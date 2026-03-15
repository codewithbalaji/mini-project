import cron from "node-cron";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { sendEmail } from "../mail/sendEmail.js";
import taskDueSoonTemplate from "../mail/templates/taskDueSoonTemplate.js";
import taskOverdueTemplate from "../mail/templates/taskOverdueTemplate.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Run every day at 8:00 AM
export const initCronJobs = () => {
  cron.schedule("0 8 * * *", async () => {
    console.log("Running daily task emails job...");

    try {
      const now = new Date();
      
      // Calculate start and end of next 24 hours for "Due Soon"
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // We only care about active tasks
      const activeStatuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED"];

      // 1. Task Due Soon: dueDate is between now and tomorrow, status is active
      const dueSoonTasks = await Task.find({
        status: { $in: activeStatuses },
        dueDate: { $gte: now, $lte: tomorrow },
        assignedTo: { $exists: true, $ne: null }
      })
        .populate("assignedTo", "name email")
        .populate("projectId", "title managerId");

      for (const task of dueSoonTasks) {
        if (!task.assignedTo?.email) continue;
        
        try {
          const html = taskDueSoonTemplate({
            taskTitle: task.title,
            projectName: task.projectId?.title || "Project",
            dueDate: new Date(task.dueDate).toLocaleDateString(),
            taskLink: `${CLIENT_URL}/tasks/${task._id}`
          });
          
          await sendEmail({
            to: task.assignedTo.email,
            subject: `Action Required: Task Due Soon - ${task.title}`,
            html
          });
        } catch (err) {
          console.error(`Failed to send due soon email for task ${task._id}:`, err);
        }
      }

      // 2. Task Overdue: dueDate is in the past, status is active
      const overdueTasks = await Task.find({
        status: { $in: activeStatuses },
        dueDate: { $lt: now },
        assignedTo: { $exists: true, $ne: null }
      })
        .populate("assignedTo", "name email")
        .populate("projectId", "title managerId");

      for (const task of overdueTasks) {
        // Calculate days overdue
        const diffTime = Math.abs(now - new Date(task.dueDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Notify Assignee
        if (task.assignedTo?.email) {
          try {
            const html = taskOverdueTemplate({
              taskTitle: task.title,
              projectName: task.projectId?.title || "Project",
              dueDate: new Date(task.dueDate).toLocaleDateString(),
              daysOverdue: diffDays,
              taskLink: `${CLIENT_URL}/tasks/${task._id}`
            });
            
            await sendEmail({
              to: task.assignedTo.email,
              subject: `Overdue: ${task.title} is ${diffDays} days late`,
              html
            });
          } catch (err) {
            console.error(`Failed to send overdue email for task ${task._id} (assignee):`, err);
          }
        }

        // Notify Manager (Optional, but good practice. Assuming project has managerId)
        if (task.projectId?.managerId) {
          try {
            const manager = await User.findById(task.projectId.managerId).select("email");
            if (manager?.email) {
              const html = taskOverdueTemplate({
                taskTitle: task.title,
                projectName: task.projectId.title,
                dueDate: new Date(task.dueDate).toLocaleDateString(),
                daysOverdue: diffDays,
                taskLink: `${CLIENT_URL}/tasks/${task._id}`
              });
              
              await sendEmail({
                to: manager.email,
                subject: `Team Task Overdue: ${task.title}`,
                html
              });
            }
          } catch (err) {
            console.error(`Failed to send overdue email for task ${task._id} (manager):`, err);
          }
        }
      }

      console.log(`Daily cron finished: Sent ${dueSoonTasks.length} due soon, ${overdueTasks.length} overdue emails.`);
    } catch (error) {
      console.error("Error running daily cron jobs:", error);
    }
  });

  console.log("Cron jobs initialized.");
};
