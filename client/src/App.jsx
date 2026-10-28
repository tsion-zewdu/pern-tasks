import { useState, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import TaskItem from "./components/TaskItem";
import "./App.css";

const API = "http://localhost:5000/api/tasks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // READ: get all tasks from the API
  const loadTasks = async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Could not load tasks");
      setTasks(await res.json());
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // runs once, when the page first opens
  useEffect(() => {
    loadTasks();
  }, []);

  // CREATE
  const addTask = async (title) => {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Could not add task");
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // UPDATE
  const toggleTask = async (task) => {
    try {
      const res = await fetch(`${API}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !task.done }),
      });
      if (!res.ok) throw new Error("Could not update task");
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // DELETE
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete task");
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>My Tasks</h1>
      <TaskForm onAdd={addTask} />

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && tasks.length === 0 && <p>No tasks yet. Add one above!</p>}

      <ul>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        ))}
      </ul>
    </div>
  );
}