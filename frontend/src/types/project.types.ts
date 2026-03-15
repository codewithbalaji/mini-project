import type { User } from "./user.types";

export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Project {
  _id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  startDate?: string;
  dueDate?: string;
  budget?: number;
  clientName?: string;
  organizationId: string;
  departmentId?: string;
  managerId?: User | string;
  members: (User | string)[];
  tags: string[];
  createdBy?: User | string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  totalTasks: number;
  statusCounts: {
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
    BLOCKED: number;
  };
  completionPercentage: number;
  overdueCount: number;
  totalLoggedHours: number;
  totalEstimatedHours: number;
}

export interface CreateProjectPayload {
  title: string;
  description?: string;
  status?: ProjectStatus;
  priority?: Priority;
  startDate?: string;
  dueDate?: string;
  budget?: number;
  clientName?: string;
  departmentId?: string;
  managerId?: string;
  members?: string[];
  tags?: string[];
}

export interface UpdateProjectPayload extends Partial<CreateProjectPayload> {}
