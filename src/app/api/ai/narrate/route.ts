import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { metrics } = body;

        if (!metrics) {
            return NextResponse.json({ error: "Missing metrics payload" }, { status: 400 });
        }

        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            return NextResponse.json(
                { fullNarrative: "API Key Groq belum dikonfigurasi. Silakan tambahkan GROQ_API_KEY di .env.local untuk mengaktifkan fitur Rangkuman Eksekutif AI yang komprehensif ini." },
                { status: 200 }
            );
        }

        const prompt = `
Kamu adalah Konsultan Bisnis Eksklusif dan Data Scientist level Internasional.
Tugas utamamu adalah menuliskan **Rangkuman Eksekutif Analisis Bisnis yang Mendalam** (sekitar 3-4 paragraf panjang) berdasarkan data ringkasan e-commerce berikut.
Buat laporan ini terkesan sangat mahal, penuh insight, menggunakan format Markdown (##, **, -, dll), dan langsung berikan saran teknis untuk bulan depan tanpa basa-basi.

Berikut adalah data bisnis dari klien bulan ini:
${JSON.stringify(metrics, null, 2)}

Fokus pada:
1. Review pendaptan, AOV, dan Return Rate (jika tinggi, peringatkan mereka).
2. Analisis perfoma kurir pengiriman dan rasio pemakaian diskon/ongkos kirim ekstra.
3. Kinerja produk utama dan anomali waktu tersibuk.
4. Jangan pernah merekomendasikan hal yang tidak ada hubungannya dengan data di atas.
Gunakan Bahasa Indonesia yang sangat profesional dan meyakinkan.
        `;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${groqApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are a world-class business consultant generating financial and operational reports in Indonesian." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 1800
            })
        });

        if (!groqRes.ok) {
            const errBody = await groqRes.text();
            throw new Error(`Groq API Error: ${groqRes.status} ${errBody}`);
        }

        const groqData = await groqRes.json();
        const fullNarrative = groqData.choices?.[0]?.message?.content || "Gagal menyintesis laporan AI.";

        return NextResponse.json({ fullNarrative });

    } catch (error: any) {
        console.error("Narrate API Error:", error.message);
        return NextResponse.json({ 
            error: "Terjadi kesalahan internal saat membuat narasi",
            fullNarrative: "Maaf, sistem AI sedang mengalami gangguan sehingga laporan eksekutif gagal di-generate secara utuh."
        }, { status: 500 });
    }
}
