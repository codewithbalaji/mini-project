import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

/**
 * Get aggregated stats for a single project.
 * Returns task counts by status, completion %, overdue tasks.
 */
const getProjectStats = async (projectId) => {
  const tasks = await Task.find({ projectId });

  const statusCounts = {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
    BLOCKED: 0
  };

  let totalLoggedHours = 0;
  let totalEstimatedHours = 0;
  let overdueCount = 0;
  const now = new Date();

  for (const task of tasks) {
    statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    totalLoggedHours += task.loggedHours || 0;
    totalEstimatedHours += task.estimatedHours || 0;

    if (task.dueDate && task.dueDate < now && task.status !== "DONE") {
      overdueCount++;
    }
  }

  const total = tasks.length;
  const completionPercentage = total > 0 ? Math.round((statusCounts.DONE / total) * 100) : 0;

  return {
    totalTasks: total,
    statusCounts,
    completionPercentage,
    overdueCount,
    totalLoggedHours,
    totalEstimatedHours
  };
};

/**
 * Get org-wide stats for the admin/manager dashboard.
 * Returns project counts by status and per-member workload.
 */
const getOrgStats = async (organizationId) => {
  const projects = await Project.find({ organizationId });

  const projectStatusCounts = {
    PLANNING: 0,
    ACTIVE: 0,
    ON_HOLD: 0,
    COMPLETED: 0,
    CANCELLED: 0
  };

  for (const project of projects) {
    projectStatusCounts[project.status] = (projectStatusCounts[project.status] || 0) + 1;
  }

  // Per-member open task count (workload distribution)
  const workloadData = await Task.aggregate([
    {
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId),
        status: { $nin: ["DONE", "CANCELLED"] }
      }
    },
    {
      $group: {
        _id: "$assignedTo",
        taskCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $project: {
        userId: "$_id",
        taskCount: 1,
        userName: { $arrayElemAt: ["$user.name", 0] }
      }
    }
  ]);

  // Overdue tasks across org
  const overdueCount = await Task.countDocuments({
    organizationId,
    dueDate: { $lt: new Date() },
    status: { $nin: ["DONE"] }
  });

  return {
    totalProjects: projects.length,
    projectStatusCounts,
    workloadData,
    overdueCount
  };
};

/**
 * Get stats for manager dashboard (scoped to their projects only).
 */
const getOrgStatsForManager = async (organizationId, projectIds) => {
  const projects = await Project.find({ 
    organizationId,
    _id: { $in: projectIds }
  });

  const projectStatusCounts = {
    PLANNING: 0,
    ACTIVE: 0,
    ON_HOLD: 0,
    COMPLETED: 0,
    CANCELLED: 0
  };

  for (const project of projects) {
    projectStatusCounts[project.status] = (projectStatusCounts[project.status] || 0) + 1;
  }

  // Per-member open task count (workload distribution) - only for manager's projects
  const workloadData = await Task.aggregate([
    {
      $match: {
        organizationId: new mongoose.Types.ObjectId(organizationId),
        projectId: { $in: projectIds.map(id => new mongoose.Types.ObjectId(id)) },
        status: { $nin: ["DONE", "CANCELLED"] }
      }
    },
    {
      $group: {
        _id: "$assignedTo",
        taskCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $project: {
        userId: "$_id",
        taskCount: 1,
        userName: { $arrayElemAt: ["$user.name", 0] }
      }
    }
  ]);

  // Overdue tasks in manager's projects
  const overdueCount = await Task.countDocuments({
    organizationId,
    projectId: { $in: projectIds },
    dueDate: { $lt: new Date() },
    status: { $nin: ["DONE"] }
  });

  return {
    totalProjects: projects.length,
    projectStatusCounts,
    workloadData,
    overdueCount
  };
};

/**
 * Get aggregated stats for the Enterprise Analytics Dashboard.
 * Admin/Viewer: sees org-wide data.
 * Manager: sees only their own projects.
 */
const getAnalyticsDashboardStats = async (organizationId, managerId = null) => {
  const projectFilter = { organizationId };
  if (managerId) projectFilter.managerId = managerId;

  const projects = await Project.find(projectFilter);
  const projectIds = projects.map(p => p._id);

  const taskFilter = { organizationId };
  if (managerId) {
    // Managers only see tasks belonging to their own projects
    taskFilter.projectId = { $in: projectIds };
  }
  const tasks = await Task.find(taskFilter);

  // 1. Top-Level KPIs
  const activeStatuses = ["PLANNING", "ACTIVE", "ON_HOLD"];
  const totalActiveProjects = projects.filter(p => activeStatuses.includes(p.status)).length;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "DONE").length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== "DONE").length;
  
  // Unique Members
  const memberSet = new Set();
  projects.forEach(p => p.members?.forEach(m => memberSet.add(m.toString())));
  const totalMembers = memberSet.size;

  // Total Budget
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

  // 2. Project Status Distribution (For Donut Chart)
  const pStatusCount = {};
  projects.forEach(p => {
    pStatusCount[p.status] = (pStatusCount[p.status] || 0) + 1;
  });
  const projectStatusDistribution = Object.keys(pStatusCount).map(key => ({
    name: key.replace("_", " "),
    value: pStatusCount[key]
  }));

  // 3. Task Status Distribution (For Bar Chart)
  const tStatusCount = {};
  tasks.forEach(t => {
    tStatusCount[t.status] = (tStatusCount[t.status] || 0) + 1;
  });
  const taskStatusDistribution = Object.keys(tStatusCount).map(key => ({
    name: key.replace("_", " "),
    value: tStatusCount[key]
  }));

  // 4. Productivity Trend (Last 6 Months)
  // Group projects and tasks by creation month
  const last6Months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      monthName: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      projectsCreated: 0,
      tasksCreated: 0
    });
  }

  projects.forEach(p => {
    const d = new Date(p.createdAt);
    const bucket = last6Months.find(b => b.month === d.getMonth() && b.year === d.getFullYear());
    if (bucket) bucket.projectsCreated++;
  });

  tasks.forEach(t => {
    const d = new Date(t.createdAt);
    const bucket = last6Months.find(b => b.month === d.getMonth() && b.year === d.getFullYear());
    if (bucket) bucket.tasksCreated++;
  });

  const productivityTrend = last6Months.map(b => ({
    name: b.monthName,
    Projects: b.projectsCreated,
    Tasks: b.tasksCreated
  }));

  return {
    kpis: {
      totalActiveProjects,
      totalTasks,
      taskCompletionRate,
      overdueTasks,
      totalMembers,
      totalBudget,
      totalEstimatedHours
    },
    charts: {
      projectStatusDistribution,
      taskStatusDistribution,
      productivityTrend
    }
  };
};

export default { getProjectStats, getOrgStats, getOrgStatsForManager, getAnalyticsDashboardStats };
