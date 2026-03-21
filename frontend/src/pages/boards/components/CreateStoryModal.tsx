import { useState } from "react";
import type { Story } from "../types";

type CreateStoryModalProps = {
  onClose: () => void;
  onCreate: (story: Story) => void;
};

export default function CreateStoryModal({
  onClose,
  onCreate,
}: CreateStoryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const formatToday = () =>
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const handleCreate = () => {
    if (!title.trim()) return;

    const newStory: Story = {
      id: Date.now(),
      title,
      description,
      createdAt: formatToday(),
      updatedAt: formatToday(),
    };

    onCreate(newStory);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create Story</h2>

        <input
          placeholder="Story title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleCreate}>Create</button>
        </div>
      </div>
    </div>
  );
}