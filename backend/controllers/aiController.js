import { getAIResponse } from "../services/ai.service.js";
import { generateSpeech } from "../services/voice.service.js";

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
