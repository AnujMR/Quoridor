const pool = require("../config/db");

/**
 * Create a new user
 */
async function insertGameHistory(data) {
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