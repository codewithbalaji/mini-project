import mongoose from "mongoose";

const taskUpdateSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    },

    // Multi-tenancy key
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization"
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // Raw employee-written update text
    // Phase 3: this field will be sent to AI for NLP processing
    updateText: {
      type: String,
      required: true
    },

    hoursLogged: {
      type: Number,
      default: 0
    },

    // The new task status after this update (if changed)
    statusChange: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED", null],
      default: null
    },

    // ── Phase 3 placeholder fields ──────────────────────────────────────────
    // AI-generated summary of the updateText (empty in Phase 2)
    aiSummary: {
      type: String,
      default: ""
    },

    // AI-extracted task status from text (null in Phase 2)
    extractedStatus: {
      type: String,
      default: null
    },

    // AI-detected progress percentage (null in Phase 2)
    extractedProgress: {
      type: Number,
      default: null
    }
    // ────────────────────────────────────────────────────────────────────────
  },
  { timestamps: true }
);

taskUpdateSchema.index({ taskId: 1, createdAt: -1 });

export default mongoose.model("TaskUpdate", taskUpdateSchema);
