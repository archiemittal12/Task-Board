import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../api/client";

interface Board {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  boards: Board[];
}

const BACKEND = "http://localhost:3000";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [openProject, setOpenProject] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setUploadingAvatar(true);
    try {
      const res = await apiClient.patch("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        // Update AuthContext so avatar shows everywhere
        updateUser({ avatarUrl: res.data.avatarUrl });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const avatarUrl = user?.avatarUrl
    ? `${BACKEND}${user.avatarUrl}`
    : null;

  if (loading) return <div style={{ padding: "20px" }}>Loading dashboard...</div>;

  return (
    <div>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>Dashboard</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => navigate("/notifications")}
            style={{ background: "#6366f1", color: "white", border: "none", padding: "10px 14px", borderRadius: 10, cursor: "pointer" }}
          >
            🔔
          </button>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            style={{ background: "#ef4444", color: "white", border: "none", padding: "10px 18px", borderRadius: 10, cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* PROFILE */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: 20, borderRadius: 14, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", marginBottom: 35 }}>
        
        {/* Avatar — clickable */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#cbd5e1", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: "bold", color: "#475569",
            cursor: "pointer", flexShrink: 0, position: "relative",
            border: "3px solid #e2e8f0",
          }}
          title="Click to change avatar"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            user?.username?.[0]?.toUpperCase() || "U"
          )}
          {/* Hover overlay */}
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.2s", borderRadius: "50%",
            fontSize: 13, color: "#fff", fontWeight: 600,
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
          >
            {uploadingAvatar ? "..." : "Edit"}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarChange}
          style={{ display: "none" }}
        />

        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{user?.username || "—"}</h2>
          <p style={{ margin: "4px 0 0 0", color: "#64748b" }}>{user?.email || "—"}</p>
          <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#94a3b8" }}>
            {uploadingAvatar ? "Uploading..." : "Click avatar to change photo"}
          </p>
        </div>
      </div>

      {/* RECENT PROJECTS */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Recent Projects</h3>
          <button
            onClick={() => navigate("/projects")}
            style={{ background: "#6366f1", color: "white", padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer" }}
          >
            View All
          </button>
        </div>

        {projects.length === 0 ? (
          <p style={{ color: "#64748b" }}>No projects found. Create one to get started!</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
            {projects.slice(0, 6).map(p => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                style={{
                  background: "#fff", padding: 18, borderRadius: 14,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  position: "relative", cursor: "pointer", transition: "0.2s",
                  border: "1px solid #e2e8f0",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                {/* Colour bar */}
                <div style={{ height: 4, background: "linear-gradient(90deg, #6366f1, #3b82f6)", borderRadius: 4, marginBottom: 12 }} />

                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{p.name}</h4>
                <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0 0" }}>
                  {p.boards.length} Board{p.boards.length !== 1 ? "s" : ""}
                </p>

                {p.boards.length > 0 && (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); setOpenProject(openProject === p.id ? null : p.id); }}
                      style={{
                        marginTop: 12, background: "#f1f5f9", color: "#1e293b",
                        border: "1px solid #e2e8f0", padding: "8px 12px",
                        borderRadius: 8, width: "100%",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        cursor: "pointer", fontSize: 13,
                      }}
                    >
                      <span>Select Board</span>
                      <span style={{ transform: openProject === p.id ? "rotate(180deg)" : "rotate(0)", transition: "0.2s" }}>▼</span>
                    </button>

                    {openProject === p.id && (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: "absolute", top: "100%", left: 0, right: 0,
                          marginTop: 6, background: "#fff", borderRadius: 12,
                          boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                          overflow: "hidden", zIndex: 20, border: "1px solid #e2e8f0",
                        }}
                      >
                        {p.boards.map(b => (
                          <div
                            key={b.id}
                            onClick={() => navigate(`/projects/${p.id}/boards/${b.id}`)}
                            style={{ padding: "12px 14px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: 14 }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                            onMouseLeave={e => (e.currentTarget.style.background = "white")}
                          >
                            📋 {b.name}
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