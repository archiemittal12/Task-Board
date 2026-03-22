import { useState } from "react";
import type { Story, Task } from "../types";

type StoryCardProps = {
  story: Story;
  taskCount: number;
  doneCount: number;
  allTasks: Task[]; // all tasks across all columns
  onEdit: (story: Story) => void;
  onDelete: (storyId: string) => void;
  isAdmin: boolean;
};
function deriveStoryStatus(children: Task[]): string {
  if (children.length === 0) return "TODO";
  const statuses = children.map((t) => t.status as string);
  if (statuses.every((s) => s === "DONE")) return "DONE";
  if (statuses.every((s) => s === "REVIEW")) return "REVIEW";
  if (statuses.every((s) => s === "TODO")) return "TODO";
  return "IN_PROGRESS";
}
const statusColors: Record<string, { bg: string; text: string }> = {
  TODO: { bg: "#f1f5f9", text: "#64748b" },
  IN_PROGRESS: { bg: "#fef3c7", text: "#d97706" },
  REVIEW: { bg: "#eff6ff", text: "#3b82f6" },
  DONE: { bg: "#dcfce7", text: "#16a34a" },
};

const priorityColors: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#3b82f6",
  HIGH: "#f59e0b",
  CRITICAL: "#ef4444",
};

const typeColors: Record<string, { bg: string; text: string }> = {
  TASK: { bg: "#eff6ff", text: "#3b82f6" },
  BUG: { bg: "#fef2f2", text: "#ef4444" },
};

export default function StoryCard({
  story,
  taskCount,
  doneCount,
  allTasks,
  isAdmin,
  onEdit,
  onDelete,
}: StoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const progress = taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100);
  const children = allTasks.filter((t) => t.parentId === story.id);
  const status =
    children.length > 0 ? deriveStoryStatus(children) : (story.status as string) || "TODO";
  const statusStyle = statusColors[status] || statusColors.TODO;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 4, background: "linear-gradient(90deg, #8b5cf6, #6366f1)" }} />

      <div style={{ padding: "14px 16px" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 6,
              }}
            >
              {/* Status badge */}
              <span
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: statusStyle.bg,
                  color: statusStyle.text,
                  fontWeight: 700,
                }}
              >
                {status.replace("_", " ")}
              </span>
              {/* Priority badge */}
              {story.priority && (
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: `${priorityColors[story.priority]}20`,
                    color: priorityColors[story.priority],
                    fontWeight: 700,
                  }}
                >
                  {story.priority}
                </span>
              )}
            </div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
              {story.title}
            </h3>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 6, marginLeft: 8, flexShrink: 0 }}>
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(story);
                }}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 8px",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ✏️
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(story.id);
              }}
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                border: "none",
                borderRadius: 8,
                padding: "6px 8px",
                color: "#fff",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              🗑
            </button>
          </div>
        </div>

        {/* Description */}
        {story.description && (
          <p style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: 13, lineHeight: 1.4 }}>
            {story.description}
          </p>
        )}

        {/* Due date */}
        {story.dueDate && (
          <p style={{ margin: "0 0 10px 0", fontSize: 12, color: "#94a3b8" }}>
            Due: {new Date(story.dueDate).toLocaleDateString()}
          </p>
        )}

        {/* Progress */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              {doneCount}/{taskCount} done
            </span>
            <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>{progress}%</span>
          </div>
          <div style={{ height: 6, background: "#e2e8f0", borderRadius: 10 }}>
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: progress === 100 ? "#22c55e" : "#6366f1",
                borderRadius: 10,
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>

        {/* Expand/collapse children */}
        {taskCount > 0 && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            style={{
              width: "100%",
              padding: "6px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#6366f1",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            {expanded ? "▲ Hide Tasks" : `▼ Show ${taskCount} Task${taskCount !== 1 ? "s" : ""}`}
          </button>
        )}
      </div>

      {/* Children task list */}
      {expanded && children.length > 0 && (
        <div
          style={{
            borderTop: "1px solid #e2e8f0",
            padding: "10px 16px",
            background: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {children.map((task) => {
            const tc = typeColors[task.type] || typeColors.TASK;
            const sc = statusColors[task.status as string] || statusColors.TODO;
            return (
              <div
                key={task.id}
                style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderLeft: `3px solid ${task.type === "BUG" ? "#ef4444" : "#3b82f6"}`,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                    {task.title}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: tc.bg,
                        color: tc.text,
                        fontWeight: 700,
                      }}
                    >
                      {task.type}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: sc.bg,
                        color: sc.text,
                        fontWeight: 600,
                      }}
                    >
                      {(task.status as string).replace("_", " ")}
                    </span>
                  </div>
                </div>
                {task.assignee && (
                  <p style={{ margin: "3px 0 0 0", fontSize: 11, color: "#94a3b8" }}>
                    Assignee: {task.assignee.name}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
