import api from "./api";
import type { Comment } from "@/types/task.types";

const commentService = {
  addComment: async (payload: {
    entityType: "TASK" | "PROJECT";
    entityId: string;
    content: string;
  }): Promise<Comment> => {
    const res = await api.post("/comments", payload);
    return res.data.comment;
  },

  getComments: async (entityType: "TASK" | "PROJECT", entityId: string): Promise<Comment[]> => {
    const res = await api.get("/comments", { params: { entityType, entityId } });
    return res.data.comments;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },
};

export default commentService;
