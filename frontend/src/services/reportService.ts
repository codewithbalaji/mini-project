import api from "./api";
import type { ProjectReport, GenerateReportPayload } from "@/types/report.types";

const reportService = {
  generateReport: async (payload: GenerateReportPayload): Promise<ProjectReport> => {
    const res = await api.post("/reports/generate", payload);
    return res.data.report;
  },

  getReports: async (projectId?: string): Promise<ProjectReport[]> => {
    const res = await api.get("/reports", {
      params: projectId ? { projectId } : undefined,
    });
    return res.data.reports;
  },

  deleteReport: async (id: string): Promise<void> => {
    await api.delete(`/reports/${id}`);
  },
};

export default reportService;
