import { useState } from "react";

export default function TaskModal({ task, onClose }: any) {
  const [comment, setComment] = useState("");

  if (!task) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* HEADER */}
        <div className="modal-header">
          <h2>{task.title}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* DETAILS */}
        <div className="modal-body">
          <div className="task-info">
            <p>
              <strong>Type:</strong> {task.type}
            </p>
            <p>
              <strong>Status:</strong> {task.status || "To Do"}
            </p>
            <p>
              <strong>Assignee:</strong> Archie
            </p>
          </div>

          <div className="task-description">
            <h4>Description</h4>
            <p>
              This is a dummy description of the task. You can edit this later.
            </p>
          </div>

          {/* COMMENTS */}
          <div className="comments-section">
            <h4>Comments</h4>

            <div className="comment-box">
              <p><strong>Rahul:</strong> Looks good 👍</p>
              <p><strong>Priya:</strong> Needs improvement</p>
            </div>

            <textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button>Add Comment</button>
          </div>
        </div>
      </div>
    </div>
  );
}