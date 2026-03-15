import TaskUpdate from "../models/TaskUpdate.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import notificationService from "../services/notificationService.js";

// POST /api/task-updates — EMPLOYEE (or MANAGER)
export const submitUpdate = async (req, res) => {
  try {
    const { taskId, updateText, hoursLogged, statusChange } = req.body;
    const { id: submittedBy, organizationId, name: employeeName } = req.user;

    const task = await Task.findOne({ _id: taskId, organizationId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    // EMPLOYEE can only update their own tasks
    if (req.user.role === "EMPLOYEE" && task.assignedTo?.toString() !== submittedBy) {
      return res.status(403).json({ message: "Access denied" });
    }

    const update = new TaskUpdate({
      taskId,
      projectId: task.projectId,
      organizationId,
      submittedBy,
      updateText,
      hoursLogged: hoursLogged || 0,
      statusChange: statusChange || null

      // Phase 3: aiService.processUpdate(updateText) will fill aiSummary, extractedStatus, extractedProgress
    });

    await update.save();

    // Accumulate logged hours on the task
    task.loggedHours = (task.loggedHours || 0) + (hoursLogged || 0);

    // Apply status change if provided
    if (statusChange) {
      task.status = statusChange;
      if (statusChange === "DONE") task.completedAt = new Date();
    }

    await task.save();

    // Notify the project manager
    const project = await Project.findById(task.projectId).select("managerId title");
    if (project && project.managerId) {
      await notificationService.notifyTaskUpdate({
        managerId: project.managerId,
        employeeName,
        taskTitle: task.title,
        taskId: task._id,
        projectId: task.projectId,
        organizationId
      });
    }

    res.status(201).json({ message: "Update submitted", update });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/task-updates/:taskId — All updates for a task
export const getUpdatesForTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { organizationId } = req.user;

    const updates = await TaskUpdate.find({ taskId, organizationId })
      .populate("submittedBy", "name email role")
      .sort({ createdAt: -1 });

    res.json({ updates });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
