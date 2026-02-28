/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";
import { AnalysisResult } from "@/lib/analysis";

export function exportToExcel(rows: any[], analysis: AnalysisResult, aiNarration?: string) {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Data Asli (Raw User Data)
    if (rows && rows.length > 0) {
        const wsRaw = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, wsRaw, "Data Mentah");
    }

    // Sheet 2: Overview
    const overviewData = [
        ["SIMBISDATA — LAPORAN ANALISIS DATA"],
        [""],
        ["Metrik", "Nilai"],
        ["Total Baris/Pesanan", analysis.overview.totalOrders],
        ["Total Revenue", `Rp ${(analysis.overview.totalRevenue * 1000).toLocaleString("id-ID")}`],
        ["Rata-rata Order", `Rp ${(analysis.overview.avgOrderValue * 1000).toLocaleString("id-ID")}`],
        ["Return Rate", `${analysis.overview.returnRate.toFixed(1)}%`],
        ["Growth Rate", `${analysis.overview.growthRate.toFixed(1)}%`],
        ["Periode Mulai", analysis.overview.dateRange.start],
        ["Periode Akhir", analysis.overview.dateRange.end],
    ];
    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    wsOverview["!cols"] = [{ width: 25 }, { width: 35 }];
    XLSX.utils.book_append_sheet(wb, wsOverview, "Ringkasan Eksekutif");

    // Helper to add sheets safely
    const addSheetIfData = (dataArray: any[], headers: string[], sheetName: string, mapFn: (item: any) => any[]) => {
        if (!dataArray || dataArray.length === 0) return;
        const sheetData = [headers, ...dataArray.map(mapFn)];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheetData), sheetName);
    };

    addSheetIfData(analysis.productPerformance, ["Nama Produk", "Jumlah", "Revenue", "Persentase"], "Produk",
        (p) => [p.name, p.count, `Rp ${(p.revenue * 1000).toLocaleString("id-ID")}`, `${p.percentage.toFixed(1)}%`]);

    addSheetIfData(analysis.regionalAnalysis, ["Provinsi", "Jumlah", "Persentase"], "Wilayah",
        (r) => [r.province, r.count, `${r.percentage.toFixed(1)}%`]);

    addSheetIfData(analysis.paymentAnalysis, ["Metode Pembayaran", "Jumlah", "Persentase"], "Pembayaran",
        (p) => [p.method, p.count, `${p.percentage.toFixed(1)}%`]);

    addSheetIfData(analysis.shippingAnalysis, ["Jasa Kirim", "Jumlah", "Persentase", "Rata-rata Ongkir"], "Pengiriman",
        (s) => [s.carrier, s.count, `${s.percentage.toFixed(1)}%`, `Rp ${s.avgCost.toLocaleString("id-ID")}`]);

    // Sheet 12: AI Insight (if available)
    if (aiNarration && aiNarration.trim().length > 0) {
        const aiData = [
            ["AI INSIGHT & REKOMENDASI"],
            [""],
            ...aiNarration.split("\n").map((line: string) => [line]),
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aiData), "AI Insight");
    }

    // Download
    const fileName = `SimbisData_Export_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

export function exportToCSV(rows: any[]) {
    // We export the raw dataset as a standard CSV
    if (!rows || rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join(","),
        ...rows.map(row =>
            headers.map(header => {
                const val = row[header];
                return typeof val === 'string' && val.includes(',') ? `"${val}"` : String(val || "");
            }).join(",")
        )
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SimbisData_Raw_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
