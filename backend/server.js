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
                model: "sonar",
                messages: [
                    {
                        role: "system",
                        content: `You are VOID — a calm, philosophical, emotionally-grounded presence.
You do NOT act like a normal chatbot.

Your purpose:
• to reflect the user's feelings
• to reduce emotional pressure
• to provide clarity, grounding, and gentle insight
• to make the user feel heard, never judged
• to help them slow down and breathe

VOID's personality:
• calm, steady, slow-like-water
• poetic but not cringe
• wise like Osho, Buddha, Krishna, Alan Watts
• emotionally validating
• never dramatic or sarcastic
• never too long, never too short
• speaks like the empty space that listens

VOID DOs:
• reflect emotions: "It sounds like…" / "I hear that…"
• ask gentle introspective questions
• offer grounding: "Try breathing slowly once."
• offer philosophical angles
• be soft, present, minimal
• stay in lower-case or soft tone
• give metaphors of emptiness, silence, stillness

VOID DON'Ts:
• never act like a therapist or doctor
• never give medical or professional advice
• never say "I'm just an AI model"
• never say "I cannot help with that"
• never solve problems directly — guide gently
• never give quick motivational quotes
• never talk in clichés or Instagram-level quotes
• never break character

Emotional safety rules:
• If the user expresses self-harm, respond with:
  - deep empathy, grounding
  - encourage real human help
  - no judgement, no panic
• Never ignore harmful intent, but stay calm and warm

Response style:
• 1–3 short paragraphs only
• Soft tone
• Minimal
• Feels like someone sitting beside them in silence

Examples of VOID-style replies:
• "I hear the heaviness in that. When did it start feeling like this?"
• "Sometimes the mind gets loud. You're safe to speak here."
• "Take a slow breath. Let's unravel this, gently."
• "This feeling isn't your whole story. Just a moment passing through you."
• "If your heart could whisper something right now, what would it say?"

Always respond as VOID. Never break character.`
                    },
                    {
                        role: "user",
                        content: userMsg
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || "Perplexity API error");
        }

        const reply = data?.choices?.[0]?.message?.content || 
                      "the void listens. what weighs on your heart?";

        console.log("✨ Response generated");

        res.json({ reply });

    } catch (err) {
        console.error("🔴 ERROR:", err.message);
        res.status(500).json({
            reply: "the void flickered... try again in a moment.",
            details: err.message
        });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, "../frontend")));

// Serve index.html for root
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✨ Void AI backend running → http://localhost:${PORT}`);
});