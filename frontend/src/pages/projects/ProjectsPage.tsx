import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LayoutGrid, List, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectCard from "./components/ProjectCard";
import ProjectTable from "./components/ProjectTable";
import PageHeader from "@/components/shared/PageHeader";
import type { ProjectStatus } from "@/types/project.types";

const STATUS_OPTIONS: (ProjectStatus | "ALL")[] = ["ALL", "PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { projects, loading, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL");

  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";

  useEffect(() => {
    fetchProjects(statusFilter !== "ALL" ? { status: statusFilter } : {});
  }, [statusFilter]);

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Projects"
        description={`${projects.length} project${projects.length !== 1 ? "s" : ""} in your organisation`}
        action={
          canCreate ? (
            <Button id="create-project-btn" onClick={() => navigate("/projects/create")}>
              <Plus size={16} className="mr-1" /> New Project
            </Button>
          ) : undefined
        }
      />

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        {/* Status filter chips */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/30"
              }`}
            >
              {s === "ALL" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-48 h-9"
            />
          </div>
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setView("grid")}
              className={`p-2 text-sm transition-colors ${view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView("table")}
              className={`p-2 text-sm transition-colors ${view === "table" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 text-muted-foreground gap-3">
          <p className="text-lg font-medium">No projects found</p>
          {canCreate && (
            <Button variant="outline" onClick={() => navigate("/projects/create")}>
              Create your first project →
            </Button>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        <ProjectTable projects={filtered} />
      )}
    </div>
  );
};

export default ProjectsPage;
