const express = require("express");
const router = express.Router();

const gameController = require("../controllers/gameController");

router.get("/", (req, res) => {
  res.send("Game route working");
});

router.post("/create", gameController.createGame);
router.get("/:id", gameController.getGame);
router.post("/move", gameController.makeMove);

module.exports = router;