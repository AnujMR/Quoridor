const pool = require("../config/db");

/**
 * Create a new user
 */
async function createUser(data) {
  const { name, email } = data;
  const query = `
    INSERT INTO users (name, email)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [name, email];

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Get all users
 */
async function getAllUsers() {
  const result = await pool.query("SELECT * FROM public.users ORDER BY id;");
  return result.rows;
}

/**
 * Get user by ID
 */
async function getUserById(id) {
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1;",
    [id]
  );
  return result.rows[0]; // undefined if not found
}

/**
 * Update user
 */
async function updateUser(id, name, email) {
  const query = `
    UPDATE users
    SET name = $1, email = $2
    WHERE id = $3
    RETURNING *;
  `;
  const values = [name, email, id];

  const result = await pool.query(query, values);
  return result.rows[0];
}

/**
 * Delete user
 */
async function deleteUser(id) {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *;",
    [id]
  );
  return result.rows[0];
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};