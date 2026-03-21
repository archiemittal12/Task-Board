import type { Task } from "../types";

type TaskCardProps = {
  task: Task;
  storyTitle: string;
  onClick: () => void;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Low":
      return "#22c55e";
    case "Medium":
      return "#3b82f6";
    case "High":
      return "#f59e0b";
    case "Critical":
      return "#ef4444";
    default:
      return "#64748b";
  }
};

export default function TaskCard({ task, storyTitle, onClick }: TaskCardProps) {
  const typeColor = task.type === "Bug" ? "#ef4444" : "#3b82f6";

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
        transition: "0.2s",
        borderLeft: `5px solid ${typeColor}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h4 style={{ margin: 0, fontSize: "16px", lineHeight: 1.4 }}>
          {task.title}
        </h4>

        <span
          style={{
            fontSize: "11px",
            padding: "4px 8px",
            borderRadius: "999px",
            background: `${getPriorityColor(task.priority)}20`,
            color: getPriorityColor(task.priority),
            fontWeight: 700,
            whiteSpace: "nowrap",
            height: "fit-content",
          }}
        >
          {task.priority}
        </span>
      </div>

      <p
        style={{
          marginTop: "10px",
          marginBottom: "12px",
          color: "#64748b",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        {task.description}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "11px",
              padding: "4px 8px",
              borderRadius: "999px",
              background: task.type === "Bug" ? "#fee2e2" : "#dbeafe",
              color: task.type === "Bug" ? "#b91c1c" : "#1d4ed8",
              fontWeight: 700,
            }}
          >
            {task.type}
          </span>

          <span
            style={{
              fontSize: "11px",
              padding: "4px 8px",
              borderRadius: "999px",
              background: "#f8fafc",
              color: "#334155",
              border: "1px solid #e2e8f0",
            }}
          >
            {task.status}
          </span>
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "#475569",
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <span>Story: {storyTitle}</span>
          <span>Due: {task.dueDate || "—"}</span>
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          Assignee: {task.assignee || "Unassigned"}
        </div>
      </div>
    </div>
  );
}