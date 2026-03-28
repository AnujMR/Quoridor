const pool = require("../config/db");

/**
 * Create a new game history record in the database.
 */
async function insertGameHistory(data) {
  const { p1_id, p2_id, winner_id, moves_count, created_at, completed_at, game_type} = data;
    const query = `
    INSERT INTO games (player1_id, player2_id, winner_id, moves_count, created_at, completed_at, game_type)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
    const values = [p1_id, p2_id, winner_id, moves_count, created_at, completed_at, game_type];

    const result = await pool.query(query, values);
    return result.rows[0];
}

module.exports = {
    insertGameHistory
};