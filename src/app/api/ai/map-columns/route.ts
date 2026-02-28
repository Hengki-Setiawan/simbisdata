import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { UNIVERSAL_FIELDS } from "@/lib/column-mapper";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { columns, sampleData } = body;

        if (!columns || !Array.isArray(columns) || columns.length === 0) {
            return NextResponse.json({ error: "Kolom tidak valid" }, { status: 400 });
        }

        const universalKeys = Object.keys(UNIVERSAL_FIELDS);
        const universalDescriptions = Object.entries(UNIVERSAL_FIELDS)
            .map(([k, v]) => `"${k}": ${v}`)
            .join("\n");

        const prompt = `
Anda adalah AI Data Engineer yang bertugas memetakan (mapping) nama kolom asing dari file Excel milik pengguna ke dalam format Universal Schema (Database Standar) kami.

Sistem kami HANYA menerima key standar berikut:
${universalDescriptions}

TUGAS ANDA:
Cocokkan nama kolom di bawah ini ke salah satu key standar di atas. Jika kolom sama sekali tidak relevan dengan e-commerce, sales, data pelanggan, atau pengiriman, kembalikan null untuk kolom tersebut. Jangan membuat key baru. Anda harus mengerti bahasa Indonesia, Inggris, dan singkatan umum.

Kolom yang perlu dipetakan:
${JSON.stringify(columns)}

Sampel Data Baris 1:
${JSON.stringify(sampleData?.[0] || {})}

FORMAT BALASAN HARUS JSON MURNI (tanpa markdown), berupa objek { "nama_kolom_asli": "key_standar_atau_null" }.
Contoh output yang benar:
{
  "Item Name": "product_name",
  "Net Sales": "total_payment",
  "shipping_zip": null,
  "Order #": "order_id"
}
`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a precise JSON-only API that maps data columns. Output raw JSON only. Do not wrap in markdown blocks like \`\`\`json." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            response_format: { type: "json_object" },
        });

        const resultJson = chatCompletion.choices[0]?.message?.content || "{}";
        const parsedMap = JSON.parse(resultJson);

        return NextResponse.json({ mapping: parsedMap });
    } catch (error: any) {
        console.error("AI Mapping Error:", error);
        return NextResponse.json({ error: "Gagal memetakan kolom dengan AI", details: error.message }, { status: 500 });
    }
}
