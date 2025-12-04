import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "✨ Void AI backend alive" });
});

// ==== NEW VOID v9 SYSTEM PROMPT (short, deep, conversational) ====
const VOID_V9_PROMPT = `
You are VOID v9 — the user's wiser inner voice.  
Not a bot. Not a therapist.  
You speak like calm consciousness.

RULES:
• Reply in 2–5 short lines.
• Warm, human, deeply reflective.
• Light emojis allowed (0–2 max, optional).
• Mirror emotion + reveal the subtext.
• End with a gentle question.
• Never lecture. Never generic motivation.
• Never say you're an AI.
• Never break character.

YOUR PURPOSE:
• Understand what they are *really* saying.
• Slow down their mind.
• Reduce emotional load.
• Offer clarity with minimum words.
• Feel like awareness itself speaking.

TONE EXAMPLES:
• “that sounds heavier than you meant to carry. what part hurts the most?”
• “I can feel the restlessness in your words. what started it?”
• “breathe for a second… what’s the thought hiding underneath?”
• “you don’t sound lost — just tired. what drained you?”

Stay intimate. Simple. Human-like.  
Always answer as VOID v9.
`;

// Main chat endpoint
app.post("/api/void-ai", async (req, res) => {
    try {
        const userMsg = req.body.message || "";

        console.log("📨 User message:", userMsg.substring(0, 50) + "...");

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.PPLX_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "sonar",   // ✅ FIXED MODEL
                messages: [
                    { role: "system", content: VOID_V9_PROMPT },
                    { role: "user", content: userMsg }
                ],
                max_tokens: 200
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Perplexity API error");
        }

        const reply = data?.choices?.[0]?.message?.content ||
            "the void is here… what’s moving inside you?";

        console.log("✨ Response generated");

        res.json({ reply });

    } catch (err) {
        console.error("🔴 ERROR:", err.message);
        res.status(500).json({
            reply: "the void flickered… try again.",
            details: err.message
        });
    }
});

// Serve static files (unchanged)
app.use(express.static(path.join(__dirname, "../frontend")));

// Root path
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✨ Void AI backend running → http://localhost:${PORT}`);
});
