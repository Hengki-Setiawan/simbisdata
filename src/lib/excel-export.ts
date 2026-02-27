/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";
import { AnalysisResult } from "@/lib/analysis";

export function exportToExcel(analysis: AnalysisResult, aiNarration?: string) {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Overview
    const overviewData = [
        ["SIMBISDATA — LAPORAN ANALISIS DATA PENJUALAN"],
        [""],
        ["Metrik", "Nilai"],
        ["Total Pesanan", analysis.overview.totalOrders],
        ["Total Revenue", `Rp ${(analysis.overview.totalRevenue * 1000).toLocaleString("id-ID")}`],
        ["Rata-rata Order", `Rp ${(analysis.overview.avgOrderValue * 1000).toLocaleString("id-ID")}`],
        ["Return Rate", `${analysis.overview.returnRate.toFixed(1)}%`],
        ["Growth Rate", `${analysis.overview.growthRate.toFixed(1)}%`],
        ["Periode Mulai", analysis.overview.dateRange.start],
        ["Periode Akhir", analysis.overview.dateRange.end],
    ];
    const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
    wsOverview["!cols"] = [{ width: 25 }, { width: 35 }];
    XLSX.utils.book_append_sheet(wb, wsOverview, "Overview");

    // Sheet 2: Produk
    const productData = [
        ["Nama Produk", "Jumlah", "Revenue", "Persentase"],
        ...analysis.productPerformance.map((p: any) => [
            p.name, p.count, `Rp ${(p.revenue * 1000).toLocaleString("id-ID")}`, `${p.percentage.toFixed(1)}%`,
        ]),
    ];
    const wsProduct = XLSX.utils.aoa_to_sheet(productData);
    wsProduct["!cols"] = [{ width: 40 }, { width: 10 }, { width: 20 }, { width: 12 }];
    XLSX.utils.book_append_sheet(wb, wsProduct, "Produk");

    // Sheet 3: Variasi
    const variantData = [
        ["Variasi/Ukuran", "Jumlah", "Persentase"],
        ...analysis.variantAnalysis.map((v: any) => [v.name, v.count, `${v.percentage.toFixed(1)}%`]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(variantData), "Variasi");

    // Sheet 4: Wilayah
    const regionData = [
        ["Provinsi", "Jumlah Pesanan", "Persentase"],
        ...analysis.regionalAnalysis.map((r: any) => [r.province, r.count, `${r.percentage.toFixed(1)}%`]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(regionData), "Wilayah");

    // Sheet 5: Top Kota
    const cityData = [
        ["Kota/Kabupaten", "Jumlah Pesanan"],
        ...analysis.cityAnalysis.map((c: any) => [c.city, c.count]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cityData), "Kota");

    // Sheet 6: Pembayaran
    const paymentData = [
        ["Metode Pembayaran", "Jumlah", "Persentase"],
        ...analysis.paymentAnalysis.map((p: any) => [p.method, p.count, `${p.percentage.toFixed(1)}%`]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(paymentData), "Pembayaran");

    // Sheet 7: Pengiriman
    const shippingData = [
        ["Jasa Kirim", "Jumlah", "Persentase", "Rata-rata Ongkir"],
        ...analysis.shippingAnalysis.map((s: any) => [
            s.carrier, s.count, `${s.percentage.toFixed(1)}%`, `Rp ${s.avgCost.toLocaleString("id-ID")}`,
        ]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(shippingData), "Pengiriman");

    // Sheet 8: Tren Bulanan
    const monthlyData = [
        ["Bulan", "Jumlah Pesanan", "Revenue"],
        ...analysis.timeAnalysis.monthly.map((m: any) => [
            m.month, m.orders, `Rp ${(m.revenue * 1000).toLocaleString("id-ID")}`,
        ]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(monthlyData), "Tren Bulanan");

    // Sheet 9: Per Hari
    const dowData = [
        ["Hari", "Jumlah Pesanan"],
        ...analysis.timeAnalysis.dayOfWeek.map((d: any) => [d.day, d.count]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dowData), "Per Hari");

    // Sheet 10: Per Jam
    const hourlyData = [
        ["Jam", "Jumlah Pesanan"],
        ...analysis.timeAnalysis.hourly.map((h: any) => [`${h.hour}:00`, h.count]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hourlyData), "Per Jam");

    // Sheet 11: Finansial
    const finData = [
        ["Metrik Finansial", "Nilai"],
        ["Total Diskon", `Rp ${analysis.financialAnalysis.totalDiscount.toLocaleString("id-ID")}`],
        ["Diskon Seller", `Rp ${analysis.financialAnalysis.sellerDiscount.toLocaleString("id-ID")}`],
        ["Diskon Platform", `Rp ${analysis.financialAnalysis.platformDiscount.toLocaleString("id-ID")}`],
        ["Rata-rata Ongkir", `Rp ${analysis.financialAnalysis.avgShippingCost.toLocaleString("id-ID")}`],
        ["Total Revenue Ongkir", `Rp ${analysis.financialAnalysis.totalShippingRevenue.toLocaleString("id-ID")}`],
        ["Subsidi Ongkir", `Rp ${analysis.financialAnalysis.shippingSubsidy.toLocaleString("id-ID")}`],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(finData), "Finansial");

    // Sheet 12: AI Insight (if available)
    if (aiNarration) {
        const aiData = [
            ["AI INSIGHT & REKOMENDASI"],
            [""],
            ...aiNarration.split("\n").map((line: string) => [line]),
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aiData), "AI Insight");
    }

    // Download
    const fileName = `SimbisData_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

export function exportToCSV(analysis: AnalysisResult) {
    const rows = [
        ["Metrik", "Nilai"],
        ["Total Pesanan", String(analysis.overview.totalOrders)],
        ["Total Revenue", String(analysis.overview.totalRevenue * 1000)],
        ["Return Rate", `${analysis.overview.returnRate.toFixed(1)}%`],
        ["Growth Rate", `${analysis.overview.growthRate.toFixed(1)}%`],
        [""],
        ["Produk", "Jumlah", "Persentase"],
        ...analysis.productPerformance.map((p: any) => [p.name, String(p.count), `${p.percentage.toFixed(1)}%`]),
        [""],
        ["Provinsi", "Jumlah", "Persentase"],
        ...analysis.regionalAnalysis.map((r: any) => [r.province, String(r.count), `${r.percentage.toFixed(1)}%`]),
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SimbisData_Report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
