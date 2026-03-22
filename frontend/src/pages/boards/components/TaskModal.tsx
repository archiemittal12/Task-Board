import { useEffect, useState } from "react";
import apiClient from "../../../api/client";
import type { ColumnType, Story, Task, TaskComment, TaskPriority, TaskType } from "../types";

type TaskModalProps = {
  task: Task;
  stories: Story[];
  columns: ColumnType[];
  onClose: () => void;
  onSave: () => void; // Changed to match refresh logic
  onDelete: () => void;
};

export default function TaskModal({ task, stories, columns, onClose, onSave, onDelete }: TaskModalProps) {
  const [draft, setDraft] = useState<Task>(task);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setDraft(task);
  }, [task]);

  // Use parentId to find the current story
  const currentStory = stories.find((s) => s.id === draft.parentId);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await apiClient.post(`/tasks/${task.id}/comments`, { content: newComment });
      setNewComment("");
      onSave(); // Refresh data
    } catch (err) {
      alert("Failed to add comment");
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.put(`/tasks/${task.id}`, {
        title: draft.title,
        description: draft.description,
        priority: draft.priority,
        dueDate: draft.dueDate,
        assigneeId: draft.assigneeId
      });
      onSave();
      onClose();
    } catch (err) {
      alert("Failed to save changes");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await apiClient.delete(`/tasks/${task.id}`);
      onDelete();
      onClose();
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ width: "min(1100px, 96vw)", background: "#ffffff", borderRadius: "20px", padding: "24px", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>{draft.title}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr", gap: 18, marginTop: 20 }}>
          <div style={{ display: "grid", gap: 14 }}>
            <input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #cbd5e1" }} />
            <textarea value={draft.description || ""} onChange={e => setDraft({ ...draft, description: e.target.value })} rows={5} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #cbd5e1" }} />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <select value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value as TaskPriority })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <select value={draft.parentId || ""} onChange={e => setDraft({ ...draft, parentId: e.target.value })}>
                {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 16 }}>
            <h4>Comments</h4>
            <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 10 }}>
              {draft.comments?.map(c => (
                <div key={c.id} style={{ padding: 8, background: "#fff", marginBottom: 8, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <small style={{ fontWeight: "bold" }}>{c.user?.name || "User"}</small>
                  <p style={{ margin: "4px 0", fontSize: 14 }}>{c.content}</p>
                </div>
              ))}
            </div>
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add comment..." style={{ width: "100%", padding: 8 }} />
            <button onClick={handleAddComment} style={{ width: "100%", marginTop: 8 }}>Post</button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button onClick={handleDelete} style={{ color: "red" }}>Delete Task</button>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleSave} style={{ background: "#6366f1", color: "#fff", padding: "8px 16px", borderRadius: 12, border: "none" }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}