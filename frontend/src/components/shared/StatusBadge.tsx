import type { TaskStatus } from "@/types/task.types";
import type { ProjectStatus } from "@/types/project.types";

type Status = TaskStatus | ProjectStatus;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  // Task statuses
  TODO: { label: "To Do", className: "bg-slate-100 text-slate-700 border-slate-200" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700 border-blue-200" },
  IN_REVIEW: { label: "In Review", className: "bg-purple-100 text-purple-700 border-purple-200" },
  DONE: { label: "Done", className: "bg-green-100 text-green-700 border-green-200" },
  BLOCKED: { label: "Blocked", className: "bg-red-100 text-red-700 border-red-200" },
  // Project statuses
  PLANNING: { label: "Planning", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  ACTIVE: { label: "Active", className: "bg-green-100 text-green-700 border-green-200" },
  ON_HOLD: { label: "On Hold", className: "bg-orange-100 text-orange-700 border-orange-200" },
  COMPLETED: { label: "Completed", className: "bg-teal-100 text-teal-700 border-teal-200" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-500 border-gray-200" },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-600 border-gray-200" };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
