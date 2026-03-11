import api from "./api";
import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  AcceptInvitationPayload,
} from "@/types/auth.types";

export const authService = {
  login: (data: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", data).then((r) => r.data),

  register: (data: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", data).then((r) => r.data),

  acceptInvitation: (token: string, data: AcceptInvitationPayload) =>
    api
      .post<AuthResponse>(`/invitations/accept/${token}`, data)
      .then((r) => r.data),
};
