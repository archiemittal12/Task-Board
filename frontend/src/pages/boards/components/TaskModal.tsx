import { useEffect, useState } from "react";
import apiClient from "../../../api/client";
import type { ColumnType, Story, Task, TaskPriority, TaskType } from "../types";
import { useAuth } from "../../../context/AuthContext";
import ActivityPanel from "./ActivityPanel";

type TaskModalProps = {
  task: Task;
  stories: Story[];
  columns: ColumnType[];
  boardId: string;
  members?: { userId: string; name: string; username: string; role: string }[];
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
};

export default function TaskModal({
  task,
  stories,
  columns,
  boardId,
  members = [],
  onClose,
  onSave,
  onDelete,
}: TaskModalProps) {
  const [draft, setDraft] = useState<Task>(task);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"comments" | "activity">("comments");
  const isAdmin =
    members.find((m) => m.userId === currentUser?.id)?.role === "ADMIN" ||
    currentUser?.globalRole === "ADMIN";
  const isAssignee = task.assigneeId === currentUser?.id;
  const canEdit = isAdmin || isAssignee;

  useEffect(() => {
    const fetchFullTask = async () => {
      try {
        const res = await apiClient.get(
          `/projects/${task.projectId}/boards/${boardId}/columns/${task.columnId}/tasks/${task.id}`
        );
        if (res.data.success) {
          setDraft(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch task details", err);
      }
    };
    fetchFullTask();
  }, [task.id]);

  const taskBase = `/projects/${task.projectId}/boards/${boardId}/columns/${task.columnId}/tasks/${task.id}`;

  const currentStory = stories.find((s) => s.id === draft.parentId);

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
    fontSize: 13,
    fontWeight: 600,
    color: "#475569",
    marginBottom: 6,
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await apiClient.post(`${taskBase}/comments`, { content: newComment });
      setNewComment("");
      const res = await apiClient.get(taskBase);
      if (res.data.success) setDraft(res.data.data);
      onSave();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to add comment");
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.put(taskBase, {
        title: draft.title,
        description: draft.description,
        priority: draft.priority,
        dueDate: draft.dueDate,
        assigneeId: draft.assigneeId || null,
      });
      onSave();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try {
      await apiClient.delete(taskBase);
      onDelete();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  const typeBadgeColor = draft.type === "BUG" ? "#fef2f2" : "#eff6ff";
  const typeBadgeText = draft.type === "BUG" ? "#ef4444" : "#3b82f6";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "min(1100px, 96vw)",
          background: "#fff",
          borderRadius: 20,
          padding: "28px 32px",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: 6,
                background: typeBadgeColor,
                color: typeBadgeText,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {draft.type}
            </span>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
              {task.title}
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>
              Story: {currentStory?.title || "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 8,
              width: 36,
              height: 36,
              cursor: "pointer",
              fontSize: 18,
              color: "#64748b",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
        {/* TWO COLUMN LAYOUT */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
          {/* LEFT — Edit fields */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: "#f8fafc",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <div>
              <label style={labelStyle}>Title</label>
              <input
                value={draft.title}
                onChange={(e) =>
                  canEdit ? setDraft({ ...draft, title: e.target.value }) : undefined
                }
                readOnly={!canEdit}
                style={{
                  ...inputStyle,
                  background: canEdit ? "#fff" : "#f8fafc",
                  cursor: canEdit ? "text" : "not-allowed",
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={draft.description || ""}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={5}
                disabled={!canEdit}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily: "inherit",
                  background: canEdit ? "#fff" : "#f8fafc",
                }}
              />
            </div>

            {/* Status + Priority */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={draft.columnId || ""}
                  onChange={(e) => setDraft({ ...draft, columnId: e.target.value })}
                  disabled={!canEdit}
                  style={{ ...inputStyle, background: canEdit ? "#fff" : "#f8fafc" }}
                >
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Priority</label>
                <select
                  value={draft.priority}
                  onChange={(e) => setDraft({ ...draft, priority: e.target.value as TaskPriority })}
                  disabled={!canEdit}
                  style={{ ...inputStyle, background: canEdit ? "#fff" : "#f8fafc" }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {/* Type + Story */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Type</label>
                <select
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value as TaskType })}
                  disabled={!canEdit}
                  style={{ ...inputStyle, background: canEdit ? "#fff" : "#f8fafc" }}
                >
                  <option value="TASK">Task</option>
                  <option value="BUG">Bug</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Story</label>
                <select
                  value={draft.parentId || ""}
                  onChange={(e) => setDraft({ ...draft, parentId: e.target.value })}
                  disabled={!canEdit}
                  style={{ ...inputStyle, background: canEdit ? "#fff" : "#f8fafc" }}
                >
                  {stories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignee + Reporter */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Assignee</label>
                {members.length > 0 ? (
                  <select
                    value={draft.assigneeId || ""}
                    onChange={(e) => setDraft({ ...draft, assigneeId: e.target.value || null })}
                    disabled={!canEdit}
                    style={{ ...inputStyle, background: canEdit ? "#fff" : "#f8fafc" }}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.name} (@{m.username})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={
                      draft.assignee?.name ||
                      members.find((m) => m.userId === draft.assigneeId)?.name ||
                      "Unassigned"
                    }
                    readOnly
                    style={{ ...inputStyle, background: "#f8fafc", color: "#475569" }}
                  />
                )}
              </div>
              <div>
                <label style={labelStyle}>Reporter</label>
                <input
                  value={
                    draft.reporter?.name ||
                    members.find((m) => m.userId === draft.reporterId)?.name ||
                    draft.reporterId?.slice(0, 8) + "..." ||
                    "—"
                  }
                  readOnly
                  style={{
                    ...inputStyle,
                    background: "#f8fafc",
                    color: "#64748b",
                    cursor: "not-allowed",
                  }}
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label style={labelStyle}>Due Date</label>
              <input
                type="date"
                value={draft.dueDate ? new Date(draft.dueDate).toISOString().split("T")[0] : ""}
                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value || null })}
                disabled={!canEdit}
                style={{ ...inputStyle, background: canEdit ? "#fff" : "#f8fafc" }}
              />
            </div>
          </div>
          {/* RIGHT — Comments + Activity + metadata */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Tab switcher */}
            <div
              style={{
                display: "flex",
                gap: 0,
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
              }}
            >
              {(["comments", "activity"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    border: "none",
                    background: activeTab === tab ? "#6366f1" : "#fff",
                    color: activeTab === tab ? "#fff" : "#64748b",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {tab === "comments" ? "💬 Comments" : "📋 Activity"}
                </button>
              ))}
            </div>

            {activeTab === "comments" ? (
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    maxHeight: 220,
                    overflowY: "auto",
                    marginBottom: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {!draft.comments || draft.comments.length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>No comments yet.</p>
                  ) : (
                    draft.comments.map((c) => (
                      <CommentItem
                        key={c.id}
                        comment={c}
                        taskBase={taskBase}
                        currentUserId={currentUser?.id || ""}
                        members={members}
                        onRefresh={async () => {
                          const res = await apiClient.get(taskBase);
                          if (res.data.success) setDraft(res.data.data);
                        }}
                      />
                    ))
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment... Use @username to mention someone"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 13,
                      resize: "none",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, display: "block" }}>
                    Tip: @username to mention · Ctrl+Enter to post
                  </span>
                </div>
                <button
                  onClick={handleAddComment}
                  style={{
                    width: "100%",
                    marginTop: 8,
                    padding: 10,
                    borderRadius: 8,
                    border: "none",
                    background: "#e2e8f0",
                    color: "#475569",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#6366f1";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#e2e8f0";
                    e.currentTarget.style.color = "#475569";
                  }}
                >
                  Add Comment
                </button>
              </div>
            ) : (
              <div style={{ maxHeight: 380, overflowY: "auto" }}>
                <ActivityPanel
                  projectId={task.projectId}
                  boardId={boardId}
                  columnId={task.columnId || ""}
                  taskId={task.id}
                  columns={columns}
                />
              </div>
            )}

            {/* Metadata */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 12,
                padding: "14px 16px",
                fontSize: 13,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div>
                <span style={{ color: "#64748b", fontWeight: 600 }}>Story: </span>
                <span>{stories.find((s) => s.id === draft.parentId)?.title || "—"}</span>
              </div>
              <div>
                <span style={{ color: "#64748b", fontWeight: 600 }}>Status: </span>
                <span>{columns.find((c) => c.id === draft.columnId)?.title || draft.status}</span>
              </div>
              <div>
                <span style={{ color: "#64748b", fontWeight: 600 }}>Priority: </span>
                <span>{draft.priority}</span>
              </div>
              <div>
                <span style={{ color: "#64748b", fontWeight: 600 }}>Type: </span>
                <span>{draft.type}</span>
              </div>
            </div>
          </div>{" "}
          {/* closes RIGHT column */}
        </div>{" "}
        {/* closes TWO COLUMN GRID */}
        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 24,
          }}
        >
          {isAdmin ? (
            <button
              onClick={handleDelete}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "none",
                background: "#ef4444",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Delete Task
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: "#fff",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              {canEdit ? "Cancel" : "Close"}
            </button>
            {canEdit && (
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: isSubmitting ? "#a5b4fc" : "#6366f1",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: 14,
                }}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  taskBase,
  currentUserId,
  members,
  onRefresh,
}: {
  comment: any;
  taskBase: string;
  currentUserId: string;
  members: { userId: string; name: string; username: string; role: string }[];
  onRefresh: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = comment.userId === currentUserId;
  const isAdmin = members.find((m) => m.userId === currentUserId)?.role === "ADMIN";
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setIsSubmitting(true);
    try {
      await apiClient.put(`${taskBase}/comments/${comment.id}`, { content: editContent });
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to edit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await apiClient.delete(`${taskBase}/comments/${comment.id}`);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  return (
    <div
      style={{
        padding: "10px 12px",
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#6366f1",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {comment.user?.avatarUrl ? (
              <img
                src={`http://localhost:3000${comment.user.avatarUrl}`}
                alt={comment.user.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              (comment.user?.name || "U")[0].toUpperCase()
            )}
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>
              {comment.user?.name || "Unknown"}
            </span>
            <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 8 }}>
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 4 }}>
          {canEdit && !isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditContent(comment.content);
              }}
              style={{
                padding: "2px 8px",
                fontSize: 11,
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                color: "#6366f1",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              style={{
                padding: "2px 8px",
                fontSize: 11,
                borderRadius: 6,
                border: "1px solid #fee2e2",
                background: "#fef2f2",
                color: "#ef4444",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Content or Edit mode */}
      {isEditing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={2}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #6366f1",
              fontSize: 13,
              fontFamily: "inherit",
              boxSizing: "border-box",
              outline: "none",
              resize: "none",
            }}
            autoFocus
          />
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                background: "#fff",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={isSubmitting}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "none",
                background: "#6366f1",
                color: "#fff",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
          {comment.content.split(/(@\w+)/g).map((part: string, i: number) =>
            part.startsWith("@") ? (
              <strong key={i} style={{ color: "#6366f1" }}>
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      )}
    </div>
  );
}
