import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
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
      2. Suggested monthly savings targets for their goals.
      3. Any immediate 'low-hanging fruit' suggestions to save money.
      
      Response format:
      {
        "summary": "...",
        "suggestions": ["...", "..."],
        "roadmap": { "monthlySavingsTarget": 0, "estimatedTimeToGoals": {} }
      }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    const text = (response.text || "").replace(/```json|```/g, "").trim();
    res.json(JSON.parse(text));
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
      Provide a JSON response with:
      1. Verdict: "green" (yes), "amber" (with trade-offs), "red" (caution)
      2. Title: A catchy verdict headline.
      3. Description: The reason for the verdict, specifically mentioning the timing they requested.
      4. Impact: How it affects their goals (e.g., "delays Europe trip by 2 weeks").
      5. Alternatives: Cheaper options or a better time to buy (e.g. "Wait 2 more months to save enough surplus").
      
      Response format:
      {
        "verdict": "green|amber|red",
        "title": "Verict headline",
        "description": "...",
        "impact": "...",
        "alternatives": ["...", "..."]
      }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    const text = (response.text || "").replace(/```json|```/g, "").trim();
    res.json(JSON.parse(text));
  } catch (error) {
    console.error("AI Affordability Error:", error);
    res.status(500).json({ error: "Failed to analyze affordability" });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history, profile } = req.body;
    
    // We can simulate chat by appending context to the history
    const systemInstruction = `You are FinWise, a supportive financial copilot. Context: User profile is ${JSON.stringify(profile)}. `;
    
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
      
      Provide a JSON response with:
      1. Health Score: A number from 0-100 reflecting their overall financial discipline and progress towards goals.
      2. Status Message: A short, encouraging summary of their overall status.
      3. Key Insights: 2-3 specific, actionable points. Mention their "Total Portfolio" if they have more than one goal.
      
      Response format:
      {
        "score": 82,
        "statusMessage": "Your financial health is looking strong!",
        "insights": [
          "Hey Rohan! You're ₹3,200 away from being on track for your Europe trip this month.",
          "You've spent 78% of your dining budget. Consider cooking at home twice this week to hit that target early!"
        ]
      }
    `;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    const text = (response.text || "").replace(/```json|```/g, "").trim();
    res.json(JSON.parse(text));
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
