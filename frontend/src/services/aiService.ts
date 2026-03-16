import api from "./api";
import type { Task } from "@/types/task.types";

export interface TaskDetailAssistantResponse {
  speechText: string;
  suggestedStatus: string | null;
  suggestedUpdateText: string | null;
}

const aiService = {
  myTasksAssistant: async (query: string, tasks: Task[]): Promise<string> => {
    const response = await api.post("/ai/my-tasks", { query, tasks });
    return response.data.reply;
  },
  taskDetailAssistant: async (query: string, taskContext: any): Promise<TaskDetailAssistantResponse> => {
    const response = await api.post("/ai/task-detail", { query, taskContext });
    return response.data;
  },
  textToSpeech: async (text: string): Promise<Blob> => {
    const response = await api.post("/ai/tts", { text }, { responseType: 'blob' });
    return response.data;
  }
};

export default aiService;
