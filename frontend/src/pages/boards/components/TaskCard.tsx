import type { Task } from "../types";

type TaskCardProps = {
  task: Task;
  storyTitle: string;
  onClick: () => void;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "LOW": return "#22c55e";
    case "MEDIUM": return "#3b82f6";
    case "HIGH": return "#f59e0b";
    case "CRITICAL": return "#ef4444";
    default: return "#64748b";
  }
};

export default function TaskCard({ task, storyTitle, onClick }: TaskCardProps) {
  // Logic for border color based on type
  const typeColor = task.type === "BUG" ? "#ef4444" : "#3b82f6";

  return (
    <div
      onClick={onClick}
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        padding: "14px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
        border: "1px solid #e2e8f0",
        cursor: "pointer",
        borderLeft: `5px solid ${typeColor}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h4 style={{ margin: 0, fontSize: "16px" }}>{task.title}</h4>
        <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "999px", background: `${getPriorityColor(task.priority)}20`, color: getPriorityColor(task.priority), fontWeight: 700 }}>
          {task.priority}
        </span>
      </div>
      <p style={{ marginTop: "10px", color: "#64748b", fontSize: "13px" }}>{task.description}</p>
      <div style={{ fontSize: "12px", color: "#475569", marginTop: "10px" }}>
        <div>Story: {storyTitle}</div>
        <div style={{ marginTop: 4 }}>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</div>
      </div>
    </div>
  );
}