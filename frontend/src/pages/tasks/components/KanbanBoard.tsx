import { useNavigate } from "react-router-dom";
import type { Task, TaskStatus } from "@/types/task.types";
import TaskCard from "./TaskCard";

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "TODO", label: "To Do", color: "border-slate-300" },
  { status: "IN_PROGRESS", label: "In Progress", color: "border-blue-400" },
  { status: "IN_REVIEW", label: "In Review", color: "border-purple-400" },
  { status: "DONE", label: "Done", color: "border-green-400" },
  { status: "BLOCKED", label: "Blocked", color: "border-red-400" },
];

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  projectId?: string;
  onEditTask?: (task: Task) => void;
}

const KanbanBoard = ({ tasks, onStatusChange, onEditTask }: KanbanBoardProps) => {
  const navigate = useNavigate();

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);

  // Simple drag-and-drop handler
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) onStatusChange(taskId, targetStatus);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto p-6 pb-4">
      {COLUMNS.map(({ status, label, color }) => {
        const colTasks = getTasksByStatus(status);
        return (
          <div
            key={status}
            className="flex-shrink-0 w-72 flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column header */}
            <div className={`flex items-center justify-between mb-3 px-1`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full border-2 ${color}`} />
                <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{colTasks.length}</span>
            </div>

            {/* Task cards */}
            <div className="flex-1 space-y-2 overflow-y-auto min-h-16 rounded-xl bg-gray-50/60 p-2">
              {colTasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id)}
                  className="relative group/card"
                >
                  <TaskCard
                    task={task}
                    onClick={() => navigate(`/tasks/${task._id}`)}
                    compact
                  />
                  {onEditTask && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                      className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity p-1 rounded bg-background/80 hover:bg-muted text-muted-foreground text-xs"
                      title="Edit task"
                    >
                      ✎
                    </button>
                  )}
                </div>
              ))}

              {colTasks.length === 0 && (
                <div className="flex items-center justify-center h-16 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
