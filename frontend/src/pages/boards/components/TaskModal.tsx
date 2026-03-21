import { useEffect, useState } from "react";
import type { ColumnType, Story, Task, TaskComment } from "../types";

type TaskModalProps = {
  task: Task;
  stories: Story[];
  columns: ColumnType[];
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: number) => void;
};

const formatToday = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default function TaskModal({
  task,
  stories,
  columns,
  onClose,
  onSave,
  onDelete,
}: TaskModalProps) {
  const [draft, setDraft] = useState<Task>(task);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setDraft(task);
    setNewComment("");
  }, [task]);

  const currentStory = stories.find((story) => story.id === draft.storyId);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: TaskComment = {
      id: Date.now(),
      author: draft.reporter || draft.assignee || "Archie Mittal",
      text: newComment.trim(),
      createdAt: formatToday(),
    };

    setDraft((prev) => ({
      ...prev,
      comments: [...prev.comments, comment],
    }));

    setNewComment("");
  };

  const handleSave = () => {
    if (!draft.title.trim()) return;
    onSave(draft);
    onClose();
  };

  const handleDelete = () => {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    onDelete(task.id);
    onClose();
  };

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
          width: "min(1100px, 96vw)",
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
            <div
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "999px",
                background: draft.type === "Bug" ? "#fee2e2" : "#dbeafe",
                color: draft.type === "Bug" ? "#b91c1c" : "#1d4ed8",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              {draft.type}
            </div>

            <h2 style={{ margin: 0 }}>{draft.title}</h2>

            <p style={{ marginTop: 8, marginBottom: 0, color: "#64748b" }}>
              Story: {currentStory?.title || "Unlinked"}
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
              height: "fit-content",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "1.4fr 0.9fr",
            gap: 18,
            alignItems: "start",
          }}
        >
          {/* LEFT SIDE */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                  Title
                </label>
                <input
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, title: e.target.value }))
                  }
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
                  Description
                </label>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={5}
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 14,
                }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
                    Status
                  </label>
                  <select
                    value={draft.status}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, status: e.target.value }))
                    }
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
                    Priority
                  </label>
                  <select
                    value={draft.priority}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        priority: e.target.value as Task["priority"],
                      }))
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
                    Type
                  </label>
                  <select
                    value={draft.type}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        type: e.target.value as Task["type"],
                      }))
                    }
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
                    Story
                  </label>
                  <select
                    value={draft.storyId}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, storyId: Number(e.target.value) }))
                    }
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
                    Assignee
                  </label>
                  <input
                    value={draft.assignee}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, assignee: e.target.value }))
                    }
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
                    value={draft.reporter}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, reporter: e.target.value }))
                    }
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
                    value={draft.dueDate}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, dueDate: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div>
              <h4 style={{ marginTop: 0, marginBottom: 8 }}>Comments</h4>

              <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
                {draft.comments.length === 0 ? (
                  <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                    No comments yet.
                  </p>
                ) : (
                  draft.comments.map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        background: "#f8fafc",
                        borderRadius: 12,
                        padding: 12,
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          fontSize: "12px",
                          color: "#64748b",
                          marginBottom: 6,
                        }}
                      >
                        <strong style={{ color: "#334155" }}>{comment.author}</strong>
                        <span>{comment.createdAt}</span>
                      </div>
                      <div style={{ fontSize: "14px", lineHeight: 1.5 }}>
                        {comment.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
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

              <button
                onClick={handleAddComment}
                style={{
                  marginTop: 10,
                  background: "#e2e8f0",
                  color: "#0f172a",
                  border: "none",
                  borderRadius: 12,
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontWeight: 700,
                  width: "100%",
                }}
              >
                Add Comment
              </button>
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                padding: 14,
                fontSize: 14,
                color: "#334155",
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <strong>Story:</strong> {currentStory?.title || "Unlinked"}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Status:</strong> {draft.status}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Priority:</strong> {draft.priority}
              </div>
              <div>
                <strong>Type:</strong> {draft.type}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 24,
          }}
        >
          <button
            onClick={handleDelete}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Delete Task
          </button>

          <div style={{ display: "flex", gap: 10 }}>
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
              onClick={handleSave}
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "10px 16px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}