/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { analyzeSentiment, batchSentiment, extractWordFrequencies } from "@/lib/external-apis";

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

        // Batch mode
        const { results, summary } = batchSentiment(texts);
        const wordFreqs = extractWordFrequencies(texts);

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
