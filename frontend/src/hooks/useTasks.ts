import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import type { TaskStatus } from "@/types/task.types";

export const useTasks = (params?: { projectId?: string; assignedTo?: string; status?: TaskStatus }) => {
  const store = useTaskStore();

  useEffect(() => {
    if (params?.projectId || params?.assignedTo) {
      store.fetchTasks(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.projectId]);

  return store;
};

export const useMyTasks = (params?: { status?: TaskStatus }) => {
  const store = useTaskStore();

  useEffect(() => {
    store.fetchMyTasks(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { myTasks: store.myTasks, loading: store.loading, error: store.error };
};
