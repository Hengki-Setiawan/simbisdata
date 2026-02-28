import { NextResponse } from "next/server";
import Groq from "groq-sdk";

/**
 * AI Data Repair API — fix typos, normalize categories, resolve complex data issues
 */
export async function POST(req: Request) {
    try {
        const { issues, sampleData, columnTypes } = await req.json();

        if (!issues || !Array.isArray(issues) || issues.length === 0) {
            return NextResponse.json({ repairs: [], summary: "Tidak ada masalah untuk diperbaiki" });
        }

        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) {
            return NextResponse.json({ repairs: [], summary: "AI tidak tersedia" });
        }

        const complexIssues = issues
            .filter((s: any) => !s.autoApply && s.suggestedValue === null)
            .slice(0, 10);

        if (complexIssues.length === 0) {
            return NextResponse.json({ repairs: [], summary: "Semua masalah sudah bisa diperbaiki otomatis" });
        }

        const summary = complexIssues.map((s: any, i: number) =>
            `${i + 1}. Kolom "${s.column}", baris ${s.row}: "${s.currentValue}" — ${s.reason}`
        ).join("\n");

        const prompt = `Kamu Data Engineer ahli data penjualan Indonesia. Analisis masalah data berikut dan berikan saran perbaikan.

Masalah:
${summary}

${columnTypes ? `Tipe kolom: ${JSON.stringify(columnTypes)}` : ""}
${sampleData ? `Sampel baris: ${JSON.stringify(sampleData.slice(0, 2))}` : ""}

Format JSON:
{
  "repairs": [
    { "row": 0, "column": "x", "suggestedValue": "y", "reason": "penjelasan singkat", "confidence": 0.9 }
  ],
  "summary": "ringkasan perbaikan"
}`;

        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a precise JSON-only Data Engineer API. Output raw JSON only." },
                { role: "user", content: prompt },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            max_tokens: 1000,
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || '{"repairs":[],"summary":""}');
        return NextResponse.json({ repairs: result.repairs || [], summary: result.summary || "", provider: "groq" });
    } catch (error: any) {
        console.error("AI Repair Error:", error);
        return NextResponse.json({ error: "Gagal menjalankan AI repair", details: error.message }, { status: 500 });
    }
}
