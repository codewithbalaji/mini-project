export interface WorkloadDataItem {
  userId: string;
  userName: string;
  taskCount: number;
}

export interface RecentActivityItem {
  _id: string;
  taskId: { _id: string; title: string; status: string };
  submittedBy: { _id: string; name: string; email: string };
  updateText: string;
  hoursLogged: number;
  statusChange: string | null;
  createdAt: string;
}

export interface OrgDashboard {
  stats: {
    totalProjects: number;
    projectStatusCounts: Record<string, number>;
    workloadData: WorkloadDataItem[];
    overdueCount: number;
  };
  recentActivity: RecentActivityItem[];
}

export interface ProjectDashboard {
  project: any;
  stats: any;
  memberWorkload: any[];
  recentUpdates: any[];
}

export interface MyDashboard {
  totalTasks: number;
  tasksByStatus: any;
  overdueCount: number;
  upcomingTasks: any[];
  recentUpdates: any[];
}

export interface AnalyticsKPIs {
  totalActiveProjects: number;
  totalTasks: number;
  taskCompletionRate: number;
  overdueTasks: number;
  totalMembers: number;
  totalBudget: number;
  totalEstimatedHours: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface TrendDataPoint {
  name: string;
  Projects: number;
  Tasks: number;
}

export interface AnalyticsData {
  kpis: AnalyticsKPIs;
  charts: {
    projectStatusDistribution: ChartDataPoint[];
    taskStatusDistribution: ChartDataPoint[];
    productivityTrend: TrendDataPoint[];
  };
}
