import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";

// Define TypeScript interfaces based on your Prisma schema
interface Board {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  boards: Board[];
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Pull user and logout from context

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openProject, setOpenProject] = useState<string | null>(null);

  // Fetch projects from the backend on component mount
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, this just updates the local UI. 
      // Later, you can wire this up to an upload API endpoint.
      console.log("Avatar selected:", file.name);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading dashboard...</div>;
  }

  return (
    <div>
      {/* 🌟 HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "700" }}>Dashboard</h1>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => navigate("/notifications")}
            style={{
              background: "#6366f1",
              color: "white",
              border: "none",
              padding: "10px 14px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            🔔
          </button>

          <button
            onClick={() => {
              logout(); // Use context logout
              navigate("/login");
            }}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "10px 18px",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* 👤 PROFILE */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          padding: "20px",
          borderRadius: "14px",
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          marginBottom: "35px",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "#cbd5e1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#475569"
          }}
        >
          {/* Fallback avatar using user's initial */}
          {user?.username?.[0]?.toUpperCase() || "U"}
        </div>

        <div style={{ flex: 1 }}>
          <h2>{user?.username || "Loading..."}</h2>
          <p style={{ color: "#64748b" }}>{user?.email || "Loading..."}</p>

          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ marginTop: "10px" }}
          />
        </div>
      </div>

      {/* 📁 PROJECTS */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ fontSize: "20px", fontWeight: "600" }}>Recent Projects</h3>

          <button
            onClick={() => navigate("/projects")}
            style={{
              background: "#6366f1",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            View All
          </button>
        </div>

        {projects.length === 0 ? (
          <p style={{ color: "#64748b" }}>No projects found. Create one to get started!</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                style={{
                  background: "#fff",
                  padding: "18px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  position: "relative",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <h4>{p.name}</h4>

                <p style={{ color: "#64748b", fontSize: "14px" }}>
                  {p.boards.length} Boards
                </p>

                {p.boards.length > 0 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenProject(openProject === p.id ? null : p.id);
                      }}
                      style={{
                        marginTop: "12px",
                        background: "#f1f5f9",
                        color: "#1e293b",
                        border: "1px solid #e2e8f0",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <span>Select Board</span>
                      <span
                        style={{
                          transform: openProject === p.id ? "rotate(180deg)" : "rotate(0)",
                          transition: "0.2s",
                        }}
                      >
                        ▼
                      </span>
                    </button>

                    {openProject === p.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          marginTop: "10px",
                          background: "#fff",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                          overflow: "hidden",
                          zIndex: 20,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {p.boards.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => navigate(`/boards/${b.id}`)}
                            style={{
                              padding: "12px 14px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f1f5f9",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#f8fafc")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "white")
                            }
                          >
                            {b.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}