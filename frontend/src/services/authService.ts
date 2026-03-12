import api from "./api";
import type {
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  AuthResponse,
  AcceptInvitationPayload,
  VerifyEmailPayload,
  ResendOtpPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from "@/types/auth.types";

export const authService = {
  login: (data: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", data).then((r) => r.data),

  register: (data: RegisterPayload) =>
    api.post<RegisterResponse>("/auth/register", data).then((r) => r.data),

  verifyEmail: (data: VerifyEmailPayload) =>
    api.post<AuthResponse>("/auth/verify-email", data).then((r) => r.data),

  resendOtp: (data: ResendOtpPayload) =>
    api.post<{ message: string }>("/auth/resend-otp", data).then((r) => r.data),

  forgotPassword: (data: ForgotPasswordPayload) =>
    api.post<{ message: string }>("/auth/forgot-password", data).then((r) => r.data),

  resetPassword: (token: string, data: ResetPasswordPayload) =>
    api.post<{ message: string }>(`/auth/reset-password/${token}`, data).then((r) => r.data),

  acceptInvitation: (token: string, data: AcceptInvitationPayload) =>
    api
      .post<AuthResponse>(`/invitations/accept/${token}`, data)
      .then((r) => r.data),
};
