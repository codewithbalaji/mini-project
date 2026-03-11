export interface Organization {
  _id: string;
  name: string;
  industry?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationPayload {
  name: string;
  industry?: string;
}
