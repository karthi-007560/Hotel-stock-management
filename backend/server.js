require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  })
);

app.use(express.json({ limit: "1mb" }));

// API home
app.get("/", (req, res) => {
  res.json({
    message: "Hotel Stock Management API is running",
  });
});

// Authentication routes
app.use("/api/auth", require("./routes/auth"));

// Dashboard data routes
app.use("/api/data", require("./routes/data"));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB before starting the server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
