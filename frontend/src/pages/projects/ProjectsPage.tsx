import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from "../../api/client";

// Ensure IDs are strings and include isArchived
type Project = {
  id: string;
  name: string;
  description: string;
  isArchived: boolean;
  createdAt?: string;
};

export default function ProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  // ✅ FETCH PROJECTS ON MOUNT
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get('/projects');
        setProjects(response.data.projects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // ✅ CREATE PROJECT
  const createProject = async () => {
    if (!name.trim()) return;

    try {
      const response = await apiClient.post('/projects', {
        name,
        description: desc,
      });

      setProjects((prev) => [response.data.project, ...prev]);

      setName("");
      setDesc("");
      setShowModal(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  // ✅ UPDATE PROJECT NAME
  const updateProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newName = prompt("Update project name");
    if (!newName) return;

    try {
      await apiClient.put(`/projects/${id}`, { name: newName });
      
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, name: newName } : p
        )
      );
    } catch (error: any) {
      console.error("Failed to update project:", error);
      if (error.response?.status === 403) {
        alert("Only Project Admins can update this project.");
      } else {
        alert("Failed to update project.");
      }
    }
  };

  // ✅ TOGGLE ARCHIVE STATUS
  const toggleArchiveProject = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation();
    const action = currentStatus ? "unarchive" : "archive";
    const confirmArchive = window.confirm(`Are you sure you want to ${action} this project?`);
    if (!confirmArchive) return;

    try {
      await apiClient.put(`/projects/${id}`, { isArchived: !currentStatus });
      
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isArchived: !currentStatus } : p
        )
      );
    } catch (error: any) {
      console.error(`Failed to ${action} project:`, error);
      if (error.response?.status === 403) {
        alert(`Only Project Admins can ${action} this project.`);
      } else {
        alert(`Failed to ${action} project.`);
      }
    }
  };

  // ✅ PERMANENT DELETE PROJECT
  const deleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this project? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/projects/${id}`);
      
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error: any) {
      console.error("Failed to delete project:", error);
      if (error.response?.status === 403) {
        alert("Only Project Admins can delete this project.");
      } else {
        alert("Failed to delete project.");
      }
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading projects...</div>;
  }

  return (
    <div>
      {/* 🔥 HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h1 style={{ fontSize: "30px", fontWeight: "700" }}>Projects</h1>

        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "#6366f1",
            color: "white",
            padding: "10px 18px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          + Create Project
        </button>
      </div>

      {/* 🔥 GRID */}
      {projects.length === 0 ? (
        <p style={{ color: "#64748b" }}>No projects found. Create one to get started!</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                if (!p.isArchived) {
                  navigate(`/projects/${p.id}`);
                }
              }}
              style={{
                background: "#ffffff",
                padding: "20px",
                borderRadius: "16px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                cursor: p.isArchived ? "not-allowed" : "pointer",
                transition: "0.2s",
                opacity: p.isArchived ? 0.6 : 1,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
              onMouseEnter={(e) => {
                if (!p.isArchived) {
                  e.currentTarget.style.transform = "translateY(-5px)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* NAME */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                {/* STATUS BADGE */}
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    background: p.isArchived ? "#fee2e2" : "#dcfce3",
                    color: p.isArchived ? "#ef4444" : "#22c55e",
                  }}
                >
                  {p.isArchived ? "Archived" : "Active"}
                </span>
              </div>

              {/* DESCRIPTION */}
              <p
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                  margin: 0,
                  flex: 1, 
                }}
              >
                {p.description || "No description provided."}
              </p>

              {/* ACTIONS */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                <button
                  onClick={(e) => updateProject(e, p.id)}
                  disabled={p.isArchived}
                  style={{
                    flex: 1,
                    padding: "6px",
                    borderRadius: "6px",
                    border: "none",
                    background: p.isArchived ? "#94a3b8" : "#3b82f6",
                    color: "white",
                    fontWeight: "500",
                    cursor: p.isArchived ? "not-allowed" : "pointer",
                    fontSize: "13px"
                  }}
                >
                  Rename
                </button>

                <button
                  onClick={(e) => toggleArchiveProject(e, p.id, p.isArchived)}
                  style={{
                    flex: 1,
                    padding: "6px",
                    borderRadius: "6px",
                    border: "none",
                    background: p.isArchived ? "#22c55e" : "#f59e0b",
                    color: "white",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  {p.isArchived ? "Unarchive" : "Archive"}
                </button>

                <button
                  onClick={(e) => deleteProject(e, p.id)}
                  style={{
                    flex: 1,
                    padding: "6px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#ef4444",
                    color: "white",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔥 CREATE MODAL */}
      {showModal && (
        <div 
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div 
            className="modal"
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "400px",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <h2 style={{ margin: 0 }}>Create Project</h2>

            <input
              placeholder="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />

            <textarea
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", minHeight: "80px" }}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 10,
                justifyContent: "flex-end"
              }}
            >
              <button 
                onClick={() => setShowModal(false)}
                style={{ padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", background: "#e2e8f0" }}
              >
                Cancel
              </button>

              <button 
                onClick={createProject}
                style={{ padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", background: "#6366f1", color: "white" }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}