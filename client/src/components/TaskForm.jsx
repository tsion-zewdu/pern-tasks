import { useState } from "react";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    if (!title.trim()) return; // ignore empty input
    onAdd(title.trim()); // tell the parent (App) to add it
    setTitle(""); // clear the box
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs doing?"
      />
      <button type="submit">Add</button>
    </form>
  );
}