const express = require("express");
const router = express.Router();

const {
  insertGameHistory,
  fetchGameHistory,
} = require("../controllers/gameController");

router.get("/history/:userId", async (req, res) => {
  const gameHistory = await fetchGameHistory({ userId: req.params.userId });
  res.json(gameHistory);
});

module.exports = router;