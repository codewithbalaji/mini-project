import type { Priority } from "@/types/project.types";

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string; dot: string }> = {
  LOW: { label: "Low", className: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
  MEDIUM: { label: "Medium", className: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  HIGH: { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  CRITICAL: { label: "Critical", className: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const PriorityBadge = ({ priority, className = "" }: PriorityBadgeProps) => {
  const config = PRIORITY_CONFIG[priority];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default PriorityBadge;
