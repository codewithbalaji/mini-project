export interface Department {
  _id: string;
  name: string;
  organizationId: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
}
