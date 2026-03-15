import { create } from "zustand";
import type { Task, TaskUpdate, CreateTaskPayload, SubmitUpdatePayload, TaskStatus } from "@/types/task.types";
import taskService from "@/services/taskService";

interface TaskState {
  tasks: Task[];
  myTasks: Task[];
  selectedTask: Task | null;
  taskUpdates: TaskUpdate[];
  loading: boolean;
  error: string | null;

  fetchTasks: (params?: { projectId?: string; assignedTo?: string; status?: TaskStatus }) => Promise<void>;
  fetchMyTasks: (params?: { status?: TaskStatus }) => Promise<void>;
  fetchTaskById: (id: string) => Promise<void>;
  createTask: (payload: CreateTaskPayload) => Promise<Task>;
  updateTask: (id: string, payload: Partial<CreateTaskPayload> & { status?: TaskStatus; order?: number }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  submitUpdate: (payload: SubmitUpdatePayload) => Promise<void>;
  fetchTaskUpdates: (taskId: string) => Promise<void>;

  setSelectedTask: (task: Task | null) => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  myTasks: [],
  selectedTask: null,
  taskUpdates: [],
  loading: false,
  error: null,

  fetchTasks: async (params) => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskService.getTasks(params);
      set({ tasks, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to fetch tasks" });
    }
  },

  fetchMyTasks: async (params) => {
    set({ loading: true, error: null });
    try {
      const myTasks = await taskService.getMyTasks(params);
      set({ myTasks, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to fetch my tasks" });
    }
  },

  fetchTaskById: async (id) => {
    set({ loading: true, error: null });
    try {
      const task = await taskService.getTaskById(id);
      set({ selectedTask: task, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to fetch task" });
    }
  },

  createTask: async (payload) => {
    set({ loading: true, error: null });
    try {
      const task = await taskService.createTask(payload);
      set((state) => ({ tasks: [...state.tasks, task], loading: false }));
      return task;
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to create task" });
      throw e;
    }
  },

  updateTask: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const updated = await taskService.updateTask(id, payload);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? updated : t)),
        myTasks: state.myTasks.map((t) => (t._id === id ? updated : t)),
        selectedTask: state.selectedTask?._id === id ? updated : state.selectedTask,
        loading: false,
      }));
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to update task" });
      throw e;
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      await taskService.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t._id !== id),
        loading: false,
      }));
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to delete task" });
      throw e;
    }
  },

  submitUpdate: async (payload) => {
    set({ loading: true, error: null });
    try {
      const update = await taskService.submitUpdate(payload);
      set((state) => ({
        taskUpdates: [update, ...state.taskUpdates],
        // Also update the task's loggedHours and status in local state
        tasks: state.tasks.map((t) =>
          t._id === payload.taskId
            ? {
                ...t,
                loggedHours: t.loggedHours + (payload.hoursLogged || 0),
                status: payload.statusChange || t.status,
              }
            : t
        ),
        loading: false,
      }));
    } catch (e: any) {
      set({ loading: false, error: e.response?.data?.message || "Failed to submit update" });
      throw e;
    }
  },

  fetchTaskUpdates: async (taskId) => {
    try {
      const taskUpdates = await taskService.getUpdatesForTask(taskId);
      set({ taskUpdates });
    } catch (e: any) {
      set({ error: e.response?.data?.message || "Failed to fetch updates" });
    }
  },

  setSelectedTask: (task) => set({ selectedTask: task }),
  clearError: () => set({ error: null }),
}));
