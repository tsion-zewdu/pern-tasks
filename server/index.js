require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/auth");
const { requireAuth, requireRole } = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());
// returns an error message if the title is bad, or null if it is fine
function checkTitle(title) {
  if (typeof title !== "string" || !title.trim()) {
    return "Title is required";
  }
  if (title.trim().length > 255) {
    return "Title must be 255 characters or less";
  }
  return null;
}

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
    const problem = checkTitle(req.body.title);
    if (problem) return res.status(400).json({ error: problem });

    const result = await pool.query(
      "INSERT INTO tasks (title, user_id) VALUES ($1, $2) RETURNING *",
      [req.body.title.trim(), req.user.id]
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
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid task id" });
    }

    const { title, done } = req.body;

    if (title === undefined && done === undefined) {
      return res.status(400).json({ error: "Nothing to update" });
    }
    if (title !== undefined) {
      const problem = checkTitle(title);
      if (problem) return res.status(400).json({ error: problem });
    }
    if (done !== undefined && typeof done !== "boolean") {
      return res.status(400).json({ error: "done must be true or false" });
    }

    const isAdmin = req.user.role === "admin";

    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title), done = COALESCE($2, done)
       WHERE id = $3 AND ($4 OR user_id = $5)
       RETURNING *`,
      [title === undefined ? null : title.trim(), done ?? null, id, isAdmin, req.user.id]
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
        const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid task id" });
    }
    
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