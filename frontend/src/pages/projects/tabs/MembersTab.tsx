import apiClient from "../../../api/client";
import type { ProjectMember } from "../ProjectDetailPage";

interface MembersTabProps {
  projectId: string;
  members: ProjectMember[];
  isAdmin: boolean;
  refreshProject: () => void;
}

export default function MembersTab({
  projectId,
  members,
  isAdmin,
  refreshProject,
}: MembersTabProps) {
  // 1. UPDATED: Accept userId instead of memberId
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Sending m.user.id to match the backend /:projectId/members/:userId
      await apiClient.put(`/projects/${projectId}/members/${userId}`, {
        role: newRole,
      });
      refreshProject();
    } catch (error: any) {
      console.error("Failed to update role:", error);
      alert(error.response?.data?.message || "Failed to update role.");
    }
  };

  // 2. NEW: Delete member functionality
  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      await apiClient.delete(`/projects/${projectId}/members/${userId}`);
      refreshProject();
    } catch (error: any) {
      console.error("Failed to remove member:", error);
      alert(error.response?.data?.message || "Failed to remove member.");
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <h3 style={{ margin: "0 0 15px 0", fontSize: "20px" }}>Project Members ({members.length})</h3>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {members.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: "600", color: "#1e293b" }}>{m.user.name}</p>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{m.user.email}</p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <select
                value={m.role}
                disabled={!isAdmin}
                onChange={(e) => handleRoleChange(m.user.id, e.target.value)} // Fixed: Passed m.user.id
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  background: isAdmin ? "#fff" : "#f8fafc",
                  cursor: isAdmin ? "pointer" : "not-allowed",
                  fontWeight: "500",
                  color: "#475569",
                }}
              >
                <option value="ADMIN">Admin</option>
                <option value="MEMBER">Member</option>
                <option value="VIEWER">Viewer</option>
              </select>

              {/* NEW: Remove button only visible to admins */}
              {isAdmin && (
                <button
                  onClick={() => handleRemoveMember(m.user.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid #ef4444",
                    background: "#fef2f2",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
