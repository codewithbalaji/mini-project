import Task from "../models/Task.js";
import Project from "../models/Project.js";
import notificationService from "../services/notificationService.js";

// POST /api/tasks — ADMIN, MANAGER
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      projectId,
      assignedTo,
      dueDate,
      estimatedHours,
      tags,
      order
    } = req.body;

    const { id: assignedBy, organizationId, name: managerName } = req.user;

    // Verify project belongs to org
    const project = await Project.findOne({ _id: projectId, organizationId });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = new Task({
      title,
      description,
      status,
      priority,
      projectId,
      organizationId,
      assignedTo,
      assignedBy,
      dueDate,
      estimatedHours,
      tags,
      order
    });

    await task.save();

    // Notify the assigned employee
    if (assignedTo) {
      await notificationService.notifyTaskAssigned({
        employeeId: assignedTo,
        managerName,
        taskTitle: title,
        taskId: task._id,
        projectId,
        dueDate,
        organizationId
      });
    }

    const populated = await task.populate([
      { path: "assignedTo", select: "name email" },
      { path: "assignedBy", select: "name email" }
    ]);

    res.status(201).json({ message: "Task created", task: populated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/tasks — filtered by project, assignee, status
export const getTasks = async (req, res) => {
  try {
    const { organizationId, id: userId, role } = req.user;
    const { projectId, assignedTo, status, priority } = req.query;

    const filter = { organizationId };

    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (role === "EMPLOYEE") {
      if (projectId) {
        // Employee can view ALL tasks in a project they're a member of (view-only context)
        // Verify they're actually a member of this project
        const project = await Project.findOne({ _id: projectId, members: userId, organizationId });
        if (!project) {
          // Not a project member — only show their own tasks
          filter.assignedTo = userId;
        }
        // else: project member → see all project tasks (filter stays without assignedTo restriction)
      } else {
        // No project filter — only show their assigned tasks
        filter.assignedTo = userId;
      }
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("projectId", "title")
      .sort({ order: 1, createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// GET /api/tasks/my-tasks — EMPLOYEE personal task list
export const getMyTasks = async (req, res) => {
  try {
    const { id: userId, organizationId } = req.user;
    const { status } = req.query;

    const filter = { assignedTo: userId, organizationId };
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate("projectId", "title status")
      .populate("assignedBy", "name email")
      .sort({ dueDate: 1, createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/tasks/:id
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    })
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("projectId", "title status managerId");

    if (!task) return res.status(404).json({ message: "Task not found" });

    // EMPLOYEE can view tasks if:
    // 1. They are assigned to the task, OR
    // 2. They are a member of the project
    if (req.user.role === "EMPLOYEE") {
      const isAssignee = task.assignedTo?._id.toString() === req.user.id;
      
      if (!isAssignee) {
        // Check if employee is a member of the project
        const project = await Project.findOne({
          _id: task.projectId,
          organizationId: req.user.organizationId,
          members: req.user.id
        });
        
        if (!project) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/tasks/:id — MANAGER updates meta; EMPLOYEE only updates status on their own tasks
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    const { role, id: updaterId, name: updaterName, organizationId } = req.user;
    const oldStatus = task.status;

    if (role === "EMPLOYEE") {
      // Employees can only update status on their own assigned tasks
      if (task.assignedTo?.toString() !== updaterId) {
        return res.status(403).json({ message: "You can only update tasks assigned to you" });
      }
      
      task.status = req.body.status || task.status;
      if (req.body.status === "DONE") task.completedAt = new Date();
    } else {
      const { title, description, status, priority, assignedTo, dueDate, estimatedHours, tags, order } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) {
        task.status = status;
        if (status === "DONE") task.completedAt = new Date();
      }
      if (priority !== undefined) task.priority = priority;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
      if (tags !== undefined) task.tags = tags;
      if (order !== undefined) task.order = order;
    }

    await task.save();

    const populated = await task.populate([
      { path: "assignedTo", select: "name email" },
      { path: "assignedBy", select: "name email" }
    ]);

    // Notify all project members when status actually changes
    if (req.body.status && req.body.status !== oldStatus) {
      try {
        const project = await Project.findById(task.projectId).select("members managerId");
        if (project) {
          const recipients = [
            ...project.members.map(String),
            project.managerId ? String(project.managerId) : null
          ].filter(Boolean).filter((id) => id !== updaterId);

          const uniqueRecipients = [...new Set(recipients)];
          await Promise.allSettled(
            uniqueRecipients.map((userId) =>
              notificationService.createNotification({
                userId,
                organizationId,
                type: "TASK_STATUS_CHANGED",
                title: "Task Status Updated",
                message: `${updaterName} changed "${task.title}" to ${req.body.status.replace("_", " ")}`,
                relatedEntity: { entityType: "TASK", entityId: task._id },
                emailData: {
                  taskTitle: task.title,
                  newStatus: req.body.status,
                  changerName: updaterName,
                  taskId: task._id
                }
              })
            )
          );
        }
      } catch (notifErr) {
        console.error("Status notification failed:", notifErr.message);
      }
    }

    res.json({ message: "Task updated", task: populated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// DELETE /api/tasks/:id — MANAGER, ADMIN
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
