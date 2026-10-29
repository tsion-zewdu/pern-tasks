import { useState, useEffect } from "react";
import { api } from "../api";

export default function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/users")
      .then(setUsers)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="panel">
      <h2>All users (admin)</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {users.map((u) => (
          <li key={u.id} className="task-item">
            <span>{u.name} ({u.email})</span>
            <span className="badge">{u.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}