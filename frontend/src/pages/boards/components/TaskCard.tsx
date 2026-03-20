export default function TaskCard({ task }: any) {
  return (
    <div className="task-card">
      <p>{task.title}</p>

      <span className={`badge ${task.type.toLowerCase()}`}>
        {task.type}
      </span>
    </div>
  );
}