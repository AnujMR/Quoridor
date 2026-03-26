const express = require("express");
const router = express.Router();

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateElo,
} = require("../controllers/userController");

// ---------------- CUSTOM API ----------------

// Get user (custom API)
router.get("/getUser", async (req, res) => {
  try {
    const { id } = req.query;
    const user = await getUserById(id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update user
router.post("/setUser", async (req, res) => {
  try {
    const { id, name, email } = req.body;

    let user;

    if (id) {
      user = await updateUser(id, name, email);
    } else {
      user = await createUser({ name, email }); 
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Elo
router.post("/updateElo", async (req, res) => {
  try {
    const { player1Id, player2Id, winnerId } = req.body;

    const result = await updateElo(player1Id, player2Id, winnerId);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- BASIC CRUD ----------------

// Create
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await createUser({ name, email });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read all
router.get("/", async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

//  LAST
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