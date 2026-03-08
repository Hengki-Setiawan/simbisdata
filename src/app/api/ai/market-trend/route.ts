import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: Request) {
    try {
        const { products } = await req.json();
        if (!products || !Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: "No products provided" }, { status: 400 });
        }

        const topProducts = products.slice(0, 3);

        if (!GROQ_API_KEY) {
             return NextResponse.json({ 
                 trend: "Data produk berhasil diterima, namun API Key Groq belum diatur dalam .env.", 
                 actionable: "Silakan tambahkan GROQ_API_KEY untuk mendapatkan wawasan tren pasar dari AI.",
                 newsCount: 0,
                 articles: topProducts.map(p => ({
                     title: `Bisnis dan Tren Pasar: ${p}`,
                     url: `https://duckduckgo.com/?q=${encodeURIComponent('Berita bisnis tren pasar ' + p)}`,
                     date: new Date().toLocaleDateString('id-ID')
                 }))
             });
        }

        const prompt = `Anda adalah analis bisnis dan analis pasar kelas eksekutif. \n\nKlien saya menjual produk terlaris berikut: ${topProducts.join(", ")}.\n\nBuatlah Wawasan Tren Pasar untuk dokumen Laporan Eksekutif bisnis klien saya.\n\nBerikan HANYA format JSON murni tanpa awalan markdown dengan 3 atribut:\n1. 'trend' (1 paragraf ringkasan 'Tren Pasar Saat Ini' dengan gaya bahasa tegas, faktual, mendikte industri terkait produk di atas)\n2. 'actionable' (1 paragraf 'Saran Aksi Strategis' yang tajam untuk meningkatkan margin keuntungan atau ekspansi)\n3. 'articles' (Array berisi 3 objek yang merepresentasikan rekomendasi pencarian berita/artikel relevan untuk pengusaha di industri ini. Tiap objek punya 'title' deskriptif dan 'searchQuery' yang berupa kata kunci pencarian akurat Google/DuckDuckGo).\n\nContoh JSON:\n{ "trend": "...", "actionable": "...", "articles": [{ "title": "Peluang Bisnis Kaos 2024", "searchQuery": "Tren desain pakaian kaos 2024 Indonesia" }] }`;

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.7
            })
        });

        if (!groqRes.ok) {
            const errText = await groqRes.text();
            throw new Error(`Groq API Error: ${groqRes.status} - ${errText}`);
        }

        const groqData = await groqRes.json();
        const content = groqData.choices?.[0]?.message?.content || "{}";
        
        let parsed: any = {};
        try {
            const cleanContent = content.replace(/```json\n?/g, "").replace(/```/g, "").trim();
            parsed = JSON.parse(cleanContent);
        } catch (err) {
            console.error("JSON Parse Error for Groq content:", content);
            parsed = {}; // Fallback handles this gracefully
        }

        // Map AI generated search queries to real search engine URLs
        const generatedArticles = Array.isArray(parsed.articles) && parsed.articles.length > 0 
            ? parsed.articles.map((a: any) => ({
                title: a.title || `Penelusuran Web Terkait ${topProducts[0]}`,
                url: `https://duckduckgo.com/?q=${encodeURIComponent(a.searchQuery || ('Tren ' + topProducts[0]))}`,
                date: new Date().toLocaleDateString('id-ID')
            }))
            : topProducts.map(p => ({
                title: `Berita Tren Pasar Bisnis: ${p}`,
                url: `https://duckduckgo.com/?q=${encodeURIComponent('Berita bisnis penjualan ' + p)}`,
                date: new Date().toLocaleDateString('id-ID')
            }));

        return NextResponse.json({
            trend: parsed.trend || "Tidak ada rincian tren pasar yang spesifik yang dapat diekstrak oleh AI saat ini.",
            actionable: parsed.actionable || "Terus pantau kondisi pasar secara berkala melalui platform riset berita komersial.",
            newsCount: generatedArticles.length,
            articles: generatedArticles
        });

    } catch (e: any) {
        // Fallback response instead of 500 so UI doesn't crash
        return NextResponse.json({ 
            trend: "Server mengalami gangguan beban saat berkonsultasi dengan AI Eksekutif.",
            actionable: "Namun, Anda tetap dapat memeriksa artikel tren pasar berdasarkan rekomendasi tautan pencarian di bawah ini.",
            error: e.message || "Unknown error",
            newsCount: 3,
            articles: [
                { title: "Dashboard Riset Sentimen Pasar E-Commerce", url: "https://duckduckgo.com/?q=Sentimen+E-Commerce+Terbaru+Indonesia+2024", date: new Date().toLocaleDateString('id-ID') }
            ]
        }, { status: 200 }); // Status 200 prevents client UI crashes
    }
}
