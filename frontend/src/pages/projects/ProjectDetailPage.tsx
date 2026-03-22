import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext";

import SummaryTab from "./tabs/SummaryTab";
import BoardsTab from "./tabs/BoardsTab";
import MembersTab from "./tabs/MembersTab";

// TypeScript Interfaces
export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

export interface ProjectMember {
  id: string;
  role: string;
  user: UserInfo;
}

export interface Board {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  boards: Board[];
  members: ProjectMember[];
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");

  // Add Member State
  const [newMemberUsername, setNewMemberUsername] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("MEMBER");
  // Fetch Project Data
  const fetchProject = async () => {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      setProject(response.data.project);
    } catch (error: any) {
      console.error("Failed to fetch project:", error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        navigate("/projects"); // Redirect if not found or no access
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  // Handle Add Member
  const handleAddMember = async () => {
    if (!newMemberUsername.trim()) return;
    try {
      // Send username instead of email
      await apiClient.post(`/projects/${id}/members`, {
        username: newMemberUsername.trim(),
        role: newMemberRole,
      });
      setNewMemberUsername("");
      fetchProject(); // Refresh the project data to show the new member
    } catch (error: any) {
      console.error("Failed to add member:", error);
      alert(error.response?.data?.error || "Failed to add member.");
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading project details...</div>;
  if (!project) return <div style={{ padding: "20px" }}>Project not found.</div>;

  // Find current user's role in this project
  const currentUserMember = project.members.find((m) => m.user.id === user?.id);
  const currentUserRole = currentUserMember?.role || "VIEWER";
  const isAdmin = currentUserRole === "ADMIN";

  return (
    <div>
      {/* 🌟 HEADER */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "28px" }}>{project.name}</h2>
            <p style={{ color: "#64748b", marginTop: "8px" }}>
              {project.description || "No description provided."}
            </p>
          </div>
          <span
            style={{
              background: isAdmin ? "#6366f1" : "#22c55e",
              color: "white",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            My Role: {currentUserRole}
          </span>
        </div>

        {/* ACTIONS (Only Admins can add members) */}
        {/* ACTIONS (Only Admins can add members) */}
        {isAdmin && (
          <div style={{ display: "flex", gap: "10px", marginTop: "20px", alignItems: "center" }}>
            <input
              type="text" // Changed from email to text
              placeholder="Username to assign..."
              value={newMemberUsername}
              onChange={(e) => setNewMemberUsername(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", width: "250px" }}
            />
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              style={{ padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
            >
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button
              onClick={handleAddMember}
              style={{
                background: "#6366f1",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              + Assign User
            </button>
          </div>
        )}
      </div>

      {/* 🌟 TABS NAVIGATION */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        {["summary", "boards", "members"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: activeTab === tab ? "#6366f1" : "#f1f5f9",
              color: activeTab === tab ? "white" : "#1e293b",
              fontWeight: "500",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* 🌟 CONTENT */}
      <div>
        {activeTab === "summary" && (
          <SummaryTab createdAt={project.createdAt} updatedAt={project.updatedAt} />
        )}

        {activeTab === "boards" && (
          <BoardsTab 
            projectId={project.id} 
            boards={project.boards} 
            isAdmin={isAdmin} 
            refreshProject={fetchProject} 
          />
        )}

        {activeTab === "members" && (
          <MembersTab 
            projectId={project.id} 
            members={project.members} 
            isAdmin={isAdmin}
            refreshProject={fetchProject}
          />
        )}
      </div>
    </div>
  );
}