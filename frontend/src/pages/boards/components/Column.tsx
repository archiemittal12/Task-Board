import TaskCard from "./TaskCard";

export default function Column({ column, onTaskClick, onAddTask }: any) {
  return (
    <div className="column">
      <div className="column-header">
        <h4>{column.title}</h4>
        <span>{column.tasks.length}</span>
      </div>

      <div className="task-list">
        {column.tasks.map((task: any) => (
          <div key={task.id} onClick={() => onTaskClick(task)}>
            <TaskCard task={task} />
          </div>
        ))}
      </div>

      <button className="add-task-btn"
      onClick={onAddTask}
      >+ Add Task</button>
    </div>
  );
}