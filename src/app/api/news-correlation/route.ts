import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * News Correlation API — Fetches simulated industry news and correlates with data anomalies
 * Uses Gemini to act as the "News API" intelligence.
 */
export async function POST(req: NextRequest) {
    try {
        const { anomalies, domain, dateRange } = await req.json();

        if (!anomalies || !Array.isArray(anomalies) || anomalies.length === 0) {
            return NextResponse.json({ error: "Anomalies array is required" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                correlations: anomalies.map(a => ({
                    date: a.date,
                    newsTitle: "Berita industri tidak tersedia (API Key missing)",
                    correlation: "Tidak dapat menganalisis korelasi tanpa API Key."
                }))
            });
        }

        const prompt = `Anda adalah analis berita industri dan tren pasar.
Diberikan titik anomali data (lonjakan/penurunan) di domain bisnis '${domain}' pada rentang waktu '${dateRange}'.
Tugas Anda: asumsikan/cari (secara simulasi) headline berita nyata atau masuk akal yang terjadi di sekitar tanggal anomali tersebut di Indonesia, dan jelaskan korelasinya.

Anomali:
${JSON.stringify(anomalies, null, 2)}

Output WAJIB berupa JSON array: 
[{"date": "tanggal", "newsTitle": "Headline Berita", "correlation": "Penjelasan korelasi..."}]
Tanpa markdown formatting.`;

        const result = await model.generateContent(prompt);
        let textResp = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const correlations = JSON.parse(textResp);

        return NextResponse.json({ correlations });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
