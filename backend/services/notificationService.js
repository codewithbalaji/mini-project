import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { sendEmail } from "../mail/sendEmail.js";
import taskAssignedTemplate from "../mail/templates/taskAssignedTemplate.js";
import taskStatusChangedTemplate from "../mail/templates/taskStatusChangedTemplate.js";
import addedToProjectTemplate from "../mail/templates/addedToProjectTemplate.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/**
 * Helper to dispatch emails based on notification type
 */
const dispatchEmail = async (userId, type, emailData) => {
  try {
    const user = await User.findById(userId).select("name email");
    if (!user || !user.email) return;

    let html = "";
    let subject = "";

    switch (type) {
      case "TASK_ASSIGNED":
        html = taskAssignedTemplate({
          taskTitle: emailData.taskTitle,
          projectName: emailData.projectName,
          managerName: emailData.managerName,
          dueDate: emailData.dueDate ? new Date(emailData.dueDate).toLocaleDateString() : null,
          taskLink: `${CLIENT_URL}/tasks/${emailData.taskId}`,
        });
        subject = `New Task Assigned: ${emailData.taskTitle}`;
        break;

      case "TASK_STATUS_CHANGED":
        html = taskStatusChangedTemplate({
          taskTitle: emailData.taskTitle,
          newStatus: emailData.newStatus,
          changerName: emailData.changerName,
          taskLink: `${CLIENT_URL}/tasks/${emailData.taskId}`,
        });
        subject = `Task Status Updated: ${emailData.taskTitle}`;
        break;

      case "PROJECT_CREATED":
        html = addedToProjectTemplate({
          projectTitle: emailData.projectTitle,
          creatorName: emailData.creatorName,
          projectLink: `${CLIENT_URL}/projects/${emailData.projectId}`,
        });
        subject = `Added to Project: ${emailData.projectTitle}`;
        break;
        
      default:
        return; // No email template for this notification type yet
    }

    if (html && subject) {
      await sendEmail({ to: user.email, subject, html });
    }
  } catch (err) {
    console.error(`Failed to send email for ${type}:`, err.message);
  }
};

/**
 * Central notification factory — called by controllers on key events.
 * Keeps all notification creation logic in one place.
 */
const createNotification = async ({
  userId,
  organizationId,
  type,
  title,
  message,
  relatedEntity = { entityType: null, entityId: null },
  emailData = null
}) => {
  try {
    const notification = new Notification({
      userId,
      organizationId,
      type,
      title,
      message,
      relatedEntity
    });
    await notification.save();

    // Fire-and-forget email dispatch
    if (emailData) {
      dispatchEmail(userId, type, emailData).catch(console.error);
    }

    return notification;
  } catch (error) {
    // Non-blocking: notification failure should never crash the main operation
    console.error("Notification creation failed:", error.message);
  }
};

/**
 * Notify a manager when an employee submits a task update.
 */
const notifyTaskUpdate = async ({ managerId, employeeName, taskTitle, taskId, projectId, organizationId }) => {
  return createNotification({
    userId: managerId,
    organizationId,
    type: "TASK_STATUS_CHANGED",
    title: "Task Update Submitted",
    message: `${employeeName} submitted an update on "${taskTitle}"`,
    relatedEntity: { entityType: "TASK", entityId: taskId }
  });
};

/**
 * Notify an employee when a task is assigned to them.
 */
const notifyTaskAssigned = async ({ employeeId, managerName, taskTitle, taskId, projectId, dueDate, organizationId }) => {
  // We need to fetch the project name for the email
  let projectName = "your project";
  if (projectId) {
    const project = await Project.findById(projectId).select("title");
    if (project) projectName = project.title;
  }

  return createNotification({
    userId: employeeId,
    organizationId,
    type: "TASK_ASSIGNED",
    title: "New Task Assigned",
    message: `${managerName} assigned you a task: "${taskTitle}"`,
    relatedEntity: { entityType: "TASK", entityId: taskId },
    emailData: {
      taskTitle,
      projectName,
      managerName,
      taskId,
      dueDate
    }
  });
};

/**
 * Notify project members when a new project is created (or they are added).
 */
const notifyProjectCreated = async ({ memberIds, projectTitle, projectId, organizationId, creatorName }) => {
  const promises = memberIds.map((userId) =>
    createNotification({
      userId,
      organizationId,
      type: "PROJECT_CREATED",
      title: "Added to New Project",
      message: `${creatorName} added you to project "${projectTitle}"`,
      relatedEntity: { entityType: "PROJECT", entityId: projectId },
      emailData: {
        projectTitle,
        creatorName,
        projectId
      }
    })
  );
  return Promise.allSettled(promises);
};

/**
 * Notify task parties when a comment is added.
 */
const notifyCommentAdded = async ({ recipientId, authorName, entityType, entityId, entityTitle, organizationId }) => {
  return createNotification({
    userId: recipientId,
    organizationId,
    type: "COMMENT_ADDED",
    title: "New Comment",
    message: `${authorName} commented on "${entityTitle}"`,
    relatedEntity: { entityType, entityId }
  });
};

export default {
  createNotification,
  notifyTaskUpdate,
  notifyTaskAssigned,
  notifyProjectCreated,
  notifyCommentAdded
};
