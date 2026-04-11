const pool = require("../config/db");

/**
 * Create a new game history record in the database.
 */
async function insertGameHistory(data) {
  const { p1_id, p2_id, winner_id, moves_count, created_at, completed_at, game_type, p1_name, p2_name} = data;
    // console.log("Inserting game history into database with data:", data);
    const query = `
    INSERT INTO games (player1_id, player2_id, winner_id, moves_count, created_at, completed_at, game_type, player1_name, player2_name)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;
    const values = [p1_id, p2_id, winner_id, moves_count, created_at, completed_at, game_type, p1_name, p2_name];

    const result = await pool.query(query, values);
    return result.rows[0];
}

async function fetchGameHistory(data) {
    const { userId } = data;
    const query = `
    SELECT * FROM games
    WHERE player1_id = $1 OR player2_id = $1
  `;
    const values = [userId];

    const result = await pool.query(query, values);
    return result.rows;
}

module.exports = {
    insertGameHistory,
    fetchGameHistory
};