import type { Story } from "../types";

type StoryCardProps = {
  story: Story;
  taskCount: number;
  doneCount: number;
  onEdit: (story: Story) => void;
  onDelete: (storyId: number) => void;
};

export default function StoryCard({
  story,
  taskCount,
  doneCount,
  onEdit,
  onDelete,
}: StoryCardProps) {
  const progress =
    taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100);

  return (
    <div className="card" style={{ position: "relative" }}>
      {/* ACTIONS */}
      <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }}>
        <button onClick={() => onEdit(story)}>✏️</button>
        <button onClick={() => onDelete(story.id)}>🗑️</button>
      </div>

      <h3>{story.title}</h3>
      <p style={{ color: "#64748b" }}>{story.description}</p>

      <div style={{ marginTop: 10 }}>
        <p>
          {doneCount}/{taskCount} done
        </p>

        <div
          style={{
            height: 6,
            background: "#e2e8f0",
            borderRadius: 10,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "#6366f1",
              borderRadius: 10,
            }}
          />
        </div>
      </div>
    </div>
  );
}