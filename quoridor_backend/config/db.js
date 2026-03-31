const { Pool } = require("pg");
require('dotenv').config();

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "quoridor",
//   password: "root",
//   port: 5432,
// });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;