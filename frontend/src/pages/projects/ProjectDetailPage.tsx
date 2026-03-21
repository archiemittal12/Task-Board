import { useParams } from "react-router-dom";
import { useState } from "react";

import SummaryTab from "./tabs/SummaryTab";
import BoardsTab from "./tabs/BoardsTab";
import MembersTab from "./tabs/MembersTab";

export default function ProjectDetailPage() {
  const { id } = useParams();

  // 🔥 PROJECT DATA (DUMMY)
  const [project, setProject] = useState({
    id: Number(id),
    name: "Alpha Project",
    description: "This is a sample project",
    role: "Admin",
    createdAt: "20 March 2026",
    updatedAt: "21 March 2026",
  });

  const [activeTab, setActiveTab] = useState("summary");

  const [members, setMembers] = useState([
    { name: "Archie", role: "Admin" },
    { name: "Rahul", role: "Member" },
  ]);

  // 🔥 ADD MEMBER
  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      { name: "New User", role: "Viewer" },
    ]);
  };

  return (
    <div>
      {/* 🔥 HEADER */}
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          marginBottom: "20px",
        }}
      >
        {/* TOP ROW */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2>{project.name}</h2>
            <p style={{ color: "#64748b" }}>
              {project.description}
            </p>
          </div>

          {/* ROLE BADGE */}
          <span
            style={{
              background: "#22c55e",
              color: "white",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {project.role}
          </span>
        </div>

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          <button
            onClick={addMember}
            style={{
              background: "#6366f1",
              color: "white",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            + Assign User
          </button>

          <select
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <option>Admin</option>
            <option>Member</option>
            <option>Viewer</option>
          </select>
        </div>
      </div>

      {/* 🔥 TABS */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        {["summary", "boards", "members"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background:
                activeTab === tab ? "#6366f1" : "#f1f5f9",
              color:
                activeTab === tab ? "white" : "#1e293b",
              fontWeight: "500",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* 🔥 CONTENT */}
      <div>
        {activeTab === "summary" && (
          <SummaryTab
            createdAt={project.createdAt}
            updatedAt={project.updatedAt}
          />
        )}

        {activeTab === "boards" && <BoardsTab />}

        {activeTab === "members" && (
          <MembersTab members={members} />
        )}
      </div>
    </div>
  );
}