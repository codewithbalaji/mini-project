import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserAvatar from "@/components/shared/UserAvatar";
import StatusBadge from "@/components/shared/StatusBadge";
import type { RecentActivityItem } from "@/types/dashboard.types";
import type { TaskStatus } from "@/types/task.types";

interface Props {
  data: RecentActivityItem[];
  maxItems?: number;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const RecentActivityFeed = ({ data, maxItems = 8 }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
        ) : (
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {data.slice(0, maxItems).map((item) => (
              <div key={item._id} className="flex items-start gap-3">
                <UserAvatar
                  name={item.submittedBy?.name || "?"}
                  size="sm"
                  className="flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{item.submittedBy?.name}</span>
                    {item.statusChange && (
                      <StatusBadge status={item.statusChange as TaskStatus} />
                    )}
                    {item.hoursLogged > 0 && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        +{item.hoursLogged}h
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {item.taskId?.title}
                  </p>
                  {item.updateText && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {item.updateText}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
