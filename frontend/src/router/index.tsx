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
import UsersPage from "@/pages/users/UsersPage";
import DepartmentsPage from "@/pages/departments/DepartmentsPage";
import InvitationsPage from "@/pages/invitations/InvitationsPage";
import OrganizationSettingsPage from "@/pages/organization/OrganizationSettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

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
        ],
      },
    ],
  },
  // 404
  { path: "*", element: <NotFoundPage /> },
]);
