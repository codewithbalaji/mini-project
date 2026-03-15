import api from "./api";
import type { Project, CreateProjectPayload, UpdateProjectPayload, ProjectStats } from "@/types/project.types";

const projectService = {
  createProject: async (payload: CreateProjectPayload): Promise<Project> => {
    const res = await api.post("/projects", payload);
    return res.data.project;
  },

  getProjects: async (params?: {
    status?: string;
    priority?: string;
    departmentId?: string;
  }): Promise<Project[]> => {
    const res = await api.get("/projects", { params });
    return res.data.projects;
  },

  getProjectById: async (id: string): Promise<Project> => {
    const res = await api.get(`/projects/${id}`);
    return res.data.project;
  },

  updateProject: async (id: string, payload: UpdateProjectPayload): Promise<Project> => {
    const res = await api.put(`/projects/${id}`, payload);
    return res.data.project;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  addMember: async (projectId: string, userId: string): Promise<Project> => {
    const res = await api.post(`/projects/${projectId}/members`, { userId });
    return res.data.project;
  },

  removeMember: async (projectId: string, userId: string): Promise<Project> => {
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    return res.data.project;
  },

  getProjectStats: async (projectId: string): Promise<ProjectStats> => {
    const res = await api.get(`/projects/${projectId}/stats`);
    return res.data.stats;
  },
};

export default projectService;
