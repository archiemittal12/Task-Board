import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div>Dashboard</div>

      <div className="topbar-right">
        <button onClick={() => navigate("/notifications")}>🔔</button>
        <button onClick={() => navigate("/login")}>Logout</button>
      </div>
    </div>
  );
}
