import api from "./api";
import type { OrgDashboard, ProjectDashboard, MyDashboard, AnalyticsData } from "@/types/dashboard.types";

const dashboardService = {
  getOrgDashboard: async (): Promise<OrgDashboard> => {
    const res = await api.get("/dashboard/org");
    return res.data;
  },

  getProjectDashboard: async (projectId: string): Promise<ProjectDashboard> => {
    const res = await api.get(`/dashboard/project/${projectId}`);
    return res.data;
  },

  getMyDashboard: async (): Promise<MyDashboard> => {
    const res = await api.get("/dashboard/me");
    return res.data;
  },

  getAnalyticsDashboard: async (): Promise<AnalyticsData> => {
    const res = await api.get("/dashboard/analytics");
    return res.data;
  },
};

export default dashboardService;
