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

/*
// /**
//  * Get user by ID
//  */
// async function getUserById(id) {
//   const result = await pool.query(
//     "SELECT * FROM users WHERE firebase_uid = $1;",
//     [id]
//   );
//   return result.rows[0]; // undefined if not found
// }
// */


/**
 * Get user by ID (Smart Version: Handles both Numeric DB ID and Firebase UID)
 */
async function getUserById(id) {
  let query = "";
  
  // Regex to check if the ID is strictly numbers (e.g., "12")
  if (/^\d+$/.test(id)) {
    query = "SELECT * FROM users WHERE id = $1;";
  } else {
    // If it contains letters (like a Firebase UID), search the firebase_uid column
    query = "SELECT * FROM users WHERE firebase_uid = $1;";
  }

  const result = await pool.query(query, [id]);
  return result.rows[0]; // Returns undefined if not found
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

async function updateElo(p1Uid, p2Uid, winnerUid) {
  // console.log(`Updating Elo: p1Uid=${p1Uid}, p2Uid=${p2Uid}, winnerUid=${winnerUid}`);

  const p1 = await getUserById(p1Uid);
  const p2 = await getUserById(p2Uid);

  if (!p1 || !p2) {
    throw new Error("One or both users not found");
  }

  // FIX 1: Explicitly convert to Number. 
  // This prevents string concatenation ("1400" + 16 = "140016")
  let rating1 = Number(p1.rating) || 1400;
  let rating2 = Number(p2.rating) || 1400;

  const K = 32;

  // 2. Calculate expected win probabilities
  const expected1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  const expected2 = 1 / (1 + Math.pow(10, (rating1 - rating2) / 400));

  // 3. Determine actual scores
  // Ensure UIDs are strings to avoid type comparison issues
  const score1 = String(winnerUid) === String(p1Uid) ? 1 : 0;
  const score2 = String(winnerUid) === String(p2Uid) ? 1 : 0;

  // 4. Calculate new ratings
  const newRating1 = Math.round(rating1 + K * (score1 - expected1));
  const newRating2 = Math.round(rating2 + K * (score2 - expected2));

  // FIX 2: Added a safety check for NaN before updating the DB
  if (isNaN(newRating1) || isNaN(newRating2)) {
    console.error("Elo calculation failed: Resulted in NaN", { rating1, rating2, expected1, score1 });
    throw new Error("Internal calculation error: NaN");
  }

  // 5. Update database using firebase_uid
  await pool.query("UPDATE users SET rating=$1 WHERE firebase_uid=$2", [
    newRating1,
    p1Uid,
  ]);

  await pool.query("UPDATE users SET rating=$1 WHERE firebase_uid=$2", [
    newRating2,
    p2Uid,
  ]);

  // console.log(`Elo updated: ${p1.name} (${rating1} -> ${newRating1}), ${p2.name} (${rating2} -> ${newRating2})`);

  return {
    [p1Uid]: { newRating: newRating1, diff: newRating1 - rating1 },
    [p2Uid]: { newRating: newRating2, diff: newRating2 - rating2 },
  };
}
// Search users by name (case-insensitive partial match)
async function searchUsers(searchTerm) {
    const query = `
        SELECT id, name, rating, profile 
        FROM users 
        WHERE name ILIKE $1
        LIMIT 10;
    `;
    // ILIKE means case-insensitive. % allows partial matches before/after the term
    const result = await pool.query(query, [`%${searchTerm}%`]);
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
  const result = await pool.query(query, [limit]);
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