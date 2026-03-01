/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from "jspdf";
import { AnalysisResult } from "@/lib/analysis";

export function generatePDFReport(analysis: AnalysisResult, aiNarration?: string) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    const addText = (text: string, size: number, bold: boolean = false, color: [number, number, number] = [30, 30, 30]) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, pageWidth - 40);
        if (y + lines.length * (size * 0.5) > 280) {
            doc.addPage();
            y = 20;
        }
        doc.text(lines, 20, y);
        y += lines.length * (size * 0.5) + 4;
    };

    const addLine = () => {
        doc.setDrawColor(100, 100, 241);
        doc.setLineWidth(0.5);
        doc.line(20, y, pageWidth - 20, y);
        y += 8;
    };

    const formatRp = (num: number) => `Rp ${num.toLocaleString("id-ID")}`;

    // Header
    doc.setFillColor(15, 15, 35);
    doc.rect(0, 0, pageWidth, 50, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("simbisai", 20, 25);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Laporan Analisis Data Penjualan", 20, 35);
    doc.setFontSize(9);
    doc.text(
        `Periode: ${analysis.overview.dateRange.start} — ${analysis.overview.dateRange.end}`,
        20, 43
    );
    doc.text(
        `Dibuat: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
        pageWidth - 80, 43
    );

    y = 62;

    // AI Executive Summary
    if (aiNarration) {
        addText("AI EXECUTIVE SUMMARY & ACTION PLAN", 14, true, [99, 102, 241]);
        addLine();

        const cleanNarration = aiNarration
            .replace(/\*\*/g, "")
            .replace(/#{1,3}\s/g, "")
            .replace(/```[^`]*```/g, "");

        addText(cleanNarration, 10, false, [60, 60, 60]);
        y += 10;

        // Add a line separator before the regular stats
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y - 5, pageWidth - 20, y - 5);
    }

    // Overview KPIs
    addText("RINGKASAN PERFORMA", 14, true, [99, 102, 241]);
    addLine();

    const kpis = [
        { label: "Total Pesanan", value: `${analysis.overview.totalOrders.toLocaleString()} pesanan` },
        { label: "Total Revenue", value: formatRp(analysis.overview.totalRevenue) },
        { label: "Rata-rata Order", value: formatRp(analysis.overview.avgOrderValue) },
        { label: "Return Rate", value: `${analysis.overview.returnRate.toFixed(1)}%` },
        { label: "Growth Rate", value: `${analysis.overview.growthRate >= 0 ? "+" : ""}${analysis.overview.growthRate.toFixed(1)}%` },
    ];

    kpis.forEach((kpi) => {
        addText(`${kpi.label}: ${kpi.value}`, 11, false);
    });

    y += 6;

    // Product Performance
    addText("PERFORMA PRODUK", 14, true, [99, 102, 241]);
    addLine();

    analysis.productPerformance.forEach((p: any, i: number) => {
        addText(
            `${i + 1}. ${p.name}`,
            10, true
        );
        addText(
            `   ${p.count} pesanan (${p.percentage.toFixed(1)}%) — Revenue: ${formatRp(p.revenue)}`,
            9, false, [100, 100, 100]
        );
    });

    y += 6;

    // Variant Analysis
    addText("DISTRIBUSI UKURAN / VARIASI", 14, true, [99, 102, 241]);
    addLine();

    analysis.variantAnalysis.forEach((v: any) => {
        addText(`• ${v.name}: ${v.count} pesanan (${v.percentage.toFixed(1)}%)`, 10);
    });

    y += 6;

    // Regional Analysis
    addText("TOP 10 WILAYAH PENJUALAN", 14, true, [99, 102, 241]);
    addLine();

    analysis.regionalAnalysis.slice(0, 10).forEach((r: any, i: number) => {
        addText(`${i + 1}. ${r.province}: ${r.count} pesanan (${r.percentage.toFixed(1)}%)`, 10);
    });

    y += 6;

    // Payment Analysis
    addText("METODE PEMBAYARAN", 14, true, [99, 102, 241]);
    addLine();

    analysis.paymentAnalysis.forEach((p: any) => {
        addText(`• ${p.method}: ${p.count} transaksi (${p.percentage.toFixed(1)}%)`, 10);
    });

    y += 6;

    // Shipping Analysis
    addText("ANALISIS PENGIRIMAN", 14, true, [99, 102, 241]);
    addLine();

    analysis.shippingAnalysis.forEach((s: any) => {
        addText(`• ${s.carrier}: ${s.count} pesanan (${s.percentage.toFixed(1)}%) — Avg ongkir: ${formatRp(s.avgCost / 1000)}`, 10);
    });

    y += 6;

    // Monthly Trend
    addText("TREN BULANAN", 14, true, [99, 102, 241]);
    addLine();

    analysis.timeAnalysis.monthly.forEach((m: any) => {
        addText(`• ${m.month}: ${m.orders} pesanan — Revenue: ${formatRp(m.revenue)}`, 10);
    });

    y += 6;

    // Financial Summary
    addText("RINGKASAN FINANSIAL", 14, true, [99, 102, 241]);
    addLine();

    const fin = analysis.financialAnalysis;
    addText(`Total Diskon Diberikan: ${formatRp(fin.totalDiscount / 1000)}`, 10);
    addText(`Diskon dari Seller: ${formatRp(fin.sellerDiscount / 1000)}`, 10);
    addText(`Diskon Platform: ${formatRp(fin.platformDiscount / 1000)}`, 10);
    addText(`Rata-rata Ongkos Kirim: ${formatRp(fin.avgShippingCost / 1000)}`, 10);
    addText(`Total Shipping Revenue: ${formatRp(fin.totalShippingRevenue / 1000)}`, 10);

    // Footer on last page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `simbisai — Halaman ${i} dari ${totalPages}`,
            pageWidth / 2,
            290,
            { align: "center" }
        );
    }

    // Download
    const fileName = `simbisai_Report_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
}

export function generatePremiumPDFHTML(analysis: AnalysisResult, aiNarration?: string): string {
    const formatRp = (num: number) => `Rp ${num.toLocaleString("id-ID")}`;

    // Basic HTML structure with styling for the premium PDF
    let html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5; background: #f8fafc; padding: 0; margin: 0; }
            .header { background: #0f172a; color: white; padding: 30px 40px; }
            .header h1 { margin: 0; font-size: 28px; color: #6366f1; }
            .header p { margin: 5px 0 0 0; opacity: 0.8; }
            .content { padding: 40px; background: white; margin: 20px 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            h2 { color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .kpi-box { background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1; }
            .kpi-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .kpi-value { font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; }
            .ai-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>simbisai Premium Report</h1>
            <p>Laporan Eksekutif Analisis Data Penjualan</p>
            <p style="font-size: 12px; margin-top: 15px;">Periode: ${analysis.overview.dateRange.start} — ${analysis.overview.dateRange.end}</p>
        </div>
        
        <div class="content">
            <h2>Ringkasan Performa</h2>
            <div class="grid">
                <div class="kpi-box">
                    <div class="kpi-label">Total Revenue</div>
                    <div class="kpi-value">${formatRp(analysis.overview.totalRevenue)}</div>
                </div>
                <div class="kpi-box">
                    <div class="kpi-label">Total Pesanan</div>
                    <div class="kpi-value">${analysis.overview.totalOrders.toLocaleString()} <span style="font-size: 14px; font-weight: normal; color: #64748b;">pesanan</span></div>
                </div>
            </div>
            
            <h2>Performa Produk</h2>
            <table>
                <tr><th>Produk</th><th>Pesanan</th><th>Revenue</th></tr>
                ${analysis.productPerformance.slice(0, 5).map((p: any) => `
                <tr>
                    <td style="font-weight: 500;">${p.name}</td>
                    <td>${p.count} (${p.percentage.toFixed(1)}%)</td>
                    <td>${formatRp(p.revenue)}</td>
                </tr>
                `).join('')}
            </table>
            
            <h2>Distribusi Wilayah</h2>
            <table>
                <tr><th>Wilayah</th><th>Pesanan</th><th>Persentase</th></tr>
                ${analysis.regionalAnalysis.slice(0, 5).map((r: any) => `
                <tr>
                    <td style="font-weight: 500;">${r.province}</td>
                    <td>${r.count}</td>
                    <td>${r.percentage.toFixed(1)}%</td>
                </tr>
                `).join('')}
            </table>
            
  `;

    if (aiNarration) {
        // Convert Markdown to basic HTML for the PDF
        const narrationHtml = aiNarration
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/## (.*?)\n/g, '<h3 style="color:#0f172a; margin-top:15px;">$1</h3>')
            .replace(/\n/g, '<br/>');

        html += `
            <div class="ai-box">
                <h2 style="margin-top: 0; border: none; padding: 0;">✨ Insight AI (Llama 3 / Gemini)</h2>
                <div>${narrationHtml}</div>
            </div>
        `;
    }

    html += `
        </div>
    </body>
    </html>
    `;

    return html;
}
