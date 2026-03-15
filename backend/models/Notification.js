import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Multi-tenancy key
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    type: {
      type: String,
      enum: [
        "TASK_ASSIGNED",
        "TASK_STATUS_CHANGED",
        "TASK_DUE_SOON",
        "TASK_OVERDUE",
        "PROJECT_CREATED",
        "PROJECT_STATUS_CHANGED",
        "COMMENT_ADDED",
        "MEMBER_ADDED"
      ],
      required: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    isRead: {
      type: Boolean,
      default: false
    },

    // Deep-link to the related entity (e.g., task or project)
    relatedEntity: {
      entityType: {
        type: String,
        enum: ["TASK", "PROJECT", null],
        default: null
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
      }
    }
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
