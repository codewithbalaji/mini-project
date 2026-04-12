import { createBrowserRouter, Navigate } from "react-router-dom";

import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import RoleGuard from "@/components/shared/RoleGuard";

import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import AcceptInvitationPage from "@/pages/auth/AcceptInvitationPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AnalyticsDashboardPage from "@/pages/dashboard/AnalyticsDashboardPage";
import UsersPage from "@/pages/users/UsersPage";
import DepartmentsPage from "@/pages/departments/DepartmentsPage";
import InvitationsPage from "@/pages/invitations/InvitationsPage";
import OrganizationSettingsPage from "@/pages/organization/OrganizationSettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

// Phase 2 — Projects
import ProjectsPage from "@/pages/projects/ProjectsPage";
import ProjectDetailPage from "@/pages/projects/ProjectDetailPage";
import CreateProjectPage from "@/pages/projects/CreateProjectPage";
import EditProjectPage from "@/pages/projects/EditProjectPage";

// Phase 2 — Tasks
import TasksPage from "@/pages/tasks/TasksPage";
import TaskDetailPage from "@/pages/tasks/TaskDetailPage";
import MyTasksPage from "@/pages/tasks/MyTasksPage";

// Phase 2 — Notifications
import NotificationsPage from "@/pages/notifications/NotificationsPage";

// Reports
import ReportsPage from "@/pages/reports/ReportsPage";

export const router = createBrowserRouter([
  // Public auth routes
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password/:token", element: <ResetPasswordPage /> },
    ],
  },
  // Public invite accept (no auth required — user has no token yet)
  {
    path: "/accept-invite/:token",
    element: <AcceptInvitationPage />,
  },
  // Protected dashboard routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },
          {
            path: "/analytics",
            element: (
              <RoleGuard roles={["ADMIN", "MANAGER"]}>
                <AnalyticsDashboardPage />
              </RoleGuard>
            ),
          },

          // ── Phase 1 routes ─────────────────────────────────────────────
          {
            path: "/users",
            element: (
              <RoleGuard roles={["ADMIN"]}>
                <UsersPage />
              </RoleGuard>
            ),
          },
          {
            path: "/departments",
            element: (
              <RoleGuard roles={["ADMIN", "MANAGER"]}>
                <DepartmentsPage />
              </RoleGuard>
            ),
          },
          {
            path: "/invitations",
            element: (
              <RoleGuard roles={["ADMIN"]}>
                <InvitationsPage />
              </RoleGuard>
            ),
          },
          {
            path: "/settings",
            element: (
              <RoleGuard roles={["ADMIN"]}>
                <OrganizationSettingsPage />
              </RoleGuard>
            ),
          },

          // ── Phase 2 — Projects ─────────────────────────────────────────
          { path: "/projects", element: <ProjectsPage /> },
          {
            path: "/projects/create",
            element: (
              <RoleGuard roles={["ADMIN", "MANAGER"]}>
                <CreateProjectPage />
              </RoleGuard>
            ),
          },
          { path: "/projects/:id", element: <ProjectDetailPage /> },
          {
            path: "/projects/:id/edit",
            element: (
              <RoleGuard roles={["ADMIN", "MANAGER"]}>
                <EditProjectPage />
              </RoleGuard>
            ),
          },
          { path: "/projects/:id/tasks", element: <TasksPage /> },

          // ── Phase 2 — Tasks ────────────────────────────────────────────
          { path: "/tasks/:id", element: <TaskDetailPage /> },
          {
            path: "/tasks/my-tasks",
            element: (
              <RoleGuard roles={["ADMIN", "MANAGER", "EMPLOYEE"]}>
                <MyTasksPage />
              </RoleGuard>
            ),
          },

          // ── Phase 2 — Notifications ────────────────────────────────────
          { path: "/notifications", element: <NotificationsPage /> },

          // ── Reports ────────────────────────────────────────────────────
          {
            path: "/reports",
            element: (
              <RoleGuard roles={["ADMIN", "MANAGER"]}>
                <ReportsPage />
              </RoleGuard>
            ),
          },
        ],
      },
    ],
  },
  // 404
  { path: "*", element: <NotFoundPage /> },
]);
