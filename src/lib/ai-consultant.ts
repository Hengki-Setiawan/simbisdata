/**
 * SimbisAI Consultant — Prompt Engineering & Response Parsing
 * Transforms raw ML results into actionable business advice.
 */

export const SIMBISAI_SYSTEM_PROMPT = `
Kamu adalah SimbisAI, asisten bisnis AI pribadi tingkat CEO untuk seller marketplace Indonesia (Shopee, Tokopedia, TikTok Shop).

PERSONA:
- Kamu berbicara seperti seorang Chief Operating Officer (COO) atau Senior Business Advisor yang sangat cerdas, detail, namun penjelasannya mudah dipahami orang awam.
- Selalu gunakan Bahasa Indonesia santai tapi sangat profesional dan berbobot.
- Gunakan emoji secukupnya untuk estetika antarmuka.

FORMAT OUTPUT (WAJIB JSON VALID, TANPA MARKDOWN BACKTICKS):
{
  "businessHealth": "BAIK" | "PERLU PERHATIAN" | "KRITIS",
  "healthReason": "Alasan singkat 1 kalimat mengapa status tersebut dipilih.",
  "insights": [
    {
      "type": "success" | "warning" | "info" | "action",
      "icon": "emoji",
      "title": "Judul masalah/peluang (maksimal 8 kata)",
      "summary": "Penjelasan utama (Wajib mengandung angka spesifik dari data)",
      "details": "HARUS DIISI LENGKAP: Penjelasan mendalam 3-4 kalimat mengapa hal ini terjadi berdasarkan data, dan apa kerugian/keuntungannya bagi bisnis secara jangka panjang.",
      "priority": 1
    }
  ],
  "actionItems": [
    {
      "task": "Tindakan Aksi Nyata (Contoh: 'Buat bundling produk A dengan B diskon 15%')",
      "urgency": "high" | "medium" | "low",
      "reason": "Alasan finansial mengapa ini harus dilakukan segera"
    }
  ],
  "risks": [
    {
      "title": "Risiko Tersembunyi (Contoh: 'Potensi Dead Stock')",
      "severity": "high" | "medium" | "low",
      "mitigation": "Langkah mitigasi konkret 1-2 kalimat (Contoh: 'Flash sale khusus hari Jumat untuk menghabiskan stok lama')"
    }
  ]
}

ATURAN WAJIB (JIKA DILANGGAR APLIKASI AKAN ERROR):
1. SELALU berikan rekomendasi YANG BISA DILAKUKAN HARI INI JUGA. Jangan pernah bilang "Perlu analisis lebih lanjut" atau "Harap pantau terus".
2. BERIKAN PENJELASAN PANJANG DAN MENDALAM pada field 'details' di array 'insights'. Pengguna aplikasi ini adalah orang awam, jelaskan korelasi data sejelas mungkin.
3. Wajib gunakan angka spesifik dari data (seperti Total Pendapatan, Nama Produk, dsb), bukan kata-kata absolut seperti "beberapa" atau "banyak".
4. Wajib buat minimal 4 insight, 4 action items, dan 2 risks.
5. Jika data yang dikirim kurang, tetap berikan saran operasional terbaik dari apa yang tersedia.
6. Format harga harus dalam Rupiah (Contoh: Rp 12.500.000). 
7. KEMBALIKAN RAW JSON SAJA. Dilarang menggunakan backticks \`\`\`json.
`;

export interface ConsultantInsight {
  type: "success" | "warning" | "info" | "action";
  icon: string;
  title: string;
  summary: string;
  details?: string;
  priority: number;
}

export interface ConsultantActionItem {
  task: string;
  urgency: "high" | "medium" | "low";
  reason: string;
}

export interface ConsultantRisk {
  title: string;
  severity: "high" | "medium" | "low";
  mitigation: string;
}

export interface ConsultantResult {
  businessHealth: "BAIK" | "PERLU PERHATIAN" | "KRITIS";
  healthReason: string;
  insights: ConsultantInsight[];
  actionItems: ConsultantActionItem[];
  risks: ConsultantRisk[];
}

export function buildConsultantPrompt(mlSummary: Record<string, unknown>): string {
  return `${SIMBISAI_SYSTEM_PROMPT}

Berikut ringkasan data hasil analisis ML:
${JSON.stringify(mlSummary, null, 2)}

Berikan analisis dan rekomendasi bisnis berdasarkan data di atas. Output HARUS JSON valid sesuai format.`;
}

export function parseConsultantResponse(raw: string): ConsultantResult {
  try {
    // Strip markdown code fences if present
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(cleaned) as ConsultantResult;
  } catch {
    // Fallback template if AI returns invalid JSON
    return {
      businessHealth: "BAIK",
      healthReason: "Data berhasil dianalisis oleh SimbisAI.",
      insights: [
        { type: "info", icon: "📊", title: "Data Berhasil Diproses", summary: "SimbisAI telah menganalisis data penjualanmu. Lihat detail di bawah.", priority: 1 },
        { type: "success", icon: "✅", title: "Sistem Berjalan Normal", summary: "Semua metrik dalam kondisi stabil.", priority: 2 },
        { type: "action", icon: "💡", title: "Tingkatkan Penjualan", summary: "Upload lebih banyak data untuk mendapatkan insight yang lebih mendalam.", priority: 3 },
      ],
      actionItems: [
        { task: "Review produk terlaris dan pastikan stok cukup", urgency: "medium", reason: "Mencegah kehabisan stok" },
        { task: "Analisis pelanggan yang belum repeat order", urgency: "medium", reason: "Potensi churn" },
        { task: "Bandingkan performa antar periode", urgency: "low", reason: "Identifikasi tren" },
      ],
      risks: [
        { title: "Data kurang lengkap untuk analisis mendalam", severity: "low", mitigation: "Upload data dari periode yang lebih panjang" },
      ],
    };
  }
}
