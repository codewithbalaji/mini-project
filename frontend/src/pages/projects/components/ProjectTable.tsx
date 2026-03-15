import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project } from "@/types/project.types";
import type { User } from "@/types/user.types";
import StatusBadge from "@/components/shared/StatusBadge";
import PriorityBadge from "@/components/shared/PriorityBadge";

interface ProjectTableProps {
  projects: Project[];
}

const ProjectTable = ({ projects }: ProjectTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const manager = project.managerId as User | undefined;
            const isOverdue =
              project.dueDate &&
              new Date(project.dueDate) < new Date() &&
              project.status !== "COMPLETED";

            return (
              <TableRow
                key={project._id}
                className="cursor-pointer"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <TableCell>
                  <p className="font-medium text-sm">{project.title}</p>
                  {project.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{project.description}</p>
                  )}
                </TableCell>
                <TableCell><StatusBadge status={project.status} /></TableCell>
                <TableCell><PriorityBadge priority={project.priority} /></TableCell>
                <TableCell className="text-sm text-muted-foreground">{manager?.name || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {(project.members as User[]).length}
                </TableCell>
                <TableCell>
                  {project.dueDate ? (
                    <span className={`text-sm ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectTable;
