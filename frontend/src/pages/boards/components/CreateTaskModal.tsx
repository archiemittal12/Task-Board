import { useState } from "react";

export default function CreateTaskModal({ onClose, onCreate }: any) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Task");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  const handleSubmit = () => {
    if (!title) return;

    const newTask = {
      id: Date.now(),
      title,
      type,
      description,
      priority,
    };

    onCreate(newTask);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create Task</h2>

        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>Task</option>
          <option>Story</option>
          <option>Bug</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={handleSubmit}>Create</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}