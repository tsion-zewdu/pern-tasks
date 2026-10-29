export default function TaskItem({ task, onToggle, onDelete, showOwner }) {
  return (
    <li className="task-item">
      <span
        onClick={() => onToggle(task)}
        className={task.done ? "done" : ""}
      >
        {task.title}
        {showOwner && <small> (user #{task.user_id ?? "none"})</small>}
      </span>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </li>
  );
}