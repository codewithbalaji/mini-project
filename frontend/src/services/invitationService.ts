import api from "./api";
import type { Invitation, InviteUserPayload } from "@/types/invitation.types";

export const invitationService = {
  getInvitations: () =>
    api.get<Invitation[]>("/invitations").then((r) => r.data),

  inviteUser: (data: InviteUserPayload) =>
    api.post<{ message: string }>("/invitations/invite", data).then((r) => r.data),
};
