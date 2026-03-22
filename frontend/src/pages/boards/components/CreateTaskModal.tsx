import { useState } from "react";
import apiClient from "../../../api/client";
import type { ColumnType, Story, TaskPriority, TaskType } from "../types";
import { useAuth } from "../../../context/AuthContext";
interface Member {
  userId: string;
  name: string;
  username: string;
  role: string;
}
type CreateTaskModalProps = {
  projectId: string;
  boardId: string;
  onClose: () => void;
  onCreate: () => void;
  stories: Story[];
  columns: ColumnType[];
  defaultColumnId: string | null;
  members: Member[];
};

export default function CreateTaskModal({ projectId, boardId, onClose, onCreate, stories, columns, defaultColumnId, members }: CreateTaskModalProps) {
  const { user } = useAuth();
  const firstColumnId = defaultColumnId || columns[0]?.id || "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState(firstColumnId);
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [type, setType] = useState<TaskType>("TASK");
  const [storyId, setStoryId] = useState(stories[0]?.id || "");
  const [dueDate, setDueDate] = useState("");
  const [initialComment, setInitialComment] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) { alert("Title is required."); return; }
    if (!storyId) { alert("Please select a story."); return; }
    if (!selectedColumnId) { alert("Please select a column."); return; }

    setIsSubmitting(true);
    try {
      await apiClient.post(
        `/projects/${projectId}/boards/${boardId}/columns/${selectedColumnId}/tasks`,
        {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          type,
          parentId: storyId,
          dueDate: dueDate || null,
          assigneeId: assigneeId || undefined,  // ← THIS LINE ADDED
        }
      );
      onCreate();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: 6,
  };

  const fieldStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(15,23,42,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        width: "min(700px, 94vw)",
        maxHeight: "92vh",
        overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        {/* HEADER */}
        <div style={{ padding: "24px 24px 0 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Create Task</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>
              Add title, description, story link, workflow status, priority, assignee, reporter, due date, and comments.
            </p>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ✕
          </button>
        </div>

        {/* BODY */}
        <div style={{ padding: "20px 24px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Title */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Title</label>
            <input
              placeholder="e.g. Design login screen"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Description</label>
            <textarea
              placeholder="Describe this task or bug..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {/* Story + Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Story</label>
              <select value={storyId} onChange={e => setStoryId(e.target.value)} style={inputStyle}>
                {stories.length === 0
                  ? <option value="">No stories — create one first</option>
                  : stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)
                }
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Status</label>
              <select value={selectedColumnId} onChange={e => setSelectedColumnId(e.target.value)} style={inputStyle}>
                {columns.length === 0
                  ? <option value="">No columns</option>
                  : columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)
                }
              </select>
            </div>
          </div>

          {/* Type + Priority */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Type</label>
              <select value={type} onChange={e => setType(e.target.value as TaskType)} style={inputStyle}>
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} style={inputStyle}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {/* Assignee + Reporter */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={fieldStyle}>
            <label style={labelStyle}>Assignee</label>
            <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} style={inputStyle}>
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m.userId} value={m.userId}>
                  {m.name} (@{m.username})
                </option>
              ))}
            </select>
          </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Reporter</label>
              <input
                value={user?.username || user?.email || "You"}
                readOnly
                style={{ ...inputStyle, background: "#f8fafc", color: "#64748b", cursor: "not-allowed" }}
              />
            </div>
          </div>

          {/* Due Date */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Initial Comment */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Initial Comment <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span></label>
            <textarea
              placeholder="Add an initial comment..."
              value={initialComment}
              onChange={e => setInitialComment(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {/* FOOTER */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", color: "#1e293b", cursor: "pointer", fontWeight: 500, fontSize: 14 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: isSubmitting ? "#a5b4fc" : "#6366f1", color: "#fff", cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14 }}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}