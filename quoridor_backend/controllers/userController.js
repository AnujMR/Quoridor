const pool = require("../config/db");

// Create user
async function createUser({ name, email }) {
  const result = await pool.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *;",
    [name, email]
  );
  return result.rows[0];
}

// Get all users
async function getAllUsers() {
  const result = await pool.query("SELECT * FROM users ORDER BY id;");
  return result.rows;
}

// Get user by ID
async function getUserById(id) {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1;",
    [id]
  );
  return result.rows[0];
}

// Update user
async function updateUser(id, name, email) {
  const result = await pool.query(
    "UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *;",
    [name, email, id]
  );
  return result.rows[0];
}

// Delete user
async function deleteUser(id) {
  const result = await pool.query(
    "DELETE FROM users WHERE id=$1 RETURNING *;",
    [id]
  );
  return result.rows[0];
}

// Update Elo rating
async function updateElo(player1Id, player2Id, winnerId) {
  const p1 = await getUserById(player1Id);
  const p2 = await getUserById(player2Id);

  if (!p1 || !p2) {
    throw new Error("One or both users not found");
  }

  let rating1 = p1.elo_rating || 1000;
  let rating2 = p2.elo_rating || 1000;

  const K = 32;

  const expected1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  const expected2 = 1 / (1 + Math.pow(10, (rating1 - rating2) / 400));

  const score1 = winnerId == player1Id ? 1 : 0;
  const score2 = winnerId == player2Id ? 1 : 0;

  const newRating1 = Math.round(rating1 + K * (score1 - expected1));
  const newRating2 = Math.round(rating2 + K * (score2 - expected2));

  await pool.query("UPDATE users SET elo_rating=$1 WHERE id=$2", [
    newRating1,
    player1Id,
  ]);

  await pool.query("UPDATE users SET elo_rating=$1 WHERE id=$2", [
    newRating2,
    player2Id,
  ]);

  return {
    player1: newRating1,
    player2: newRating2,
  };
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateElo,
};