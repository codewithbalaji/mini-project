import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationStore } from "@/store/notificationStore";
import PageHeader from "@/components/shared/PageHeader";
import type { Notification } from "@/types/notification.types";

const TYPE_ICON: Record<string, string> = {
  TASK_ASSIGNED: "📋",
  TASK_STATUS_CHANGED: "🔄",
  TASK_DUE_SOON: "⏰",
  TASK_OVERDUE: "🚨",
  PROJECT_CREATED: "🚀",
  PROJECT_STATUS_CHANGED: "📊",
  COMMENT_ADDED: "💬",
  MEMBER_ADDED: "👤",
};

const NotificationsPage = () => {
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => { fetchNotifications(); }, []);

  const handleClick = (n: Notification) => {
    if (!n.isRead) markAsRead(n._id);
    if (n.relatedEntity?.entityType === "TASK" && n.relatedEntity.entityId) {
      navigate(`/tasks/${n.relatedEntity.entityId}`);
    } else if (n.relatedEntity?.entityType === "PROJECT" && n.relatedEntity.entityId) {
      navigate(`/projects/${n.relatedEntity.entityId}`);
    }
  };

  const groupedByDate = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const dateKey = new Date(n.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(n);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck size={14} className="mr-1" /> Mark all as read
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Bell size={40} className="text-muted-foreground/30" />
            <p className="font-medium">No notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, nList]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{date}</p>
              <div className="space-y-2">
                {nList.map((n) => (
                  <Card
                    key={n._id}
                    className={`cursor-pointer hover:shadow-sm transition-all ${!n.isRead ? "border-primary/30 bg-primary/5" : ""}`}
                    onClick={() => handleClick(n)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{TYPE_ICON[n.type] || "🔔"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{n.title}</p>
                            <div className="flex items-center gap-2 shrink-0">
                              {!n.isRead && (
                                <Badge className="text-[10px] bg-primary text-primary-foreground">New</Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
