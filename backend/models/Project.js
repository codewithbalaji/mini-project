import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
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
      enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"],
      default: "PLANNING"
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM"
    },

    startDate: {
      type: Date
    },

    dueDate: {
      type: Date
    },

    // New fields for Analytics
    budget: {
      type: Number,
      default: 0,
      min: 0
    },

    clientName: {
      type: String,
      trim: true
    },

    // Multi-tenancy key — all queries must scope by this
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    },

    // The manager who owns/leads this project
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // Employee members on this project
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    tags: [String],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// Index for fast org-scoped queries
projectSchema.index({ organizationId: 1, status: 1 });
projectSchema.index({ managerId: 1 });

export default mongoose.model("Project", projectSchema);
