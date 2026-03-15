import api from "./api";
import type { Department, CreateDepartmentPayload, UpdateDepartmentPayload } from "@/types/department.types";

export const departmentService = {
  getDepartments: () =>
    api.get<Department[]>("/departments").then((r) => r.data),

  createDepartment: (data: CreateDepartmentPayload) =>
    api.post<Department>("/departments", data).then((r) => r.data),

  updateDepartment: (id: string, data: UpdateDepartmentPayload) =>
    api.put<Department>(`/departments/${id}`, data).then((r) => r.data),
};
