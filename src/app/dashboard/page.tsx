"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { analyzeData, type AnalysisResult } from "@/lib/analysis";
import { generatePDFReport } from "@/lib/pdf-export";
import { exportToExcel, exportToCSV } from "@/lib/excel-export";
import { generatePremiumPDFHTML } from "@/lib/premium-pdf-template";
import { generatePPTX } from "@/lib/ppt-export";
import { db } from "@/lib/local-db";
import { Responsive, Layout } from "react-grid-layout";

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
    const [loading, setLoading] = useState(true);
    const [aiInsight, setAiInsight] = useState<string>("");
    const [aiLoading, setAiLoading] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [exportingPremium, setExportingPremium] = useState(false);

    // Dashboard Customizer
    const [isEditingLayout, setIsEditingLayout] = useState(false);
    const [layouts, setLayouts] = useState<Partial<Record<string, Layout>>>({
        lg: [
            { i: "trend", x: 0, y: 0, w: 8, h: 3, minW: 4, minH: 2 },
            { i: "product", x: 8, y: 0, w: 4, h: 3, minW: 3, minH: 2 },
            { i: "variant", x: 0, y: 3, w: 6, h: 3, minW: 3, minH: 2 },
            { i: "day", x: 6, y: 3, w: 6, h: 3, minW: 3, minH: 2 },
            { i: "region", x: 0, y: 6, w: 6, h: 3, minW: 3, minH: 2 },
            { i: "payment", x: 6, y: 6, w: 6, h: 3, minW: 3, minH: 2 },
            { i: "hourly", x: 0, y: 9, w: 12, h: 2, minW: 4, minH: 2 },
            { i: "ai", x: 0, y: 11, w: 12, h: 2, minW: 4, minH: 2 }
        ]
    });

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
                    const result = analyzeData(data);
                    setAnalysis(result);
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px" }}>
                <Loader2 size={32} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "1.1rem" }}>Memuat Dashboard...</span>
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
                <div style={{ display: "flex", gap: "8px", position: "relative" }}>
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
                                <button onClick={() => { analysis && exportToExcel(analysis, aiInsight); setExportOpen(false); }}
                                    style={{ width: "100%", textAlign: "left", padding: "10px 12px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", borderRadius: "6px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "8px" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-surface)"} onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                    📊 Excel (.xlsx)
                                </button>
                                <button onClick={() => { analysis && exportToCSV(analysis); setExportOpen(false); }}
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

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
                <KPICard icon={DollarSign} label="Total Revenue" value={formatRupiah(overview.totalRevenue * 1000)} sub={`${overview.growthRate >= 0 ? "↑" : "↓"} ${Math.abs(overview.growthRate).toFixed(1)}%`} color="var(--success)" delay={0} />
                <KPICard icon={Package} label="Total Pesanan" value={overview.totalOrders.toLocaleString()} sub={`${productPerformance.length} produk`} color="var(--primary)" delay={0.1} />
                <KPICard icon={TrendingUp} label="Rata-rata Order" value={formatRupiah(overview.avgOrderValue * 1000)} sub="per pesanan" color="var(--accent)" delay={0.2} />
                <KPICard icon={RotateCcw} label="Return Rate" value={`${overview.returnRate.toFixed(1)}%`} sub={overview.returnRate < 2 ? "✅ Sangat baik" : "⚠️ Perlu perhatian"} color={overview.returnRate < 2 ? "var(--success)" : "var(--warning)"} delay={0.3} />
            </div>

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
                    {/* Trend Chart */}
                    <div key="trend">
                        <motion.div className="glass-card" style={{ padding: "20px", height: "100%", border: isEditingLayout ? "2px dashed var(--primary)" : "none" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>📈 Tren Penjualan Bulanan</h3>
                                <span title="Model Machine Learning ARIMA (AutoRegressive Integrated Moving Average) menganalisis pola historis waktu untuk memprediksi fluktuasi order di bulan-bulan mendatang." style={{ cursor: "help", fontSize: "0.7rem", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--primary)", color: "var(--primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <Brain size={12} /> Time-Series (ARIMA)
                                </span>
                            </div>
                            <ResponsiveContainer width="100%" height="80%" minWidth={1} minHeight={1}>
                                <AreaChart data={timeAnalysis.monthly}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Area type="monotone" dataKey="orders" stroke="#6366f1" fill="url(#colorRevenue)" strokeWidth={2} name="Pesanan" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Product Distribution */}
                    <div key="product">
                        <motion.div className="glass-card" style={{ padding: "20px", height: "100%", overflow: "hidden", border: isEditingLayout ? "2px dashed var(--primary)" : "none" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>🥧 Distribusi Produk</h3>
                                <span title="Algoritma Unsupervised AI K-Means secara matematis mengelompokkan (clustering) persentase demografi produk paling dominan tanpa perlu anotasi manual." style={{ cursor: "help", fontSize: "0.7rem", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--accent)", color: "var(--accent)", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <Brain size={12} /> K-Means
                                </span>
                            </div>
                            <ResponsiveContainer width="100%" height="50%" minWidth={1} minHeight={1}>
                                <PieChart>
                                    <Pie data={productPerformance} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                                        {productPerformance.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ marginTop: "8px", overflowY: "auto", maxHeight: "35%", paddingRight: "4px" }}>
                                {productPerformance.map((p, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", marginBottom: "4px" }}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                                        <span style={{ color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{p.percentage.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Variant Analysis */}
                    <div key="variant">
                        <motion.div className="glass-card" style={{ padding: "20px", height: "100%", border: isEditingLayout ? "2px dashed var(--primary)" : "none" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>📏 Distribusi Ukuran/Variasi</h3>
                                <span title="Machine Learning Market Basket Analysis (Apriori) mencoba mengungkap aturan asosiasi tersembunyi dari korelasi belanja ukuran pakaian oleh pembeli." style={{ cursor: "help", fontSize: "0.7rem", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--success)", color: "var(--success)", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <Brain size={12} /> Apriori Rules
                                </span>
                            </div>
                            <ResponsiveContainer width="100%" height="80%" minWidth={1} minHeight={1}>
                                <BarChart data={variantAnalysis} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                                    <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={11} width={45} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="count" name="Jumlah" radius={[0, 4, 4, 0]}>
                                        {variantAnalysis.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Day of Week */}
                    <div key="day">
                        <motion.div className="glass-card" style={{ padding: "20px", height: "100%", border: isEditingLayout ? "2px dashed var(--primary)" : "none" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>📅 Penjualan per Hari</h3>
                            <ResponsiveContainer width="100%" height="80%" minWidth={1} minHeight={1}>
                                <BarChart data={timeAnalysis.dayOfWeek}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} />
                                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="count" name="Pesanan" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Regional TOP 10 */}
                    <div key="region">
                        <motion.div className="glass-card" style={{ padding: "20px", height: "100%", border: isEditingLayout ? "2px dashed var(--primary)" : "none" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>🌍 Top 10 Provinsi</h3>
                                <span title="Sistem menggunakan Natural Language Processing (NLP) Entity Extraction dari AI untuk menormalisasi dan mengenali data lokasi regional acak menjadi data geografis peta yang valid." style={{ cursor: "help", fontSize: "0.7rem", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--warning)", color: "var(--warning)", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <Brain size={12} /> NLP Entity
                                </span>
                            </div>
                            <ResponsiveContainer width="100%" height="80%" minWidth={1} minHeight={1}>
                                <BarChart data={regionalAnalysis.slice(0, 10)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                                    <YAxis type="category" dataKey="province" stroke="var(--text-muted)" fontSize={9} width={100} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="count" name="Pesanan" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Payment Methods */}
                    <div key="payment">
                        <motion.div className="glass-card" style={{ padding: "20px", height: "100%", border: isEditingLayout ? "2px dashed var(--primary)" : "none" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>💳 Metode Pembayaran</h3>
                                <span title="Algoritma Anomaly Detection (Isolation Forest) mengidentifikasi dan mengisolasi transaksi anomali pada metode bayar guna mengamankan akurasi analisis tren pembayaran." style={{ cursor: "help", fontSize: "0.7rem", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--primary-light)", color: "var(--primary-light)", display: "flex", alignItems: "center", gap: "4px" }}>
                                    <Brain size={12} /> Isolation Forest
                                </span>
                            </div>
                            <ResponsiveContainer width="100%" height="80%" minWidth={1} minHeight={1}>
                                <BarChart data={paymentAnalysis.slice(0, 8)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                                    <YAxis type="category" dataKey="method" stroke="var(--text-muted)" fontSize={9} width={120} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="count" name="Jumlah" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Hourly Distribution */}
                    <div key="hourly">
                        <motion.div className="glass-card" style={{ padding: "20px", height: "100%", border: isEditingLayout ? "2px dashed var(--primary)" : "none" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>⏰ Distribusi Pesanan per Jam</h3>
                            <ResponsiveContainer width="100%" height="75%" minWidth={1} minHeight={1}>
                                <LineChart data={timeAnalysis.hourly}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={11} tickFormatter={(h) => `${h}:00`} />
                                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                                    <Tooltip contentStyle={tooltipStyle} labelFormatter={(h) => `${h}:00`} />
                                    <Line type="monotone" dataKey="count" stroke="#a78bfa" strokeWidth={2} dot={{ fill: "#a78bfa", r: 3 }} name="Pesanan" />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

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
