import api from "./api";
import type { Organization, UpdateOrganizationPayload } from "@/types/organization.types";

export const organizationService = {
  getOrganization: () =>
    api.get<Organization>("/organization").then((r) => r.data),

  updateOrganization: (data: UpdateOrganizationPayload) =>
    api.put<Organization>("/organization", data).then((r) => r.data),
};
