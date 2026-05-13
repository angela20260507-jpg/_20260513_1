

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getAICommentary = async (event: string, score: number, level: number) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The player just ${event}. Current score: ${score}, Level: ${level}. Give a very short, punchy, neon-styled pro-gamer comment (max 10 words).`,
      config: {
        systemInstruction: "You are a cool, retro-future AI game commentator for a neon Tetris game. Use gaming slang and neon aesthetics in your short remarks. Be encouraging but competitive.",
      },
    });

    return response.text?.trim() || "KEEP IT UP, PILOT.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "CONNECTION STABLE. PROCEED.";
  }
};
