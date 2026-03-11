import { useAuth } from "./useAuth";
import type { Role } from "@/types/user.types";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;

  return {
    isAdmin: role === "ADMIN",
    isManager: role === "MANAGER",
    isEmployee: role === "EMPLOYEE",
    isViewer: role === "VIEWER",
    hasRole: (...roles: Role[]) => !!role && roles.includes(role),
    role,
  };
}
