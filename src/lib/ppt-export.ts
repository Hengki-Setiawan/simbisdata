/* eslint-disable @typescript-eslint/no-explicit-any */
import pptxgen from "pptxgenjs";
import { AnalysisResult } from "@/lib/analysis";

export async function generatePPTX(analysis: AnalysisResult, aiNarration?: string) {
    const pptx = new pptxgen();

    pptx.author = "simbisai Platform";
    pptx.company = "Simbisdis";
    pptx.revision = "1";
    pptx.subject = "Laporan Analisis Data Penjualan";
    pptx.title = "simbisai Export";

    const formatRp = (num: number) => `Rp ${num.toLocaleString("id-ID")}`;

    // ---------------------------------------------------------
    // SLIDE 1: TITLE
    // ---------------------------------------------------------
    const slideTitle = pptx.addSlide();
    slideTitle.background = { color: "0F172A" }; // Dark Slate

    slideTitle.addText("simbisai Report", {
        x: 1, y: 2, w: "80%", h: 1,
        fontSize: 44, bold: true, color: "6366F1", align: "center", fontFace: "Inter"
    });

    slideTitle.addText(`Laporan Eksekutif Penjualan UMKM\nPeriode: ${analysis.overview.dateRange.start} s/d ${analysis.overview.dateRange.end}`, {
        x: 1, y: 3.2, w: "80%", h: 1,
        fontSize: 18, color: "F1F5F9", align: "center", fontFace: "Inter"
    });

    // ---------------------------------------------------------
    // SLIDE 2: AI EXECUTIVE SUMMARY
    // ---------------------------------------------------------
    if (aiNarration) {
        const slideExec = pptx.addSlide();
        slideExec.addText("✨ AI Executive Summary & Action Plan", {
            x: 0.5, y: 0.4, w: "90%", h: 0.5,
            fontSize: 22, bold: true, color: "0F172A"
        });

        // Clean up markdown
        let cleanNarration = aiNarration
            .replace(/\*\*/g, "")
            .replace(/#{1,3}\s/g, "")
            .replace(/```[^`]*```/g, "")
            .replace(/\n*\*\*ANALISIS PENJUALAN SHOPEE\*\*\n*/, "");

        slideExec.addText(cleanNarration, {
            x: 0.5, y: 1.2, w: "90%", h: 4,
            fontSize: 12, color: "333333", align: "left", valign: "top", bullet: false
        });
    }

    // ---------------------------------------------------------
    // SLIDE 3: KPI OVERVIEW
    // ---------------------------------------------------------
    const slideKPI = pptx.addSlide();
    slideKPI.addText("Ringkasan Performa", {
        x: 0.5, y: 0.4, w: "90%", h: 0.5,
        fontSize: 22, bold: true, color: "0F172A"
    });

    const o = analysis.overview;
    const kpiData = [
        [{ text: "Total Revenue", options: { bold: true, color: "64748B", fontSize: 14 } }, { text: "Total Pesanan", options: { bold: true, color: "64748B", fontSize: 14 } }],
        [{ text: formatRp(o.totalRevenue), options: { bold: true, fontSize: 28, color: "0F172A" } }, { text: o.totalOrders.toLocaleString(), options: { bold: true, fontSize: 28, color: "0F172A" } }],
        [{ text: "Rata-rata Order", options: { bold: true, color: "64748B", fontSize: 14 } }, { text: "Return Rate", options: { bold: true, color: "64748B", fontSize: 14 } }],
        [{ text: formatRp(o.avgOrderValue), options: { bold: true, fontSize: 24, color: "0F172A" } }, { text: `${o.returnRate.toFixed(1)}%`, options: { bold: true, fontSize: 24, color: "0F172A" } }]
    ];

    slideKPI.addTable(kpiData, {
        x: 0.5, y: 1.5, w: "90%", rowH: [0.5, 1, 0.5, 1],
        fill: { color: "F8FAFC" }, border: { type: "none" }, align: "center", valign: "middle"
    });

    // ---------------------------------------------------------
    // SLIDE 4: TOP 5 PRODUK
    // ---------------------------------------------------------
    const slideProd = pptx.addSlide();
    slideProd.addText("Performa Produk Utama (Top 5)", {
        x: 0.5, y: 0.4, w: "90%", h: 0.5,
        fontSize: 22, bold: true, color: "0F172A"
    });

    const headerProd = [
        { text: "Nama Produk", options: { bold: true, fill: { color: "F1F5F9" }, color: "475569" } },
        { text: "Pesanan", options: { bold: true, fill: { color: "F1F5F9" }, color: "475569" } },
        { text: "Share (%)", options: { bold: true, fill: { color: "F1F5F9" }, color: "475569" } },
        { text: "Revenue", options: { bold: true, fill: { color: "F1F5F9" }, color: "475569" } },
    ];

    const rowsProd = analysis.productPerformance.slice(0, 5).map(p => [
        { text: p.name },
        { text: p.count.toString() },
        { text: `${p.percentage.toFixed(1)}%` },
        { text: formatRp(p.revenue) }
    ]);

    slideProd.addTable([headerProd, ...rowsProd], {
        x: 0.5, y: 1.2, w: "90%",
        border: { type: "solid", pt: 1, color: "E2E8F0" },
        fontSize: 12, rowH: 0.5, valign: "middle" // Default rowH is 0.5 instead of an array
    });

    // Save
    const fileName = `simbisai_Presentasi_${new Date().toISOString().split("T")[0]}.pptx`;
    await pptx.writeFile({ fileName });
}
