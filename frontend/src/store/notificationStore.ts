import { create } from "zustand";
import type { Notification } from "@/types/notification.types";
import notificationService from "@/services/notificationService";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const data = await notificationService.getNotifications();
      set({ notifications: data.notifications, unreadCount: data.unreadCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {}
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {}
  },
}));
