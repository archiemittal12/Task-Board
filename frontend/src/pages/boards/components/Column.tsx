import TaskCard from "./TaskCard";
import type { ColumnType, Story, Task } from "../types";

type ColumnProps = {
  column: ColumnType;
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  onRename: () => void;
  onDelete: () => void;
  storyTitleById: Record<number, string>;
};

export default function Column({
  column,
  onTaskClick,
  onAddTask,
  onRename,
  onDelete,
  storyTitleById,
}: ColumnProps) {
  const iconButtonStyle = {
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    border: "none",
    borderRadius: 10,
    padding: "8px 10px",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    transition: "0.2s",
  } as const;

  return (
    <div
      style={{
        minWidth: 300,
        background: "#f8fafc",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          gap: 10,
        }}
      >
        <h3 style={{ fontSize: 18, margin: 0 }}>{column.title}</h3>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            title="Rename Column"
            style={iconButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            onClick={onRename}
          >
            ✏️
          </button>

          <button
            title="Delete Column"
            style={iconButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            onClick={onDelete}
          >
            🗑
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            storyTitle={storyTitleById[task.storyId] || "No Story"}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>

      <button
        onClick={onAddTask}
        style={{
          marginTop: 12,
          width: "100%",
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          background: "#eef2ff",
          color: "#4338ca",
          cursor: "pointer",
          fontWeight: 700,
          transition: "0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#dbe4ff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#eef2ff";
        }}
      >
        + Add Task
      </button>
    </div>
  );
}