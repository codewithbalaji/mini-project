import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import type { Notification } from "@/types/notification.types";

const formatTime = (date: string) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotificationClick = (n: Notification) => {
    markAsRead(n._id);
    setOpen(false);
    if (n.relatedEntity?.entityType === "TASK" && n.relatedEntity.entityId) {
      navigate(`/tasks/${n.relatedEntity.entityId}`);
    } else if (n.relatedEntity?.entityType === "PROJECT" && n.relatedEntity.entityId) {
      navigate(`/projects/${n.relatedEntity.entityId}`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
        id="notification-bell-btn"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-center text-gray-400">No notifications</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !n.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                    <div className={!n.isRead ? "" : "pl-4"}>
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2">
            <button
              onClick={() => { navigate("/notifications"); setOpen(false); }}
              className="text-xs text-blue-600 hover:underline w-full text-center"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
