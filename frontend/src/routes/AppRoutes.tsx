import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";

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
                {/* DEFAULT ROUTE */}
                <Route path="/" element={<LoginPage />} />

                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                <Route element={<AppLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/boards/:id" element={<BoardPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}