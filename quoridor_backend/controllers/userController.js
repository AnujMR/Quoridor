const pool = require("../config/db");

/**
 * Create a new user
 */
async function createUser(data) {
  const { firebase_uid, name, email, created_at } = data;
  // console.log("Creating user in database with Firebase ID:", firebase_uid, "Name:", name, "Email:", email);
  const query = `
    INSERT INTO users (firebase_uid, name, email, rating, created_at)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (firebase_uid)
    DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email
    RETURNING *;
  `;
  const values = [firebase_uid, name, email, 1400, created_at]; // Default rating of 1400

  const result = await pool.query(query, values);
  // console.log("User created with ID:", result.rows[0].id);
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
    "SELECT * FROM users WHERE firebase_uid = $1;",
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