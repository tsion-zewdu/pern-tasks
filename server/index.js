const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json()); // lets the server read JSON request bodies

// CREATE
app.post("/api/tasks", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [title]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
  console.error(err.message);
  res.status(500).json({ error: "Server error" });
}
});

// READ ALL
app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
  console.error(err.message);
  res.status(500).json({ error: "Server error" });
}
});

// UPDATE
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { title, done } = req.body;
    const result = await pool.query(
      "UPDATE tasks SET title = COALESCE($1, title), done = COALESCE($2, done) WHERE id = $3 RETURNING *",
      [title, done, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (err) {
  console.error(err.message);
  res.status(500).json({ error: "Server error" });
}
});

// DELETE
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Task not found" });
    res.status(204).send();
  } catch (err) {
  console.error(err.message);
  res.status(500).json({ error: "Server error" });
}
});

app.listen(process.env.PORT, () => console.log("Server running on port " + process.env.PORT));