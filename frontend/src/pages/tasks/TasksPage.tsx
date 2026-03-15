import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutGrid, List, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import KanbanBoard from "./components/KanbanBoard";
import TaskCard from "./components/TaskCard";
import TaskForm from "./components/TaskForm";
import type { Task, TaskStatus } from "@/types/task.types";

const TasksPage = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, loading, fetchTasks, updateTask } = useTaskStore();
  const { user } = useAuthStore();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";

  useEffect(() => {
    if (projectId) fetchTasks({ projectId });
  }, [projectId]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const closeModal = () => {
    setShowCreateForm(false);
    setEditingTask(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}`)} className="gap-1 text-muted-foreground">
            <ArrowLeft size={14} /> Project
          </Button>
          <span className="text-border">|</span>
          <h1 className="font-semibold">Task Board</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === "kanban" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid size={14} /> Kanban
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${view === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List size={14} /> List
            </button>
          </div>
          {canCreate && (
            <Button id="create-task-btn" size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus size={14} className="mr-1" /> New Task
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">Loading tasks...</div>
        ) : view === "kanban" ? (
          <KanbanBoard
            tasks={tasks}
            onStatusChange={handleStatusChange}
            projectId={projectId!}
            onEditTask={canCreate ? (task) => setEditingTask(task) : undefined}
          />
        ) : (
          <div className="p-6 space-y-3 overflow-y-auto h-full">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                <p>No tasks yet.</p>
                {canCreate && (
                  <Button variant="outline" size="sm" onClick={() => setShowCreateForm(true)}>
                    Create first task →
                  </Button>
                )}
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task._id} className="relative group">
                  <TaskCard task={task} onClick={() => navigate(`/tasks/${task._id}`)} />
                  {canCreate && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                      title="Edit task"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {(showCreateForm || editingTask) && projectId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center">
          <div className="bg-background border rounded-t-2xl md:rounded-xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingTask ? "Edit Task" : "Create Task"}
            </h2>
            <TaskForm
              projectId={projectId}
              editTask={editingTask ?? undefined}
              onClose={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
