"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText, Download, Printer, Brain,
    TrendingUp, AlertTriangle, Users,
    CheckCircle2, Loader2, Landmark,
    ArrowLeft, LayoutDashboard, Database, Target, Sparkles
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/local-db";
import { generateExecutiveBriefing, type ExecutiveBriefing } from "@/lib/ai-executive-briefing";
import { analyzeData } from "@/lib/analysis";
import { detectDomain } from "@/lib/data-domain-detector";
import { analyzeColumns } from "@/lib/ai-viz-recommender";
import { useToast } from "@/components/ui/toast-provider";

export default function ReportPage() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [briefing, setBriefing] = useState<ExecutiveBriefing | null>(null);
    const [fileInfo, setFileInfo] = useState<{ name: string, date: number } | null>(null);

    useEffect(() => {
        const loadReport = async () => {
            try {
                const salesData = await db.getAllData();
                setData(salesData);

                // Get file info
                const files = await db.files.orderBy("uploadedAt").reverse().toArray();
                if (files.length > 0) {
                    setFileInfo({ name: files[0].name, date: files[0].uploadedAt });
                }

                if (salesData.length > 0) {
                    // 1. Core Analysis
                    const analysisResult = analyzeData(salesData);

                    // 2. Metadata Analysis
                    const colMeta = analyzeColumns(salesData);
                    const domainResult = detectDomain(Object.keys(salesData[0] || {}), salesData);

                    // 3. Generate Briefing with all 4 required arguments
                    const report = generateExecutiveBriefing(
                        analysisResult,
                        domainResult.domain,
                        colMeta,
                        salesData.length
                    );
                    setBriefing(report);
                }
            } catch (err) {
                console.error("Report Load Error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadReport();
    }, []);

    const handleExportPDF = async () => {
        setExporting(true);
        addToast("Sedang menyiapkan PDF. Mohon tunggu...", "info");

        try {
            const reportElement = document.getElementById("report-content");
            if (!reportElement) throw new Error("Report element not found");

            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
                        .header { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
                        .title { color: #6366f1; font-size: 24px; font-weight: 800; margin: 0; }
                        .meta { color: #64748b; font-size: 14px; margin-top: 8px; }
                        .section { margin-bottom: 25px; page-break-inside: avoid; }
                        .section-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; display: flex; align-items: center; }
                        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 10px; }
                        .stat-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; }
                        .badge { display: inline-block; padding: 2px 8px; border-radius: 100px; font-size: 12px; font-weight: 700; }
                        .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 class="title">SimbisData Executive Summary</h1>
                        <div class="meta">
                            Dihasilkan pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
                            File Sumber: ${fileInfo?.name || "Unknown"}<br/>
                            Total Transaksi: ${data.length.toLocaleString()}
                        </div>
                    </div>
                    ${reportElement.innerHTML}
                    <div class="footer">Dihasilkan secara otomatis oleh SimbisData - Platform Analisis Data Driven & AI Powered</div>
                </body>
                </html>
            `;

            const res = await fetch("/api/export/premium-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ html: htmlContent }),
            });

            if (!res.ok) throw new Error("Gagal mengunduh PDF");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `SimbisData_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            addToast("PDF berhasil diunduh!", "success");
        } catch (error) {
            console.error(error);
            addToast("Gagal mengekspor PDF. Pastikan koneksi internet stabil.", "error");
        } finally {
            setExporting(false);
        }
    };

    if (loading) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
            <Loader2 size={40} className="spin" style={{ color: "var(--primary)" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Menganalisis data kamu untuk laporan ringkasan...</p>
        </div>
    );

    if (data.length === 0) return (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <Database size={64} style={{ color: "var(--text-muted)", marginBottom: "24px" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Tidak Ada Data untuk Laporan</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "12px", marginBottom: "32px" }}>Silakan upload file penjualan terlebih dahulu di menu Upload Data.</p>
            <Link href="/dashboard/upload" className="btn-primary">Ke Halaman Upload</Link>
        </div>
    );

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            {/* Header Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <Link href="/dashboard" style={{
                    display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)",
                    textDecoration: "none", fontSize: "0.85rem", fontWeight: 600
                }}>
                    <ArrowLeft size={16} /> Kembali ke Beranda
                </Link>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={() => window.print()} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Printer size={16} /> Cetak
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={exporting}
                        className="btn-primary"
                        style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        {exporting ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
                        {exporting ? "Mengekspor..." : "Download PDF Premium"}
                    </button>
                </div>
            </div>

            {/* The Report Document Style */}
            <div className="glass-card" style={{ padding: "40px", background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                <div id="report-content">
                    {/* Header */}
                    <div style={{ marginBottom: "40px", borderBottom: "1px solid var(--border-color)", paddingBottom: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <div style={{ padding: "10px", borderRadius: "12px", background: "var(--primary)", color: "white" }}>
                                <Brain size={28} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0 }}>Laporan Ringkasan AI</h1>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>SimbisData Executive Intelligent Briefing</p>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            <div>
                                <strong>Sumber Data:</strong> {fileInfo?.name || "Multiple Upload"}<br />
                                <strong>Periode Data:</strong> {fileInfo ? new Date(fileInfo.date).toLocaleDateString() : "Baru saja"}
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <strong>Dihasilkan pada:</strong> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    {/* Executive Summary Section */}
                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-light)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Target size={20} /> Kesimpulan Eksekutif
                        </h2>
                        <div className="glass-card" style={{ padding: "24px", background: "rgba(99,102,241,0.03)", border: "1px solid rgba(99,102,241,0.1)" }}>
                            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--text-primary)" }}>
                                {briefing?.headline || "Menganalisis performa bisnis kamu secara menyeluruh berdasarkan data transaksi marketplace."}
                            </p>
                        </div>
                    </section>

                    {/* Snapshot Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                        {briefing?.keyMetrics.map((metric, i) => (
                            <div key={i} className="glass-card" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>{metric.label}</p>
                                    <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>{metric.value}</p>
                                </div>
                                {metric.change && (
                                    <span style={{
                                        fontSize: "0.75rem", fontWeight: 700, padding: "4px 8px", borderRadius: "20px",
                                        background: metric.trend === 'up' ? 'rgba(16,185,129,0.1)' : metric.trend === 'down' ? 'rgba(239,68,68,0.1)' : 'rgba(100,116,139,0.1)',
                                        color: metric.trend === 'up' ? 'var(--success)' : metric.trend === 'down' ? 'var(--danger)' : 'var(--text-muted)'
                                    }}>
                                        {metric.change}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Alerts */}
                    {briefing?.alerts && briefing.alerts.length > 0 && (
                        <section style={{ marginBottom: "32px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {briefing.alerts.map((alert, i) => (
                                    <div key={i} style={{
                                        padding: "12px 16px", borderRadius: "8px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "10px",
                                        background: alert.severity === 'critical' ? 'rgba(239,68,68,0.1)' : alert.severity === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                                        border: `1px solid ${alert.severity === 'critical' ? 'rgba(239,68,68,0.2)' : alert.severity === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)'}`,
                                        color: alert.severity === 'critical' ? 'var(--danger)' : alert.severity === 'warning' ? 'var(--warning)' : 'var(--primary-light)'
                                    }}>
                                        <AlertTriangle size={16} /> {alert.message}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Wawasan & Strategi */}
                    <section style={{ marginBottom: "40px" }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-light)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Sparkles size={20} /> Wawasan Strategis AI
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {briefing?.insights.map((insight, idx) => (
                                <div key={idx} style={{
                                    padding: "20px", borderRadius: "12px", background: "var(--bg-card)",
                                    border: "1px solid var(--border-color)", borderLeft: '4px solid var(--primary)'
                                }}>
                                    <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{insight}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Rekomendasi Aksi */}
                    <section>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary-light)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Users size={20} /> Rekomendasi Aksi Strategis
                        </h2>
                        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                            {briefing?.recommendations.map((rec, i) => (
                                <div key={i} style={{
                                    padding: "16px 20px", borderBottom: i === briefing.recommendations.length - 1 ? "none" : "1px solid var(--border-color)",
                                    display: "flex", alignItems: "center", gap: "12px"
                                }}>
                                    <CheckCircle2 size={18} style={{ color: "var(--success)" }} />
                                    <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{rec}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Page Footer */}
            <div style={{ marginTop: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                <p>© 2026 SimbisData. Laporan ini bersifat rahasia dan dihasilkan berdasarkan algoritma pemrosesan data otomatis kami.</p>
            </div>
        </div>
    );
}
