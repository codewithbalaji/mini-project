export interface OrgDashboard {
  stats: any;
  recentActivity: any[];
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
