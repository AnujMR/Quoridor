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
  let client;
  client = await pool.connect();
  const result = await client.query(query, values);
  // const result = await pool.query(query, values);
  // console.log("User created with ID:", result.rows[0].id);
  client?.release();
  return result.rows[0];
}

/**
 * Get all users
 */
async function getAllUsers() {
  // const result = await pool.query("SELECT * FROM public.users ORDER BY id;");

  let client;
  client = await pool.connect();
  const result = await client.query("SELECT * FROM public.users ORDER BY id;");
  client?.release();
  return result.rows;
}


/**
 * Get user by ID (Handles both Numeric DB ID and Firebase UID)
 */
async function getUserById(id) {
  let query = "";
  
  // Regex to check if the ID is strictly numbers
  if (/^\d+$/.test(id)) {
    query = "SELECT * FROM users WHERE id = $1;";
  } else {
    query = "SELECT * FROM users WHERE firebase_uid = $1;";
  }

  // const result = await pool.query(query, [id]);

  let client;
  client = await pool.connect();
  const result = await client.query(query, [id]);
  client?.release();
  return result.rows[0];
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

  // const result = await pool.query(query, values);
  let client;
  client = await pool.connect();
  const result = await client.query(query, values);
  client?.release();
  return result.rows[0];
}

/**
 * Delete user
 */
async function deleteUser(id) {

  let client;
  client = await pool.connect();
  const result = await client.query("DELETE FROM users WHERE id = $1 RETURNING *;", [id]);
  client?.release();
  return result.rows[0];
}

async function updateElo(p1Uid, p2Uid, winnerUid) {
  // console.log(`Updating Elo: p1Uid=${p1Uid}, p2Uid=${p2Uid}, winnerUid=${winnerUid}`);

  const p1 = await getUserById(p1Uid);
  const p2 = await getUserById(p2Uid);

  if (!p1 || !p2) {
    throw new Error("One or both users not found");
  }

  let client;
  client = await pool.connect();
  let rating1 = Number(p1.rating) || 1400;
  let rating2 = Number(p2.rating) || 1400;

  const K = 32;

  const expected1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  const expected2 = 1 / (1 + Math.pow(10, (rating1 - rating2) / 400));

  const score1 = String(winnerUid) === String(p1Uid) ? 1 : 0;
  const score2 = String(winnerUid) === String(p2Uid) ? 1 : 0;

  const newRating1 = Math.round(rating1 + K * (score1 - expected1));
  const newRating2 = Math.round(rating2 + K * (score2 - expected2));

  if (isNaN(newRating1) || isNaN(newRating2)) {
    console.error("Elo calculation failed: Resulted in NaN", { rating1, rating2, expected1, score1 });
    throw new Error("Internal calculation error: NaN");
  }

  await client.query("UPDATE users SET rating=$1 WHERE firebase_uid=$2", [
    newRating1,
    p1Uid,
  ]);

  await client.query("UPDATE users SET rating=$1 WHERE firebase_uid=$2", [
    newRating2,
    p2Uid,
  ]);

  // console.log(`Elo updated: ${p1.name} (${rating1} -> ${newRating1}), ${p2.name} (${rating2} -> ${newRating2})`);
  client?.release();

  return {
    [p1Uid]: { newRating: newRating1, diff: newRating1 - rating1 },
    [p2Uid]: { newRating: newRating2, diff: newRating2 - rating2 },
  };
}
async function searchUsers(searchTerm) {
    const query = `
        SELECT id, name, rating, profile 
        FROM users 
        WHERE name ILIKE $1
        LIMIT 10;
    `;
  let client;
  client = await pool.connect();

  const result = await client.query(query, [`%${searchTerm}%`]);
  client?.release();
    return result.rows;
}

/**
 * Fetch the top players ordered by Elo rating
 */
async function getLeaderboard(limit = 50) {
  const query = `
    SELECT id, name, rating, profile, created_at 
    FROM users 
    ORDER BY rating DESC 
    LIMIT $1;
  `;
  let client;
  client = await pool.connect();
  const result = await client.query(query, [limit]);
  client?.release();
  return result.rows;
}


module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateElo,
  searchUsers,
  getLeaderboard
};