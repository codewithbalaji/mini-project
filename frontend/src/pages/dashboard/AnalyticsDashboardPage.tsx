import { useQuery } from "@tanstack/react-query";
import { Users, FolderKanban, CheckSquare, DollarSign, CheckCircle2, Clock, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";

import { usePermissions } from "@/hooks/usePermissions";
import dashboardService from "@/services/dashboardService";
import { organizationService } from "@/services/organizationService";
import type { WorkloadDataItem, RecentActivityItem } from "@/types/dashboard.types";

// Analytics Components
import { StatCard as RechartStatCard } from "./components/StatCard";
import { ProjectStatusPieChart } from "./components/ProjectStatusPieChart";
import { TaskStatusBarChart } from "./components/TaskStatusBarChart";
import { MonthlyTrendLineChart } from "./components/MonthlyTrendLineChart";
import { FinancialAnalyticsChart } from "./components/FinancialAnalyticsChart";
import { WorkloadBarChart } from "./components/WorkloadBarChart";
import { RecentActivityFeed } from "./components/RecentActivityFeed";

const ChartSkeleton = () => <Skeleton className="h-[340px] w-full rounded-xl" />;

export default function AnalyticsDashboardPage() {
  const { isAdmin, role } = usePermissions();
  const isManagerOrAbove = role === "ADMIN" || role === "MANAGER" || role === "VIEWER";
  const isManager = role === "MANAGER";

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: dashboardService.getAnalyticsDashboard,
    enabled: isManagerOrAbove,
  });

  const { data: orgDashboard, isLoading: loadingOrg } = useQuery({
    queryKey: ["org-dashboard"],
    queryFn: dashboardService.getOrgDashboard,
    enabled: isManagerOrAbove,
  });

  const { data: org } = useQuery({
    queryKey: ["organization"],
    queryFn: organizationService.getOrganization,
  });

  const currencySymbol = org?.currencySymbol || "$";
  const workloadData: WorkloadDataItem[] = orgDashboard?.stats?.workloadData ?? [];
  const recentActivity: RecentActivityItem[] = orgDashboard?.recentActivity ?? [];

  if (!isManagerOrAbove) {
    return (
      <div className="p-6">
        <PageHeader title="Access Denied" description="You do not have permission to view Analytics." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Analytics Dashboard 📊"
        description={
          isAdmin
            ? "Organization-wide corporate analytics."
            : isManager
            ? "Department analytics — project progress, team productivity, and delay tracking."
            : "Organization-wide analytics (read-only)."
        }
      />

      {/* Manager scope banner */}
      {/* {isManager && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
          <Info className="h-4 w-4 flex-shrink-0" />
          Showing data scoped to your department only.
        </div>
      )} */}

      <div className="space-y-6">

        {/* SECTION 1: KPI Cards */}
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Key Performance Indicators
        </p>

        {loadingAnalytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <RechartStatCard
              title="Active Projects"
              value={analytics.kpis.totalActiveProjects}
              icon={<FolderKanban className="h-4 w-4" />}
              description="Currently ongoing"
            />
            <RechartStatCard
              title="Total Tasks"
              value={analytics.kpis.totalTasks}
              icon={<CheckSquare className="h-4 w-4" />}
            />
            <RechartStatCard
              title="Task Completion"
              value={`${analytics.kpis.taskCompletionRate}%`}
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              description="Done"
            />
            <RechartStatCard
              title="Overdue Tasks"
              value={analytics.kpis.overdueTasks}
              icon={<Clock className="h-4 w-4 text-red-500" />}
              description="Past due"
            />
            <RechartStatCard
              title="Active Members"
              value={analytics.kpis.totalMembers}
              icon={<Users className="h-4 w-4" />}
              description="Working on active projects"
            />
            <RechartStatCard
              title="Total Budget"
              value={`${currencySymbol}${analytics.kpis.totalBudget.toLocaleString()}`}
              icon={<DollarSign className="h-4 w-4 text-green-600" />}
            />
          </div>
        ) : (
          <div className="text-muted-foreground p-8 text-center border rounded-lg bg-slate-50">
            Failed to load analytics data.
          </div>
        )}

        {/* SECTION 2: Charts Row 1 — Project Status + Task Status */}
        {loadingAnalytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        ) : analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProjectStatusPieChart data={analytics.charts.projectStatusDistribution} />
            <TaskStatusBarChart data={analytics.charts.taskStatusDistribution} />
          </div>
        )}

        {/* SECTION 3: Charts Row 2 — Financial + Monthly Trend */}
        {loadingAnalytics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        ) : analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FinancialAnalyticsChart
              totalBudget={analytics.kpis.totalBudget}
              totalEstimatedHours={analytics.kpis.totalEstimatedHours}
              currencySymbol={currencySymbol}
            />
            <MonthlyTrendLineChart data={analytics.charts.productivityTrend} />
          </div>
        )}

        {/* SECTION 4: Team Workload */}
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Team Workload
        </p>
        {loadingOrg ? (
          <ChartSkeleton />
        ) : (
          <WorkloadBarChart data={workloadData} />
        )}

        {/* SECTION 5: Recent Activity */}
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Recent Activity
        </p>
        {loadingOrg ? (
          <Skeleton className="h-[460px] w-full rounded-xl" />
        ) : (
          <RecentActivityFeed data={recentActivity} maxItems={8} />
        )}

      </div>
    </div>
  );
}
