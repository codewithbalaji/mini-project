export interface Department {
  _id: string;
  name: string;
  organizationId: string;
  managerId?: string;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
}

export interface UpdateDepartmentPayload {
  name: string;
}
