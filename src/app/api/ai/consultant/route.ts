import { NextRequest, NextResponse } from "next/server";
import { 
    buildHealthPrompt, parseHealthResponse,
    buildInsightPrompt, parseInsightResponse,
    buildNarrativePrompt, parseNarrativeResponse
} from "@/lib/ai-consultant";
import { getCached, setCache } from "@/lib/api-cache";

async function fetchAI(prompt: string, model: "llama" | "gemini" = "llama"): Promise<string> {
    if (model === "llama") {
        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) throw new Error("No Groq Key");
        
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
                max_tokens: 1500,
                response_format: { type: "json_object" },
            }),
        });
        if (!res.ok) throw new Error(`Groq error: ${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
    } else {
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) throw new Error("No Gemini Key");
        
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 1500, responseMimeType: "application/json" },
                }),
            }
        );
        if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
}

async function runPromptWithFallback(prompt: string): Promise<string> {
    try {
        return await fetchAI(prompt, "llama");
    } catch (e) {
        console.warn("Groq failed, falling back to Gemini...", e);
        try {
            return await fetchAI(prompt, "gemini");
        } catch (e2) {
            console.error("Both AI providers failed", e2);
            return "";
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        const { mlSummary } = await req.json();
        if (!mlSummary) {
            return NextResponse.json({ error: "mlSummary is required" }, { status: 400 });
        }

        const cacheKey = `consultant-v2:${Buffer.from(JSON.stringify(mlSummary)).toString("base64").substring(0, 64)}`;
        
        // Check in-memory cache first
        const cached = getCached(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Build all 3 prompts
        const healthPrompt = buildHealthPrompt(mlSummary);
        const insightPrompt = buildInsightPrompt(mlSummary);
        const narrativePrompt = buildNarrativePrompt(mlSummary);

        // Execute concurrently
        const [rawHealth, rawInsight, rawNarrative] = await Promise.all([
            runPromptWithFallback(healthPrompt),
            runPromptWithFallback(insightPrompt),
            runPromptWithFallback(narrativePrompt)
        ]);

        // Parse results
        const finalResult = {
            health: parseHealthResponse(rawHealth),
            insights: parseInsightResponse(rawInsight),
            narratives: parseNarrativeResponse(rawNarrative)
        };

        // Cache result (1 day TTL)
        setCache(cacheKey, finalResult, "sentiment");

        return NextResponse.json(finalResult);
    } catch (error) {
        console.error("Consultant API error:", error);
        return NextResponse.json({
            health: parseHealthResponse(""),
            insights: parseInsightResponse(""),
            narratives: parseNarrativeResponse("")
        });
    }
}

