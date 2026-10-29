require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/auth");
const { requireAuth, requireRole } = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());

// signup, login, me
app.use("/api/auth", authRoutes);

// ADMIN ONLY: list all users
app.get("/api/users", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// READ: admins see all tasks, users see only their own
app.get("/api/tasks", requireAuth, async (req, res) => {
  try {
    const result =
      req.user.role === "admin"
        ? await pool.query("SELECT * FROM tasks ORDER BY id DESC")
        : await pool.query(
            "SELECT * FROM tasks WHERE user_id = $1 ORDER BY id DESC",
            [req.user.id]
          );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// CREATE: the task is saved with the logged-in user's id
app.post("/api/tasks", requireAuth, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const result = await pool.query(
      "INSERT INTO tasks (title, user_id) VALUES ($1, $2) RETURNING *",
      [title, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE: only the owner or an admin
app.put("/api/tasks/:id", requireAuth, async (req, res) => {
  try {
    const { title, done } = req.body;
    const isAdmin = req.user.role === "admin";

    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title), done = COALESCE($2, done)
       WHERE id = $3 AND ($4 OR user_id = $5)
       RETURNING *`,
      [title, done, req.params.id, isAdmin, req.user.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE: only the owner or an admin
app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND ($2 OR user_id = $3)",
      [req.params.id, isAdmin, req.user.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Task not found" });
    res.status(204).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.error("Could not start server:", err.message);
    return;
  }
  console.log("Server running on port " + process.env.PORT);
});