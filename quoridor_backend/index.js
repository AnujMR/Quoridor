const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// app.use("/api/game", gameRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});