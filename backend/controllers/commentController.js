import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import notificationService from "../services/notificationService.js";

// POST /api/comments — All authenticated users
export const addComment = async (req, res) => {
  try {
    const { entityType, entityId, content } = req.body;
    const { id: author, organizationId, name: authorName } = req.user;

    const comment = new Comment({
      entityType,
      entityId,
      organizationId,
      author,
      content
    });

    await comment.save();

    await comment.populate("author", "name email role");

    // Notify the relevant party about the comment
    try {
      let recipientId = null;
      let entityTitle = "";

      if (entityType === "TASK") {
        const task = await Task.findById(entityId).select("assignedTo assignedBy title");
        if (task) {
          entityTitle = task.title;
          // Notify the other party: if commenter is employee, notify manager (assignedBy), & vice versa
          if (task.assignedTo?.toString() !== author) recipientId = task.assignedTo;
          else recipientId = task.assignedBy;
        }
      } else if (entityType === "PROJECT") {
        const project = await Project.findById(entityId).select("managerId title");
        if (project) {
          entityTitle = project.title;
          if (project.managerId?.toString() !== author) recipientId = project.managerId;
        }
      }

      if (recipientId) {
        await notificationService.notifyCommentAdded({
          recipientId,
          authorName,
          entityType,
          entityId,
          entityTitle,
          organizationId
        });
      }
    } catch (_) {
      // swallow notification errors
    }

    res.status(201).json({ message: "Comment added", comment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/comments?entityType=TASK&entityId=:id
export const getComments = async (req, res) => {
  try {
    const { entityType, entityId } = req.query;
    const { organizationId } = req.user;

    if (!entityType || !entityId) {
      return res.status(400).json({ message: "entityType and entityId are required" });
    }

    const comments = await Comment.find({ entityType, entityId, organizationId })
      .populate("author", "name email role")
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/comments/:id — Own comment or ADMIN/MANAGER
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const isOwner = comment.author.toString() === req.user.id;
    const isPrivileged = ["ADMIN", "MANAGER"].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: "Access denied" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
