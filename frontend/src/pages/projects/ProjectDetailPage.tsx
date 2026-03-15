import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Plus, LayoutGrid, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import StatusBadge from "@/components/shared/StatusBadge";
import PriorityBadge from "@/components/shared/PriorityBadge";
import UserAvatar from "@/components/shared/UserAvatar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ProjectMembersPanel from "./components/ProjectMembersPanel";
import type { User } from "@/types/user.types";

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProject, fetchProjectById, deleteProject, loading } = useProjectStore();
  const { user } = useAuthStore();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [tab, setTab] = useState<"tasks" | "members">("tasks");

  const canEdit = user?.role === "ADMIN" || user?.role === "MANAGER";

  useEffect(() => {
    if (id) fetchProjectById(id);
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    await deleteProject(id);
    navigate("/projects");
  };

  if (loading || !selectedProject) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const manager = selectedProject.managerId as User | undefined;
  const members = selectedProject.members as User[];
  const isOverdue =
    selectedProject.dueDate &&
    new Date(selectedProject.dueDate) < new Date() &&
    selectedProject.status !== "COMPLETED";

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} className="gap-1 -ml-2 text-muted-foreground">
        <ArrowLeft size={14} /> Projects
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{selectedProject.title}</h1>
          {selectedProject.description && (
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm">{selectedProject.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            <StatusBadge status={selectedProject.status} />
            <PriorityBadge priority={selectedProject.priority} />
            {isOverdue && (
              <Badge variant="destructive">Overdue</Badge>
            )}
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2 shrink-0">
            <Button size="sm" onClick={() => navigate(`/projects/${id}/tasks`)}>
              <Plus size={14} className="mr-1" /> Add Task
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate(`/projects/${id}/edit`)}>
              <Edit size={14} className="mr-1" /> Edit
            </Button>
            {user?.role === "ADMIN" && (
              <Button size="sm" variant="outline" className="text-destructive border-destructive/40 hover:bg-destructive/10" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={14} className="mr-1" /> Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Manager</p>
            {manager ? (
              <div className="flex items-center gap-2">
                <UserAvatar name={manager.name} size="sm" />
                <div>
                  <p className="text-sm font-medium">{manager.name}</p>
                  <p className="text-xs text-muted-foreground">{manager.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Timeline</p>
            <p className="text-sm">
              {selectedProject.startDate
                ? new Date(selectedProject.startDate).toLocaleDateString()
                : "—"}
              {" → "}
              {selectedProject.dueDate
                ? new Date(selectedProject.dueDate).toLocaleDateString()
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Team Size</p>
            <p className="text-sm font-semibold">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tags */}
      {selectedProject.tags && selectedProject.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedProject.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-0">
          {[
            { key: "tasks", label: "Tasks", icon: <LayoutGrid size={14} /> },
            { key: "members", label: `Members (${members.length})`, icon: <Users size={14} /> },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === "tasks" && (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <LayoutGrid size={32} className="text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">View and manage tasks for this project on the Kanban board.</p>
          <Button onClick={() => navigate(`/projects/${id}/tasks`)}>
            Open Task Board →
          </Button>
        </div>
      )}

      {tab === "members" && (
        <ProjectMembersPanel
          projectId={id!}
          members={members}
          canManage={canEdit}
          departmentId={
            selectedProject.departmentId
              ? typeof selectedProject.departmentId === "string"
                ? selectedProject.departmentId
                : (selectedProject.departmentId as any)._id
              : undefined
          }
        />
      )}


      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Project?"
        description="This will permanently delete the project and all its tasks. This action cannot be undone."
        confirmLabel="Delete Project"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ProjectDetailPage;
