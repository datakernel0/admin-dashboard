require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test database connection
pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("PostgreSQL connected successfully!");
  }
});

app.use("/api", authRoutes(pool));
app.use("/api", userRoutes(pool));

app.get("/", (req, res) => {
  res.json({
    message: "Admin Dashboard API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});