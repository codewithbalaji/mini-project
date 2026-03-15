import Project from "../models/Project.js";
import Task from "../models/Task.js";

/**
 * Verifies that the requesting user has access to a given project.
 * - ADMIN and MANAGER: access all projects within their org.
 * - EMPLOYEE: only projects they are a member of.
 * - VIEWER: read access to all projects within their org.
 */
export const checkProjectAccess = async (req, res, next) => {
  try {
    const { id: userId, organizationId, role } = req.user;
    const projectId = req.params.id || req.body.projectId;

    const project = await Project.findOne({ _id: projectId, organizationId });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (role === "EMPLOYEE") {
      const isMember = project.members.some((m) => m.toString() === userId);
      if (!isMember) return res.status(403).json({ message: "Access denied: not a project member" });
    }

    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Verifies that the requesting user has access to a given task.
 * - ADMIN and MANAGER: all tasks within their org.
 * - EMPLOYEE: only tasks assigned to them.
 */
export const checkTaskAccess = async (req, res, next) => {
  try {
    const { id: userId, organizationId, role } = req.user;
    const taskId = req.params.id;

    const task = await Task.findOne({ _id: taskId, organizationId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (role === "EMPLOYEE") {
      if (task.assignedTo?.toString() !== userId) {
        return res.status(403).json({ message: "Access denied: task not assigned to you" });
      }
    }

    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
