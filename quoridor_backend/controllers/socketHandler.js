// socketHandler.js
const { v4: uuidv4 } = require('uuid');
const { getUserById, updateElo } = require('./userController');
const { insertGameHistory } = require('./gameController');

let waitingQueues = {
    'standard' : [],
    'timed' : []
};
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
        delete activeGames[roomId];
    }
}

// CREATE MATCH
function createMatch(p1Socket, p2Socket, mode) {
    const roomId = uuidv4();

    const matchData = {
        roomId,
        players: { 
            p1: p1Socket.userProfile, 
            p2: p2Socket.userProfile 
        },
        game_type: mode === 'timed' ? 'rapid' : 'untimed'
    };

    p1Socket.join(roomId);
    p2Socket.join(roomId);

    p1Socket.emit('match_found', { ...matchData, myRole: 'p1' });
    p2Socket.emit('match_found', { ...matchData, myRole: 'p2' });
}

// RANGE CALCULATION (NEW)
function getRange(player) {
    const now = Date.now();
    const wait = now - player.userProfile.joinedAt;

    let diff = 100;

    if (wait > 5000) diff = 200;
    if (wait > 10000) diff = Infinity;

    return {
        min: player.userProfile.rating - diff,
        max: player.userProfile.rating + diff
    };
}

// MATCHMAKING LOOP (NEW - TIME DRIVEN)
function tryMatchmaking(io) {
    for (const mode in waitingQueues) {
        const queue = waitingQueues[mode];

        for (let i = 0; i < queue.length; i++) {
            for (let j = i + 1; j < queue.length; j++) {

                const s1 = queue[i];
                const s2 = queue[j];

                const r1 = getRange(s1);
                const r2 = getRange(s2);

                const isOverlap = !(r1.max < r2.min || r2.max < r1.min);

                if (isOverlap) {
                    queue.splice(j, 1);
                    queue.splice(i, 1);

                    createMatch(s1, s2, mode);
                    return;
                }
            }
        }

        // FIFO fallback after 10 sec
        if (queue.length >= 2) {
            const now = Date.now();

            const first = queue[0];
            const second = queue[1];

            const wait1 = now - first.userProfile.joinedAt;
            const wait2 = now - second.userProfile.joinedAt;

            if (wait1 > 10000 || wait2 > 10000) {
                queue.shift();
                queue.shift();

                createMatch(first, second, mode);
            }
        }
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
                    // console.log(`Timeout in room ${roomId}. Winner: ${winnerUid}`);
                    endGameHelper(io, roomId, game, winnerUid, 'timeout');
                }
            }
        }
    }, 1000);

    // MATCHMAKING LOOP
    setInterval(() => {
        tryMatchmaking(io);
    }, 1000);

    io.on('connection', (socket) => {
        // console.log(`New connection: ${socket.id}`);

        socket.on('start_search', async ({ userId, mode = 'standard' }) => {

            if(!waitingQueues[mode]) mode = 'standard';
            if (waitingQueues[mode].find(s => s.id === socket.id)) return;

            try {
                const userProfile = await getUserById(userId);

                socket.userProfile = {
                    id: userProfile.firebase_uid,
                    name: userProfile?.name || "Anonymous",
                    rating: userProfile?.rating || 1400,
                    joinedAt: Date.now()
                };

                waitingQueues[mode].push(socket);

                // No matching here (handled by loop)

            } catch (err) {
                console.error("Matchmaking error:", err);
            }
        });

        socket.on('cancel_search', () => {

            for(const queueMode in waitingQueues) {
                waitingQueues[queueMode] = waitingQueues[queueMode].filter(s => s.id !== socket.id);
            }
        });

        // --- CHAT LOGIC ---
        socket.on('chat_message', (data) => {
            const { roomId, message } = data;
            socket.to(roomId).emit('sync_chat', message);
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

            if (!game.p1) {
                game.p1 = { uid, socketId: socket.id, name: playerName };
            } else if (!game.p2 && game.p1.uid !== uid) {
                game.p2 = { uid, socketId: socket.id, name: playerName };
            }

            socket.roomId = roomId;
            socket.uid = uid;

            if (game.isTimed && game.p1 && game.p2 && !game.lastMoveTime) {
                game.lastMoveTime = Date.now();
                io.to(roomId).emit('sync_clocks', { p1Time: game.p1Time, p2Time: game.p2Time, turn: 'p1' });
            }
        });

        // --- 2. UNIFIED GAME ACTION ---
        socket.on('game_action', async (data) => {
            const { roomId, action } = data;
            const game = activeGames[roomId];

            if (!game) return;

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

            game.currentTurn = game.currentTurn === 'p1' ? 'p2' : 'p1';
            game.moves_count += 1;

            socket.to(roomId).emit('sync_action', {
                action,
                p1Time: game.p1Time,
                p2Time: game.p2Time,
                nextTurn: game.currentTurn,
                isTimed: game.isTimed
            });

            if (action.isWin) {
                // console.log(`Winning move detected in room ${roomId} by socket ${socket.id}`);
                endGameHelper(io, roomId, game, socket.uid, 'normal');
            }
        });

        /*
        socket.on('leave_room', async ({ roomId }) => {
            const game = activeGames[roomId];
            if (game && (game.p1?.socketId === socket.id || game.p2?.socketId === socket.id)) {
                const winnerUid = game.p1.socketId === socket.id ? game.p2.uid : game.p1.uid;
                endGameHelper(io, roomId, game, winnerUid, 'forfeit');
            }
            socket.leave(roomId);
        });
        */
       socket.on('leave_room', async ({ roomId }) => {
            const game = activeGames[roomId];
            if (game) {
                if (game.p1 && game.p2 && (game.p1.socketId === socket.id || game.p2.socketId === socket.id)) {
                    const winnerUid = game.p1.socketId === socket.id ? game.p2.uid : game.p1.uid;
                    endGameHelper(io, roomId, game, winnerUid, 'forfeit');
                } else {
                    delete activeGames[roomId];
                }
            }
            socket.leave(roomId);
        });

        /*
        socket.on('disconnect', async () => {
            const roomId = socket.roomId;
            const game = activeGames[roomId];

            if (game && (game.p1?.socketId === socket.id || game.p2?.socketId === socket.id)) {
                const winnerUid = game.p1.socketId === socket.id ? game.p2.uid : game.p1.uid;
                endGameHelper(io, roomId, game, winnerUid, 'forfeit');
            }
        });
        */
       socket.on('disconnect', async () => {
            const roomId = socket.roomId;
            const game = activeGames[roomId];

            if (game) {
                if (game.p1 && game.p2) {
                    const winnerUid = game.p1.socketId === socket.id ? game.p2.uid : game.p1.uid;
                    endGameHelper(io, roomId, game, winnerUid, 'forfeit');
                } else {
                    delete activeGames[roomId];
                }
            }

            for (const queueMode in waitingQueues) {
                if (waitingQueues[queueMode]) {
                    waitingQueues[queueMode] = waitingQueues[queueMode].filter(s => s.id !== socket.id);
                }
            }
        });

        socket.on('resign', ({ roomId }) => {
            const game = activeGames[roomId];
            if (game && game.p1 && game.p2) {
                const winnerUid = game.p1.socketId === socket.id ? game.p2.uid : game.p1.uid;
                endGameHelper(io, roomId, game, winnerUid, 'forfeit');
            }
        });
    });
};