const express = require("express");
const router = express.Router();

const {
  insertGameHistory,
} = require("../controllers/gameController");