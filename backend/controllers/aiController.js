import { getAIResponse } from "../services/ai.service.js";
import { generateSpeech } from "../services/voice.service.js";
import TaskInsight from "../models/TaskInsight.js";
import Task from "../models/Task.js";

// @route POST /api/ai/my-tasks-assistant
export const myTasksAssistant = async (req, res) => {
  try {
    const { query, tasks } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const messages = [
      {
        role: "system",
        content: `You are an AI Copilot for a project management system. 
You help users with their tasks. Below is the list of the user's current tasks.
Answer their question concisely based ONLY on these tasks. If they ask about something unrelated, politely steer them back.

Tasks context:
${JSON.stringify(tasks, null, 2)}`
      },
      {
        role: "user",
        content: query
      }
    ];

    const aiText = await getAIResponse(messages);
    
    res.status(200).json({ reply: aiText });
  } catch (error) {
    console.error("myTasksAssistant error:", error);
    res.status(500).json({ message: "Failed to process AI request" });
  }
};

// @route POST /api/ai/task-detail-assistant
export const taskDetailAssistant = async (req, res) => {
  try {
    const { query, taskContext } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const messages = [
      {
        role: "system",
        content: `You are an AI Copilot for a specific task in a project management system.
You analyze the user's voice/text input and the current task context to determine if they want to update the task status, or add an update/comment.
You MUST respond IN JSON FORMAT ONLY with the following structure. Do not use markdown backticks around the json, just output raw json.
{
  "speechText": "A concise, natural, spoken response to the user. E.g. 'I've noted that you finished the design. I suggest changing the status to DONE.'",
  "suggestedStatus": "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED" | null (if no change is implied),
  "suggestedUpdateText": "Suggested text for a new update log based on the user's input, or null"
}

Task Context:
${JSON.stringify(taskContext, null, 2)}`
      },
      {
        role: "user",
        content: query
      }
    ];

    const aiRes = await getAIResponse(messages, "gemini-flash-latest", true);
    
    let parsedData = {};
    try {
      const cleanJson = aiRes.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleanJson);
    } catch(e) {
      console.error("Failed to parse JSON from AI:", aiRes);
      parsedData = {
        speechText: aiRes,
        suggestedStatus: null,
        suggestedUpdateText: null
      };
    }

    res.status(200).json(parsedData);
  } catch (error) {
    console.error("taskDetailAssistant error:", error);
    res.status(500).json({ message: "Failed to process task detail AI request" });
  }
};

// @route POST /api/ai/text-to-speech
export const textToSpeech = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const audioBuffer = await generateSpeech(text);
    
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error("textToSpeech error:", error);
    res.status(500).json({ message: "Failed to generate speech" });
  }
};

// @route POST /api/ai/task-insights
export const getTaskInsights = async (req, res) => {
  try {
    const { task, updates } = req.body;
    
    if (!task) {
      return res.status(400).json({ message: "Task data is required" });
    }

    const now = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < now && task.status !== "DONE";
    const daysUntilDue = dueDate ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)) : null;
    const hoursProgress = task.estimatedHours > 0 ? (task.loggedHours / task.estimatedHours) * 100 : 0;

    const messages = [
      {
        role: "system",
        content: `You are an AI assistant analyzing a task in a project management system.
Provide smart, actionable recommendations based on the task data.

Respond ONLY with valid JSON (no markdown, no backticks) in this exact format:
{
  "recommendations": [
    {
      "type": "status" | "priority" | "time" | "action",
      "title": "Brief recommendation title",
      "description": "Detailed explanation",
      "severity": "info" | "warning" | "critical"
    }
  ]
}

IMPORTANT: The "type" field must be exactly one of: "status", "priority", "time", or "action"

Analysis context:
- Current status: ${task.status}
- Priority: ${task.priority}
- Logged hours: ${task.loggedHours}h / ${task.estimatedHours}h (${hoursProgress.toFixed(0)}%)
- Due date: ${dueDate ? dueDate.toLocaleDateString() : "Not set"}
- Days until due: ${daysUntilDue !== null ? daysUntilDue : "N/A"}
- Is overdue: ${isOverdue}
- Recent updates: ${updates?.length || 0}

Provide 2-4 specific, actionable recommendations. Use these types:
- "status": Suggest status changes (TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED)
- "priority": Recommend priority adjustments (LOW, MEDIUM, HIGH)
- "time": Time management concerns (hours, estimates, deadlines)
- "action": General next steps or actions to take`
      },
      {
        role: "user",
        content: `Analyze this task and provide recommendations:

Task: ${task.title}
Description: ${task.description || "No description"}
Status: ${task.status}
Priority: ${task.priority}

Recent Updates:
${updates?.slice(0, 3).map(u => `- ${u.description} (${u.hoursWorked}h)`).join('\n') || "No updates yet"}`
      }
    ];

    const aiResponse = await getAIResponse(messages, "gemini-flash-latest", true);
    
    let insights = {};
    try {
      const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedInsights = JSON.parse(cleanJson);
      
      // Fix any invalid type values from AI response
      const validRecommendations = parsedInsights.recommendations.map(rec => ({
        ...rec,
        type: ['status', 'priority', 'time', 'action'].includes(rec.type) ? rec.type : 'action'
      }));
      
      insights = { recommendations: validRecommendations };
    } catch(e) {
      console.error("Failed to parse AI insights JSON:", aiResponse);
      insights = {
        recommendations: [
          {
            type: "action",
            title: "Analysis in progress",
            description: "AI insights are being generated. Please try again.",
            severity: "info"
          }
        ]
      };
    }

    // Delete existing insights for this task
    await TaskInsight.deleteMany({ 
      taskId: task._id, 
      organizationId: req.user.organizationId 
    });

    // Save new insights to database
    const taskInsight = new TaskInsight({
      taskId: task._id,
      organizationId: req.user.organizationId,
      recommendations: insights.recommendations,
      taskSnapshot: {
        status: task.status,
        priority: task.priority,
        loggedHours: task.loggedHours,
        estimatedHours: task.estimatedHours,
        dueDate: task.dueDate,
        updatesCount: updates?.length || 0
      }
    });

    await taskInsight.save();

    res.status(200).json(insights);
  } catch (error) {
    console.error("getTaskInsights error:", error);
    res.status(500).json({ message: "Failed to generate task insights" });
  }
};

// @route GET /api/ai/task-insights/:taskId
export const getStoredTaskInsights = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Verify task exists and user has access
    const task = await Task.findOne({ 
      _id: taskId, 
      organizationId: req.user.organizationId 
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Get the most recent insights for this task
    const insights = await TaskInsight.findOne({ 
      taskId, 
      organizationId: req.user.organizationId 
    }).sort({ createdAt: -1 });

    if (!insights) {
      return res.status(404).json({ message: "No insights found for this task" });
    }

    res.status(200).json({ insights });
  } catch (error) {
    console.error("getStoredTaskInsights error:", error);
    res.status(500).json({ message: "Failed to retrieve task insights" });
  }
};
