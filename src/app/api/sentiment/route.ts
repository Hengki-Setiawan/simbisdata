/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Local Sentiment Fallback Helpers
function analyzeSentiment(text: string) {
    const t = text.toLowerCase();
    const posWords = ["bagus", "baik", "mantap", "keren", "puas", "cepat", "suka", "good"];
    const negWords = ["jelek", "buruk", "lama", "kecewa", "lambat", "rusak", "mahal", "bad"];
    let score = 0;
    posWords.forEach(w => { if (t.includes(w)) score += 0.2; });
    negWords.forEach(w => { if (t.includes(w)) score -= 0.2; });
    score = Math.max(-1, Math.min(1, score));
    return {
        text,
        label: score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
        score,
        confidence: 0.6,
        keywords: []
    };
}

function batchSentiment(texts: string[]) {
    const results = texts.map(t => analyzeSentiment(t));
    const positive = results.filter((r) => r.label === "positive").length;
    const negative = results.filter((r) => r.label === "negative").length;
    const neutral = results.filter((r) => r.label === "neutral").length;
    const avgScore = results.reduce((s, r) => s + r.score, 0) / (results.length || 1);

    return {
        results,
        summary: { positive, negative, neutral, avgScore }
    };
}

function extractWordFrequencies(texts: string[]) {
    const map = new Map<string, number>();
    const stops = new Set(["dan", "di", "ke", "dari", "yang", "ini", "itu", "untuk", "dengan", "ada", "bisa", "tidak"]);
    texts.forEach(t => {
        const words = t.toLowerCase().match(/\b\w{3,}\b/g) || [];
        words.forEach(w => {
            if (!stops.has(w) && !/^\d+$/.test(w)) {
                map.set(w, (map.get(w) || 0) + 1);
            }
        });
    });
    return Array.from(map.entries())
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value);
}

/**
 * Sentiment Analysis API — Analyze text data for sentiment
 * Uses built-in keyword-based analysis (no external API key needed)
 */
export async function POST(request: Request) {
    try {
        const { texts, mode } = await request.json();

        if (!texts || !Array.isArray(texts)) {
            return NextResponse.json({ error: "texts array required" }, { status: 400 });
        }

        if (mode === "wordcloud") {
            const wordFreqs = extractWordFrequencies(texts);
            return NextResponse.json({ wordFrequencies: wordFreqs });
        }

        if (mode === "single" && texts.length === 1) {
            const result = analyzeSentiment(texts[0]);
            return NextResponse.json(result);
        }

        // Batch mode - Try Gemini first for true NLP
        let results = [];
        let summary = { positive: 0, negative: 0, neutral: 0, avgScore: 0 };
        const wordFreqs = extractWordFrequencies(texts);

        if (process.env.GEMINI_API_KEY && texts.length <= 50) {
            try {
                const uniqueTexts = [...new Set(texts)].slice(0, 50);
                const prompt = `Analisis sentimen dari review/teks berikut. Output WAJIB berupa JSON array dengan format: [{"text": "...", "sentiment": "positive/negative/neutral", "score": -1.0 to 1.0}]. Tanpa markdown. Teks:\n${JSON.stringify(uniqueTexts)}`;

                const result = await model.generateContent(prompt);
                let textResp = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
                const parsed = JSON.parse(textResp);

                results = parsed.map((p: any) => ({
                    text: p.text,
                    label: p.sentiment.toLowerCase() as "positive" | "negative" | "neutral",
                    score: parseFloat(p.score) || 0,
                    confidence: 0.9,
                    keywords: []
                }));

                // Calculate summary
                const positive = results.filter((r: any) => r.label === "positive").length;
                const negative = results.filter((r: any) => r.label === "negative").length;
                const neutral = results.filter((r: any) => r.label === "neutral" || r.label === "netral").length;
                const avgScore = results.reduce((s: number, r: any) => s + r.score, 0) / (results.length || 1);
                summary = { positive, negative, neutral, avgScore };

            } catch (e) {
                console.warn("Gemini NLP failed, falling back to keyword analysis:", e);
                const fallback = batchSentiment(texts);
                results = fallback.results;
                summary = fallback.summary;
            }
        } else {
            // Fallback to basic keyword matching
            const fallback = batchSentiment(texts);
            results = fallback.results;
            summary = fallback.summary;
        }

        return NextResponse.json({
            results: results.slice(0, 100), // Limit response size
            summary,
            wordFrequencies: wordFreqs.slice(0, 30),
            totalAnalyzed: texts.length
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
