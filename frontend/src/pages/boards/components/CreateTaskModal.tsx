import { useState } from "react";
import apiClient from "../../../api/client";
import type { ColumnType, Story, Task, TaskPriority, TaskType } from "../types";

type CreateTaskModalProps = {
  onClose: () => void;
  onCreate: () => void;
  stories: Story[];
  columns: ColumnType[];
  defaultStatus: string;
};

export default function CreateTaskModal({ onClose, onCreate, stories, columns, defaultStatus }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [type, setType] = useState<TaskType>("TASK");
  const [storyId, setStoryId] = useState(stories[0]?.id || "");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !storyId) return;

    // Find the correct column ID for the selected status
    const selectedColumn = columns.find(c => c.title === status);
    if (!selectedColumn) return;

    try {
      await apiClient.post(`/columns/${selectedColumn.id}/tasks`, {
        title,
        description,
        priority,
        type,
        parentId: storyId,
        dueDate: dueDate || null
      });
      onCreate();
      onClose();
    } catch (err) {
      alert("Failed to create task");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 16, width: 500 }}>
        <h2>Create New Task</h2>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />
        
        <label>Story</label>
        <select value={storyId} onChange={e => setStoryId(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }}>
          {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>

        <div style={{ display: "flex", gap: 10 }}>
          <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <select value={type} onChange={e => setType(e.target.value as TaskType)}>
            <option value="TASK">Task</option>
            <option value="BUG">Bug</option>
          </select>
        </div>

        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit} style={{ background: "#6366f1", color: "#fff", padding: "8px 16px", border: "none", borderRadius: 8 }}>Create</button>
        </div>
      </div>
    </div>
  );
}