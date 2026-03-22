import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import AdminPage from "../pages/admin/AdminPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProjectsPage from "../pages/projects/ProjectsPage";
import ProjectDetailPage from "../pages/projects/ProjectDetailPage";
import BoardPage from "../pages/boards/BoardPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* DEFAULT ROUTE → REDIRECT TO LOGIN */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* AUTH ROUTES */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* APP ROUTES */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/:projectId/boards/:boardId" element={<BoardPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
