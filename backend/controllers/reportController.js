import { getAIResponse } from "../services/ai.service.js";
import statsService from "../services/statsService.js";
import ProjectReport from "../models/ProjectReport.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import TaskUpdate from "../models/TaskUpdate.js";

// @route POST /api/reports/generate
export const generateReport = async (req, res) => {
  try {
    const { projectId } = req.body;
    const { organizationId, id: userId } = req.user;

    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }

    // Verify project belongs to org
    const project = await Project.findOne({ _id: projectId, organizationId });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Gather data for the AI prompt
    const stats = await statsService.getProjectStats(projectId);
    const tasks = await Task.find({ projectId, organizationId }).populate(
      "assignedTo",
      "name email"
    );
    const updates = await TaskUpdate.find({ projectId, organizationId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("submittedBy", "name email");

    // Priority breakdown
    const priorityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    tasks.forEach((t) => {
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
    });

    const now = new Date();
    const dueDate = project.dueDate ? new Date(project.dueDate) : null;
    const daysUntilDue = dueDate
      ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      : null;

    const projectContext = {
      title: project.title,
      description: project.description || "",
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      dueDate: project.dueDate,
      daysUntilDue,
      budget: project.budget || 0,
      clientName: project.clientName || "",
      memberCount: project.members?.length || 0,
      taskStats: {
        ...stats,
        priorityCounts,
      },
      recentUpdates: updates.slice(0, 10).map((u) => ({
        submittedBy: u.submittedBy?.name || "Unknown",
        text: u.updateText?.slice(0, 200),
        hoursLogged: u.hoursLogged,
        statusChange: u.statusChange,
        date: u.createdAt,
      })),
    };

    const messages = [
      {
        role: "system",
        content: `You are an expert project management analyst. Analyze the project data and produce a structured performance report.

Respond ONLY with valid JSON (no markdown, no backticks) in this exact format:
{
  "executiveSummary": "string (3-4 sentences summarizing overall project health and status)",
  "healthScore": <0-100 integer>,
  "healthStatus": "On Track" | "At Risk" | "Critical",
  "keyFindings": ["string (1-2 sentences each)", "..."],
  "risks": [{ "title": "string", "severity": "low" | "medium" | "high", "description": "string (1-2 sentences)" }],
  "recommendations": [{ "title": "string", "priority": "low" | "medium" | "high", "action": "string (1-2 sentences)" }],
  "teamPerformance": "string (2-3 sentences about team activity and productivity)",
  "timeline": "On Track" | "Delayed" | "Ahead of Schedule"
}

Rules:
- healthScore: 0-100 integer reflecting overall project health
- keyFindings: 3-5 bullet-level insights
- risks: 2-4 identified risks
- recommendations: 2-4 actionable items
- Keep all descriptions concise (1-2 sentences) to fit within token limits`,
      },
      {
        role: "user",
        content: `Generate a performance report for this project:

${JSON.stringify(projectContext, null, 2)}`,
      },
    ];

    const aiRes = await getAIResponse(messages, "gemini-flash-latest", true);

    let reportData = {};
    try {
      const cleanJson = aiRes.replace(/```json/g, "").replace(/```/g, "").trim();
      reportData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse AI report JSON:", aiRes);
      return res.status(500).json({ message: "Failed to parse AI report response" });
    }

    // Validate and sanitize enum fields
    const validHealthStatus = ["On Track", "At Risk", "Critical"];
    const validTimeline = ["On Track", "Delayed", "Ahead of Schedule"];
    const validSeverity = ["low", "medium", "high"];

    if (!validHealthStatus.includes(reportData.healthStatus)) {
      reportData.healthStatus = "At Risk";
    }
    if (!validTimeline.includes(reportData.timeline)) {
      reportData.timeline = "On Track";
    }
    if (Array.isArray(reportData.risks)) {
      reportData.risks = reportData.risks.map((r) => ({
        ...r,
        severity: validSeverity.includes(r.severity) ? r.severity : "medium",
      }));
    }
    if (Array.isArray(reportData.recommendations)) {
      reportData.recommendations = reportData.recommendations.map((r) => ({
        ...r,
        priority: validSeverity.includes(r.priority) ? r.priority : "medium",
      }));
    }

    // Replace any existing cached report for this project
    await ProjectReport.deleteMany({ projectId, organizationId });

    const report = new ProjectReport({
      projectId,
      organizationId,
      generatedBy: userId,
      executiveSummary: reportData.executiveSummary,
      healthScore: Math.min(100, Math.max(0, Math.round(reportData.healthScore))),
      healthStatus: reportData.healthStatus,
      keyFindings: reportData.keyFindings || [],
      risks: reportData.risks || [],
      recommendations: reportData.recommendations || [],
      teamPerformance: reportData.teamPerformance || "",
      timeline: reportData.timeline,
      projectSnapshot: {
        totalTasks: stats.totalTasks,
        completionPercentage: stats.completionPercentage,
        overdueCount: stats.overdueCount,
        totalLoggedHours: stats.totalLoggedHours,
        totalEstimatedHours: stats.totalEstimatedHours,
      },
    });

    await report.save();

    const populated = await ProjectReport.findById(report._id)
      .populate("projectId", "title status")
      .populate("generatedBy", "name email");

    res.status(201).json({ report: populated });
  } catch (error) {
    console.error("generateReport error:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

// @route DELETE /api/reports/:id
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const report = await ProjectReport.findOneAndDelete({ _id: id, organizationId });
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report deleted" });
  } catch (error) {
    console.error("deleteReport error:", error);
    res.status(500).json({ message: "Failed to delete report" });
  }
};

// @route GET /api/reports
export const getReports = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { projectId } = req.query;

    const filter = { organizationId };
    if (projectId) filter.projectId = projectId;

    const reports = await ProjectReport.find(filter)
      .sort({ createdAt: -1 })
      .populate("projectId", "title status")
      .populate("generatedBy", "name email");

    res.json({ reports });
  } catch (error) {
    console.error("getReports error:", error);
    res.status(500).json({ message: "Failed to retrieve reports" });
  }
};
