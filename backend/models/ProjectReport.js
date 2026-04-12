import mongoose from "mongoose";

const riskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], required: true },
    action: { type: String, required: true },
  },
  { _id: false }
);

const projectReportSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    executiveSummary: { type: String, required: true },
    healthScore: { type: Number, min: 0, max: 100, required: true },
    healthStatus: {
      type: String,
      enum: ["On Track", "At Risk", "Critical"],
      required: true,
    },
    keyFindings: [String],
    risks: [riskSchema],
    recommendations: [recommendationSchema],
    teamPerformance: { type: String, default: "" },
    timeline: {
      type: String,
      enum: ["On Track", "Delayed", "Ahead of Schedule"],
      required: true,
    },
    projectSnapshot: {
      totalTasks: Number,
      completionPercentage: Number,
      overdueCount: Number,
      totalLoggedHours: Number,
      totalEstimatedHours: Number,
    },
  },
  { timestamps: true }
);

projectReportSchema.index({ projectId: 1, organizationId: 1 });
projectReportSchema.index({ organizationId: 1, createdAt: -1 });

export default mongoose.model("ProjectReport", projectReportSchema);
