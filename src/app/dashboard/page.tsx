"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Brain, Loader2, FileDown, Sparkles, DollarSign, ShoppingCart, TrendingUp, Award, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell,
} from "recharts";
import { db } from "@/lib/local-db";
import { runPipeline, type PipelineResult } from "@/lib/pipeline-engine";
import { ComparisonKPI } from "@/components/dashboard/ComparisonKPI";
import HealthBadge from "@/components/dashboard/HealthBadge";
import { ProcessingProgress } from "@/components/dashboard/ProcessingProgress";

const CHART_COLORS = ["#4f46e5", "#0d9488", "#f59e0b", "#ef4444", "#a78bfa", "#f472b6"];

export default function DashboardPage() {
    const [data, setData] = useState<Record<string, unknown>[]>([]);
    const [pipeline, setPipeline] = useState<PipelineResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [progressSteps, setProgressSteps] = useState<{ label: string; status: "done" | "running" | "pending"; duration?: string }[]>([]);
    const [progressPct, setProgressPct] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const records = await db.salesData.toArray();
            if (records.length > 0) {
                const parsed = records.map(r => r.data);
                setData(parsed);
                await runPipelineProcess(parsed);
            }
        } catch { /* ignore */ }
        setLoading(false);
    };

    const runPipelineProcess = async (rows: Record<string, unknown>[]) => {
        setProcessing(true);
        const steps = [
            { label: "Membaca data...", status: "running" as const },
            { label: "Menganalisis pola", status: "pending" as const },
            { label: "Menjalankan algoritma ML", status: "pending" as const },
            { label: "Menghitung metrik bisnis", status: "pending" as const },
            { label: "Menyiapkan dashboard", status: "pending" as const },
        ];
        setProgressSteps(steps);

        const result = await runPipeline(rows, "auto", (stage, pct) => {
            setProgressPct(pct);
            setProgressSteps(prev => prev.map((s, i) => ({
                ...s,
                status: pct > (i + 1) * 20 ? "done" : pct > i * 20 ? "running" : "pending",
            })));
        });

        setPipeline(result);
        setProcessing(false);
    };

    // Derived data for charts
    const metrics = pipeline?.metrics;
    const topProducts = pipeline?.features.productProfiles.slice(0, 6) || [];
    const temporal = pipeline?.features.temporalProfile;
    const crossInsights = pipeline?.mlResults.crossInsights || [];
    const totalRevenue = metrics?.overview?.totalRevenue || 0;
    const totalOrders = metrics?.overview?.totalOrders || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // AI Synthesis data
    const aiHealth = pipeline?.aiSynthesis?.health || null;
    const aiInsights = pipeline?.aiSynthesis?.insights || null;
    // const aiNarratives = pipeline?.aiSynthesis?.narratives || null;

    // Show processing overlay
    if (processing) {
        return <ProcessingProgress steps={progressSteps} percentage={progressPct} />;
    }

    // Empty state
    if (!loading && data.length === 0) {
        return (
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                minHeight: "70vh", textAlign: "center", padding: "40px",
            }}>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div style={{
                        width: "80px", height: "80px", borderRadius: "20px",
                        background: "var(--primary-surface)", margin: "0 auto 24px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Upload size={32} style={{ color: "var(--primary)" }} />
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-heading)", marginBottom: "8px" }}>
                        Mulai Analisis Data
                    </h2>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto 24px", lineHeight: 1.6 }}>
                        Upload file CSV/XLSX dari Shopee, Tokopedia, atau TikTok Shop untuk mendapatkan insight bisnis dari AI.
                    </p>
                    <Link href="/dashboard/upload" style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        padding: "12px 28px", borderRadius: "12px",
                        background: "var(--gradient-primary)", color: "#fff",
                        fontSize: "0.9rem", fontWeight: 600, textDecoration: "none",
                        boxShadow: "var(--shadow-md)",
                    }}>
                        <Upload size={18} /> Upload Data Sekarang
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="animate-pulse-soft" style={{ maxWidth: "1200px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
                    <div>
                        <div className="skeleton" style={{ width: "240px", height: "32px", marginBottom: "12px", borderRadius: "8px" }} />
                        <div className="skeleton" style={{ width: "400px", height: "16px", borderRadius: "4px" }} />
                    </div>
                </div>
                
                <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton" style={{ flex: 1, height: "120px", borderRadius: "20px" }} />
                    ))}
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
                    <div className="skeleton" style={{ height: "400px", borderRadius: "24px" }} />
                    <div className="skeleton" style={{ height: "400px", borderRadius: "24px" }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "1200px" }}>
            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-heading)", marginBottom: "4px" }}>
                    Dashboard Bisnis
                </h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {pipeline ? `${pipeline.ingestion.rowCount.toLocaleString()} baris data • Diproses dalam ${(pipeline.processingDuration / 1000).toFixed(1)}s` : "Memuat..."}
                </p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                <ComparisonKPI data={{
                    label: "Total Revenue", value: `Rp ${(totalRevenue / 1000000).toFixed(1)}jt`,
                    icon: <DollarSign size={18} />, iconColor: "var(--success)",
                    delta: temporal?.trendSlope ? temporal.trendSlope * 100 : 0, deltaLabel: "vs tren",
                }} />
                <ComparisonKPI data={{
                    label: "Total Orders", value: totalOrders,
                    icon: <ShoppingCart size={18} />, iconColor: "var(--info)",
                    delta: 0, deltaLabel: "periode ini",
                }} />
                <ComparisonKPI data={{
                    label: "Avg Order Value", value: `Rp ${Math.round(avgOrderValue).toLocaleString('id-ID')}`,
                    icon: <TrendingUp size={18} />, iconColor: "#f59e0b",
                }} />
                <ComparisonKPI data={{
                    label: "Data Quality", value: `${pipeline?.cleaning.qualityScore || 0}/100`,
                    icon: <Award size={18} />, iconColor: "var(--primary)",
                }} />
            </div>

            {/* AI Health Badge */}
            <div style={{ marginBottom: "28px" }}>
                <HealthBadge result={aiHealth} />
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
                {/* Top Products */}
                <div style={{
                    background: "var(--bg-card)", borderRadius: "16px", padding: "20px",
                    border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)",
                }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "16px" }}>
                        Produk Teratas
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={topProducts} layout="vertical" margin={{ left: 80, right: 10 }}>
                            <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v: number) => v >= 1000000 ? `${(v/1000000).toFixed(0)}jt` : v >= 1000 ? `${(v/1000).toFixed(0)}K` : String(v)} />
                            <YAxis type="category" dataKey="productName" stroke="var(--text-muted)" fontSize={10} width={75} tick={{ fill: "var(--text-secondary)" }} />
                            <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.8rem" }} />
                            <Bar dataKey="totalRevenue" radius={[0, 6, 6, 0]}>
                                {topProducts.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Temporal Insights */}
                <div style={{
                    background: "var(--bg-card)", borderRadius: "16px", padding: "20px",
                    border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)",
                }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "16px" }}>
                        Pola Temporal
                    </h3>
                    {temporal && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.82rem" }}>
                            {[
                                { label: "Hari Tersibuk", value: temporal.peakDayOfWeek, color: "var(--primary)" },
                                { label: "Bulan Puncak", value: temporal.peakMonth, color: "var(--accent)" },
                                { label: "Tren", value: temporal.trendDirection === 'up' ? '📈 Naik' : temporal.trendDirection === 'down' ? '📉 Turun' : '➡️ Stabil', color: "var(--text-primary)" },
                                { label: "Weekday vs Weekend", value: temporal.weekdayVsWeekend.weekday > temporal.weekdayVsWeekend.weekend ? 'Weekday dominan' : 'Weekend dominan', color: "var(--text-primary)" },
                            ].map((item, i) => (
                                <div key={i} style={{ background: "var(--bg-surface)", padding: "14px", borderRadius: "12px" }}>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "4px" }}>{item.label}</p>
                                    <p style={{ fontWeight: 700, color: item.color }}>{item.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Deep Extraction: Operational & FinancialInsights */}
            {((metrics?.shippingAnalysis && metrics.shippingAnalysis.length > 0) || (metrics?.paymentAnalysis && metrics.paymentAnalysis.length > 0) || metrics?.financialAnalysis) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "28px" }}>
                    
                    {/* Logistik & Kurir */}
                    {metrics?.shippingAnalysis && (
                        <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "20px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "16px" }}>Logistik Top</h3>
                            {metrics.shippingAnalysis.slice(0, 3).map((s, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.85rem" }}>
                                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{s.carrier === "Unknown" ? "Lainnya" : s.carrier}</span>
                                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>{s.count} trx ({Math.round(s.percentage)}%)</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pembayaran */}
                    {metrics?.paymentAnalysis && (
                        <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "20px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "16px" }}>Metode Pembayaran Top</h3>
                            {metrics.paymentAnalysis.slice(0, 3).map((p, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.85rem" }}>
                                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{p.method === "Unknown" ? "Lain-lain" : p.method}</span>
                                    <span style={{ color: "var(--info)", fontWeight: 600 }}>{Math.round(p.percentage)}%</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Finansial Ekstra */}
                    {metrics?.financialAnalysis && (
                        <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "20px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: "16px" }}>Dampak Finansial Tambahan</h3>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>Total Subsidi Diskon</span>
                                <span style={{ color: "var(--danger)", fontWeight: 700 }}>-Rp {(metrics.financialAnalysis.totalDiscount / 1000).toLocaleString('id-ID')}K</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>Avg. Ongkir per Trx</span>
                                <span style={{ color: "var(--warning)", fontWeight: 700 }}>Rp {Math.round(metrics.financialAnalysis.avgShippingCost).toLocaleString('id-ID')}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>Diskon Platform (Shopee)</span>
                                <span style={{ color: "var(--success)", fontWeight: 700 }}>+Rp {(metrics.financialAnalysis.platformDiscount / 1000).toLocaleString('id-ID')}K</span>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* Cross-Algorithm Insights */}
            {crossInsights.length > 0 && (
                <div style={{
                    background: "var(--bg-card)", borderRadius: "16px", padding: "20px",
                    border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)", marginBottom: "28px",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <Sparkles size={18} style={{ color: "var(--primary)" }} />
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)" }}>
                            AI Cross-Analysis Insights
                        </h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {crossInsights.map((insight, i) => (
                            <div key={i} style={{
                                padding: "12px 16px", borderRadius: "10px",
                                background: "var(--primary-surface, rgba(79, 70, 229, 0.06))",
                                fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: 1.6,
                                borderLeft: "3px solid var(--primary)",
                            }}>
                                {insight}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Action Items & Risks */}
            {aiInsights && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
                    {/* Action Checklist */}
                    <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "20px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-card)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                            <CheckCircle2 size={18} style={{ color: "var(--primary)" }} />
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)" }}>Recommended Actions</h3>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {aiInsights.actionItems?.map((action: any, i: number) => (
                                <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px", background: "var(--bg-main)", borderRadius: "12px" }}>
                                    <input type="checkbox" style={{ marginTop: "4px", accentColor: "var(--primary)" }} />
                                    <div>
                                        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{action.task}</p>
                                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{action.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risk Alerts */}
                    <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "20px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-card)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                            <AlertTriangle size={18} style={{ color: "var(--danger)" }} />
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)" }}>Risk Alerts</h3>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {aiInsights.risks?.map((risk: any, i: number) => (
                                <div key={i} style={{ padding: "12px", background: risk.severity === 'high' ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)', borderLeft: `3px solid ${risk.severity === 'high' ? 'var(--danger)' : 'var(--warning)'}`, borderRadius: "8px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: risk.severity === 'high' ? 'var(--danger)' : 'var(--warning)' }}>{risk.title}</p>
                                        <span style={{ fontSize: "0.65rem", padding: "2px 6px", borderRadius: "100px", background: risk.severity === 'high' ? 'var(--danger)' : 'var(--warning)', color: "#fff", textTransform: "uppercase" }}>{risk.severity} Risk</span>
                                    </div>
                                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{risk.impact}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                {[
                    { href: "/dashboard/analysis", icon: <Brain size={20} />, label: "ML Insights", desc: "Lihat semua algoritma" },
                    { href: "/dashboard/upload", icon: <Upload size={20} />, label: "Upload Baru", desc: "Perbarui data" },
                ].map((action, i) => (
                    <Link key={i} href={action.href} style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        padding: "16px 20px", borderRadius: "14px",
                        background: "var(--bg-card)", border: "1px solid var(--border-color)",
                        textDecoration: "none", color: "var(--text-primary)",
                        boxShadow: "var(--shadow-xs)", transition: "all 0.15s ease",
                    }}>
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "10px",
                            background: "var(--primary-surface)", display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--primary)",
                        }}>{action.icon}</div>
                        <div>
                            <p style={{ fontWeight: 600, fontSize: "0.88rem" }}>{action.label}</p>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{action.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
