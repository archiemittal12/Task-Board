import { useNavigate } from "react-router-dom";

const boards = [
  { id: 1, name: "Sprint Board" },
  { id: 2, name: "Bug Tracking" },
];

export default function BoardsTab() {
  const navigate = useNavigate();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h3>Boards</h3>
        <button>Create Board</button>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        {boards.map((b) => (
          <div
            key={b.id}
            className="card"
            style={{ width: 220, cursor: "pointer" }}
            onClick={() => navigate(`/boards/${b.id}`)}
          >
            <h4>{b.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}