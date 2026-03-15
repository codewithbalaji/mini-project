import Task from "../models/Task.js";
import Project from "../models/Project.js";
import TaskUpdate from "../models/TaskUpdate.js";
import statsService from "../services/statsService.js";

// GET /api/dashboard/org — ADMIN, MANAGER, VIEWER
export const getOrgDashboard = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const stats = await statsService.getOrgStats(organizationId);

    // Recent activity: last 10 task updates across the org
    const recentActivity = await TaskUpdate.find({ organizationId })
      .populate("submittedBy", "name email")
      .populate("taskId", "title status")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ stats, recentActivity });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/dashboard/analytics — ADMIN, MANAGER, VIEWER
export const getAnalyticsDashboard = async (req, res) => {
  try {
    const { organizationId, departmentId, role } = req.user;
    
    // Admins/Viewers see everything. Managers only see their department.
    const filterDeptId = role === "MANAGER" ? departmentId : null;

    const analytics = await statsService.getAnalyticsDashboardStats(organizationId, filterDeptId);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/dashboard/project/:id — ADMIN, MANAGER, VIEWER
export const getProjectDashboard = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { id: projectId } = req.params;

    const project = await Project.findOne({ _id: projectId, organizationId }).populate("members", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const stats = await statsService.getProjectStats(projectId);

    // Per-member task breakdown within this project
    const memberWorkload = await Task.aggregate([
      { $match: { projectId: project._id, organizationId } },
      { $group: { _id: "$assignedTo", taskCount: { $sum: 1 }, doneCount: { $sum: { $cond: [{ $eq: ["$status", "DONE"] }, 1, 0] } } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $project: { userId: "$_id", taskCount: 1, doneCount: 1, userName: { $arrayElemAt: ["$user.name", 0] } } }
    ]);

    // Recent updates on this project
    const recentUpdates = await TaskUpdate.find({ projectId, organizationId })
      .populate("submittedBy", "name email")
      .populate("taskId", "title")
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({ project, stats, memberWorkload, recentUpdates });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/dashboard/me — EMPLOYEE personal dashboard
export const getMyDashboard = async (req, res) => {
  try {
    const { id: userId, organizationId } = req.user;

    const myTasks = await Task.find({ assignedTo: userId, organizationId })
      .populate("projectId", "title status")
      .sort({ dueDate: 1 });

    const tasksByStatus = {
      TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0, BLOCKED: 0
    };

    let overdueCount = 0;
    const now = new Date();

    for (const task of myTasks) {
      tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1;
      if (task.dueDate && task.dueDate < now && task.status !== "DONE") overdueCount++;
    }

    const recentUpdates = await TaskUpdate.find({ submittedBy: userId, organizationId })
      .populate("taskId", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalTasks: myTasks.length,
      tasksByStatus,
      overdueCount,
      upcomingTasks: myTasks.filter((t) => t.status !== "DONE").slice(0, 5),
      recentUpdates
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
