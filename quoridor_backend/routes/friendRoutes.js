const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');

// POST /api/friends/request
router.post('/request', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const result = await friendController.sendFriendRequest(senderId, receiverId);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/friends/accept
router.post('/accept', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body; // senderId is the person who sent it
        const result = await friendController.acceptFriendRequest(senderId, receiverId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/friends/reject
router.post('/reject', async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        const result = await friendController.rejectFriendRequest(senderId, receiverId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/friends/remove
router.delete('/remove', async (req, res) => {
    try {
        const { user1, user2 } = req.body;
        const result = await friendController.removeFriend(user1, user2);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/friends/:userId/list
router.get('/:userId/list', async (req, res) => {
    try {
        const userId = req.params.userId;
        const friends = await friendController.getUserFriends(userId);
        res.status(200).json(friends);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/friends/:userId/pending
router.get('/:userId/pending', async (req, res) => {
    try {
        const userId = req.params.userId;
        const requests = await friendController.getPendingRequests(userId);
        res.status(200).json(requests);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;