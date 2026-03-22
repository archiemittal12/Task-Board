import type { Task } from "../types";

type TaskCardProps = {
  task: Task;
  storyTitle: string;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "LOW":
      return "#22c55e";
    case "MEDIUM":
      return "#3b82f6";
    case "HIGH":
      return "#f59e0b";
    case "CRITICAL":
      return "#ef4444";
    default:
      return "#64748b";
  }
};

export default function TaskCard({ task, storyTitle, onClick, onDragStart }: TaskCardProps) {
  const typeColor = task.type === "BUG" ? "#ef4444" : "#3b82f6";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: 14,
        boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
        border: "1px solid #e2e8f0",
        cursor: "grab",
        borderLeft: `5px solid ${typeColor}`,
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h4 style={{ margin: 0, fontSize: 15 }}>{task.title}</h4>
        <span
          style={{
            fontSize: 11,
            padding: "4px 8px",
            borderRadius: 999,
            background: `${getPriorityColor(task.priority)}20`,
            color: getPriorityColor(task.priority),
            fontWeight: 700,
          }}
        >
          {task.priority}
        </span>
      </div>
      {task.description && (
        <p style={{ marginTop: 8, color: "#64748b", fontSize: 13 }}>{task.description}</p>
      )}
      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 6,
            background: typeColor + "20",
            color: typeColor,
            fontWeight: 600,
          }}
        >
          {task.type}
        </span>
        <span
          style={{
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 6,
            background: "#f1f5f9",
            color: "#64748b",
          }}
        >
          {task.status?.replace("_", " ")}
        </span>
      </div>
      <div style={{ fontSize: 12, color: "#475569", marginTop: 8 }}>
        <div>Story: {storyTitle}</div>
        <div style={{ marginTop: 2 }}>
          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
        </div>
        {task.assignee && <div style={{ marginTop: 2 }}>Assignee: {task.assignee.name}</div>}
      </div>
    </div>
  );
}
