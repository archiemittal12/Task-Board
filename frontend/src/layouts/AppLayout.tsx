import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

export default function AppLayout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "30px 40px",
          overflowY: "auto",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}
