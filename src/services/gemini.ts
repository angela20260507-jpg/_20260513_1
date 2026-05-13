import { GoogleGenAI } from "@google/genai";

export const getAICommentary = async (event: string, score: number, level: number) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === "your_actual_key_here") {
    console.warn("Gemini API Key is missing. Skipping commentary.");
    return "AI OFFLINE. KEEP GOING, PILOT.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
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
