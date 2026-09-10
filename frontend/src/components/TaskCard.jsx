export default function TaskCard({ task, onStatusChange }) {
  const next = {
    Todo: "In Progress",
    "In Progress": "Review",
    Review: "Done",
    Done: null
  }[task.status];

  return (
    <article className="task-card">
      <div className="task-top">
        <strong>{task.title}</strong>
        <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
      </div>
      <p>{task.description || "No description"}</p>
      <div className="task-meta">
        <span>{task.assignedTo?.name || "Unassigned"}</span>
        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
      </div>
      {next && (
        <button className="small-btn" onClick={() => onStatusChange(task._id, next)}>
          Move to {next}
        </button>
      )}
    </article>
  );
}