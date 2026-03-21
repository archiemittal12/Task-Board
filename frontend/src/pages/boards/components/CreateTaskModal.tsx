import { useState } from "react";
import type { ColumnType, Story, Task, TaskComment } from "../types";

type CreateTaskModalProps = {
  onClose: () => void;
  onCreate: (task: Task) => void;
  stories: Story[];
  columns: ColumnType[];
  defaultStatus: string;
};

const formatToday = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default function CreateTaskModal({
  onClose,
  onCreate,
  stories,
  columns,
  defaultStatus,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(defaultStatus || columns[0]?.title || "To Do");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">(
    "Medium"
  );
  const [type, setType] = useState<"Task" | "Bug">("Task");
  const [assignee, setAssignee] = useState("");
  const [reporter, setReporter] = useState("Archie Mittal");
  const [dueDate, setDueDate] = useState("");
  const [storyId, setStoryId] = useState<number>(stories[0]?.id || 0);
  const [initialComment, setInitialComment] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !stories.length) return;

    const comments: TaskComment[] = initialComment.trim()
      ? [
          {
            id: Date.now() + 1,
            author: reporter.trim() || "Archie Mittal",
            text: initialComment.trim(),
            createdAt: formatToday(),
          },
        ]
      : [];

    const task: Task = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee: assignee.trim(),
      reporter: reporter.trim(),
      dueDate,
      storyId,
      type,
      comments,
    };

    onCreate(task);
    onClose();
  };

  const canCreate = stories.length > 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
    >
      <div
        style={{
          width: "min(980px, 96vw)",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
          padding: "24px",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0 }}>Create Task</h2>
            <p style={{ marginTop: 8, marginBottom: 0, color: "#64748b" }}>
              Add title, description, story link, workflow status, priority, assignee,
              reporter, due date, and comments.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {!canCreate ? (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 12,
              background: "#fff7ed",
              color: "#9a3412",
              border: "1px solid #fed7aa",
              fontWeight: 600,
            }}
          >
            Please create at least one Story first.
          </div>
        ) : (
          <>
            <div
              style={{
                marginTop: 20,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Design login screen"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this task or bug..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Story
                </label>
                <select
                  value={storyId}
                  onChange={(e) => setStoryId(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                >
                  {stories.map((story) => (
                    <option key={story.id} value={story.id}>
                      {story.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.title}>
                      {col.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "Task" | "Bug")}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                >
                  <option value="Task">Task</option>
                  <option value="Bug">Bug</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as "Low" | "Medium" | "High" | "Critical")
                  }
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Assignee
                </label>
                <input
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="e.g. Priya"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Reporter
                </label>
                <input
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  placeholder="e.g. Archie Mittal"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Initial Comment (optional)
                </label>
                <textarea
                  value={initialComment}
                  onChange={(e) => setInitialComment(e.target.value)}
                  placeholder="Add an initial comment..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 24,
              }}
            >
              <button
                onClick={onClose}
                style={{
                  background: "#e2e8f0",
                  color: "#0f172a",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={!canCreate || !title.trim()}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 16px",
                  cursor: !canCreate || !title.trim() ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  opacity: !canCreate || !title.trim() ? 0.6 : 1,
                }}
              >
                Create Task
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}