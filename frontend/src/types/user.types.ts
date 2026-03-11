// User roles — must match backend constants/roles.js
export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE" | "VIEWER";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  departmentId?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}
