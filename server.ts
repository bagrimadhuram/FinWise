import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/ai/onboarding", async (req, res) => {
  try {
    const { profile } = req.body;
    const prompt = `
      You are FinWise, a supportive financial copilot. Analyze this user profile and generate an initial financial roadmap.
      User Profile: ${JSON.stringify(profile)}
      
      Provide a JSON response with:
      1. A short, encouraging summary of their financial health.
      2. Suggested monthly savings target to hit their goals.
      3. Any immediate 'low-hanging fruit' suggestions to save money.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestions: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            monthlySavingsTarget: { type: Type.NUMBER }
          },
          required: ["summary", "suggestions", "monthlySavingsTarget"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("AI Onboarding Error:", error);
    res.status(500).json({ error: "Failed to process roadmap" });
  }
});

app.post("/api/ai/affordability", async (req, res) => {
  try {
    const { item, price, whenToBuy, profile, goals } = req.body;
    const prompt = `
      You are FinWise. A user wants to buy "${item}" for ${price} and plans to buy it "${whenToBuy}".
      User Profile: ${JSON.stringify(profile)}
      Active Goals: ${JSON.stringify(goals)}
      
      Analyze if they can afford it. Consider their monthly disposable income, goal priority, and emergency fund status.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, enum: ["green", "amber", "red"] },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            impact: { type: Type.STRING },
            alternatives: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["verdict", "title", "description", "impact", "alternatives"]
        }
      }
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("AI Affordability Error:", error);
    res.status(500).json({ error: "Failed to analyze affordability" });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history, profile } = req.body;
    
    const systemInstruction = `You are FinWise, a supportive financial copilot. Context: User profile is ${JSON.stringify(profile)}. Keep responses helpful and professional.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.json({ content: response.text });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

app.post("/api/ai/insights", async (req, res) => {
  try {
    const { profile, goals, expenses } = req.body;
    const prompt = `
      You are FinWise. Analyze this user's financial situation:
      Profile: ${JSON.stringify(profile)}
      Goals: ${JSON.stringify(goals)}
      Recent Expenses: ${JSON.stringify(expenses)}
      
      Note: The user has multiple goals. Provide insights that look at the BIG PICTURE of their savings portfolio.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            statusMessage: { type: Type.STRING },
            insights: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["score", "statusMessage", "insights"]
        }
      }
    });
    res.json(JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("AI Insights Error:", error);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
