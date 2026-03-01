import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

/**
 * AI Chat Assistant API — ask anything about your data
 * Accepts data summary + user question, returns AI response
 */
export async function POST(req: NextRequest) {
    try {
        const { question, dataSummary, history } = await req.json();

        if (!question) {
            return NextResponse.json({ error: "Pertanyaan diperlukan" }, { status: 400 });
        }

        // Try Redis cache
        try {
            const { redis } = await import("@/lib/redis");
            const cacheKey = `ai-chat:${question.substring(0, 80).replace(/\s+/g, "-")}`;
            const cached = await redis.get(cacheKey);
            if (cached) return NextResponse.json({ answer: cached, provider: "cache" });
        } catch { /* skip cache */ }

        const systemPrompt = `Kamu adalah asisten data analyst untuk platform SimbisData. Kamu membantu user UMKM Indonesia memahami data penjualan mereka.

Aturan:
- Jawab dalam Bahasa Indonesia yang sederhana dan mudah dipahami
- Berikan insight actionable, bukan hanya angka
- Jika ada data summary, gunakan itu sebagai konteks
- Format dengan emoji dan bullet points
- Jangan terlalu panjang — max 200 kata`;

        const messages: any[] = [
            { role: "system", content: systemPrompt },
        ];

        // Add conversation history if available
        if (history && Array.isArray(history)) {
            for (const msg of history.slice(-4)) { // Last 4 messages
                messages.push({ role: msg.role, content: msg.content });
            }
        }

        // Add data context
        if (dataSummary) {
            messages.push({
                role: "user",
                content: `Konteks data saya:\n${typeof dataSummary === "string" ? dataSummary : JSON.stringify(dataSummary)}\n\nPertanyaan: ${question}`,
            });
        } else {
            messages.push({ role: "user", content: question });
        }

        // Try Groq
        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey) {
            try {
                const groq = new Groq({ apiKey: groqKey });
                const completion = await groq.chat.completions.create({
                    messages,
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.5,
                    max_tokens: 800,
                });

                const answer = completion.choices[0]?.message?.content || "";

                // Cache response
                try {
                    const { redis } = await import("@/lib/redis");
                    const cacheKey = `ai-chat:${question.substring(0, 80).replace(/\s+/g, "-")}`;
                    await redis.set(cacheKey, answer, { ex: 1800 }); // 30 min cache
                } catch { /* skip cache */ }

                return NextResponse.json({ answer, provider: "groq" });
            } catch (groqError) {
                console.error("Groq Chat error:", groqError);
            }
        }

        // Fallback: Gemini
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey) {
            try {
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(geminiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const fullPrompt = `${systemPrompt}\n\n${dataSummary ? `Data: ${JSON.stringify(dataSummary)}\n\n` : ""}Pertanyaan: ${question}`;
                const result = await model.generateContent(fullPrompt);
                const answer = result.response.text();

                return NextResponse.json({ answer, provider: "gemini" });
            } catch (geminiError) {
                console.error("Gemini Chat error:", geminiError);
            }
        }

        // Template fallback
        return NextResponse.json({
            answer: `💡 Untuk menjawab pertanyaan tentang "${question}", saya memerlukan koneksi AI (Groq/Gemini). Silakan tambahkan GROQ_API_KEY atau GEMINI_API_KEY di environment variables untuk mengaktifkan AI Chat Assistant.\n\nSementara itu, Anda bisa melihat insight otomatis di tab AI Insight pada dashboard.`,
            provider: "template",
        });
    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return NextResponse.json({ error: "Gagal memproses chat", details: error.message }, { status: 500 });
    }
}
