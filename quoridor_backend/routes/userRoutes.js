const express = require("express");
const router = express.Router();

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
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