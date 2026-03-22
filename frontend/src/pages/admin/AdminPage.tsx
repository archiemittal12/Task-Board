import { useState, useEffect } from "react";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  globalRole: string;
  avatarUrl?: string | null;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  isArchived: boolean;
  createdAt: string;
  members: { userId: string; role: string }[];
}

const BACKEND = "http://localhost:3000";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"users" | "projects">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect non-admins immediately
  useEffect(() => {
    if (user && user.globalRole !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        apiClient.get("/users/all"),
        apiClient.get("/projects/all"),
      ]);
      if (usersRes.data.success) setUsers(usersRes.data.data);
      if (projectsRes.data.success) setProjects(projectsRes.data.data);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGlobalRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!window.confirm(`Change this user's global role to ${newRole}?`)) return;
    try {
      await apiClient.patch(`/users/${userId}/role`, { globalRole: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, globalRole: newRole } : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
    padding: "16px 20px",
  };

  if (user?.globalRole !== "ADMIN") return null;

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Admin Panel</h1>
          <span
            style={{
              background: "#6366f1",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 999,
            }}
          >
            GLOBAL ADMIN
          </span>
        </div>
        <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
          Manage all users and projects across the platform.
        </p>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {[
          { label: "Total Users", value: users.length, color: "#6366f1" },
          {
            label: "Global Admins",
            value: users.filter((u) => u.globalRole === "ADMIN").length,
            color: "#8b5cf6",
          },
          { label: "Total Projects", value: projects.length, color: "#3b82f6" },
          {
            label: "Active Projects",
            value: projects.filter((p) => !p.isArchived).length,
            color: "#22c55e",
          },
          {
            label: "Archived",
            value: projects.filter((p) => p.isArchived).length,
            color: "#f59e0b",
          },
        ].map((s) => (
          <div key={s.label} style={{ ...cardStyle, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600 }}>{s.label}</p>
            <p style={{ margin: "4px 0 0 0", fontSize: 26, fontWeight: 700, color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          marginBottom: 20,
          width: "fit-content",
        }}
      >
        {(["users", "projects"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 24px",
              border: "none",
              background: activeTab === tab ? "#6366f1" : "#fff",
              color: activeTab === tab ? "#fff" : "#64748b",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {tab === "users" ? "👥 Users" : "📁 Projects"}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading...</p>
      ) : activeTab === "users" ? (
        /* USERS TABLE */
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700 }}>
            All Users ({users.length})
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  {["User", "Email", "Username", "Global Role", "Joined", "Action"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: "#6366f1",
                            color: "#fff",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {u.avatarUrl ? (
                            <img
                              src={`${BACKEND}${u.avatarUrl}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            (u.name || u.username)[0].toUpperCase()
                          )}
                        </div>
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 12px", color: "#475569" }}>{u.email}</td>
                    <td style={{ padding: "12px 12px", color: "#475569" }}>@{u.username}</td>
                    <td style={{ padding: "12px 12px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: u.globalRole === "ADMIN" ? "#eef2ff" : "#f1f5f9",
                          color: u.globalRole === "ADMIN" ? "#6366f1" : "#64748b",
                        }}
                      >
                        {u.globalRole}
                      </span>
                    </td>
                    <td style={{ padding: "12px 12px", color: "#94a3b8", fontSize: 12 }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleToggleGlobalRole(u.id, u.globalRole)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "none",
                            background: u.globalRole === "ADMIN" ? "#fef2f2" : "#eef2ff",
                            color: u.globalRole === "ADMIN" ? "#ef4444" : "#6366f1",
                          }}
                        >
                          {u.globalRole === "ADMIN" ? "Revoke Admin" : "Make Admin"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* PROJECTS TABLE */
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700 }}>
            All Projects ({projects.length})
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  {["Project", "Description", "Members", "Status", "Created", "Action"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 12px", fontWeight: 700, color: "#1e293b" }}>
                      {p.name}
                    </td>
                    <td style={{ padding: "12px 12px", color: "#64748b", maxWidth: 200 }}>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {p.description || "—"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 12px", color: "#475569" }}>
                      {p.members?.length || 0}
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: p.isArchived ? "#fee2e2" : "#dcfce7",
                          color: p.isArchived ? "#ef4444" : "#16a34a",
                        }}
                      >
                        {p.isArchived ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 12px", color: "#94a3b8", fontSize: 12 }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 12px" }}>
                      <button
                        onClick={() => navigate(`/projects/${p.id}`)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          border: "1px solid #e2e8f0",
                          background: "#f8fafc",
                          color: "#475569",
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
