const express = require("express");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

module.exports = (pool) => {

// Get all users / Search users
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;

    let result;

    if (search) {
      result = await pool.query(
        `SELECT id, name, email, phone, address, role, created_at
         FROM users
         WHERE name ILIKE $1
            OR email ILIKE $1
         ORDER BY id DESC`,
        [`%${search}%`]
      );
    } else {
      result = await pool.query(
        `SELECT id, name, email, phone, address, role, created_at
         FROM users
         ORDER BY id DESC`
      );
    }

    res.json({
      users: result.rows,
    });
  } catch (error) {
    console.error("Get users/search error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

  // Add new user
  router.post("/users", authMiddleware, async (req, res) => {
    try {
      const { name, email, phone, address, role } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          message: "Name and email are required",
        });
      }

      const result = await pool.query(
        `INSERT INTO users (name, email, phone, address, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, phone, address, role, created_at`,
        [
          name,
          email,
          phone || null,
          address || null,
          role || "User",
        ]
      );

      res.status(201).json({
        message: "User added successfully",
        user: result.rows[0],
      });
    } catch (error) {
      console.error("Add user error:", error);

      if (error.code === "23505") {
        return res.status(409).json({
          message: "Email already exists",
        });
      }

      res.status(500).json({
        message: "Server error",
      });
    }
  });


  // Get single user by ID
  router.get("/users/:id", authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT id, name, email, phone, address, role, created_at
         FROM users
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json({
        user: result.rows[0],
      });
    } catch (error) {
      console.error("Get user error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  });


  // Delete user
router.delete("/users/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM users
       WHERE id = $1
       RETURNING id, name, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User deleted successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

  return router;
};