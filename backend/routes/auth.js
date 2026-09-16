const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

module.exports = (pool) => {
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check required fields
      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      // Find admin
      const result = await pool.query(
        "SELECT * FROM admins WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      const admin = result.rows[0];

      // Compare password with stored bcrypt hash
      const passwordMatch = await bcrypt.compare(
        password,
        admin.password_hash
      );

      if (!passwordMatch) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      // Create JWT
      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          username: admin.username,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.json({
        message: "Login successful",
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  });

  return router;
};