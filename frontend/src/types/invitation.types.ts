import type { Role } from "./user.types";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED";

export interface Invitation {
  _id: string;
  email: string;
  role: Role;
  organizationId: string;
  departmentId?: string;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  invitedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InviteUserPayload {
  email: string;
  role: Exclude<Role, "ADMIN">;
  departmentId?: string;
}
