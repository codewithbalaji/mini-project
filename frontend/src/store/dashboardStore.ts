import { create } from "zustand";
import type { OrgDashboard, ProjectDashboard, MyDashboard } from "@/types/dashboard.types";
import dashboardService from "@/services/dashboardService";

interface DashboardState {
  orgStats: OrgDashboard | null;
  projectStats: ProjectDashboard | null;
  myStats: MyDashboard | null;
  loading: boolean;
  error: string | null;

  fetchOrgDashboard: () => Promise<void>;
  fetchProjectDashboard: (projectId: string) => Promise<void>;
  fetchMyDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  orgStats: null,
  projectStats: null,
  myStats: null,
  loading: false,
  error: null,

  fetchOrgDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const orgStats = await dashboardService.getOrgDashboard();
      set({ orgStats, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to load dashboard" });
    }
  },

  fetchProjectDashboard: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const projectStats = await dashboardService.getProjectDashboard(projectId);
      set({ projectStats, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to load project dashboard" });
    }
  },

  fetchMyDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const myStats = await dashboardService.getMyDashboard();
      set({ myStats, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to load my dashboard" });
    }
  },
}));
