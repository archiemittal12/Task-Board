import { useState } from "react";
import apiClient from "../../../api/client";
import type { Story, TaskPriority } from "../types";

type EditStoryModalProps = {
  projectId: string;
  story: Story;
  onClose: () => void;
  onSave: () => void;
};

export default function EditStoryModal({ projectId, story, onClose, onSave }: EditStoryModalProps) {
  const [title, setTitle] = useState(story.title);
  const [description, setDescription] = useState(story.description || "");
  const [priority, setPriority] = useState<TaskPriority>((story.priority as TaskPriority) || "MEDIUM");
  const [dueDate, setDueDate] = useState(
    story.dueDate ? new Date(story.dueDate).toISOString().split("T")[0] : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #e2e8f0", fontSize: 14, outline: "none",
    boxSizing: "border-box", background: "#fff",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 14, fontWeight: 600,
    color: "#1e293b", marginBottom: 6,
  };

  const handleSave = async () => {
    if (!title.trim()) { alert("Title is required"); return; }
    setIsSubmitting(true);
    try {
      await apiClient.put(`/projects/${projectId}/stories/${story.id}`, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || null,
      });
      onSave();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update story");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "min(500px, 94vw)", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        
        {/* HEADER */}
        <div style={{ padding: "24px 24px 0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Edit Story</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>Update story details</p>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b" }}>✕</button>
        </div>

        {/* BODY */}
        <div style={{ padding: "20px 24px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          
          <div>
            <label style={labelStyle}>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="Story title" />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} placeholder="Describe this story..." />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} style={inputStyle}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 500, fontSize: 14 }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={isSubmitting} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: isSubmitting ? "#a5b4fc" : "#6366f1", color: "#fff", cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14 }}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}