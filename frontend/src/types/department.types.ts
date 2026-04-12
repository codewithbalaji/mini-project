export interface Department {
  _id: string;
  name: string;
  organizationId: string;
  managerId?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
  managerId?: string;
}

export interface UpdateDepartmentPayload {
  name: string;
  managerId?: string;
}
