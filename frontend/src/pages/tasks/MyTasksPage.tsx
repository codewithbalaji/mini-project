import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar, CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskStore } from "@/store/taskStore";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import PriorityBadge from "@/components/shared/PriorityBadge";
import AICopilotModal from "@/components/ai/AICopilotModal";
import type { Project } from "@/types/project.types";

const MyTasksPage = () => {
  const navigate = useNavigate();
  const { myTasks, loading, fetchMyTasks } = useTaskStore();

  useEffect(() => { fetchMyTasks(); }, []);

  const overdueTasks = myTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
  );
  const activeTasks = myTasks.filter((t) => t.status !== "DONE");
  const doneTasks = myTasks.filter((t) => t.status === "DONE");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title="My Tasks"
          description={`${activeTasks.length} active · ${overdueTasks.length} overdue · ${doneTasks.length} completed`}
        />
        <AICopilotModal contextType="MY_TASKS" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{activeTasks.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-destructive">{overdueTasks.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-green-600">{doneTasks.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : myTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <CheckSquare size={40} className="text-muted-foreground/30" />
            <p className="font-medium">No tasks assigned to you yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myTasks.map((task) => {
            const project = task.projectId as Project;
            const isOverdue =
              task.dueDate &&
              new Date(task.dueDate) < new Date() &&
              task.status !== "DONE";
            return (
              <Card
                key={task._id}
                className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all"
                onClick={() => navigate(`/tasks/${task._id}`)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{task.title}</p>
                      {project?.title && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Project: {project.title}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      {isOverdue && <Badge variant="destructive" className="text-[10px]">Overdue</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    {task.dueDate && (
                      <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : ""}`}>
                        <Calendar size={11} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.loggedHours > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {task.loggedHours}h logged
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
