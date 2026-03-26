// socketHandler.js
const { v4: uuidv4 } = require('uuid');
const { getUserById } = require('./userController');

// 1. Keep the queue outside the export so it persists across the life of the server
let waitingQueue = [];

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
                    rating: userProfile?.rating || 1200
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

        // --- 2. GAME ACTION SYNC ---
        socket.on('game_action', (data) => {
            const { roomId, action } = data;
            socket.to(roomId).emit('sync_action', { action });
        });

        // --- 3. CHAT SYNC ---
        socket.on('chat_message', (data) => {
            const { roomId, text } = data;
            socket.to(roomId).emit('sync_chat', text);
        });

        // --- 4. LEAVE ROOM (For "Back to Home" Button) ---
        socket.on('leave_room', ({ roomId }) => {
            console.log(`User ${socket.id} left room ${roomId}`);

            // Notify the opponent that the other player left
            socket.to(roomId).emit('opponent_left');

            socket.leave(roomId);
        });

        // --- 5. CLEANUP ---
        socket.on('disconnect', () => {
            // Remove from queue if they were searching
            waitingQueue = waitingQueue.filter(s => s.id !== socket.id);
            console.log(`User disconnected: ${socket.id}`);

            // Important: If they were in a room, you might want to 
            // notify opponents here as well. For a production app, 
            // you'd typically track which roomId a socket is in.
        });
    });
};