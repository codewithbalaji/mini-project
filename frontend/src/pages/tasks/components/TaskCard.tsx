import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types/task.types";
import type { User } from "@/types/user.types";
import StatusBadge from "@/components/shared/StatusBadge";
import PriorityBadge from "@/components/shared/PriorityBadge";
import UserAvatar from "@/components/shared/UserAvatar";
import { Calendar, Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  compact?: boolean;
}

const PRIORITY_BAR: Record<string, string> = {
  CRITICAL: "bg-destructive",
  HIGH: "bg-orange-400",
  MEDIUM: "bg-yellow-400",
  LOW: "bg-muted",
};

const TaskCard = ({ task, onClick, compact = false }: TaskCardProps) => {
  const assignee = task.assignedTo as User | undefined;
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE";

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all group"
    >
      <CardContent className="pt-3 pb-3 space-y-2">
        {/* Priority bar */}
        <div className={`h-0.5 w-full rounded ${PRIORITY_BAR[task.priority] || "bg-muted"}`} />

        {/* Title */}
        <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
          {task.title}
        </p>

        {!compact && task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        {/* Status (list view only) */}
        {!compact && (
          <div className="flex flex-wrap gap-1">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {isOverdue && <Badge variant="destructive" className="text-[10px]">Overdue</Badge>}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {task.dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : ""}`}>
                <Calendar size={10} />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.loggedHours > 0 && (
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {task.loggedHours}h
              </span>
            )}
          </div>
          {assignee && <UserAvatar name={assignee.name} size="sm" />}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
