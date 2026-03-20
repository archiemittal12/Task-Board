import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function DashboardPage() {
  const navigate = useNavigate();

  // USER STATE (for avatar upload)
  const [user, setUser] = useState({
    name: "Archie Mittal",
    email: "archie@gmail.com",
    avatar: "https://i.pravatar.cc/100",
  });

  // HANDLE AVATAR UPLOAD
  const handleAvatarChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUser({ ...user, avatar: url });
    }
  };

  // PROJECTS WITH BOARDS
  const projects = [
    {
      id: 1,
      name: "Alpha Project",
      boards: [
        { id: 1, name: "Sprint Board" },
        { id: 2, name: "Bug Board" },
      ],
    },
    {
      id: 2,
      name: "Beta Project",
      boards: [
        { id: 3, name: "Dev Board" },
        { id: 4, name: "Testing Board" },
      ],
    },
    {
      id: 3,
      name: "Gamma Project",
      boards: [
        { id: 5, name: "Release Board" },
      ],
    },
  ];

  // DROPDOWN STATE
  const [openProject, setOpenProject] = useState<number | null>(null);

  return (
    <div>
      {/* 🔥 DASHBOARD HEADING */}
      <h1 style={{ fontSize: 32, marginBottom: 25 }}>Dashboard</h1>

      {/* 👤 PROFILE CARD */}
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <img
          src={user.avatar}
          alt="avatar"
          style={{ width: 70, borderRadius: "50%" }}
        />

        <div style={{ flex: 1 }}>
          <h2>{user.name}</h2>
          <p style={{ color: "#64748b" }}>{user.email}</p>

          {/* Avatar Upload */}
          <input
            type="file"
            onChange={handleAvatarChange}
            style={{ marginTop: 10 }}
          />
        </div>
      </div>

      {/* 📁 RECENT PROJECTS */}
      <div>
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Recent Projects</h3>

          <button onClick={() => navigate("/projects")}>
            View All
          </button>
        </div>

        {/* 🔥 HORIZONTAL SCROLL PROJECTS */}
        <div className="project-row">
          {projects.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                width: 250,
                cursor: "pointer",
                position: "relative",
              }}
            >
              {/* PROJECT INFO */}
              <h4>{p.name}</h4>
              <p style={{ color: "#64748b" }}>
                {p.boards.length} Boards
              </p>

              {/* DROPDOWN BUTTON */}
              <button
                style={{ marginTop: 10 }}
                onClick={() =>
                  setOpenProject(
                    openProject === p.id ? null : p.id
                  )
                }
              >
                View Boards
              </button>

              {/* 🔥 BOARDS DROPDOWN */}
              {openProject === p.id && (
                <div className="board-dropdown">
                  {p.boards.map((b) => (
                    <div
                      key={b.id}
                      className="board-item"
                      onClick={() =>
                        navigate(`/boards/${b.id}`)
                      }
                    >
                      {b.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}