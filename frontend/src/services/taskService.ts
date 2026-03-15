import api from "./api";
import type { Task, TaskUpdate, CreateTaskPayload, SubmitUpdatePayload } from "@/types/task.types";
import type { TaskStatus } from "@/types/task.types";

const taskService = {
  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const res = await api.post("/tasks", payload);
    return res.data.task;
  },

  getTasks: async (params?: {
    projectId?: string;
    assignedTo?: string;
    status?: TaskStatus;
    priority?: string;
  }): Promise<Task[]> => {
    const res = await api.get("/tasks", { params });
    return res.data.tasks;
  },

  getMyTasks: async (params?: { status?: TaskStatus }): Promise<Task[]> => {
    const res = await api.get("/tasks/my-tasks", { params });
    return res.data.tasks;
  },

  getTaskById: async (id: string): Promise<Task> => {
    const res = await api.get(`/tasks/${id}`);
    return res.data.task;
  },

  updateTask: async (
    id: string,
    payload: Partial<CreateTaskPayload> & { status?: TaskStatus; order?: number }
  ): Promise<Task> => {
    const res = await api.put(`/tasks/${id}`, payload);
    return res.data.task;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Task Updates
  submitUpdate: async (payload: SubmitUpdatePayload): Promise<TaskUpdate> => {
    const res = await api.post("/task-updates", payload);
    return res.data.update;
  },

  getUpdatesForTask: async (taskId: string): Promise<TaskUpdate[]> => {
    const res = await api.get(`/task-updates/${taskId}`);
    return res.data.updates;
  },
};

export default taskService;
