import type { User } from "./user.types";
import type { Project } from "./project.types";
import type { Priority } from "./project.types";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED";

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  projectId: Project | string;
  organizationId: string;
  assignedTo?: User | string;
  assignedBy?: User | string;
  dueDate?: string;
  completedAt?: string;
  estimatedHours: number;
  loggedHours: number;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskUpdate {
  _id: string;
  taskId: Task | string;
  projectId: string;
  organizationId: string;
  submittedBy: User | string;
  updateText: string;
  hoursLogged: number;
  statusChange?: TaskStatus | null;
  // Phase 3 fields (empty in Phase 2)
  aiSummary: string;
  extractedStatus: string | null;
  extractedProgress: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  entityType: "TASK" | "PROJECT";
  entityId: string;
  organizationId: string;
  author: User | string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  projectId: string;
  assignedTo?: string;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
  order?: number;
}

export interface SubmitUpdatePayload {
  taskId: string;
  updateText: string;
  hoursLogged?: number;
  statusChange?: TaskStatus | null;
}
