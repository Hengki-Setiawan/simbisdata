/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * AI Executive Briefing — Generates executive summaries and per-chart insights
 * Uses data analysis results to produce actionable business narratives
 */

import { type ColumnMeta } from "./ai-viz-recommender";
import { type DataDomain } from "./data-domain-detector";
import { type AnalysisResult } from "./analysis";

export interface ExecutiveBriefing {
    headline: string;
    keyMetrics: { label: string; value: string; trend: "up" | "down" | "stable"; change?: string }[];
    insights: string[];
    recommendations: string[];
    alerts: { severity: "critical" | "warning" | "info"; message: string }[];
}

export function generateExecutiveBriefing(
    analysis: AnalysisResult | null,
    domain: DataDomain,
    columnMeta: ColumnMeta[],
    rowCount: number
): ExecutiveBriefing {
    const keyMetrics: ExecutiveBriefing["keyMetrics"] = [];
    const insights: string[] = [];
    const recommendations: string[] = [];
    const alerts: ExecutiveBriefing["alerts"] = [];

    if (analysis) {
        // Key Metrics from analysis
        if (analysis.overview) {
            keyMetrics.push({
                label: "Total Pesanan", value: analysis.overview.totalOrders.toLocaleString("id-ID"),
                trend: analysis.overview.growthRate > 0 ? "up" : analysis.overview.growthRate < 0 ? "down" : "stable",
                change: `${analysis.overview.growthRate > 0 ? "+" : ""}${analysis.overview.growthRate.toFixed(1)}%`
            });
            keyMetrics.push({
                label: "Total Revenue", value: `Rp ${(analysis.overview.totalRevenue / 1000000).toFixed(1)}M`,
                trend: "stable"
            });
            keyMetrics.push({
                label: "Avg Order Value", value: `Rp ${analysis.overview.avgOrderValue.toLocaleString("id-ID")}`,
                trend: "stable"
            });
            if (analysis.overview.returnRate > 0) {
                keyMetrics.push({
                    label: "Return Rate", value: `${analysis.overview.returnRate.toFixed(1)}%`,
                    trend: analysis.overview.returnRate > 5 ? "down" : "stable"
                });
            }
        }

        // Generate insights
        if (analysis.overview?.growthRate > 10) {
            insights.push(`📈 Pertumbuhan kuat: Revenue tumbuh ${analysis.overview.growthRate.toFixed(1)}% — momentum positif yang harus dipertahankan.`);
        } else if (analysis.overview?.growthRate < -5) {
            insights.push(`📉 Penurunan terdeteksi: Revenue turun ${Math.abs(analysis.overview.growthRate).toFixed(1)}% — perlu investigasi penyebab.`);
            alerts.push({ severity: "warning", message: `Revenue menurun ${Math.abs(analysis.overview.growthRate).toFixed(1)}%` });
        }

        if (analysis.productPerformance && analysis.productPerformance.length > 0) {
            insights.push(`🏆 Produk terlaris: "${analysis.productPerformance[0].name}" menyumbang porsi revenue terbesar.`);
        }

        if (analysis.overview?.returnRate > 5) {
            alerts.push({ severity: "warning", message: `Return rate tinggi (${analysis.overview.returnRate.toFixed(1)}%) — perlu perbaikan kualitas atau deskripsi produk.` });
            recommendations.push("Investigasi produk dengan return rate tertinggi dan perbaiki deskripsi/foto produk.");
        }
    }

    // Domain-specific insights
    if (domain === "ecommerce") {
        recommendations.push("Jalankan RFM Analysis untuk segmentasi pelanggan dan targetkan kampanye retargeting.");
        recommendations.push("Gunakan LSTM Forecast untuk prediksi demand 30 hari ke depan dan optimasi stok.");
    } else if (domain === "survey") {
        recommendations.push("Jalankan Sentiment Analysis untuk mengukur tingkat kepuasan responden.");
    } else if (domain === "inventory") {
        recommendations.push("Jalankan ABC Analysis untuk identifikasi item high-value yang perlu prioritas stok.");
    }

    // Data quality alerts
    const numCols = columnMeta.filter(c => c.type === "number");
    const nullCols = columnMeta.filter(c => c.hasNulls);
    if (nullCols.length > columnMeta.length * 0.3) {
        alerts.push({ severity: "info", message: `${nullCols.length} kolom memiliki data kosong — jalankan Auto-Clean untuk memperbaiki.` });
    }

    // Headline
    const headline = analysis?.overview
        ? `${analysis.overview.totalOrders.toLocaleString("id-ID")} pesanan senilai Rp ${(analysis.overview.totalRevenue / 1000000).toFixed(1)}M dianalisis dari ${rowCount} baris data.`
        : `${rowCount} baris data dengan ${columnMeta.length} kolom berhasil diproses.`;

    return { headline, keyMetrics, insights, recommendations, alerts };
}

export function generateChartInsight(
    chartType: string,
    chartTitle: string,
    data: any[],
    fields: string[]
): string {
    if (!data || data.length === 0) return "Belum ada data untuk dianalisis.";

    const numValues = data.map(d => {
        for (const f of fields) {
            const v = parseFloat(String(d[f]));
            if (!isNaN(v)) return v;
        }
        return 0;
    }).filter(v => v > 0);

    if (numValues.length === 0) return "Data tidak mengandung nilai numerik yang bisa dianalisis.";

    const max = Math.max(...numValues);
    const min = Math.min(...numValues);
    const avg = numValues.reduce((s, v) => s + v, 0) / numValues.length;
    const range = max - min;

    switch (chartType) {
        case "line": case "area": case "stacked_area":
            return `Tren menunjukkan rentang nilai dari ${min.toLocaleString("id-ID")} hingga ${max.toLocaleString("id-ID")} (rata-rata: ${Math.round(avg).toLocaleString("id-ID")}). Variasi sebesar ${((range / avg) * 100).toFixed(0)}% menunjukkan ${range / avg > 0.5 ? "fluktuasi signifikan" : "stabilitas relatif"}.`;
        case "bar": case "horizontal_bar":
            return `Dari ${data.length} kategori, nilai tertinggi mencapai ${max.toLocaleString("id-ID")} dan terendah ${min.toLocaleString("id-ID")}. Gap sebesar ${range.toLocaleString("id-ID")} menunjukkan ${range / avg > 1 ? "distribusi yang sangat tidak merata" : "distribusi cukup merata"}.`;
        case "pie": case "donut":
            return `Distribusi menunjukkan ${data.length} segmen. ${range / avg > 1 ? "Ada dominasi signifikan dari satu atau dua segmen utama." : "Pembagian relatif merata antar segmen."}`;
        case "scatter":
            return `Scatter plot dari ${data.length} titik data menunjukkan pola ${range / avg > 0.5 ? "sebaran luas — kemungkinan korelasi lemah" : "sebaran terkonsentrasi — kemungkinan ada korelasi"}.`;
        default:
            return `Analisis ${data.length} data points: range ${min.toLocaleString("id-ID")} — ${max.toLocaleString("id-ID")}, rata-rata ${Math.round(avg).toLocaleString("id-ID")}.`;
    }
}
