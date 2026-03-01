/**
 * Resilience Handler — Graceful degradation when data is incomplete.
 * Instead of crashing, SimbisData tells the user what CAN be analyzed.
 */

export interface ResilienceReport {
    availableAnalyses: string[];
    unavailableAnalyses: string[];
    message: string;
    dataCompleteness: number; // 0-100
}

const ANALYSIS_REQUIREMENTS: Record<string, string[]> = {
    "Tren Penjualan": ["tanggal", "revenue"],
    "Produk Terlaris": ["produk"],
    "Analisis Regional": ["kota", "provinsi"],
    "Segmentasi Pelanggan": ["username", "revenue"],
    "Analisis Pengiriman": ["jasa_kirim", "ongkos_kirim"],
    "Metode Pembayaran": ["metode_pembayaran"],
    "Deteksi Anomali": ["tanggal", "revenue"],
    "RFM Analysis": ["username", "tanggal", "revenue"],
    "Forecast Penjualan": ["tanggal", "revenue"],
    "Analisis Return": ["status"],
    "Analisis Harga": ["harga", "qty"],
    "Analisis Varian": ["variasi"],
};

const ESSENTIALS = ["tanggal", "revenue", "produk"];

export function assessDataCompleteness(
    data: Record<string, unknown>[],
    mappedColumns: string[]
): ResilienceReport {
    if (!data.length) {
        return {
            availableAnalyses: [],
            unavailableAnalyses: Object.keys(ANALYSIS_REQUIREMENTS),
            message: "Belum ada data untuk dianalisis. Silakan upload file penjualanmu.",
            dataCompleteness: 0,
        };
    }

    const cols = new Set(mappedColumns.map((c) => c.toLowerCase()));
    const available: string[] = [];
    const unavailable: string[] = [];

    for (const [analysis, required] of Object.entries(ANALYSIS_REQUIREMENTS)) {
        if (required.every((r) => cols.has(r))) {
            available.push(analysis);
        } else {
            unavailable.push(analysis);
        }
    }

    const total = Object.keys(ANALYSIS_REQUIREMENTS).length;
    const completeness = Math.round((available.length / total) * 100);

    const essentialsMissing = ESSENTIALS.filter((e) => !cols.has(e));

    let message: string;
    if (completeness >= 80) {
        message = "Data kamu sangat lengkap! SimbisData bisa menjalankan hampir semua analisis. 🎉";
    } else if (completeness >= 50) {
        message = `SimbisData bisa menjalankan ${available.length} dari ${total} analisis. Beberapa fitur tidak tersedia karena kolom data kurang lengkap.`;
    } else if (completeness > 0) {
        message = `Data yang tersedia terbatas, tapi SimbisData tetap bisa menganalisis: ${available.join(", ")}. ${essentialsMissing.length ? `Kolom yang belum ditemukan: ${essentialsMissing.join(", ")}.` : ""}`;
    } else {
        message = "Format data belum dikenali. Pastikan file berasal dari Shopee, Tokopedia, atau TikTok Shop.";
    }

    return { availableAnalyses: available, unavailableAnalyses: unavailable, message, dataCompleteness: completeness };
}
