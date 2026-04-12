import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Loader2,
  Sparkles,
  Eye,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import reportService from "@/services/reportService";
import projectService from "@/services/projectService";
import { organizationService } from "@/services/organizationService";
import { generateReportPDF } from "@/utils/generateReportPDF";
import type { ProjectReport } from "@/types/report.types";
import ReportDetailModal from "./components/ReportDetailModal";

function healthBadgeClass(status: string) {
  if (status === "Critical") return "bg-red-100 text-red-700 border-red-200";
  if (status === "At Risk")  return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function healthIcon(status: string) {
  if (status === "Critical") return <XCircle size={12} />;
  if (status === "At Risk")  return <AlertTriangle size={12} />;
  return <CheckCircle size={12} />;
}

function timelineBadgeClass(status: string) {
  if (status === "Delayed")           return "bg-red-100 text-red-700 border-red-200";
  if (status === "Ahead of Schedule") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function healthScoreColor(score: number) {
  if (score >= 70) return "text-green-700";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [viewReport, setViewReport]   = useState<ProjectReport | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectReport | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectService.getProjects(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: org } = useQuery({
    queryKey: ["organization"],
    queryFn: organizationService.getOrganization,
    staleTime: 1000 * 60 * 10,
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportService.getReports(),
  });

  const { mutate: generateReport, isPending: isGenerating } = useMutation({
    mutationFn: () => reportService.generateReport({ projectId: selectedProjectId }),
    onSuccess: (newReport) => {
      toast.success("Report generated successfully");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setViewReport(newReport);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? "Failed to generate report");
    },
  });

  const { mutate: deleteReport, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => reportService.deleteReport(id),
    onSuccess: () => {
      toast.success("Report deleted");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete report"),
  });

  const handleDownload = (report: ProjectReport) => {
    setDownloadingId(report._id);
    try {
      generateReportPDF(report, org?.name);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Reports"
        description={
           "AI-powered performance reports for your projects"
        }
      />

      {/* Generate Control */}
      <Card>
        <CardContent className="pt-5 pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Generate New Report
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="w-full sm:w-72">
              {projectsLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a project…" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button
              onClick={() => generateReport()}
              disabled={!selectedProjectId || isGenerating}
              size="sm"
            >
              {isGenerating ? (
                <Loader2 size={14} className="animate-spin mr-1.5" />
              ) : (
                <Sparkles size={14} className="mr-1.5" />
              )}
              {isGenerating ? "Generating…" : "Generate Report"}
            </Button>
          </div>
          {isGenerating && (
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2 size={11} className="animate-spin" />
              AI is analysing project data — this may take a few seconds…
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reports Table */}
      {reportsLoading ? (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 text-muted-foreground gap-3">
          <FileText size={32} className="opacity-30" />
          <p className="text-sm font-medium">No reports generated yet</p>
          <p className="text-xs">Select a project above and click Generate Report to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Generated By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const projectTitle =
                  typeof report.projectId === "object" ? report.projectId.title : "—";
                const generatedBy =
                  typeof report.generatedBy === "object" ? report.generatedBy.name : "—";
                const generatedDate = new Date(report.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                });

                return (
                  <TableRow key={report._id}>
                    <TableCell>
                      <p className="font-medium text-sm text-foreground">{projectTitle}</p>
                    </TableCell>

                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${healthBadgeClass(report.healthStatus)}`}>
                        {healthIcon(report.healthStatus)}
                        {report.healthStatus}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className={`text-sm font-bold ${healthScoreColor(report.healthScore)}`}>
                        {report.healthScore}
                        <span className="text-muted-foreground font-normal text-xs"> / 100</span>
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${timelineBadgeClass(report.timeline)}`}>
                        <Clock size={11} />
                        {report.timeline}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">{generatedBy}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{generatedDate}</TableCell>

                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => setViewReport(report)}
                        >
                          <Eye size={14} className="mr-1" /> View
                        </Button>

                        {/* Download PDF — direct jsPDF draw, no HTML rendering */}
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => handleDownload(report)}
                          disabled={downloadingId === report._id}
                          title="Download PDF"
                        >
                          {downloadingId === report._id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Download size={14} />}
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(report)}
                          title="Delete report"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Modal */}
      <ReportDetailModal
        report={viewReport}
        open={!!viewReport}
        onOpenChange={(open) => { if (!open) setViewReport(null); }}
        orgName={org?.name}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Report"
        description={`Delete the report for "${
          typeof deleteTarget?.projectId === "object"
            ? deleteTarget.projectId.title : "this project"
        }"? This cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        variant="destructive"
        onConfirm={() => deleteTarget && deleteReport(deleteTarget._id)}
      />
    </div>
  );
}
