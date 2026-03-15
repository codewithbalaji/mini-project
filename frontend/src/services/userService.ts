import api from "./api";
import type { User, Role } from "@/types/user.types";

export const userService = {
  getUsers: (params?: { departmentId?: string }) =>
    api.get<User[]>("/users", { params }).then((r) => r.data),

  updateUserRole: (id: string, role: Role) =>
    api.put<User>(`/users/${id}/role`, { role }).then((r) => r.data),

  updateUserDepartment: (id: string, departmentId: string | null) =>
    api.put<User>(`/users/${id}/department`, { departmentId }).then((r) => r.data),

  deactivateUser: (id: string) =>
    api.delete<{ message: string }>(`/users/${id}`).then((r) => r.data),
};

