const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./controllers/socketHandler");
// require('dotenv').config();
const pool = require("./config/db");


const userRoutes = require("./routes/userRoutes");
const friendRoutes = require('./routes/friendRoutes');
const gameRoutes = require("./routes/gameRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// app.use("/api/game", gameRoutes);
app.use("/api/users", userRoutes);
app.use('/api/friends', friendRoutes); 
app.use("/api/games", gameRoutes);

app.get('/', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query('SELECT version()');
    const version = rows[0]?.version || 'No version found';
    res.json({
      message: 'NeonDB Connection successful!',
      version: version,
    });
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Failed to connect to the database.' });
  } finally {
    // Make sure to release the client back to the pool
    client?.release();
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const server = http.createServer(app); // Create the HTTP server using Express
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" } // Your React URL
});

// Pass the 'io' instance to your handler
socketHandler(io);

// IMPORTANT: Start the 'server', not 'app'
server.listen(PORT, () => {
  console.log(`Server & Sockets running on port ${PORT}`);
});