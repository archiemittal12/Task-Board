import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/client";
import type { Board } from "../ProjectDetailPage";

interface BoardsTabProps {
  projectId: string;
  boards: Board[];
  isAdmin: boolean;
  refreshProject: () => void;
}

export default function BoardsTab({ projectId, boards, isAdmin, refreshProject }: BoardsTabProps) {
  const navigate = useNavigate();

  const handleCreateBoard = async () => {
    const boardName = prompt("Enter new board name:");
    if (!boardName?.trim()) return;

    try {
      await apiClient.post(`/projects/${projectId}/boards`, { name: boardName });
      refreshProject(); // Reload the project data to show the new board
    } catch (error: any) {
      console.error("Failed to create board:", error);
      alert(error.response?.data?.error || "Failed to create board.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: "20px" }}>Boards</h3>
        {isAdmin && (
          <button
            onClick={handleCreateBoard}
            style={{
              background: "#3b82f6",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            + Create Board
          </button>
        )}
      </div>

      {boards.length === 0 ? (
        <p style={{ color: "#64748b" }}>No boards found for this project.</p>
      ) : (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {boards.map((b) => (
            <div
              key={b.id}
              onClick={() => navigate(`/boards/${b.id}`)}
              style={{
                width: 220,
                cursor: "pointer",
                background: "#ffffff",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <h4 style={{ margin: 0, color: "#1e293b" }}>{b.name}</h4>
              <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#64748b" }}>Click to open kanban</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}