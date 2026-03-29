// socketHandler.js
const { v4: uuidv4 } = require('uuid');
const { getUserById, updateElo } = require('./userController');
const { insertGameHistory } = require('./gameController');

// 1. Keep the queue outside the export so it persists across the life of the server
let waitingQueue = [];
const activeGames = {};

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        // --- 1. MATCHMAKING LOGIC ---
        socket.on('start_search', async ({ userId }) => {
            // Avoid adding the same socket twice
            if (waitingQueue.find(s => s.id === socket.id)) return;

            try {
                const userProfile = await getUserById(userId);

                // Attach profile info to the socket object temporarily
                socket.userProfile = {
                    id: userId,
                    name: userProfile?.name || "Anonymous",
                    rating: userProfile?.rating || 1400
                };

                waitingQueue.push(socket);
                console.log(`Queue size: ${waitingQueue.length}`);

                if (waitingQueue.length >= 2) {
                    const p1Socket = waitingQueue.shift();
                    const p2Socket = waitingQueue.shift();
                    const roomId = uuidv4();

                    const matchData = {
                        roomId,
                        players: {
                            p1: p1Socket.userProfile,
                            p2: p2Socket.userProfile
                        }
                    };

                    p1Socket.join(roomId);
                    p2Socket.join(roomId);

                    p1Socket.emit('match_found', { ...matchData, myRole: 'p1' });
                    p2Socket.emit('match_found', { ...matchData, myRole: 'p2' });

                    console.log(`Match started in room: ${roomId}`);
                }
            } catch (err) {
                console.error("Matchmaking error:", err);
            }
        });

        socket.on('cancel_search', () => {
            waitingQueue = waitingQueue.filter(s => s.id !== socket.id);
            console.log(`Search cancelled. Queue size: ${waitingQueue.length}`);
        });

        // --- 2. GAME ACTION & WIN CHECK ---
        socket.on('game_action', async (data) => {
            const { roomId, action } = data;

            // 1. Instantly forward the move to the opponent so the UI feels fast
            socket.to(roomId).emit('sync_action', { action });
            activeGames[roomId].moves_count = (activeGames[roomId].moves_count || 0) + 1;

            // 2. Check if the frontend flagged this move as the winning move
            if (action.isWin) {
                console.log(`Winning move detected in room ${roomId} by socket ${socket.id}`);
                // Retrieve the players' Firebase UIDs from our tracking object
                const game = activeGames[roomId];

                // Safety check: If the game doesn't exist in memory, abort
                if (!game || !game.p1 || !game.p2) {
                    console.error(`Error: Game data missing for room ${roomId}`);
                    return;
                }

                try {
                    // 3. The person who sent this action is the winner. 
                    // socket.uid was saved during the 'join_game' event.
                    const winnerUid = socket.uid;

                    // 4. Calculate new Elo and update PostgreSQL database
                    const ratings = await updateElo(game.p1.uid, game.p2.uid, winnerUid);

                    // 5. Broadcast the official Game Over event to BOTH players
                    io.to(roomId).emit('game_over', {
                        winnerUid: winnerUid,
                        reason: 'normal',
                        ratings: ratings
                    });

                    // 6. Clean up the server memory
                    delete activeGames[roomId];

                } catch (error) {
                    console.error("Failed to update Elo ratings in database:", error);
                    // Fallback: End the game anyway so players aren't stuck, 
                    // even if the database update failed.
                    io.to(roomId).emit('game_over', {
                        winnerUid: socket.uid,
                        reason: 'normal',
                        ratings: null // Frontend won't show the rating UI if this is null
                    });
                    delete activeGames[roomId];
                }

                try {
                    await insertGameHistory({
                        p1_id: game.p1.uid,
                        p2_id: game.p2.uid,
                        winner_id: socket.uid,
                        moves_count: game.moves_count || 0,
                        created_at: game.created_at,
                        completed_at: new Date(),
                        game_type: game.game_type,
                        p1_name: game.p1.name,
                        p2_name: game.p2.name
                    });
                } catch (err) {
                    console.error("Failed to insert game history into database:", err);
                }
            }
        });

        // --- 1. JOIN GAME ---
        socket.on('join_game', ({ roomId, uid, game_type, created_at }) => {
            socket.join(roomId);
            // console.log("Game joined: ", { roomId, uid, game_type, created_at });

            // If this room doesn't exist in our tracker yet, create it
            if (!activeGames[roomId]) {
                activeGames[roomId] = {};
            }

            // Assign this player to slot p1 or p2
            if (!activeGames[roomId].p1) {
                activeGames[roomId].p1 = { uid: uid, socketId: socket.id, name: socket.userProfile?.name || "Anonymous" };
            } else if (!activeGames[roomId].p2) {
                activeGames[roomId].p2 = { uid: uid, socketId: socket.id, name: socket.userProfile?.name || "Anonymous" };
            }
            activeGames[roomId].moves_count = 0; // Initialize move count
            activeGames[roomId].game_type = game_type;
            activeGames[roomId].created_at = created_at;

            // CRITICAL: Attach these to the socket itself so we can easily 
            // access them later if the user disconnects unexpectedly!
            socket.roomId = roomId;
            socket.uid = uid;
        });

        socket.on('leave_room', async ({ roomId }) => {
            const game = activeGames[roomId];
            if (game && (game.p1.socketId === socket.id || game.p2.socketId === socket.id)) {
                const winner = game.p1.socketId === socket.id ? game.p2 : game.p1;
                try {
                    const ratings = await updateElo(game.p1.uid, game.p2.uid, winner.uid);
                    socket.to(roomId).emit('game_over', {
                        winnerUid: winner.uid,
                        reason: 'forfeit',
                        ratings
                    });
                    try {
                        await insertGameHistory({
                            p1_id: game.p1.uid,
                            p2_id: game.p2.uid,
                            winner_id: winner.uid,
                            moves_count: game.moves_count || 0,
                            created_at: game.created_at,
                            completed_at: new Date(),
                            game_type: game.game_type,
                            p1_name: game.p1.name,
                            p2_name: game.p2.name
                        });
                    } catch (err) {
                        console.error("Failed to insert game history into database:", err);
                    }

                } catch (err) {
                    console.error("Elo Update Error:", err);
                }
                delete activeGames[roomId];
            }
            socket.leave(roomId);
        });

        // --- 5. DISCONNECT (Unexpected Forfeit) ---
        socket.on('disconnect', async () => {
            const roomId = socket.roomId;
            const game = activeGames[roomId];

            if (game) {
                const winner = game.p1.socketId === socket.id ? game.p2 : game.p1;
                try {
                    const ratings = await updateElo(game.p1.uid, game.p2.uid, winner.uid);
                    io.to(roomId).emit('game_over', {
                        winnerUid: winner.uid, // FIX: Changed from 'winner' to 'winnerUid'
                        reason: 'forfeit',
                        ratings
                    });
                    try {
                        await insertGameHistory({
                            p1_id: game.p1.uid,
                            p2_id: game.p2.uid,
                            winner_id: winner.uid,
                            moves_count: game.moves_count || 0,
                            created_at: game.created_at,
                            completed_at: new Date(),
                            game_type: game.game_type,
                            p1_name: game.p1.name,
                            p2_name: game.p2.name
                        });
                    } catch (err) {
                        console.error("Failed to insert game history into database:", err);
                    }

                } catch (err) { console.error(err); }
                delete activeGames[roomId];
            }
        });
    });

};