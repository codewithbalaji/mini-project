import OpenAI from "openai";
import axios from "axios";

// Using OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "dummy",
});

export const getAIResponse = async (messages, model = "arcee-ai/trinity-large-preview:free", isJson = false) => {
  // Use Gemini API directly for gemini models
  if (model.startsWith("google/gemini") || model.startsWith("gemini")) {
    return getGeminiResponse(messages, isJson);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      response_format: isJson ? { type: "json_object" } : undefined,
      max_tokens: 1024, // Limit tokens to reduce cost
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter AI Error:", error);
    throw error;
  }
};

// Direct Gemini API integration (free tier: 15 requests/min, 1M tokens/min)
const getGeminiResponse = async (messages, isJson = false) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Convert OpenAI format to Gemini format
    const contents = messages
      .filter(msg => msg.role !== "system")
      .map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

    // Add system instruction separately
    const systemMsg = messages.find(msg => msg.role === "system");
    
    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    };

    if (systemMsg) {
      requestBody.systemInstruction = {
        parts: [{ text: systemMsg.content }]
      };
    }

    if (isJson) {
      requestBody.generationConfig.responseMimeType = "application/json";
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
      requestBody,
      {
        headers: { 
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw error;
  }
};
