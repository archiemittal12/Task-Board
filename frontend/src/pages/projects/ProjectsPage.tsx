import { useNavigate } from "react-router-dom";
import { useState } from "react";

type Project = {
  id: number;
  name: string;
  description: string;
  archived: boolean;
};

export default function ProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "Alpha Project",
      description: "UI + Backend work",
      archived: false,
    },
    {
      id: 2,
      name: "Beta Project",
      description: "API + Integration",
      archived: false,
    },
    {
      id: 3,
      name: "Gamma Project",
      description: "Testing + QA",
      archived: false,
    },
  ]);

  // 🔥 MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  // ✅ CREATE PROJECT
  const createProject = () => {
    if (!name.trim()) return;

    const newProject: Project = {
      id: Date.now(),
      name,
      description: desc,
      archived: false,
    };

    setProjects((prev) => [...prev, newProject]);

    // reset
    setName("");
    setDesc("");
    setShowModal(false);
  };

  // ✅ UPDATE PROJECT
  const updateProject = (id: number) => {
    const newName = prompt("Update project name");
    if (!newName) return;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: newName } : p
      )
    );
  };

  // ✅ ARCHIVE PROJECT
  const archiveProject = (id: number) => {
    const confirmArchive = window.confirm("Archive this project?");
    if (!confirmArchive) return;

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
        <h1 style={{ fontSize: "30px", fontWeight: "700" }}>
          Projects
        </h1>

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
              borderRadius: "16px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
              cursor: p.archived ? "not-allowed" : "pointer",
              transition: "0.2s",
              opacity: p.archived ? 0.6 : 1,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
            onMouseEnter={(e) => {
              if (!p.archived) {
                e.currentTarget.style.transform =
                  "translateY(-5px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* NAME */}
            <h3 style={{ margin: 0 }}>{p.name}</h3>

            {/* DESCRIPTION */}
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                margin: 0,
              }}
            >
              {p.description}
            </p>

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

            {/* ACTIONS */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "10px",
              }}
              onClick={(e) => e.stopPropagation()}
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
                  cursor: p.archived
                    ? "not-allowed"
                    : "pointer",
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
                  cursor: p.archived
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Project</h2>

            <input
              placeholder="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <textarea
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 10,
              }}
            >
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>

              <button onClick={createProject}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}