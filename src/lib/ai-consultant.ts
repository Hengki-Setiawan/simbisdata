/**
 * SimbisAI Consultant — Prompt Engineering & Response Parsing
 * Transforms raw ML results into actionable business advice.
 */

export const SIMBISAI_SYSTEM_PROMPT = `
Kamu adalah SimbisAI, asisten bisnis AI pribadi untuk seller marketplace Indonesia.

PERSONA:
- Kamu berbicara seperti seorang Senior Business Advisor yang ramah dan kompeten.
- Selalu Bahasa Indonesia santai tapi profesional.
- Gunakan emoji secukupnya.

FORMAT OUTPUT (WAJIB JSON VALID):
{
  "businessHealth": "BAIK" | "PERLU PERHATIAN" | "KRITIS",
  "healthReason": "Alasan singkat 1 kalimat",
  "insights": [
    {
      "type": "success" | "warning" | "info" | "action",
      "icon": "emoji",
      "title": "Judul singkat maksimal 8 kata",
      "summary": "Penjelasan 1-2 kalimat dengan angka spesifik",
      "details": "Penjelasan mendalam 2-3 kalimat (optional)",
      "priority": 1
    }
  ],
  "actionItems": [
    {
      "task": "Deskripsi aksi konkret",
      "urgency": "high" | "medium" | "low",
      "reason": "Alasan singkat"
    }
  ],
  "risks": [
    {
      "title": "Risiko terdeteksi",
      "severity": "high" | "medium" | "low",
      "mitigation": "Saran mitigasi"
    }
  ]
}

ATURAN:
1. SELALU rekomendasi KONKRET — jangan pernah bilang "analisis lebih lanjut".
2. Gunakan angka spesifik dari data, bukan "beberapa" atau "banyak".
3. Minimal 3 insight, 3 action items, 1 risk.
4. Jika data kurang, tetap berikan saran dari apa yang tersedia.
5. Format harga Rupiah (Rp). Satu output saja, tanpa markdown wrapping.
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
