import { NextResponse } from "next/server";
import Groq from "groq-sdk";

/**
 * AI Smart Clean API — resolve cleaning issues that rule-based can't handle
 */
export async function POST(req: Request) {
    try {
        const { issues, sampleData } = await req.json();

        if (!issues || !Array.isArray(issues) || issues.length === 0) {
            return NextResponse.json({ suggestions: [], message: "Tidak ada masalah yang perlu AI" });
        }

        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) {
            return NextResponse.json({ suggestions: [], message: "AI tidak tersedia (GROQ_API_KEY missing)" });
        }

        const issuesSummary = issues.slice(0, 8).map((issue: any, i: number) =>
            `${i + 1}. Kolom "${issue.column}" — ${issue.description}\n   Sampel: ${JSON.stringify((issue.sampleValues || []).slice(0, 3))}`
        ).join("\n");

        const prompt = `Kamu Data Engineer. Fix masalah cleaning data berikut. Analisis sampel dan berikan solusi.

Masalah:
${issuesSummary}

${sampleData ? `Sampel data (baris 1): ${JSON.stringify(sampleData[0] || {})}` : ""}

Format JSON:
{
  "solutions": [
    {
      "column": "nama_kolom",
      "action": "normalize|convert|fill|fix_encoding|skip",
      "targetType": "number|date|text",
      "transformRule": "penjelasan singkat",
      "confidence": 0.0-1.0
    }
  ]
}`;

        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a precise JSON-only Data Engineer API. Output raw JSON only." },
                { role: "user", content: prompt },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            max_tokens: 800,
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || '{"solutions":[]}');
        return NextResponse.json({ suggestions: result.solutions || [], provider: "groq" });
    } catch (error: any) {
        console.error("AI Smart Clean Error:", error);
        return NextResponse.json({ error: "Gagal menjalankan AI clean", details: error.message }, { status: 500 });
    }
}
