export type HealthStatus = "On Track" | "At Risk" | "Critical";
export type TimelineStatus = "On Track" | "Delayed" | "Ahead of Schedule";
export type Severity = "low" | "medium" | "high";

export interface ReportRisk {
  title: string;
  severity: Severity;
  description: string;
}

export interface ReportRecommendation {
  title: string;
  priority: Severity;
  action: string;
}

export interface ProjectSnapshot {
  totalTasks: number;
  completionPercentage: number;
  overdueCount: number;
  totalLoggedHours: number;
  totalEstimatedHours: number;
}

export interface ReportProject {
  _id: string;
  title: string;
  status: string;
}

export interface ReportUser {
  _id: string;
  name: string;
  email: string;
}

export interface ProjectReport {
  _id: string;
  projectId: ReportProject;
  organizationId: string;
  generatedBy: ReportUser;
  executiveSummary: string;
  healthScore: number;
  healthStatus: HealthStatus;
  keyFindings: string[];
  risks: ReportRisk[];
  recommendations: ReportRecommendation[];
  teamPerformance: string;
  timeline: TimelineStatus;
  projectSnapshot: ProjectSnapshot;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateReportPayload {
  projectId: string;
}
