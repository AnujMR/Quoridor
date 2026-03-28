const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./controllers/socketHandler");


const userRoutes = require("./routes/userRoutes");
const friendRoutes = require('./routes/friendRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// app.use("/api/game", gameRoutes);
app.use("/api/users", userRoutes);
app.use('/api/friends', friendRoutes); 

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