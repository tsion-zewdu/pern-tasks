import { useState, useEffect } from "react";
import { api } from "./api";
import AuthForm from "./components/AuthForm";
import TaskForm from "./components/TaskForm";
import TaskItem from "./components/TaskItem";
import UsersPanel from "./components/UsersPanel";
import "./App.css";

export default function App() {
  // start from whatever is saved in the browser, so a refresh keeps you logged in
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTasks([]);
  };

  const handleAuth = ({ user, token }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  // if the server says the token is bad or expired, log out
  const handleError = (err) => {
    if (err.status === 401) logout();
    else setError(err.message);
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      setTasks(await api("/tasks"));
      setError("");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // load tasks whenever someone logs in
  useEffect(() => {
    if (user) loadTasks();
  }, [user]);

  const addTask = async (title) => {
    try {
      await api("/tasks", { method: "POST", body: JSON.stringify({ title }) });
      loadTasks();
    } catch (err) {
      handleError(err);
    }
  };

  const toggleTask = async (task) => {
    try {
      await api(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ done: !task.done }),
      });
      loadTasks();
    } catch (err) {
      handleError(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api(`/tasks/${id}`, { method: "DELETE" });
      loadTasks();
    } catch (err) {
      handleError(err);
    }
  };

  // not logged in: show the login/signup form
  if (!user) {
    return (
      <div className="container">
        <h1>My Tasks</h1>
        <AuthForm onAuth={handleAuth} />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <span>
          Hi, {user.name} <span className="badge">{user.role}</span>
        </span>
        <button onClick={logout}>Log out</button>
      </div>

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
            showOwner={user.role === "admin"}
          />
        ))}
      </ul>

      {user.role === "admin" && <UsersPanel />}
    </div>
  );
}