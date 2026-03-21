import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([
    { id: 1, name: "Alpha Project", archived: false },
    { id: 2, name: "Beta Project", archived: false },
    { id: 3, name: "Gamma Project", archived: false },
  ]);

  // CREATE PROJECT
  const createProject = () => {
    const newProject = {
      id: Date.now(),
      name: `New Project ${projects.length + 1}`,
      archived: false,
    };
    setProjects((prev) => [...prev, newProject]);
  };

  // UPDATE PROJECT
  const updateProject = (id: number) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, name: p.name + " (Updated)" }
          : p
      )
    );
  };

  // ARCHIVE PROJECT
  const archiveProject = (id: number) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, archived: true } : p
      )
    );
  };

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
        <h1 style={{ fontSize: "28px", fontWeight: "700" }}>
          Projects
        </h1>

        <button
          onClick={createProject}
          style={{
            background: "#6366f1",
            color: "white",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          + Create Project
        </button>
      </div>

      {/* 🔥 GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              if (!p.archived) {
                navigate(`/projects/${p.id}`);
              }
            }}
            style={{
              background: "#ffffff",
              padding: "20px",
              borderRadius: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              cursor: p.archived ? "not-allowed" : "pointer",
              transition: "0.2s",
              opacity: p.archived ? 0.6 : 1,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
            onMouseEnter={(e) => {
              if (!p.archived) {
                e.currentTarget.style.transform =
                  "translateY(-4px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* PROJECT NAME */}
            <h3>{p.name}</h3>

            {/* STATUS */}
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: p.archived ? "#ef4444" : "#22c55e",
              }}
            >
              {p.archived ? "Archived" : "Active"}
            </span>

            {/* 🔥 BUTTONS (VISIBLE + SPACED) */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "10px",
              }}
              onClick={(e) => e.stopPropagation()} // 🔥 VERY IMPORTANT
            >
              <button
                onClick={() => updateProject(p.id)}
                disabled={p.archived}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#3b82f6",
                  color: "white",
                  fontWeight: "500",
                  cursor: p.archived ? "not-allowed" : "pointer",
                }}
              >
                Update
              </button>

              <button
                onClick={() => archiveProject(p.id)}
                disabled={p.archived}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#ef4444",
                  color: "white",
                  fontWeight: "500",
                  cursor: p.archived ? "not-allowed" : "pointer",
                }}
              >
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}