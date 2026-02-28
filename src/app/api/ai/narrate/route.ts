import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
    try {
        const { prompt, type = "general" } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        let systemPrompt = "Kamu adalah konsultan bisnis dan data analyst senior Indonesia yang ahli di bidang e-commerce dan marketplace. Berikan analisis mendalam, insight yang tidak terlihat dari angka, dan rekomendasi aksi yang spesifik dan actionable. Gunakan bahasa Indonesia yang elegan dan mudah dipahami. Format jawabanmu dengan emoji, heading, dan bullet points agar mudah dibaca.";

        if (type === "executive") {
            systemPrompt = "Kamu adalah AI Executive Analyst tingkat C-Level. Tugasmu: Berikan 'Executive Summary' performa bisnis dalam tepat 3 kalimat singkat, padat, dan berdampak tinggi. Jangan bertele-tele. Kalimat 1: Fakta utama. Kalimat 2: Insight tersembunyi. Kalimat 3: Aksi/Rekomendasi strategis.";
        } else if (type === "chart") {
            systemPrompt = "Kamu adalah Data Storyteller. Jelaskan visualisasi data ini dalam 3 paragraf pendek: 1) Apa yang ditunjukkan chart ini (What). 2) Apa pola/insight tersembunyi di baliknya (Why). 3) Apa rekomendasi aksinya (How). Gunakan markdown dan poin-poin.";
        } else if (type === "anomaly") {
            systemPrompt = "Kamu adalah Risk & Fraud Analyst. Sebuah anomali data terdeteksi! Jelaskan kemungkinan penyebab anomali ini dan berikan saran mitigasi segera.";
        }

        // Try to get from Upstash Redis cache first
        const { redis } = await import("@/lib/redis");
        try {
            // we hash the prompt or use it as key
            const cacheKey = `ai-narrate:${type}:${prompt.substring(0, 100).replace(/\s+/g, '-')}`;
            const cachedNarrative = await redis.get(cacheKey);
            if (cachedNarrative) {
                console.log("Redis cache hit for AI Narrate");
                return NextResponse.json({ narrative: cachedNarrative, provider: "cache" });
            }
        } catch (cacheErr) {
            console.error("Redis Cache error:", cacheErr);
        }

        // Try Groq first
        const groqKey = process.env.GROQ_API_KEY;

        if (groqKey) {
            try {
                const groq = new Groq({ apiKey: groqKey });
                const completion = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt },
                    ],
                    temperature: 0.7,
                    max_tokens: type === "executive" ? 300 : 2000,
                });

                const narrative = completion.choices[0]?.message?.content || "";

                try {
                    const { redis } = await import("@/lib/redis");
                    const cacheKey = `ai-narrate:${prompt.substring(0, 100).replace(/\s+/g, '-')}`;
                    await redis.set(cacheKey, narrative, { ex: 3600 });
                } catch (e) {
                    console.error("Failed to save to Redis:", e);
                }

                return NextResponse.json({ narrative, provider: "groq" });
            } catch (groqError) {
                console.error("Groq error:", groqError);
                // Fall through to fallback
            }
        }

        // Fallback 1: Try Gemini AI
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey) {
            try {
                // We're importing dynamically to avoid breaking the build if the package isn't loaded correctly yet
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(geminiKey);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const fullPrompt = systemPrompt + "\n\nBerikut datanya:\n" + prompt;

                const result = await model.generateContent(fullPrompt);
                const narrative = result.response.text();

                return NextResponse.json({ narrative, provider: "gemini" });
            } catch (geminiError) {
                console.error("Gemini error:", geminiError);
                // Fall through to template fallback
            }
        }

        // Fallback 2: Generate template-based narrative
        const narrative = generateTemplateNarrative(prompt);
        return NextResponse.json({ narrative, provider: "template" });
    } catch (error) {
        console.error("AI Narration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

function generateTemplateNarrative(prompt: string): string {
    // Parse key metrics from the prompt
    const totalMatch = prompt.match(/(\d+)\s*pesanan/);
    const productMatch = prompt.match(/Produk terlaris:\s*(.+?)\s*\(/);
    const regionMatch = prompt.match(/Region terbesar:\s*(.+?)\s*\(/);
    const paymentMatch = prompt.match(/Metode bayar terbanyak:\s*(.+?)\s*\(/);
    const returnMatch = prompt.match(/Return rate:\s*([\d.]+)%/);
    const growthMatch = prompt.match(/Growth rate:\s*([-\d.]+)%/);

    const total = totalMatch ? totalMatch[1] : "N/A";
    const product = productMatch ? productMatch[1] : "produk utama";
    const region = regionMatch ? regionMatch[1] : "wilayah utama";
    const payment = paymentMatch ? paymentMatch[1] : "metode utama";
    const returnRate = returnMatch ? parseFloat(returnMatch[1]) : 0;
    const growth = growthMatch ? parseFloat(growthMatch[1]) : 0;

    return `📊 **ANALISIS PENJUALAN SHOPEE**

🔍 **Ringkasan Performa**
Toko Anda telah mencatat ${total} pesanan dalam periode yang dianalisis. ${growth >= 0 ? `Tren penjualan menunjukkan pertumbuhan positif sebesar ${growth.toFixed(1)}% — ini indikasi momentum yang baik!` : `Terdapat penurunan sebesar ${Math.abs(growth).toFixed(1)}% — perlu strategi recovery segera.`}

🏆 **Produk Unggulan**
Produk "${product}" mendominasi penjualan. Ini menunjukkan product-market fit yang kuat untuk item ini. Fokuskan stok dan marketing di produk ini.

🌍 **Distribusi Geografis**
Pasar terbesar berada di ${region}. ${region === "JAWA BARAT" ? "Ini wajar mengingat populasi dan daya beli konsumen di wilayah ini." : "Pertimbangkan untuk memperkuat penetrasi di wilayah Jawa yang memiliki volume pasar terbesar."}

💳 **Preferensi Pembayaran**
${payment} menjadi metode pembayaran paling populer. ${payment.includes("COD") ? "Tingginya COD menunjukkan pembeli masih memiliki concern terhadap trust — pertimbangkan untuk meningkatkan branding dan review positif." : "Dominasi pembayaran digital menunjukkan basis pembeli yang tech-savvy."}

🔄 **Kualitas Layanan**
Return rate ${returnRate.toFixed(1)}% — ${returnRate < 2 ? "ini sangat rendah dan menunjukkan kualitas produk dan deskripsi yang akurat. Pertahankan!" : "cukup tinggi, perlu investigasi penyebab return (ukuran, kualitas, atau deskripsi tidak akurat)."}

✅ **5 REKOMENDASI AKSI PRIORITAS**

1. 📦 **Optimasi Stok** — Pastikan stok produk terlaris selalu tersedia, terutama menjelang tanggal gajian (25-1 setiap bulan)
2. 📣 **Targetkan Marketing** — Fokuskan iklan Shopee Ads di ${region} dan kota-kota dengan konversi tertinggi
3. 💰 **Review Pricing** — Analisis apakah margin sudah optimal dengan mempertimbangkan biaya voucher dan ongkir
4. ⭐ **Tingkatkan Review** — Minta review dari pembeli puas untuk meningkatkan trust dan mengurangi COD
5. 🗓️ **Manfaatkan Momentum** — Jadwalkan campaign dan flash sale di hari/jam dengan traffic tertinggi

_💡 Catatan: Ini adalah analisis template. Untuk insight AI yang lebih mendalam dan personalized, tambahkan GROQ_API_KEY di environment variables._`;
}
