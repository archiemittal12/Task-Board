import { useState } from "react";
import apiClient from "../../../api/client";

type CreateStoryModalProps = {
  projectId: string;
  onClose: () => void;
  onCreate: () => void;
};

export default function CreateStoryModal({ projectId, onClose, onCreate }: CreateStoryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await apiClient.post(`/projects/${projectId}/stories`, {
        title,
        description,
        priority: "MEDIUM" // Default
      });
      onCreate();
      onClose();
    } catch (err) {
      alert("Failed to create story");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 16, width: 400 }}>
        <h2>Create Story</h2>
        <input placeholder="Story title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleCreate} style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px" }}>Create</button>
        </div>
      </div>
    </div>
  );
}