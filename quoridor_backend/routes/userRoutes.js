const express = require("express");
const router = express.Router();

// 👇 1. ADD getLeaderboard TO YOUR IMPORTS
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers, 
  getLeaderboard 
} = require("../controllers/userController");

// Create
router.post("/", async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: err.message });
  }
});

// Read all
router.get("/", async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

// GET /api/users/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        // 👇 2. REMOVE "userController." and just call the function directly
        const topPlayers = await getLeaderboard(limit); 
        res.status(200).json(topPlayers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search users
router.get("/search", async (req, res) => {
  try {
    const { term } = req.query;
    if (!term) return res.status(200).json([]); 
    
    const users = await searchUsers(term); 
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read one
router.get("/:id", async (req, res) => {
  const user = await getUserById(req.params.id);
  res.json(user);
});

// Update
router.put("/:id", async (req, res) => {
  const { name, email } = req.body;
  const user = await updateUser(req.params.id, name, email);
  res.json(user);
});

// Delete
router.delete("/:id", async (req, res) => {
  const user = await deleteUser(req.params.id);
  res.json(user);
});

module.exports = router;