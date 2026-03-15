import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import StatusBadge from "@/components/shared/StatusBadge";
import PriorityBadge from "@/components/shared/PriorityBadge";
import UserAvatar from "@/components/shared/UserAvatar";
import TaskUpdateForm from "./components/TaskUpdateForm";
import TaskUpdateList from "./components/TaskUpdateList";
import CommentSection from "./components/CommentSection";
import type { User } from "@/types/user.types";
import type { TaskStatus } from "@/types/task.types";

const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"];

const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedTask, fetchTaskById, fetchTaskUpdates, taskUpdates, updateTask, loading } = useTaskStore();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"updates" | "comments">("updates");

  const canEdit = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isAssignee = selectedTask?.assignedTo && (selectedTask.assignedTo as User)._id === user?._id;

  useEffect(() => {
    if (id) {
      fetchTaskById(id);
      fetchTaskUpdates(id);
    }
  }, [id]);

  if (loading || !selectedTask) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      </div>
    );
  }

  const assignee = selectedTask.assignedTo as User | undefined;
  const assignedBy = selectedTask.assignedBy as User | undefined;
  const isOverdue =
    selectedTask.dueDate &&
    new Date(selectedTask.dueDate) < new Date() &&
    selectedTask.status !== "DONE";

  const handleStatusChange = async (status: TaskStatus) => {
    if (id) await updateTask(id, { status });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1 -ml-2 text-muted-foreground">
        <ArrowLeft size={14} /> Back
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">{selectedTask.title}</h1>
        {selectedTask.description && (
          <p className="text-muted-foreground text-sm mt-1">{selectedTask.description}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          <StatusBadge status={selectedTask.status} />
          <PriorityBadge priority={selectedTask.priority} />
          {isOverdue && <Badge variant="destructive">Overdue</Badge>}
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-2">Assignee</p>
            {assignee ? (
              <div className="flex items-center gap-2">
                <UserAvatar name={assignee.name} size="sm" />
                <p className="text-sm font-medium">{assignee.name}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unassigned</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-2">Due Date</p>
            <p className={`text-sm font-medium flex items-center gap-1 ${isOverdue ? "text-destructive" : ""}`}>
              <Calendar size={12} />
              {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-2">Hours</p>
            <p className="text-sm font-medium flex items-center gap-1">
              <Clock size={12} />
              {selectedTask.loggedHours}h / {selectedTask.estimatedHours}h
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-2">Assigned By</p>
            <p className="text-sm font-medium">{assignedBy?.name || "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Status change bar */}
      {(canEdit || isAssignee) && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground uppercase font-medium tracking-wide mb-3">Change Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={selectedTask.status === s ? "default" : "outline"}
                  onClick={() => handleStatusChange(s)}
                  disabled={selectedTask.status === s}
                  className="text-xs"
                >
                  {s.replace("_", " ")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase 3 AI placeholder */}
      <Card className="border-violet-200 bg-violet-50/50 dark:bg-violet-950/20">
        <CardContent className="pt-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300">🤖 AI Insights</span>
              <Badge variant="secondary" className="text-[10px] bg-violet-100 text-violet-700">Coming in Phase 3</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">AI-powered task analysis will appear here.</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-0">
          {[
            { key: "updates", label: `Updates (${taskUpdates.length})` },
            { key: "comments", label: "Comments" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "updates" && (
        <div className="space-y-4">
          {(canEdit || isAssignee) && id && <TaskUpdateForm taskId={id} />}
          <TaskUpdateList updates={taskUpdates} />
        </div>
      )}
      {tab === "comments" && id && (
        <CommentSection entityType="TASK" entityId={id} />
      )}
    </div>
  );
};

export default TaskDetailPage;
