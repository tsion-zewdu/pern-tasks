export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className="task-item">
      <span
        onClick={() => onToggle(task)}
        className={task.done ? "done" : ""}
      >
        {task.title}
      </span>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </li>
  );
}