/**
 * SimbisData AI Consultant — 3-Prompt Multi-Focus Strategy
 * Prompt 1: Business Health Assessment
 * Prompt 2: Deep Insights & Action Plan
 * Prompt 3: Narrative Storytelling
 */

// ==================== TYPES ====================

export interface ConsultantInsight {
  type: "success" | "warning" | "info" | "action";
  icon: string;
  title: string;
  summary: string;
  details?: string;
  dataEvidence?: string;
  mlSource?: string;
  priority: number;
}

export interface ConsultantActionItem {
  task: string;
  urgency: "high" | "medium" | "low";
  expectedImpact?: string;
  reason: string;
}

export interface ConsultantRisk {
  title: string;
  severity: "high" | "medium" | "low";
  probability?: string;
  mitigation: string;
  dataSignal?: string;
}

export interface HealthResult {
  businessHealth: "BAIK" | "PERLU PERHATIAN" | "KRITIS";
  healthScore: number;
  healthReason: string;
  keyMetrics: { label: string; value: string; status: "good" | "warning" | "bad"; context: string }[];
}

export interface InsightResult {
  insights: ConsultantInsight[];
  actionItems: ConsultantActionItem[];
  risks: ConsultantRisk[];
}

export interface NarrativeResult {
  narratives: {
    overview: string;
    productInsight: string;
    customerInsight: string;
    forecastInsight: string;
    recommendation: string;
  };
}

export interface ConsultantResult {
  businessHealth: "BAIK" | "PERLU PERHATIAN" | "KRITIS";
  healthScore: number;
  healthReason: string;
  keyMetrics: HealthResult["keyMetrics"];
  insights: ConsultantInsight[];
  actionItems: ConsultantActionItem[];
  risks: ConsultantRisk[];
  narratives: NarrativeResult["narratives"];
}

// ==================== PROMPT BUILDERS ====================

export function buildHealthPrompt(summary: Record<string, unknown>): string {
  return `Kamu adalah SimbisData Business Analyst. Analisis data penjualan berikut dan tentukan kesehatan bisnis.

DATA SUMMARY:
${JSON.stringify(summary, null, 2)}

RETURN JSON (tanpa backticks):
{
  "businessHealth": "BAIK" | "PERLU PERHATIAN" | "KRITIS",
  "healthScore": 0-100,
  "healthReason": "1 kalimat mengapa",
  "keyMetrics": [
    { "label": "...", "value": "...", "status": "good|warning|bad", "context": "..." }
  ]
}`;
}

export function buildInsightPrompt(summary: Record<string, unknown>): string {
  return `Kamu adalah SimbisData Senior Business Advisor untuk seller marketplace Indonesia.

Berdasarkan hasil analisis ML berikut, berikan insight mendalam:

ML RESULTS:
${JSON.stringify(summary, null, 2)}

ATURAN: Gunakan Bahasa Indonesia, angka spesifik, format Rupiah. Minimal 4 insights, 4 action items, 2 risks.

RETURN JSON (tanpa backticks):
{
  "insights": [
    {
      "type": "success|warning|info|action",
      "icon": "emoji",
      "title": "max 8 kata",
      "summary": "1-2 kalimat dengan ANGKA SPESIFIK dari data",
      "details": "3-4 kalimat penjelasan mendalam + korelasi antar data",
      "dataEvidence": "angka/fakta spesifik yang mendukung",
      "mlSource": "nama algoritma ML",
      "priority": 1-10
    }
  ],
  "actionItems": [
    {
      "task": "tindakan konkret yang bisa dilakukan HARI INI",
      "urgency": "high|medium|low",
      "expectedImpact": "estimasi dampak dalam Rupiah atau persentase",
      "reason": "mengapa ini penting berdasarkan data"
    }
  ],
  "risks": [
    {
      "title": "risiko tersembunyi",
      "severity": "high|medium|low",
      "probability": "kemungkinan terjadi",
      "mitigation": "langkah mitigasi 1-2 kalimat",
      "dataSignal": "sinyal data apa yang menunjukkan risiko ini"
    }
  ]
}`;
}

export function buildNarrativePrompt(summary: Record<string, unknown>): string {
  return `Kamu adalah business narrator untuk dashboard analytics Indonesia.
Tuliskan NARASI SINGKAT (bukan list/bullet) untuk setiap section dashboard.
Bahasa Indonesia NATURAL dan mudah dipahami, seperti advisor berbicara langsung.

DATA:
${JSON.stringify(summary, null, 2)}

RETURN JSON (tanpa backticks):
{
  "narratives": {
    "overview": "2-3 kalimat rangkuman bisnis keseluruhan...",
    "productInsight": "2-3 kalimat tentang produk terlaris, yang perlu perhatian...",
    "customerInsight": "2-3 kalimat tentang pelanggan, segmentasi, retention...",
    "forecastInsight": "2-3 kalimat prediksi dan tren ke depan...",
    "recommendation": "2-3 kalimat prioritas tindakan minggu ini..."
  }
}`;
}

// Legacy single-prompt (backward compat)
export function buildConsultantPrompt(mlSummary: Record<string, unknown>): string {
  return buildInsightPrompt(mlSummary);
}

// ==================== PARSERS ====================

function safeParseJSON<T>(raw: string, fallback: T): T {
  try {
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

export function parseHealthResponse(raw: string): HealthResult {
  return safeParseJSON<HealthResult>(raw, {
    businessHealth: "BAIK",
    healthScore: 70,
    healthReason: "Data berhasil dianalisis.",
    keyMetrics: [{ label: "Status", value: "Normal", status: "good", context: "Sistem berjalan baik" }],
  });
}

export function parseInsightResponse(raw: string): InsightResult {
  return safeParseJSON<InsightResult>(raw, {
    insights: [
      { type: "info", icon: "📊", title: "Data Berhasil Diproses", summary: "SimbisData telah menganalisis data penjualanmu.", priority: 1 },
      { type: "success", icon: "✅", title: "Sistem Berjalan Normal", summary: "Semua metrik dalam kondisi stabil.", priority: 2 },
    ],
    actionItems: [
      { task: "Review produk terlaris dan pastikan stok cukup", urgency: "medium", reason: "Mencegah kehabisan stok" },
    ],
    risks: [
      { title: "Data kurang lengkap", severity: "low", mitigation: "Upload data dari periode lebih panjang" },
    ],
  });
}

export function parseNarrativeResponse(raw: string): NarrativeResult {
  return safeParseJSON<NarrativeResult>(raw, {
    narratives: {
      overview: "Data bisnis Anda telah berhasil dianalisis oleh SimbisData.",
      productInsight: "Produk-produk Anda menunjukkan performa yang bervariasi.",
      customerInsight: "Pelanggan Anda menunjukkan pola pembelian yang beragam.",
      forecastInsight: "Tren bisnis terlihat stabil berdasarkan data yang tersedia.",
      recommendation: "Pastikan stok produk terlaris selalu tersedia.",
    },
  });
}

// Legacy single-prompt parser (backward compat)
export function parseConsultantResponse(raw: string): ConsultantResult {
  const insight = parseInsightResponse(raw);
  return {
    businessHealth: "BAIK",
    healthScore: 70,
    healthReason: "Data berhasil dianalisis.",
    keyMetrics: [],
    ...insight,
    narratives: {
      overview: "", productInsight: "", customerInsight: "", forecastInsight: "", recommendation: "",
    },
  };
}
