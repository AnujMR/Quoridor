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
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
    client?.release();
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const server = http.createServer(app);
const io = new Server(server, {
  // cors: { origin: "https://quoridor-frontend.onrender.com" } // Allowing only the frontend domain to connect
  cors: { origin: "http://localhost:5173" } // Allowing only the frontend domain to connect
});

socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server & Sockets running on port ${PORT}`);
});