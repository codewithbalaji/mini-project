import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types/project.types";
import type { User } from "@/types/user.types";
import StatusBadge from "@/components/shared/StatusBadge";
import PriorityBadge from "@/components/shared/PriorityBadge";
import UserAvatar from "@/components/shared/UserAvatar";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();
  const managerId = project.managerId as User | undefined;
  const members = project.members as User[];
  const isOverdue =
    project.dueDate &&
    new Date(project.dueDate) < new Date() &&
    project.status !== "COMPLETED";

  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all group"
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{project.description}</p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={project.status} />
          <PriorityBadge priority={project.priority} />
          {isOverdue && <Badge variant="destructive" className="text-[10px]">Overdue</Badge>}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Footer: due date + members */}
        <div className="flex items-center justify-between pt-1 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {project.dueDate && (
              <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : ""}`}>
                <Calendar size={11} />
                {new Date(project.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {managerId && <UserAvatar name={managerId.name} size="sm" />}
            {members.length > 0 && (
              <div className="flex -space-x-2 ml-1">
                {members.slice(0, 3).map((m) => (
                  <UserAvatar key={m._id} name={m.name} size="sm" className="ring-2 ring-background" />
                ))}
                {members.length > 3 && (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground text-[10px] ring-2 ring-background font-medium">
                    +{members.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
