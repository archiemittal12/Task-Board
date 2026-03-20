import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-container">
      {/* LEFT */}
      <div className="auth-left">
        <h1>TaskBoard</h1>
        <p>Manage projects with clarity and speed.</p>

        <div className="auth-features">
          <p>✔ Kanban Boards</p>
          <p>✔ Role-based access</p>
          <p>✔ Real-time collaboration</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="auth-card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}