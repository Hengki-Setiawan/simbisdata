import { NextRequest, NextResponse } from "next/server";
import { buildConsultantPrompt, parseConsultantResponse } from "@/lib/ai-consultant";
import { redis } from "@/lib/redis";

export async function POST(req: NextRequest) {
    try {
        const { mlSummary } = await req.json();
        if (!mlSummary) {
            return NextResponse.json({ error: "mlSummary is required" }, { status: 400 });
        }

        const prompt = buildConsultantPrompt(mlSummary);
        const cacheKey = `SimbisData:ai:consultant:${Buffer.from(JSON.stringify(mlSummary)).toString("base64")}`;

        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return NextResponse.json(typeof cached === "string" ? JSON.parse(cached) : cached);
            }
        } catch (e) {
            console.warn("Redis get failed:", e);
        }

        let rawResponse = "";

        // Try Groq first
        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey) {
            try {
                const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.4,
                        max_tokens: 2000,
                        response_format: { type: "json_object" },
                    }),
                });
                if (res.ok) {
                    const data = await res.json();
                    rawResponse = data.choices?.[0]?.message?.content || "";
                }
            } catch (e) {
                console.warn("Groq failed, falling back to Gemini:", e);
            }
        }

        // Fallback to Gemini
        if (!rawResponse) {
            const geminiKey = process.env.GEMINI_API_KEY;
            if (geminiKey) {
                try {
                    const res = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                contents: [{ parts: [{ text: prompt }] }],
                                generationConfig: { temperature: 0.4, maxOutputTokens: 2000, responseMimeType: "application/json" },
                            }),
                        }
                    );
                    if (res.ok) {
                        const data = await res.json();
                        rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                    }
                } catch (e) {
                    console.warn("Gemini also failed:", e);
                }
            }
        }

        const result = parseConsultantResponse(rawResponse);

        try {
            // Cache for 7 days
            await redis.set(cacheKey, JSON.stringify(result), { ex: 604800 });
        } catch (e) {
            console.warn("Redis set failed:", e);
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Consultant API error:", error);
        // Return fallback template
        const fallback = parseConsultantResponse("");
        return NextResponse.json(fallback);
    }
}
