import type { User } from "./user.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AcceptInvitationPayload {
  name: string;
  password: string;
}
