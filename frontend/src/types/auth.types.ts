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

export interface RegisterResponse {
  userId: string;
  email: string;
  message: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AcceptInvitationPayload {
  name: string;
  password: string;
}

export interface VerifyEmailPayload {
  userId: string;
  otp: string;
}

export interface ResendOtpPayload {
  userId: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  password: string;
}
