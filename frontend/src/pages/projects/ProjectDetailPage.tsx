import { useParams } from "react-router-dom";
import { useState } from "react";

import SummaryTab from "./tabs/SummaryTab";
import BoardsTab from "./tabs/BoardsTab";
import MembersTab from "./tabs/MembersTab";

const project = {
  id: 1,
  name: "Alpha Project",
  description: "This is a sample project",
  role: "Admin",
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div>
      {/* HEADER */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2>{project.name}</h2>
        <p style={{ color: "#64748b" }}>{project.description}</p>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <button onClick={() => setActiveTab("summary")}>
          Summary
        </button>

        <button onClick={() => setActiveTab("boards")}>
          Boards
        </button>

        <button onClick={() => setActiveTab("members")}>
          Members
        </button>
      </div>

      {/* CONTENT */}
      <div>
        {activeTab === "summary" && <SummaryTab />}
        {activeTab === "boards" && <BoardsTab />}
        {activeTab === "members" && <MembersTab />}
      </div>
    </div>
  );
}