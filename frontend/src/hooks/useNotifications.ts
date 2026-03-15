import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

export const useNotifications = () => {
  const store = useNotificationStore();

  useEffect(() => {
    store.fetchNotifications();
    // Poll every 60 seconds to pick up new notifications
    const interval = setInterval(store.fetchNotifications, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
};
