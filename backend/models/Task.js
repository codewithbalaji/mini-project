import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"],
      default: "TODO"
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM"
    },

    // Parent project
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    // Multi-tenancy key
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    // Employee this task is assigned to
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // Manager who created/assigned the task
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    dueDate: {
      type: Date
    },

    completedAt: {
      type: Date
    },

    estimatedHours: {
      type: Number,
      default: 0
    },

    // Accumulated from TaskUpdate submissions
    loggedHours: {
      type: Number,
      default: 0
    },

    tags: [String],

    // For Kanban drag-and-drop ordering within a column
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Indexes for common query patterns
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, organizationId: 1 });
taskSchema.index({ organizationId: 1, dueDate: 1 });

export default mongoose.model("Task", taskSchema);
