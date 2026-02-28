/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Data Domain Detector — Auto-detect the domain/category of uploaded data
 * Supports: E-Commerce, Survey, Inventory, HR, Financial, Academic, Healthcare, Generic
 */

export type DataDomain =
    | "ecommerce" | "survey" | "inventory" | "hr"
    | "financial" | "academic" | "healthcare" | "generic";

export interface DomainDetectionResult {
    domain: DataDomain;
    confidence: number;
    label: string;
    icon: string;
    description: string;
    suggestedVisualizations: string[];
    suggestedAlgorithms: string[];
}

const DOMAIN_FINGERPRINTS: Record<DataDomain, {
    label: string; icon: string; description: string;
    keywords: string[];
    suggestedVisualizations: string[];
    suggestedAlgorithms: string[];
}> = {
    ecommerce: {
        label: "E-Commerce / Penjualan", icon: "🛒",
        description: "Data transaksi penjualan dari marketplace atau toko online",
        keywords: ["pesanan", "order", "produk", "product", "harga", "price", "pembeli", "buyer",
            "shipping", "pengiriman", "kurir", "qty", "quantity", "diskon", "discount", "sku",
            "invoice", "transaksi", "revenue", "penjualan", "sales", "checkout", "cart",
            "voucher", "promo", "ongkir", "resi", "tracking", "marketplace"],
        suggestedVisualizations: ["line_trend", "bar_product", "pie_category", "map_regional", "funnel_status", "heatmap_time"],
        suggestedAlgorithms: ["forecast", "rfm", "clv", "abc", "cohort", "association", "anomaly", "clustering", "price_sensitivity"]
    },
    survey: {
        label: "Survey / Feedback", icon: "📋",
        description: "Data kuesioner, feedback pelanggan, atau riset pasar",
        keywords: ["responden", "respondent", "jawaban", "answer", "pertanyaan", "question",
            "rating", "skor", "score", "feedback", "review", "komentar", "comment", "opini",
            "opinion", "puas", "satisfied", "skala", "scale", "likert", "nps", "csat"],
        suggestedVisualizations: ["bar_rating", "pie_distribution", "wordcloud", "gauge_nps", "heatmap_correlation"],
        suggestedAlgorithms: ["sentiment", "clustering", "correlation"]
    },
    inventory: {
        label: "Inventaris / Stok", icon: "📦",
        description: "Data persediaan barang, gudang, atau manajemen stok",
        keywords: ["stok", "stock", "gudang", "warehouse", "persediaan", "inventory", "reorder",
            "supplier", "pemasok", "sku", "barcode", "lokasi", "location", "bin", "rack",
            "minimum", "maximum", "safety stock", "lead time", "batch"],
        suggestedVisualizations: ["bar_stock", "treemap_category", "gauge_level", "line_movement", "scatter_turnover"],
        suggestedAlgorithms: ["abc", "forecast", "anomaly", "demand_prediction"]
    },
    hr: {
        label: "HR / Karyawan", icon: "👥",
        description: "Data sumber daya manusia, karyawan, atau absensi",
        keywords: ["karyawan", "employee", "pegawai", "staff", "gaji", "salary", "departemen",
            "department", "jabatan", "position", "absensi", "attendance", "cuti", "leave",
            "resign", "hire", "recruitment", "performance", "kinerja", "divisi"],
        suggestedVisualizations: ["bar_department", "pie_division", "line_headcount", "treemap_org", "heatmap_attendance"],
        suggestedAlgorithms: ["clustering", "anomaly", "correlation", "forecast"]
    },
    financial: {
        label: "Keuangan / Akuntansi", icon: "💰",
        description: "Data keuangan, neraca, arus kas, atau laporan laba rugi",
        keywords: ["debit", "kredit", "credit", "saldo", "balance", "akun", "account",
            "jurnal", "journal", "piutang", "hutang", "receivable", "payable", "laba",
            "profit", "rugi", "loss", "pendapatan", "income", "beban", "expense",
            "neraca", "kas", "cash", "bank", "transfer", "pajak", "tax"],
        suggestedVisualizations: ["waterfall_revenue", "line_cashflow", "bar_account", "pie_expense", "sankey_flow"],
        suggestedAlgorithms: ["forecast", "anomaly", "correlation"]
    },
    academic: {
        label: "Akademik / Pendidikan", icon: "🎓",
        description: "Data mahasiswa, nilai, atau institusi pendidikan",
        keywords: ["mahasiswa", "student", "siswa", "mata kuliah", "course", "nilai", "grade",
            "semester", "gpa", "ipk", "dosen", "lecturer", "kelas", "class", "ujian",
            "exam", "tugas", "assignment", "jurusan", "major", "fakultas", "faculty"],
        suggestedVisualizations: ["bar_grade", "line_gpa", "pie_major", "heatmap_schedule", "scatter_correlation"],
        suggestedAlgorithms: ["clustering", "correlation", "forecast"]
    },
    healthcare: {
        label: "Kesehatan / Medis", icon: "🏥",
        description: "Data pasien, diagnosis, atau fasilitas kesehatan",
        keywords: ["pasien", "patient", "diagnosis", "diagnosa", "obat", "medication", "dokter",
            "doctor", "rumah sakit", "hospital", "klinik", "clinic", "resep", "prescription",
            "rawat", "treatment", "gejala", "symptom", "lab", "laboratorium"],
        suggestedVisualizations: ["bar_diagnosis", "line_trend", "pie_category", "map_facility", "funnel_treatment"],
        suggestedAlgorithms: ["clustering", "anomaly", "correlation", "forecast"]
    },
    generic: {
        label: "Data Umum", icon: "📊",
        description: "Format data umum atau campuran",
        keywords: [],
        suggestedVisualizations: ["bar_auto", "line_auto", "pie_auto", "scatter_auto"],
        suggestedAlgorithms: ["clustering", "correlation", "anomaly"]
    }
};

function normalize(s: string): string {
    return s.toLowerCase().trim().replace(/[_\-\.\/\\()]/g, " ").replace(/\s+/g, " ");
}

export function detectDomain(columns: string[], sampleRows: Record<string, any>[] = []): DomainDetectionResult {
    const normalizedCols = columns.map(normalize);
    const allValues = sampleRows.slice(0, 10).flatMap(r => Object.values(r).map(v => normalize(String(v || ""))));

    let bestDomain: DataDomain = "generic";
    let bestScore = 0;

    for (const [domain, config] of Object.entries(DOMAIN_FINGERPRINTS)) {
        if (domain === "generic") continue;

        // Check column names
        const colMatches = config.keywords.filter(kw =>
            normalizedCols.some(col => col.includes(kw) || kw.includes(col))
        );

        // Check sample values
        const valMatches = config.keywords.filter(kw =>
            allValues.some(v => v.includes(kw))
        );

        const score = (colMatches.length * 2 + valMatches.length) / (config.keywords.length + 1);

        if (score > bestScore) {
            bestScore = score;
            bestDomain = domain as DataDomain;
        }
    }

    if (bestScore < 0.15) bestDomain = "generic";

    const config = DOMAIN_FINGERPRINTS[bestDomain];
    return {
        domain: bestDomain,
        confidence: Math.min(1, bestScore),
        label: config.label,
        icon: config.icon,
        description: config.description,
        suggestedVisualizations: config.suggestedVisualizations,
        suggestedAlgorithms: config.suggestedAlgorithms,
    };
}
