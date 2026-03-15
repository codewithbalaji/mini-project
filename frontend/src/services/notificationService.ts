import api from "./api";
import type { Notification } from "@/types/notification.types";

const notificationService = {
  getNotifications: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
    const res = await api.get("/notifications");
    return res.data;
  },

  markAsRead: async (notificationId: string): Promise<Notification> => {
    const res = await api.put(`/notifications/${notificationId}/read`);
    return res.data.notification;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put("/notifications/read-all");
  },
};

export default notificationService;
