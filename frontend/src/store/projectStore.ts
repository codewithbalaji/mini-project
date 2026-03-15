import { create } from "zustand";
import type { Project, ProjectStats, CreateProjectPayload, UpdateProjectPayload } from "@/types/project.types";
import projectService from "@/services/projectService";

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  projectStats: ProjectStats | null;
  loading: boolean;
  error: string | null;

  fetchProjects: (params?: { status?: string; priority?: string; departmentId?: string }) => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  createProject: (payload: CreateProjectPayload) => Promise<Project>;
  updateProject: (id: string, payload: UpdateProjectPayload) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMember: (projectId: string, userId: string) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  fetchProjectStats: (projectId: string) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  selectedProject: null,
  projectStats: null,
  loading: false,
  error: null,

  fetchProjects: async (params) => {
    set({ loading: true, error: null });
    try {
      const projects = await projectService.getProjects(params);
      set({ projects, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to fetch projects" });
    }
  },

  fetchProjectById: async (id) => {
    set({ loading: true, error: null });
    try {
      const project = await projectService.getProjectById(id);
      set({ selectedProject: project, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to fetch project" });
    }
  },

  createProject: async (payload) => {
    set({ loading: true, error: null });
    try {
      const project = await projectService.createProject(payload);
      set((state) => ({ projects: [project, ...state.projects], loading: false }));
      return project;
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to create project" });
      throw e;
    }
  },

  updateProject: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const updated = await projectService.updateProject(id, payload);
      set((state) => ({
        projects: state.projects.map((p) => (p._id === id ? updated : p)),
        selectedProject: state.selectedProject?._id === id ? updated : state.selectedProject,
        loading: false,
      }));
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to update project" });
      throw e;
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await projectService.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p._id !== id),
        loading: false,
      }));
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to delete project" });
      throw e;
    }
  },

  addMember: async (projectId, userId) => {
    try {
      const updated = await projectService.addMember(projectId, userId);
      set((state) => ({
        projects: state.projects.map((p) => (p._id === projectId ? updated : p)),
        selectedProject: state.selectedProject?._id === projectId ? updated : state.selectedProject,
      }));
    } catch (e: any) {
      set({ error: e.response?.data?.message || "Failed to add member" });
      throw e;
    }
  },

  removeMember: async (projectId, userId) => {
    try {
      const updated = await projectService.removeMember(projectId, userId);
      set((state) => ({
        projects: state.projects.map((p) => (p._id === projectId ? updated : p)),
        selectedProject: state.selectedProject?._id === projectId ? updated : state.selectedProject,
      }));
    } catch (e: any) {
      set({ error: e.response?.data?.message || "Failed to remove member" });
      throw e;
    }
  },

  fetchProjectStats: async (projectId) => {
    try {
      const projectStats = await projectService.getProjectStats(projectId);
      set({ projectStats });
    } catch (e: any) {
      set({ error: e.response?.data?.message || "Failed to fetch stats" });
    }
  },

  setSelectedProject: (project) => set({ selectedProject: project }),
  clearError: () => set({ error: null }),
}));
