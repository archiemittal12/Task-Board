import { useState } from "react";
import apiClient from "../../../api/client";

type AddColumnModalProps = {
  projectId: string;
  boardId: string;
  afterColumnId?: string;
  beforeColumnId?: string;
  onClose: () => void;
  onCreate: () => void;
};

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Done" },
];

export default function AddColumnModal({ projectId, boardId, afterColumnId, beforeColumnId, onClose, onCreate }: AddColumnModalProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("TODO");
  const [wipLimit, setWipLimit] = useState("");
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

  const handleCreate = async () => {
    if (!name.trim()) { alert("Column name is required"); return; }
    setIsSubmitting(true);
    try {
      await apiClient.post(
        `/projects/${projectId}/boards/${boardId}/columns`,
        {
          name: name.trim(),
          status,
          wipLimit: wipLimit ? parseInt(wipLimit) : undefined,
          afterColumnId: afterColumnId || undefined,
          beforeColumnId: beforeColumnId || undefined, 
        }
      );
      onCreate();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create column");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "min(460px, 94vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>

        {/* HEADER */}
        <div style={{ padding: "24px 24px 0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Add Workflow Column</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>Add a new status column to this board</p>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b" }}>✕</button>
        </div>

        {/* BODY */}
        <div style={{ padding: "20px 24px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          <div>
            <label style={labelStyle}>Column Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. In Review"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>WIP Limit <span style={{ fontWeight: 400, color: "#94a3b8" }}>(optional)</span></label>
              <input
                type="number"
                min="1"
                value={wipLimit}
                onChange={e => setWipLimit(e.target.value)}
                placeholder="e.g. 5"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 500, fontSize: 14 }}>
              Cancel
            </button>
            <button onClick={handleCreate} disabled={isSubmitting} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: isSubmitting ? "#a5b4fc" : "#6366f1", color: "#fff", cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14 }}>
              {isSubmitting ? "Creating..." : "Add Column"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}