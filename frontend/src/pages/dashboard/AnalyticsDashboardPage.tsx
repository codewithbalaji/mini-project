import { useQuery } from "@tanstack/react-query";
import { Users, FolderKanban, CheckSquare, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";

import { usePermissions } from "@/hooks/usePermissions";
import dashboardService from "@/services/dashboardService";

// Analytics Components
import { StatCard as RechartStatCard } from "./components/StatCard";
import { ProjectStatusPieChart } from "./components/ProjectStatusPieChart";
import { TaskStatusBarChart } from "./components/TaskStatusBarChart";
import { MonthlyTrendLineChart } from "./components/MonthlyTrendLineChart";
import { FinancialAnalyticsChart } from "./components/FinancialAnalyticsChart";
export default function AnalyticsDashboardPage() {
  const { isAdmin, role } = usePermissions();
  const isManagerOrAbove = role === "ADMIN" || role === "MANAGER" || role === "VIEWER";

  // Enterprise Analytics (For Manager/Admin/Viewer)
  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: dashboardService.getAnalyticsDashboard,
    enabled: isManagerOrAbove,
  });

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
            : "Department analytics overview."
        }
      />

      <div className="space-y-6 mt-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Key Performance Indicators</p>
        
        {loadingAnalytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : analytics ? (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                title="Active Members" 
                value={analytics.kpis.totalMembers} 
                icon={<Users className="h-4 w-4" />} 
                description="Working on active projects"
              />
              <RechartStatCard 
                title="Total Budget" 
                value={`$${analytics.kpis.totalBudget.toLocaleString()}`} 
                icon={<DollarSign className="h-4 w-4" />} 
              />
            </div>

            {/* Charts Row 1: Donut & Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <ProjectStatusPieChart data={analytics.charts.projectStatusDistribution} />
              <TaskStatusBarChart data={analytics.charts.taskStatusDistribution} />
            </div>

            {/* Charts Row 2: Financial & Trend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <FinancialAnalyticsChart 
                totalBudget={analytics.kpis.totalBudget} 
                totalEstimatedHours={analytics.kpis.totalEstimatedHours} 
              />
              <MonthlyTrendLineChart data={analytics.charts.productivityTrend} />
            </div>
          </>
        ) : (
           <div className="text-muted-foreground p-8 text-center border rounded-lg bg-slate-50">
             Failed to load analytics data.
           </div>
        )}
      </div>
    </div>
  );
}
