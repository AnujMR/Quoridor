// socketHandler.js
const { v4: uuidv4 } = require('uuid');
const { getUserById, updateElo } = require('./userController');
const { insertGameHistory } = require('./gameController');

let waitingQueue = [];
const activeGames = {};

// Time Control Dictionary (in milliseconds)
const TIME_CONTROLS = {
    'rapid': 10 * 60 * 1000, // 10 minutes
    'blitz': 5 * 60 * 1000,  // 5 minutes
    'untimed': null          // null means the clock is disabled
};

// --- HELPER FUNCTION TO END GAMES CLEANLY ---
async function endGameHelper(io, roomId, game, winnerUid, reason) {
    if (!game) return;

    try {
        const ratings = await updateElo(game.p1.uid, game.p2.uid, winnerUid);
        io.to(roomId).emit('game_over', {
            winnerUid: winnerUid,
            reason: reason,
            ratings: ratings
        });

        try {
            await insertGameHistory({
                p1_id: game.p1.uid,
                p2_id: game.p2.uid,
                winner_id: winnerUid,
                moves_count: game.moves_count || 0,
                created_at: game.created_at,
                completed_at: new Date(),
                game_type: game.game_type || 'untimed',
                p1_name: game.p1.name || 'Player 1',
                p2_name: game.p2.name || 'Player 2'
            });
        } catch (dbErr) {
            console.error("Failed to insert game history:", dbErr);
        }
    } catch (eloErr) {
        console.error("Elo Update Error:", eloErr);
        io.to(roomId).emit('game_over', { winnerUid, reason, ratings: null });
    } finally {
        // Clean up the room to prevent memory leaks
        delete activeGames[roomId];
    }
}

module.exports = (io) => {

    // --- GLOBAL SERVER CLOCK (Handles Timeouts) ---
    setInterval(() => {
        const now = Date.now();
        for (const roomId in activeGames) {
            const game = activeGames[roomId];

            if (game.isTimed && game.p1 && game.p2 && game.lastMoveTime) {
                const timeSpent = now - game.lastMoveTime;
                const activePlayerTime = game.currentTurn === 'p1' ? game.p1Time : game.p2Time;

                if (activePlayerTime - timeSpent <= 0) {
                    const winnerUid = game.currentTurn === 'p1' ? game.p2.uid : game.p1.uid;
                    console.log(`Timeout in room ${roomId}. Winner: ${winnerUid}`);
                    endGameHelper(io, roomId, game, winnerUid, 'timeout');
                }
            }
        }
    }, 1000);

    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        // --- MATCHMAKING ---
        socket.on('start_search', async ({ userId }) => {
            if (waitingQueue.find(s => s.id === socket.id)) return;

            try {
                const userProfile = await getUserById(userId);
                socket.userProfile = {
                    id: userProfile.firebase_uid,
                    name: userProfile?.name || "Anonymous",
                    rating: userProfile?.rating || 1400
                };

                waitingQueue.push(socket);

                if (waitingQueue.length >= 2) {
                    const p1Socket = waitingQueue.shift();
                    const p2Socket = waitingQueue.shift();
                    const roomId = uuidv4();

                    const matchData = {
                        roomId,
                        players: { p1: p1Socket.userProfile, p2: p2Socket.userProfile },
                        game_type: 'rapid'
                    };

                    p1Socket.join(roomId);
                    p2Socket.join(roomId);

                    p1Socket.emit('match_found', { ...matchData, myRole: 'p1' });
                    p2Socket.emit('match_found', { ...matchData, myRole: 'p2' });
                }
            } catch (err) {
                console.error("Matchmaking error:", err);
            }
        });

        socket.on('cancel_search', () => {
            waitingQueue = waitingQueue.filter(s => s.id !== socket.id);
        });

        // --- 1. JOIN GAME ---
        socket.on('join_game', ({ roomId, uid, game_type, created_at }) => {
            socket.join(roomId);

            if (!activeGames[roomId]) {
                const timeControlMs = TIME_CONTROLS[game_type] !== undefined ? TIME_CONTROLS[game_type] : null;
                const isTimed = timeControlMs !== null;

                activeGames[roomId] = {
                    moves_count: 0,
                    game_type: game_type || 'untimed',
                    created_at: created_at,
                    isTimed: isTimed,
                    p1Time: timeControlMs,
                    p2Time: timeControlMs,
                    currentTurn: 'p1',
                    lastMoveTime: null
                };
            }

            const game = activeGames[roomId];
            const playerName = socket.userProfile?.name || "Anonymous";

            // Safely assign players without overwriting
            if (!game.p1) {
                game.p1 = { uid, socketId: socket.id, name: playerName };
            } else if (!game.p2 && game.p1.uid !== uid) {
                game.p2 = { uid, socketId: socket.id, name: playerName };
            }

            socket.roomId = roomId;
            socket.uid = uid;

            // Start the official clock if both players are present
            if (game.isTimed && game.p1 && game.p2 && !game.lastMoveTime) {
                game.lastMoveTime = Date.now();
                io.to(roomId).emit('sync_clocks', { p1Time: game.p1Time, p2Time: game.p2Time, turn: 'p1' });
            }
        });

        // --- 2. UNIFIED GAME ACTION (Moves & Time Calculation) ---
        socket.on('game_action', async (data) => {
            const { roomId, action } = data;
            const game = activeGames[roomId];

            if (!game) return;

            // Update Time if game is timed
            if (game.isTimed && game.lastMoveTime) {
                const now = Date.now();
                const timeSpent = now - game.lastMoveTime;

                if (game.currentTurn === 'p1') {
                    game.p1Time -= timeSpent;
                } else {
                    game.p2Time -= timeSpent;
                }
                game.lastMoveTime = now;
            }

            // Update state
            game.currentTurn = game.currentTurn === 'p1' ? 'p2' : 'p1';
            game.moves_count += 1;

            // Broadcast the move and clock sync immediately
            socket.to(roomId).emit('sync_action', {
                action,
                p1Time: game.p1Time,
                p2Time: game.p2Time,
                nextTurn: game.currentTurn,
                isTimed: game.isTimed
            });

            // Check Win Condition
            if (action.isWin) {
                console.log(`Winning move detected in room ${roomId} by socket ${socket.id}`);
                // Use the helper to process Elo, emit game_over, and save to DB
                endGameHelper(io, roomId, game, socket.uid, 'normal');
            }
        });

        // --- 3. DISCONNECTS & FORFEITS ---
        socket.on('leave_room', async ({ roomId }) => {
            const game = activeGames[roomId];
            if (game && (game.p1?.socketId === socket.id || game.p2?.socketId === socket.id)) {
                const winnerUid = game.p1.socketId === socket.id ? game.p2.uid : game.p1.uid;
                endGameHelper(io, roomId, game, winnerUid, 'forfeit');
            }
            socket.leave(roomId);
        });

        socket.on('disconnect', async () => {
            const roomId = socket.roomId;
            const game = activeGames[roomId];

            if (game && (game.p1?.socketId === socket.id || game.p2?.socketId === socket.id)) {
                const winnerUid = game.p1.socketId === socket.id ? game.p2.uid : game.p1.uid;
                endGameHelper(io, roomId, game, winnerUid, 'forfeit');
            }
        });
    });
};