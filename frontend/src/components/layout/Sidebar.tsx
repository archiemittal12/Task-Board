import { NavLink } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <div className="sidebar">
      <h2>TaskBoard</h2>

      <nav>
        {user?.globalRole === "ADMIN" && <NavLink to="/admin">⚙️ Admin</NavLink>}
        <NavLink to="/dashboard">
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink to="/projects">
          <FolderKanban size={18} /> Projects
        </NavLink>

        <NavLink to="/notifications">
          <Bell size={18} /> Notifications
        </NavLink>
      </nav>
    </div>
  );
}
