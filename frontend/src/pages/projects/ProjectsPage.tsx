import { useNavigate } from "react-router-dom";
import { FolderKanban, Users } from "lucide-react";

const projects = [
  { id: 1, name: "Alpha Project", boards: 3, role: "Admin" },
  { id: 2, name: "Beta Project", boards: 5, role: "Member" },
  { id: 3, name: "Gamma Project", boards: 2, role: "Viewer" },
  { id: 4, name: "Delta Project", boards: 4, role: "Member" },
];

const getRoleColor = (role: string) => {
  switch (role) {
    case "Admin":
      return "#22c55e"; // green
    case "Member":
      return "#3b82f6"; // blue
    case "Viewer":
      return "#94a3b8"; // gray
    default:
      return "#64748b";
  }
};

export default function ProjectsPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>All Projects</h2>

        <button>Create Project</button>
      </div>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        {projects.map((p) => (
          <div
            key={p.id}
            className="card"
            style={{
              cursor: "pointer",
              transition: "0.2s",
            }}
            onClick={() => navigate(`/projects/${p.id}`)}
          >
            {/* TOP */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <FolderKanban size={20} />
              <span
                style={{
                  background: getRoleColor(p.role),
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                {p.role}
              </span>
            </div>

            {/* TITLE */}
            <h3 style={{ marginTop: 12 }}>{p.name}</h3>

            {/* INFO */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#64748b",
                marginTop: 8,
              }}
            >
              <Users size={16} />
              {p.boards} Boards
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}