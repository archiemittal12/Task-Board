import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/client";
import type { Board } from "../ProjectDetailPage";

interface BoardsTabProps {
  projectId: string;
  boards: Board[];
  isAdmin: boolean;
  refreshProject: () => void;
}

function CreateBoardModal({
  projectId,
  onClose,
  onCreate,
}: {
  projectId: string;
  onClose: () => void;
  onCreate: () => void;
}) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Board name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const boardRes = await apiClient.post(`/projects/${projectId}/boards`, { name: name.trim() });
      const boardId = boardRes.data.data.id;

      // Create 4 default columns sequentially to maintain order
      const defaultColumns = [
        { name: "To Do", status: "TODO" },
        { name: "In Progress", status: "IN_PROGRESS" },
        { name: "Review", status: "REVIEW" },
        { name: "Done", status: "DONE" },
      ];

      for (const col of defaultColumns) {
        await apiClient.post(`/projects/${projectId}/boards/${boardId}/columns`, col);
      }

      onCreate();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create board");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "min(420px, 94vw)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            padding: "24px 24px 0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              Create Board
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>
              Add a new Kanban board to this project
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
              color: "#64748b",
            }}
          >
            ✕
          </button>
        </div>
        <div
          style={{
            padding: "20px 24px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 600,
                color: "#1e293b",
                marginBottom: 6,
              }}
            >
              Board Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sprint 1, Backlog..."
              style={inputStyle}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
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
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isSubmitting}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "none",
                background: isSubmitting ? "#a5b4fc" : "#6366f1",
                color: "#fff",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {isSubmitting ? "Creating..." : "Create Board"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BoardsTab({ projectId, boards, isAdmin, refreshProject }: BoardsTabProps) {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, boardId: string, boardName: string) => {
    e.stopPropagation();
    if (!window.confirm(`Delete board "${boardName}"? This cannot be undone.`)) return;
    setDeletingId(boardId);
    try {
      await apiClient.delete(`/projects/${projectId}/boards/${boardId}`);
      refreshProject();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Failed to delete board. Make sure all tasks are removed first."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Boards</h3>
          <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b" }}>
            {boards.length} board{boards.length !== 1 ? "s" : ""} in this project
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: "#3b82f6",
              color: "white",
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            + Create Board
          </button>
        )}
      </div>

      {/* BOARDS GRID */}
      {boards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 16, margin: "0 0 16px 0", fontWeight: 500 }}>No boards yet</p>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: "#6366f1",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 20px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              + Create First Board
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {boards.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/projects/${projectId}/boards/${b.id}`)}
              style={{
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
              }}
            >
              {/* Colour top bar */}
              <div style={{ height: 6, background: "linear-gradient(90deg, #6366f1, #3b82f6)" }} />

              <div style={{ padding: "16px 18px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#1e293b",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {b.name}
                    </h4>
                    <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#94a3b8" }}>
                      Click to open Kanban
                    </p>
                  </div>

                  {/* Delete button — admin only */}
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDelete(e, b.id, b.name)}
                      disabled={deletingId === b.id}
                      title="Delete board"
                      style={{
                        marginLeft: 8,
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid #fee2e2",
                        background: "#fef2f2",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: 13,
                        flexShrink: 0,
                        opacity: deletingId === b.id ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => (
                        (e.currentTarget.style.background = "#ef4444"),
                        (e.currentTarget.style.color = "#fff")
                      )}
                      onMouseLeave={(e) => (
                        (e.currentTarget.style.background = "#fef2f2"),
                        (e.currentTarget.style.color = "#ef4444")
                      )}
                    >
                      🗑
                    </button>
                  )}
                </div>

                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "3px 10px",
                      borderRadius: 999,
                      background: "#eef2ff",
                      color: "#6366f1",
                      fontWeight: 600,
                    }}
                  >
                    Kanban
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateBoardModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onCreate={refreshProject}
        />
      )}
    </div>
  );
}
