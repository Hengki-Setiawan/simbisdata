"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FileText, Download, Printer, Brain,
    TrendingUp, AlertTriangle, Users,
    CheckCircle2, Loader2, Database, Target, Sparkles, ArrowLeft,
    Globe, BookOpen, Newspaper
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/local-db";
import { analyzeData, type AnalysisResult } from "@/lib/analysis";
import { runPipeline, type PipelineResult } from "@/lib/pipeline-engine";
import { useToast } from "@/components/ui/toast-provider";
import GeographicMap from "@/components/charts/GeographicMap";

export default function ReportPage() {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [pipeline, setPipeline] = useState<PipelineResult | null>(null);
    const [fileInfo, setFileInfo] = useState<{ name: string; date: number } | null>(null);
    const [marketTrend, setMarketTrend] = useState<{trend: string, actionable: string, newsCount: number, error?: string, articles?: {title: string, url: string, date: string}[]} | null>(null);

    useEffect(() => {
        const loadReport = async () => {
            try {
                const salesData = await db.salesData.toArray();
                const parsed = salesData.map(r => r.data);
                setData(parsed);

                const files = await db.files.orderBy("uploadedAt").reverse().toArray();
                if (files.length > 0) setFileInfo({ name: files[0].name, date: files[0].uploadedAt });

                if (parsed.length > 0) {
                    const result = await runPipeline(parsed);
                    setPipeline(result);
                    
                    try {
                        const topProds = result.features.productProfiles.slice(0, 3).map(p => p.productName);
                        if (topProds.length > 0) {
                            fetch("/api/ai/market-trend", {
                                method: "POST", headers: {"Content-Type":"application/json"},
                                body: JSON.stringify({ products: topProds })
                            })
                            .then(async r => {
                                const text = await r.text();
                                try {
                                    return JSON.parse(text);
                                } catch (e) {
                                    console.error("Non-JSON Response received:", text.substring(0, 100));
                                    throw new Error("Invalid server response format (Not JSON)");
                                }
                            })
                            .then(res => {
                                setMarketTrend(res);
                            })
                            .catch(err => {
                                console.error("Trend fetch error", err);
                                setMarketTrend({ trend: "", actionable: "", newsCount: 0, error: err.message });
                            });
                        }
                    } catch (e) {
                         console.error("Market trend preparation error", e);
                    }
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
        addToast("Sedang menyiapkan PDF...", "info");
        try {
            const el = document.getElementById("report-content");
            if (!el) throw new Error("Report element not found");
            const htmlContent = `<html><head><style>
                body{font-family:'Inter',sans-serif;color:#1e293b;padding:40px}
                .header{border-bottom:2px solid #4f46e5;padding-bottom:20px;margin-bottom:30px}
                .title{color:#4f46e5;font-size:24px;font-weight:800;margin:0}
                .meta{color:#64748b;font-size:14px;margin-top:8px}
                .section{margin-bottom:25px;page-break-inside:avoid}
                .section-title{font-size:18px;font-weight:700;margin-bottom:12px}
                .card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:15px;margin-bottom:10px}
                .footer{margin-top:40px;font-size:12px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:20px}
            </style></head><body>
                <div class="header"><h1 class="title">SimbisData Executive Report</h1>
                <div class="meta">Dihasilkan: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
                File: ${fileInfo?.name || "Unknown"}<br/>Total Transaksi: ${data.length.toLocaleString()}</div></div>
                ${el.innerHTML}
                <div class="footer">Dihasilkan oleh SimbisData — AI-Powered Business Analytics</div>
            </body></html>`;

            const res = await fetch("/api/export/premium-pdf", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ html: htmlContent }),
            });
            if (!res.ok) throw new Error("PDF export failed");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `SimbisData_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            addToast("PDF berhasil diunduh!", "success");
        } catch {
            addToast("Gagal mengekspor PDF.", "error");
        } finally {
            setExporting(false);
        }
    };

    if (loading) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
            <Loader2 size={40} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Menganalisis data untuk laporan...</p>
        </div>
    );

    if (data.length === 0) return (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <Database size={64} style={{ color: "var(--text-muted)", marginBottom: "24px" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-heading)" }}>Tidak Ada Data</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "12px", marginBottom: "32px" }}>Upload file penjualan terlebih dahulu.</p>
            <Link href="/dashboard/upload" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 24px", borderRadius: "12px", background: "var(--gradient-primary)",
                color: "#fff", fontWeight: 600, textDecoration: "none",
            }}>Ke Halaman Upload</Link>
        </div>
    );

    const overview = pipeline?.metrics?.overview;
    const products = pipeline?.features.productProfiles.slice(0, 5) || [];
    const crossInsights = pipeline?.mlResults.crossInsights || [];
    const temporal = pipeline?.features.temporalProfile;

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Kembali
                </Link>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderRadius: "10px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        <Printer size={16} /> Cetak
                    </button>
                    <button onClick={handleExportPDF} disabled={exporting} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", borderRadius: "10px", background: "var(--gradient-primary)", border: "none", cursor: "pointer", color: "#fff", fontSize: "0.85rem", fontWeight: 600 }}>
                        {exporting ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={16} />}
                        {exporting ? "Mengekspor..." : "Download PDF"}
                    </button>
                </div>
            </div>

            {/* Report Content */}
            <div style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "40px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
                <div id="report-content">
                    {/* Header */}
                    <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--border-color)", paddingBottom: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <div style={{ padding: "10px", borderRadius: "12px", background: "var(--gradient-primary)", color: "white" }}>
                                <Brain size={28} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-heading)", margin: 0 }}>Laporan Analisis AI</h1>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>SimbisData Executive Report</p>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            <div>
                                <strong>File:</strong> {fileInfo?.name || "Multiple"}
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <strong>Tanggal:</strong> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>

                    {/* Executive Narrative */}
                    {pipeline?.aiSynthesis?.narratives && (
                        <section style={{ marginBottom: "32px" }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <BookOpen size={18} /> Ringkasan Eksekutif
                            </h2>
                            <div style={{ padding: "20px", borderRadius: "12px", background: "var(--primary-surface, rgba(79,70,229,0.06))", borderLeft: "4px solid var(--primary)", fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text-primary)" }}>
                                {pipeline.aiSynthesis.narratives[0]}
                            </div>
                        </section>
                    )}

                    {/* AI Grand Synthesis (Long Form Report) */}
                    {pipeline?.aiSynthesis?.fullNarrative && (
                        <section style={{ marginBottom: "32px", breakInside: "avoid" }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Brain size={18} style={{ color: "var(--primary)" }} /> Rangkuman Eksekutif Mendalam AI
                            </h2>
                            <div 
                                style={{ padding: "24px", borderRadius: "16px", background: "var(--bg-surface)", border: "1px dashed var(--primary)", fontSize: "0.95rem", lineHeight: 1.8, color: "var(--text-primary)", whiteSpace: "pre-line" }}
                                dangerouslySetInnerHTML={{ __html: pipeline.aiSynthesis.fullNarrative.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                            />
                        </section>
                    )}

                    {/* KPI Snapshot */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "32px" }}>
                        {[
                            { label: "Total Revenue", value: `Rp ${((overview?.totalRevenue || 0) / 1e6).toFixed(1)}jt`, icon: <TrendingUp size={18} />, color: "var(--success)" },
                            { label: "Total Orders", value: String(overview?.totalOrders || data.length), icon: <FileText size={18} />, color: "var(--primary)" },
                            { label: "Avg Order Value", value: `Rp ${Math.round(overview?.avgOrderValue || 0).toLocaleString('id-ID')}`, icon: <Target size={18} />, color: "var(--accent)" },
                            { label: "Data Quality", value: `${pipeline?.cleaning.qualityScore || 0}/100`, icon: <CheckCircle2 size={18} />, color: "var(--success)" },
                        ].map((kpi, i) => (
                            <div key={i} style={{ padding: "16px", borderRadius: "12px", background: "var(--bg-surface)", border: "1px solid var(--border-color)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: kpi.color }}>{kpi.icon}<span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{kpi.label}</span></div>
                                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-heading)" }}>{kpi.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Top Products */}
                    {products.length > 0 && (
                        <section style={{ marginBottom: "32px" }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Target size={18} /> Produk Teratas
                            </h2>
                            <div style={{ borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                                {products.map((p, i) => (
                                    <div key={i} style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < products.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span style={{ width: "24px", height: "24px", borderRadius: "6px", background: "var(--primary-surface, #eef2ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "var(--primary)" }}>
                                                {p.rank}
                                            </span>
                                            <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--text-primary)" }}>{p.productName}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem" }}>
                                            <span style={{ color: "var(--text-muted)" }}>{p.totalQuantitySold} unit</span>
                                            <span style={{ fontWeight: 700, color: "var(--success)" }}>Rp {Math.round(p.totalRevenue).toLocaleString('id-ID')}</span>
                                            <span style={{ padding: "2px 8px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 700, background: p.category === "A" ? "var(--success-bg, #f0fdf4)" : p.category === "B" ? "var(--info-bg, #eff6ff)" : "var(--warning-bg, #fefce8)", color: p.category === "A" ? "var(--success)" : p.category === "B" ? "var(--info, var(--primary))" : "var(--warning)" }}>
                                                Kat. {p.category}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Geographic Map Section */}
                    {data && data.length > 0 && (
                         <section style={{ marginBottom: "32px" }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Globe size={18} /> Peta Distribusi (Geospasial)
                            </h2>
                            <GeographicMap data={data} />
                        </section>
                    )}

                    {/* Cross-Algorithm Insights */}
                    {crossInsights.length > 0 && (
                        <section style={{ marginBottom: "32px" }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Sparkles size={18} /> Wawasan AI
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {crossInsights.map((insight, i) => (
                                    <div key={i} style={{ padding: "14px 18px", borderRadius: "10px", background: "var(--primary-surface, rgba(79,70,229,0.06))", borderLeft: "3px solid var(--primary)", fontSize: "0.88rem", lineHeight: 1.7, color: "var(--text-primary)" }}>
                                        {insight}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Market Trends (Live API) */}
                    <section style={{ marginBottom: "32px" }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Newspaper size={18} /> Tren Pasar & Berita Global
                        </h2>
                        {!marketTrend && (
                            <div style={{ padding: "20px", borderRadius: "12px", border: "1px dashed var(--border-color)", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 12px", color: "var(--primary)" }} />
                                Sedang mengekstrak berita RSS & melakukan *reasoning* AI...
                            </div>
                        )}
                        {marketTrend && marketTrend.error && (
                             <div style={{ padding: "20px", borderRadius: "12px", background: "var(--danger-bg, #fef2f2)", borderLeft: "4px solid var(--danger)", color: "var(--danger)" }}>
                                 Gagal memuat tren pasar: {marketTrend.error}
                             </div>
                        )}
                        {marketTrend && !marketTrend.error && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-surface)" }}>
                                    <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>📉 Analisis Tren Saat Ini</h3>
                                    <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>{marketTrend.trend}</p>
                                </div>
                                <div style={{ padding: "16px", borderRadius: "10px", background: "var(--success-bg, #f0fdf4)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                                    <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--success)", marginBottom: "8px" }}>💡 Saran Strategis</h3>
                                    <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "var(--text-primary)" }}>{marketTrend.actionable}</p>
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "right", marginTop: "-4px" }}>
                                    Berdasarkan ekstraksi {marketTrend.newsCount} artikel terbaru.
                                </div>
                                {marketTrend.articles && marketTrend.articles.length > 0 && (
                                    <div style={{ marginTop: "4px" }}>
                                        <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Sumber Rujukan Top:</h4>
                                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                                            {marketTrend.articles.slice(0, 3).map((art, idx) => (
                                                <li key={idx} style={{ fontSize: "0.8rem" }}>
                                                    <a href={art.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none", display: "inline-block", maxWidth: "95%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        🔗 {art.title}
                                                    </a>
                                                    <span style={{ color: "var(--text-muted)", marginLeft: "8px", fontSize: "0.7rem" }}>{art.date}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Temporal Info */}
                    {temporal && (
                        <section>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <Users size={18} /> Pola Bisnis
                            </h2>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                                {[
                                    { label: "Hari Tersibuk", value: temporal.peakDayOfWeek },
                                    { label: "Bulan Puncak", value: temporal.peakMonth },
                                    { label: "Tren", value: temporal.trendDirection === 'up' ? '📈 Naik' : temporal.trendDirection === 'down' ? '📉 Turun' : '➡️ Stabil' },
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: "14px", borderRadius: "10px", background: "var(--bg-surface)", textAlign: "center" }}>
                                        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>{item.label}</p>
                                        <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-heading)" }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            <div style={{ marginTop: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                © 2026 SimbisData. Laporan dihasilkan otomatis berdasarkan pipeline analisis data.
            </div>
        </div>
    );
}
