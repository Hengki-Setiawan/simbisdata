import { NextResponse } from "next/server";
import Groq from "groq-sdk";

/**
 * AI Quality Advice API — deeper quality analysis using AI
 */
export async function POST(req: Request) {
    try {
        const { report } = await req.json();

        if (!report) {
            return NextResponse.json({ error: "Quality report required" }, { status: 400 });
        }

        const groqKey = process.env.GROQ_API_KEY;

        // Try Groq first
        if (groqKey) {
            try {
                const issuesSummary = (report.issues || []).slice(0, 8).map((i: any) =>
                    `- [${i.severity}] ${i.message}${i.column ? ` (kolom: ${i.column})` : ""}`
                ).join("\n");

                const colTypes = (report.columnStats || []).slice(0, 12).map((c: any) =>
                    `${c.name}: ${c.type} (${c.completeness}% terisi, ${c.uniqueCount} unik)`
                ).join("\n");

                const prompt = `Analisis kualitas dataset penjualan ini dan berikan saran perbaikan dalam Bahasa Indonesia yang mudah dipahami UMKM:

Skor: ${report.score}/100 (${report.grade})
Total: ${report.totalRows} baris, ${report.totalColumns} kolom

Masalah:
${issuesSummary || "Tidak ada masalah signifikan"}

Struktur kolom:
${colTypes}

Berikan analisis singkat (3-5 poin) format JSON:
{
  "insights": ["insight1", "insight2"],
  "priorities": ["aksi prioritas 1", "aksi prioritas 2"],
  "estimatedScoreAfterFix": 90,
  "overallAssessment": "ringkasan 1 kalimat"
}`;

                const groq = new Groq({ apiKey: groqKey });
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are a data quality advisor for Indonesian SME businesses. Output clean JSON." },
                        { role: "user", content: prompt },
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.3,
                    max_tokens: 600,
                    response_format: { type: "json_object" },
                });

                const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
                return NextResponse.json({ advice: result, provider: "groq" });
            } catch (groqError) {
                console.error("Groq Quality Advice error:", groqError);
            }
        }

        // Fallback: Gemini
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey) {
            try {
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(geminiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompt = `Analisis kualitas dataset (skor ${report.score}/100, ${report.totalRows} baris). Masalah: ${(report.issues || []).map((i: any) => i.message).join("; ")}. Berikan 3 saran perbaikan singkat dalam Bahasa Indonesia.`;
                const result = await model.generateContent(prompt);
                const text = result.response.text();

                return NextResponse.json({
                    advice: { insights: [text], priorities: [], estimatedScoreAfterFix: report.score + 10, overallAssessment: text.split(".")[0] },
                    provider: "gemini",
                });
            } catch (geminiError) {
                console.error("Gemini Quality error:", geminiError);
            }
        }

        // Template fallback
        return NextResponse.json({
            advice: {
                insights: [
                    `Data memiliki skor ${report.score}/100.`,
                    report.score >= 80 ? "Data sudah cukup baik untuk dianalisis." : "Disarankan menjalankan auto-clean terlebih dahulu.",
                ],
                priorities: ["Jalankan Auto-Clean untuk menghapus duplikat dan mengisi cell kosong"],
                estimatedScoreAfterFix: Math.min(100, report.score + 15),
                overallAssessment: report.score >= 80 ? "Data siap dianalisis" : "Data perlu perbaikan sebelum analisis",
            },
            provider: "template",
        });
    } catch (error: any) {
        console.error("Quality Advice Error:", error);
        return NextResponse.json({ error: "Gagal menganalisis kualitas", details: error.message }, { status: 500 });
    }
}
