import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Download,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Lightbulb,
  Users,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProjectReport, Severity } from "@/types/report.types";
import ReportPDF from "./ReportPDF";

interface ReportCardProps {
  report: ProjectReport;
  orgName?: string;
}

// Matches StatusBadge / PriorityBadge pattern
function healthBadgeClass(status: string) {
  if (status === "Critical") return "bg-red-100 text-red-700 border-red-200";
  if (status === "At Risk") return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function healthIcon(status: string) {
  if (status === "Critical") return <XCircle size={12} />;
  if (status === "At Risk") return <AlertTriangle size={12} />;
  return <CheckCircle size={12} />;
}

function timelineBadgeClass(status: string) {
  if (status === "Delayed") return "bg-red-100 text-red-700 border-red-200";
  if (status === "Ahead of Schedule") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function severityBadgeClass(severity: Severity) {
  if (severity === "high") return "bg-red-100 text-red-700 border-red-200";
  if (severity === "medium") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function healthScoreColor(score: number) {
  if (score >= 70) return "text-green-700 border-green-300 bg-green-50";
  if (score >= 40) return "text-orange-700 border-orange-300 bg-orange-50";
  return "text-red-700 border-red-300 bg-red-50";
}

export default function ReportCard({ report, orgName }: ReportCardProps) {
  const [exporting, setExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const projectTitle =
    typeof report.projectId === "object" ? report.projectId.title : "Project";
  const generatedBy =
    typeof report.generatedBy === "object" ? report.generatedBy.name : "—";
  const generatedDate = new Date(report.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        onclone: (_clonedDoc, element) => {
          const doc = element.ownerDocument;
          doc.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => el.remove());
        },
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      const pageHeight = 297;
      let yOffset = 0;
      while (yOffset < imgHeight) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -yOffset, pageWidth, imgHeight);
        yOffset += pageHeight;
      }
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${projectTitle.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {/* Hidden PDF template — off screen */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <ReportPDF ref={pdfRef} report={report} orgName={orgName} />
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-4 pb-4 space-y-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground">{projectTitle}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {generatedBy}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays size={11} />
                  {generatedDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Health Score */}
              <div
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 ${healthScoreColor(report.healthScore)}`}
              >
                <span className="text-sm font-bold leading-none">{report.healthScore}</span>
                <span className="text-[9px] leading-none mt-0.5 opacity-60">/ 100</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={exporting}
                className="h-8 text-xs"
              >
                {exporting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Download size={13} />
                )}
                <span className="ml-1.5">{exporting ? "Exporting…" : "PDF"}</span>
              </Button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${healthBadgeClass(report.healthStatus)}`}
            >
              {healthIcon(report.healthStatus)}
              {report.healthStatus}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${timelineBadgeClass(report.timeline)}`}
            >
              <Clock size={11} />
              {report.timeline}
            </span>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-border">
            {[
              {
                label: "Total Tasks",
                value: report.projectSnapshot.totalTasks,
                icon: <TrendingUp size={12} />,
              },
              {
                label: "Completion",
                value: `${report.projectSnapshot.completionPercentage}%`,
                icon: <CheckCircle size={12} />,
              },
              {
                label: "Overdue",
                value: report.projectSnapshot.overdueCount,
                icon: <AlertTriangle size={12} />,
                alert: report.projectSnapshot.overdueCount > 0,
              },
              {
                label: "Hours Logged",
                value: `${report.projectSnapshot.totalLoggedHours}h`,
                sub: `/ ${report.projectSnapshot.totalEstimatedHours}h est.`,
                icon: <Clock size={12} />,
              },
            ].map((m, i) => (
              <div key={i} className="rounded-lg bg-muted px-3 py-2.5">
                <div
                  className={`text-lg font-bold ${m.alert ? "text-destructive" : "text-foreground"}`}
                >
                  {m.value}
                </div>
                {"sub" in m && m.sub && (
                  <div className="text-[10px] text-muted-foreground">{m.sub}</div>
                )}
                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  {m.icon}
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* Executive Summary */}
          <Section icon={<TrendingUp size={12} />} title="Executive Summary">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {report.executiveSummary}
            </p>
          </Section>

          {/* Key Findings */}
          {report.keyFindings.length > 0 && (
            <Section icon={<Lightbulb size={12} />} title="Key Findings">
              <ul className="space-y-1.5">
                {report.keyFindings.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-semibold text-xs mt-0.5 shrink-0 w-4">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Risks + Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {report.risks.length > 0 && (
              <Section icon={<Shield size={12} />} title="Risk Register">
                <div className="space-y-2">
                  {report.risks.map((risk, i) => (
                    <div key={i} className="rounded-lg border border-border bg-background p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${severityBadgeClass(risk.severity)}`}
                        >
                          {risk.severity}
                        </span>
                        <span className="text-sm font-medium text-foreground">{risk.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{risk.description}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {report.recommendations.length > 0 && (
              <Section icon={<Lightbulb size={12} />} title="Recommendations">
                <div className="space-y-2">
                  {report.recommendations.map((rec, i) => (
                    <div key={i} className="rounded-lg border border-border bg-background p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${severityBadgeClass(rec.priority)}`}
                        >
                          {rec.priority}
                        </span>
                        <span className="text-sm font-medium text-foreground">{rec.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.action}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Team Performance */}
          {report.teamPerformance && (
            <Section icon={<Users size={12} />} title="Team Performance">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.teamPerformance}
              </p>
            </Section>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}
