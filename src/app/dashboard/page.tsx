"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
    DollarSign,
    Package,
    TrendingUp,
    RotateCcw,
    Upload,
    Brain,
    Loader2,
    FileDown,
    Settings,
    Sparkles,
    Zap,
    AlertTriangle,
    Info,
    ChevronRight,
    BarChart3,
    Plus,
} from "lucide-react";
import Link from "next/link";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, Treemap,
} from "recharts";
import { analyzeData, type AnalysisResult } from "@/lib/analysis";
import { generatePDFReport } from "@/lib/pdf-export";
import { exportToExcel, exportToCSV } from "@/lib/excel-export";
import { generatePremiumPDFHTML } from "@/lib/premium-pdf-template";
import { generatePPTX } from "@/lib/ppt-export";
import { db } from "@/lib/local-db";
import { Responsive, Layout } from "react-grid-layout";
import { SmartChartCard } from "@/components/charts/SmartChartCard";
import { MarketInsights } from "@/components/dashboard/MarketInsights"; // Added import
import { detectDomain, type DomainDetectionResult } from "@/lib/data-domain-detector";
import { analyzeColumns, recommendCharts, type ChartRecommendation, type ColumnMeta } from "@/lib/ai-viz-recommender";
import { recommendAlgorithms, type MLRecommendation } from "@/lib/ai-ml-selector";
import { generateExecutiveBriefing, type ExecutiveBriefing } from "@/lib/ai-executive-briefing";
import ExecutiveSummary from "@/components/dashboard/ExecutiveSummary";

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#a78bfa", "#f472b6", "#34d399"];

function formatRupiah(num: number): string {
    if (num >= 1_000_000) return `Rp${(num / 1_000_000).toFixed(1)}jt`;
    if (num >= 1_000) return `Rp${(num / 1_000).toFixed(0)}K`;
    return `Rp${num.toFixed(0)}`;
}

function KPICard({ icon: Icon, label, value, sub, color, delay }: {
    icon: React.ElementType; label: string; value: string; sub: string; color: string; delay: number;
}) {
    return (
        <motion.div
            className="glass-card"
            style={{ padding: "24px" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "8px" }}>{label}</p>
                    <p style={{ fontSize: "1.6rem", fontWeight: 800 }}>{value}</p>
                    <p style={{ color: color, fontSize: "0.8rem", fontWeight: 600, marginTop: "4px" }}>{sub}</p>
                </div>
                <div style={{
                    width: 44, height: 44, borderRadius: "var(--radius)",
                    background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon size={22} style={{ color }} />
                </div>
            </div>
        </motion.div>
    );
}

const tooltipStyle = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "0.8rem",
};

export default function DashboardPage() {
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [rawData, setRawData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState<string>("");
    const [aiLoading, setAiLoading] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [exportingPremium, setExportingPremium] = useState(false);
    const [period, setPeriod] = useState("all");

    // AI Module State
    const [domainResult, setDomainResult] = useState<DomainDetectionResult | null>(null);
    const [chartRecs, setChartRecs] = useState<ChartRecommendation[]>([]);
    const [mlRecs, setMlRecs] = useState<MLRecommendation[]>([]);
    const [briefing, setBriefing] = useState<ExecutiveBriefing | null>(null);
    const [columnMeta, setColumnMeta] = useState<ColumnMeta[]>([]);

    // Dashboard Customizer
    const [isEditingLayout, setIsEditingLayout] = useState(false);
    const [layouts, setLayouts] = useState<Partial<Record<string, Layout>>>({ lg: [] });

    // Load saved layout from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("simbis_dashboard_layout");
        if (saved) {
            try { setLayouts(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
    }, []);

    const onLayoutChange = (_: Layout, allLayouts: Partial<Record<string, Layout>>) => {
        setLayouts(allLayouts);
        localStorage.setItem("simbis_dashboard_layout", JSON.stringify(allLayouts));
    };

    useEffect(() => {
        const load = async () => {
            try {
                const data = await db.getAllData();
                if (data && data.length > 0) {
                    setRawData(data);
                    const result = analyzeData(data);
                    setAnalysis(result);

                    // AI Pipeline: Domain Detection → Column Analysis → Chart & ML Recommendations → Briefing
                    const columns = Object.keys(data[0] || {});
                    const domain = detectDomain(columns, data);
                    setDomainResult(domain);

                    const meta = analyzeColumns(data);
                    setColumnMeta(meta);

                    const charts = recommendCharts(meta, domain.domain, data);
                    setChartRecs(charts);

                    // Generate layout for dynamic charts
                    const newLgLayout = charts.map((c, i) => ({
                        i: c.id,
                        x: (i % 2) * 6, // 2 columns (6 width each on 12-col grid)
                        y: Math.floor(i / 2) * 4,
                        w: 6,
                        h: 4,
                        minW: 3,
                        minH: 3
                    }));
                    // Add AI section at bottom
                    newLgLayout.push({
                        i: "ai",
                        x: 0,
                        y: Math.ceil(charts.length / 2) * 3,
                        w: 12, h: 2, minW: 4, minH: 2
                    });

                    // Only override if no valid saved layout for these exact charts
                    const saved = localStorage.getItem("simbis_dashboard_layout");
                    let useSaved = false;
                    if (saved) {
                        try {
                            const parsed = JSON.parse(saved);
                            if (parsed.lg && parsed.lg.some((l: any) => charts.find(c => c.id === l.i))) {
                                useSaved = true;
                            }
                        } catch (e) { }
                    }
                    if (!useSaved) {
                        setLayouts({ lg: newLgLayout });
                    }

                    const ml = recommendAlgorithms(meta, domain.domain, data.length);
                    setMlRecs(ml);

                    const brief = generateExecutiveBriefing(result, domain.domain, meta, data.length);
                    setBriefing(brief);
                }
            } catch { /* ignore */ }
            setLoading(false);
        };
        load();
    }, []);
    const generateAiInsights = async (data: AnalysisResult) => {
        setAiLoading(true);
        const prompt = `Analisis data penjualan ini:
1. Total Penjualan: Rp${data.overview.totalRevenue}
2. Total Pesanan: ${data.overview.totalOrders}
3. Produk Terlaris: ${data.productPerformance[0]?.name || "N/A"} (${data.productPerformance[0]?.count || 0} terjual)
4. Tren Pertumbuhan: ${data.overview.growthRate < 0 ? "Turun" : "Naik"} ${Math.abs(data.overview.growthRate).toFixed(1)}%

Berikan analisis mendalam dalam bahasa Indonesia yang mudah dipahami, insight tersembunyi, dan 5 rekomendasi aksi prioritas untuk meningkatkan penjualan. Format dengan emoji dan poin-poin jelas.`;

        try {
            const resp = await fetch("/api/ai/narrate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });
            const data = await resp.json();
            setAiInsight(data.narrative || "Gagal generate insight. Coba lagi nanti.");
        } catch {
            setAiInsight("⚠️ Tidak dapat terhubung ke AI. Pastikan API key sudah diset atau coba lagi nanti.");
        }
        setAiLoading(false);
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div style={{ minHeight: "100vh", padding: "32px", display: "flex", justifyContent: "center" }}><Loader2 className="animate-spin text-primary" size={32} /></div>;
    }

    if (loading) {
        return (
            <div style={{ padding: "0" }}>
                {/* Skeleton Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div>
                        <div style={{ width: "260px", height: "28px", background: "var(--border-color)", borderRadius: "6px", marginBottom: "8px", animation: "pulse 1.5s infinite" }} />
                        <div style={{ width: "180px", height: "14px", background: "var(--border-color)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
                    </div>
                </div>
                {/* Skeleton KPIs */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="glass-card" style={{ padding: "24px" }}>
                            <div style={{ width: "80px", height: "12px", background: "var(--border-color)", borderRadius: "4px", marginBottom: "12px", animation: "pulse 1.5s infinite" }} />
                            <div style={{ width: "120px", height: "24px", background: "var(--border-color)", borderRadius: "4px", marginBottom: "8px", animation: "pulse 1.5s infinite" }} />
                            <div style={{ width: "100px", height: "10px", background: "var(--border-color)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
                        </div>
                    ))}
                </div>
                {/* Skeleton Charts */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                    <div className="glass-card" style={{ padding: "24px", height: "300px" }}>
                        <div style={{ width: "150px", height: "16px", background: "var(--border-color)", borderRadius: "4px", marginBottom: "20px", animation: "pulse 1.5s infinite" }} />
                        <div style={{ width: "100%", height: "200px", background: "var(--border-color)", borderRadius: "8px", opacity: 0.3, animation: "pulse 1.5s infinite" }} />
                    </div>
                    <div className="glass-card" style={{ padding: "24px", height: "300px" }}>
                        <div style={{ width: "120px", height: "16px", background: "var(--border-color)", borderRadius: "4px", marginBottom: "20px", animation: "pulse 1.5s infinite" }} />
                        <div style={{ width: "100%", height: "200px", background: "var(--border-color)", borderRadius: "8px", opacity: 0.3, animation: "pulse 1.5s infinite" }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!analysis) { // Changed from `loading || !analysis` because loading is handled above
        return (
            <div style={{ textAlign: "center", padding: "80px 24px" }}>
                <Upload size={64} style={{ color: "var(--text-muted)", marginBottom: "24px" }} />
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>Belum Ada Data</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px" }}>
                    Upload file Excel penjualan kamu untuk melihat analisis lengkap di sini.
                </p>
                <Link href="/dashboard/upload" className="btn-primary">
                    <Upload size={18} />
                    Upload Data Sekarang
                </Link>
            </div>
        );
    }

    const { overview, productPerformance, variantAnalysis, regionalAnalysis, paymentAnalysis, timeAnalysis } = analysis;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Dashboard Analytics</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        {overview.dateRange.start} — {overview.dateRange.end}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {/* Period Filter */}
                    <div style={{ display: "flex", gap: "4px", background: "var(--bg-surface)", borderRadius: "100px", padding: "3px", border: "1px solid var(--border-color)" }}>
                        {[
                            { key: "7d", label: "7H" },
                            { key: "30d", label: "30H" },
                            { key: "90d", label: "90H" },
                            { key: "all", label: "Semua" },
                        ].map(p => (
                            <button key={p.key} onClick={() => setPeriod(p.key)} style={{
                                padding: "5px 14px", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                                background: period === p.key ? "var(--primary)" : "transparent",
                                color: period === p.key ? "white" : "var(--text-muted)",
                                border: "none", transition: "all 0.2s",
                            }}>{p.label}</button>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button className="primary-button" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }} onClick={() => {/* router.push('/dashboard/upload') */ }}> {/* router.push was not defined, so commented out */}
                            <Plus size={16} /> Import Data Baru
                        </button>
                    </div>
                    <div style={{ position: "relative" }}>
                        <button onClick={() => setExportOpen(!exportOpen)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                            <FileDown size={16} /> Export ▾
                        </button>
                        {exportOpen && (
                            <div style={{
                                position: "absolute", top: "100%", right: 0, marginTop: "4px",
                                background: "var(--bg-card)", border: "1px solid var(--border-color)",
                                borderRadius: "var(--radius)", padding: "8px", minWidth: "200px", zIndex: 100,
                                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                            }}>
                                <button onClick={() => { analysis && generatePDFReport(analysis, aiInsight); setExportOpen(false); }}
                                    style={{ width: "100%", textAlign: "left", padding: "10px 12px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", borderRadius: "6px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                    📄 PDF Report
                                </button>
                                <button onClick={() => { analysis && exportToExcel(rawData, analysis, aiInsight); setExportOpen(false); }}
                                    style={{ width: "100%", textAlign: "left", padding: "10px 12px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", borderRadius: "6px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                    📊 Excel (.xlsx)
                                </button>
                                <button onClick={() => { exportToCSV(rawData); setExportOpen(false); }}
                                    style={{ width: "100%", textAlign: "left", padding: "10px 12px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", borderRadius: "6px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                    📋 CSV
                                </button>
                                <button onClick={() => { analysis && generatePPTX(analysis, aiInsight); setExportOpen(false); }}
                                    style={{ width: "100%", textAlign: "left", padding: "10px 12px", background: "none", border: "none", color: "var(--warning)", cursor: "pointer", borderRadius: "6px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                    📊 PowerPoint (.pptx)
                                </button>
                                <div style={{ height: "1px", background: "var(--border-color)", margin: "6px 0" }} />
                                <button onClick={async () => {
                                    if (!analysis) return;
                                    setExportingPremium(true); setExportOpen(false);
                                    try {
                                        const html = generatePremiumPDFHTML(analysis, aiInsight);
                                        const res = await fetch("/api/export/premium-pdf", {
                                            method: "POST", headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ html }),
                                        });
                                        if (res.ok) {
                                            const blob = await res.blob();
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement("a"); a.href = url;
                                            a.download = `SimbisData_Premium_${new Date().toISOString().split("T")[0]}.pdf`;
                                            a.click(); URL.revokeObjectURL(url);
                                        } else { alert("Premium PDF belum tersedia. Tambahkan BROWSERLESS_API_KEY."); }
                                    } catch { alert("Gagal generate Premium PDF."); }
                                    setExportingPremium(false);
                                }}
                                    style={{ width: "100%", textAlign: "left", padding: "10px 12px", background: "none", border: "none", color: "var(--primary-light)", cursor: "pointer", borderRadius: "6px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                    {exportingPremium ? "⏳ Generating..." : "✨ Premium PDF (Pro)"}
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsEditingLayout(!isEditingLayout)} className={isEditingLayout ? "btn-primary" : "btn-secondary"} style={{ padding: "8px 16px", fontSize: "0.85rem", gap: "6px" }}>
                        <Settings size={16} /> {isEditingLayout ? "Simpan Layout" : "Edit Layout"}
                    </button>
                    <Link href="/dashboard/upload" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                        <Upload size={16} /> Upload Baru
                    </Link>
                </div>
            </div>

            {/* AI Executive Briefing Banner */}
            <ExecutiveSummary data={rawData} />

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <KPICard icon={DollarSign} label="Total Revenue" value={formatRupiah(overview.totalRevenue * 1000)} sub={`${overview.growthRate >= 0 ? "↑" : "↓"} ${Math.abs(overview.growthRate).toFixed(1)}%`} color="var(--success)" delay={0} />
                <KPICard icon={Package} label="Total Pesanan" value={overview.totalOrders.toLocaleString()} sub={`${productPerformance.length} produk`} color="var(--primary)" delay={0.1} />
                <KPICard icon={TrendingUp} label="Rata-rata Order" value={formatRupiah(overview.avgOrderValue * 1000)} sub="per pesanan" color="var(--accent)" delay={0.2} />
                <KPICard icon={RotateCcw} label="Return Rate" value={`${overview.returnRate.toFixed(1)}%`} sub={overview.returnRate < 2 ? "✅ Sangat baik" : "⚠️ Perlu perhatian"} color={overview.returnRate < 2 ? "var(--success)" : "var(--warning)"} delay={0.3} />
            </div>

            {/* AI Dynamic Recommendations Panel */}
            {(chartRecs.length > 0 || mlRecs.length > 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    style={{ marginBottom: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}
                >
                    {/* Chart Recommendations */}
                    {chartRecs.length > 0 && (
                        <div className="glass-card" style={{ padding: "18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                                <BarChart3 size={16} style={{ color: "var(--primary)" }} />
                                <h4 style={{ fontSize: "0.88rem", fontWeight: 700 }}>🎯 AI Chart Recommendations</h4>
                                <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "100px", background: "rgba(99,102,241,0.12)", color: "var(--primary)", fontWeight: 600 }}>
                                    {chartRecs.length} charts
                                </span>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {chartRecs.slice(0, 6).map((rec) => (
                                    <span key={rec.id} title={rec.reason} style={{
                                        fontSize: "0.72rem", padding: "5px 10px", borderRadius: "8px",
                                        background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                                        color: "var(--text-secondary)", cursor: "help",
                                        display: "flex", alignItems: "center", gap: "4px"
                                    }}>
                                        {rec.title.split(" ")[0]} {rec.type}
                                        <span style={{ fontSize: "0.65rem", color: "var(--success)", fontWeight: 600 }}>
                                            {Math.round(rec.confidence * 100)}%
                                        </span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ML Recommendations */}
                    {mlRecs.length > 0 && (
                        <div className="glass-card" style={{ padding: "18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                                <Zap size={16} style={{ color: "var(--accent)" }} />
                                <h4 style={{ fontSize: "0.88rem", fontWeight: 700 }}>🤖 AI ML Recommendations</h4>
                                <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "100px", background: "rgba(6,182,212,0.12)", color: "var(--accent)", fontWeight: 600 }}>
                                    {mlRecs.length} algorithms
                                </span>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {mlRecs.slice(0, 6).map((rec) => (
                                    <Link key={rec.id} href="/dashboard/analysis" title={rec.reason} style={{
                                        fontSize: "0.72rem", padding: "5px 10px", borderRadius: "8px",
                                        background: rec.useTensorFlow ? "rgba(99,102,241,0.08)" : "var(--bg-surface)",
                                        border: `1px solid ${rec.useTensorFlow ? "rgba(99,102,241,0.25)" : "var(--border-color)"}`,
                                        color: "var(--text-secondary)", textDecoration: "none",
                                        display: "flex", alignItems: "center", gap: "4px"
                                    }}>
                                        {rec.icon} {rec.name.replace(/🧠|🔍|🎯|💎|📊|🔥|💬|💲|⏰|🔮|🗺️|👥|🔗/g, "").trim()}
                                        {rec.useTensorFlow && <span style={{ fontSize: "0.6rem", color: "var(--primary)", fontWeight: 700 }}>TF.js</span>}
                                        <ChevronRight size={10} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Draggable Dashboard Layout */}
            <div style={{ width: "100%", overflowX: "hidden" }} id="dashboard-grid-container">
                <Responsive
                    className="layout"
                    width={mounted && typeof window !== "undefined" ? document.getElementById("dashboard-grid-container")?.offsetWidth || window.innerWidth - 64 : 1200}
                    layouts={layouts}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={100}
                    onLayoutChange={onLayoutChange}
                    {...{ isDraggable: isEditingLayout, isResizable: isEditingLayout } as any}
                    margin={[16, 16]}
                >
                    {/* Dynamic Chart Grid */}
                    {chartRecs.map((rec, i) => (
                        <div key={rec.id}>
                            <SmartChartCard rec={rec} data={rawData} delay={0.3 + (i * 0.1)} />
                        </div>
                    ))}

                    {/* AI Insight Section */}
                    <div key="ai">
                        <motion.div className="glass-card" style={{ padding: "24px", height: "100%", overflowY: "auto", border: isEditingLayout ? "2px dashed var(--primary)" : "none" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <Brain size={24} style={{ color: "var(--primary)" }} />
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>AI Insight & Rekomendasi</h3>
                                </div>
                                <button onClick={() => generateAiInsights(analysis)} onMouseDown={(e) => e.stopPropagation()} className="btn-primary" disabled={aiLoading}
                                    style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
                                    {aiLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Brain size={16} />}
                                    {aiLoading ? "Menganalisis..." : "Generate Insight AI"}
                                </button>
                            </div>

                            {aiInsight ? (
                                <div style={{
                                    padding: "20px", borderRadius: "var(--radius)", background: "var(--bg-surface)",
                                    border: "1px solid var(--border-color)", whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: "0.9rem", color: "var(--text-secondary)"
                                }} onMouseDown={(e) => e.stopPropagation()}>
                                    {aiInsight}
                                </div>
                            ) : (
                                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", borderRadius: "var(--radius)", background: "var(--bg-surface)", border: "1px dashed var(--border-color)" }}>
                                    <Brain size={32} style={{ marginBottom: "12px", opacity: 0.5 }} />
                                    <p>Klik tombol "Generate Insight AI" untuk mendapatkan rekomendasi bisnis.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </Responsive>
            </div>
        </div>
    );
}
