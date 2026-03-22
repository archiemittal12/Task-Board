import { useState } from "react";
import TaskCard from "./TaskCard";
import type { ColumnType, Task } from "../types";

type ColumnProps = {
  column: ColumnType;
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  onRename: () => void;
  onDelete: () => void;
  storyTitleById: Record<string, string>;
  // drag task
  onTaskDragStart: (e: React.DragEvent, task: Task) => void;
  onTaskDrop: (targetColumnId: string, beforeTaskId?: string, afterTaskId?: string) => void;
  // drag column
  onColumnDragStart: (e: React.DragEvent, columnId: string) => void;
  onColumnDragOver: (e: React.DragEvent, columnId: string) => void;
  onColumnDrop: (e: React.DragEvent, columnId: string) => void;
  isDragOverColumn: boolean;
};

export default function Column({
  column,
  onTaskClick,
  onAddTask,
  onRename,
  onDelete,
  storyTitleById,
  onTaskDragStart,
  onTaskDrop,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  isDragOverColumn,
}: ColumnProps) {
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<"above" | "below">("below");
  const [isDragOverBody, setIsDragOverBody] = useState(false);

  const iconButtonStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    border: "none",
    borderRadius: 10,
    padding: "8px 10px",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
  };

  const handleTaskDragOverBody = (e: React.DragEvent) => {
    // only accept task drags (not column drags)
    if (e.dataTransfer.types.includes("columnid")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOverBody(true);
  };

  const handleTaskDropOnBody = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverBody(false);
    setDragOverTaskId(null);
    // dropped on empty column body → append to end
    onTaskDrop(column.id);
  };

  const handleTaskDragOverTask = (e: React.DragEvent, taskId: string) => {
    if (e.dataTransfer.types.includes("columnid")) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setIsDragOverBody(false);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? "above" : "below";
    setDragOverTaskId(taskId);
    setDragOverPosition(position);
  };

  const handleTaskDropOnTask = (e: React.DragEvent, targetTask: Task) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTaskId(null);
    setIsDragOverBody(false);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isAbove = e.clientY < midY;

    if (isAbove) {
      onTaskDrop(column.id, targetTask.id, undefined); // drop before targetTask
    } else {
      onTaskDrop(column.id, undefined, targetTask.id); // drop after targetTask
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onColumnDragStart(e, column.id)}
      onDragOver={(e) => onColumnDragOver(e, column.id)}
      onDrop={(e) => onColumnDrop(e, column.id)}
      style={{
        minWidth: 300,
        background: isDragOverColumn ? "#eef2ff" : "#f8fafc",
        borderRadius: 16,
        padding: 14,
        boxShadow: isDragOverColumn
          ? "0 0 0 2px #6366f1, 0 8px 20px rgba(99,102,241,0.15)"
          : "0 8px 20px rgba(15,23,42,0.06)",
        border: isDragOverColumn ? "2px solid #6366f1" : "1px solid #e2e8f0",
        transition: "box-shadow 0.15s, border 0.15s, background 0.15s",
        cursor: "default",
      }}
    >
      {/* COLUMN HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <h3 style={{ fontSize: 17, margin: 0, fontWeight: 700 }}>{column.title}</h3>
          {column.wipLimit && (
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              WIP: {column.tasks.length}/{column.wipLimit}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={iconButtonStyle} onClick={onRename} title="Rename">
            ✏️
          </button>
          <button style={iconButtonStyle} onClick={onDelete} title="Delete">
            🗑
          </button>
        </div>
      </div>

      {/* TASK DROP BODY */}
      <div
        onDragOver={handleTaskDragOverBody}
        onDragLeave={() => setIsDragOverBody(false)}
        onDrop={handleTaskDropOnBody}
        style={{
          display: "grid",
          gap: 10,
          minHeight: 40,
          background: isDragOverBody ? "#e0e7ff" : "transparent",
          borderRadius: 8,
          transition: "background 0.15s",
          padding: isDragOverBody ? 4 : 0,
        }}
      >
        {column.tasks.map((task) => (
          <div key={task.id}>
            {/* Drop indicator ABOVE */}
            {dragOverTaskId === task.id && dragOverPosition === "above" && (
              <div style={{ height: 3, background: "#6366f1", borderRadius: 2, marginBottom: 4 }} />
            )}

            <div
              onDragOver={(e) => handleTaskDragOverTask(e, task.id)}
              onDragLeave={() => setDragOverTaskId(null)}
              onDrop={(e) => handleTaskDropOnTask(e, task)}
              style={{
                opacity: dragOverTaskId === task.id ? 0.6 : 1,
                transition: "opacity 0.15s",
              }}
            >
              <TaskCard
                task={task}
                storyTitle={storyTitleById[task.parentId ?? ""] || "No Story"}
                onClick={() => onTaskClick(task)}
                onDragStart={onTaskDragStart}
              />
            </div>

            {/* Drop indicator BELOW */}
            {dragOverTaskId === task.id && dragOverPosition === "below" && (
              <div style={{ height: 3, background: "#6366f1", borderRadius: 2, marginTop: 4 }} />
            )}
          </div>
        ))}

        {column.tasks.length === 0 && !isDragOverBody && (
          <div style={{ textAlign: "center", color: "#cbd5e1", fontSize: 13, padding: "16px 0" }}>
            Drop tasks here
          </div>
        )}
      </div>

      {/* ADD TASK BUTTON */}
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
          fontSize: 14,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#dbe4ff")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#eef2ff")}
      >
        + Add Task
      </button>
    </div>
  );
}
