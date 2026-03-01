"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Brain, Loader2, FileDown, Sparkles, FileText } from "lucide-react";
import Link from "next/link";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar,
} from "recharts";
import { analyzeData, type AnalysisResult } from "@/lib/analysis";
import { generatePDFReport } from "@/lib/pdf-export";
import { exportToExcel } from "@/lib/excel-export";
import { db } from "@/lib/local-db";
import DailyBriefing from "@/components/SimbisData/DailyBriefing";
import InsightCard from "@/components/SimbisData/InsightCard";
import ActionChecklist from "@/components/SimbisData/ActionChecklist";
import MetricSnapshot from "@/components/SimbisData/MetricSnapshot";
import type { ConsultantResult } from "@/lib/ai-consultant";

export default function DashboardPage() {
    const [data, setData] = useState<Record<string, unknown>[]>([]);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [aiResult, setAiResult] = useState<ConsultantResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [fileName, setFileName] = useState<string>("Data Berhasil Diproses");
    const [uploadDate, setUploadDate] = useState<Date>(new Date());

    // Load data from IndexedDB
    useEffect(() => {
        (async () => {
            try {
                const records = await db.salesData.toArray();
                if (records.length > 0) {
                    // Try to get metadata from local-db (files table)
                    try {
                        const files = await db.files.orderBy("uploadedAt").reverse().toArray();
                        if (files.length > 0) {
                            setFileName(files[0].name);
                            setUploadDate(new Date(files[0].uploadedAt));
                        }
                    } catch (e) {
                        // gracefully ignore if files store not found or empty
                    }

                    const parsed = records.map((r) => r.data);
                    setData(parsed);
                    const result = analyzeData(parsed);
                    setAnalysis(result);
                }
            } catch (e) {
                console.error("Load error:", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Auto-generate AI insights when analysis is ready
    useEffect(() => {
        if (!analysis || aiResult) return;
        (async () => {
            setAiLoading(true);
            try {
                const res = await fetch("/api/ai/consultant", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        mlSummary: {
                            totalRevenue: analysis.overview.totalRevenue,
                            totalOrders: analysis.overview.totalOrders,
                            avgOrderValue: analysis.overview.avgOrderValue,
                            growthRate: analysis.overview.growthRate,
                            returnRate: analysis.overview.returnRate,
                            topProducts: analysis.productPerformance?.slice(0, 5),
                            monthlySales: analysis.timeAnalysis?.monthly?.slice(-6),
                            dateRange: analysis.overview.dateRange,
                        },
                        // Penambahan instruksi untuk AI
                        contextPuzzler: "Please provide a much richer, detailed, and actionable business explanation for the landing page dashboard. Identify at least 3 concrete strategies the seller can do right now to increase revenue using the data provided. Use encouraging, professional tone."
                    }),
                });
                if (res.ok) setAiResult(await res.json());
            } catch (e) {
                console.error("AI consult error:", e);
            } finally {
                setAiLoading(false);
            }
        })();
    }, [analysis, aiResult]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
        );
    }

    // Empty state — no data uploaded yet
    if (!data.length || !analysis) {
        return (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Sparkles size={48} style={{ color: "var(--primary)", marginBottom: "16px" }} />
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "8px" }}>
                        Selamat datang di SimbisData!
                    </h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "24px", maxWidth: "500px", margin: "0 auto 24px" }}>
                        Upload data penjualan dari Shopee, Tokopedia, atau TikTok Shop untuk mendapatkan saran bisnis dari AI.
                    </p>
                    <Link href="/dashboard/upload" style={{
                        display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px",
                        borderRadius: "12px", background: "var(--primary)", color: "white", textDecoration: "none",
                        fontWeight: 600, fontSize: "0.95rem",
                    }}>
                        <Upload size={18} /> Upload Data Pertamamu
                    </Link>
                </motion.div>
            </div>
        );
    }

    const { overview, timeAnalysis, productPerformance } = analysis;

    return (
        <div style={{ maxWidth: "900px" }}>
            {/* Daily Briefing */}
            <DailyBriefing data={analysis} userName={undefined} fileName={fileName} processedDate={uploadDate} />

            {/* Metric Snapshot */}
            <MetricSnapshot
                totalRevenue={overview.totalRevenue}
                totalOrders={overview.totalOrders}
                avgOrderValue={overview.avgOrderValue}
                returnRate={overview.returnRate}
                growthRate={overview.growthRate}
                productCount={productPerformance?.length || 0}
            />

            {/* AI Insights Feed */}
            {aiLoading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ padding: "32px", textAlign: "center", borderRadius: "14px", border: "1px solid var(--border-color)", marginBottom: "16px" }}>
                    <Brain size={28} className="animate-spin" style={{ color: "var(--primary)", marginBottom: "8px" }} />
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>🧠 SimbisData sedang menganalisis data bisnismu...</p>
                </motion.div>
            ) : aiResult ? (
                <>
                    {aiResult.insights.sort((a, b) => a.priority - b.priority).map((insight, i) => (
                        <InsightCard
                            key={i} delay={i * 0.1}
                            type={insight.type} icon={insight.icon}
                            title={insight.title} summary={insight.summary}
                            details={insight.details}
                            mlBadge={insight.mlUsed}
                        />
                    ))}

                    <ActionChecklist items={aiResult.actionItems} />

                    {aiResult.risks.length > 0 && aiResult.risks.map((risk, i) => (
                        <InsightCard
                            key={`risk-${i}`} delay={0.6 + i * 0.1}
                            type="warning" icon="⚠️"
                            title={risk.title} summary={risk.mitigation}
                        />
                    ))}
                </>
            ) : null}

            {/* Processed Data Table Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                style={{ marginTop: "32px", marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(99,102,241,0.1)", color: "var(--primary)" }}>
                        <FileDown size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>Tabel Data Terproses</h3>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Preview 5 baris pertama dari total {analysis.overview.totalOrders} data.</p>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                            <thead style={{ background: "rgba(255,255,255,0.03)" }}>
                                <tr>
                                    {Object.keys(data[0] || {}).slice(0, 6).map((col, idx) => (
                                        <th key={idx} style={{
                                            padding: "12px 16px", textAlign: "left", color: "var(--text-muted)",
                                            fontWeight: 600, borderBottom: "1px solid var(--border-color)", whiteSpace: "nowrap"
                                        }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, 5).map((row, rowIdx) => (
                                    <tr key={rowIdx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                        {Object.keys(data[0] || {}).slice(0, 6).map((col, colIdx) => (
                                            <td key={colIdx} style={{
                                                padding: "10px 16px", color: "var(--text-secondary)",
                                                maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                            }}>
                                                {String(row[col] ?? "-")}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: "12px 16px", background: "rgba(0,0,0,0.1)", borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
                        <Link href="/dashboard/data-studio" style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                            Buka Data Studio untuk kelola data lengkap →
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Supporting Charts (simplified — only 2) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "16px", marginTop: "16px" }}>
                {/* Trend Chart */}
                {timeAnalysis?.monthly && timeAnalysis.monthly.length > 0 && (
                    <motion.div className="glass-card" style={{ padding: "20px" }}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px" }}>📈 Tren Penjualan</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={timeAnalysis.monthly}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: any) => `${(v / 1000000).toFixed(0)}jt`} />
                                <Tooltip formatter={(v: any) => [`Rp${v.toLocaleString()}`, "Revenue"]} />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#colorRev)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Top Products */}
                {productPerformance && productPerformance.length > 0 && (
                    <motion.div className="glass-card" style={{ padding: "20px" }}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                        <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "16px" }}>🏆 Produk Terlaris</h4>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={productPerformance.slice(0, 5)} layout="vertical">
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                                <Tooltip formatter={(v: any) => [v.toLocaleString(), "Qty"]} />
                                <Bar dataKey="count" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}
            </div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap" }}>
                <Link href="/dashboard/upload" style={{
                    padding: "10px 18px", borderRadius: "10px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                    color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px",
                }}>
                    <Upload size={14} /> Upload Data Baru
                </Link>
                <Link href="/dashboard/analysis" style={{
                    padding: "10px 18px", borderRadius: "10px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                    color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px",
                }}>
                    <Brain size={14} /> Lihat Analisis Detail
                </Link>
                <div style={{ position: "relative" }}>
                    <button onClick={() => setExportOpen(!exportOpen)} style={{
                        padding: "10px 18px", borderRadius: "10px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                        color: "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                    }}>
                        <FileDown size={14} /> Export
                    </button>
                    {exportOpen && (
                        <div style={{
                            position: "absolute", bottom: "110%", left: 0, background: "var(--bg-card)", border: "1px solid var(--border-color)",
                            borderRadius: "10px", padding: "8px", minWidth: "140px", zIndex: 10,
                        }}>
                            {[
                                { label: "PDF", fn: () => generatePDFReport(analysis) },
                                { label: "Excel", fn: () => exportToExcel(data, analysis) },
                            ].map((item) => (
                                <button key={item.label} onClick={() => { item.fn(); setExportOpen(false); }} style={{
                                    display: "block", width: "100%", padding: "8px 12px", background: "none", border: "none",
                                    color: "var(--text-secondary)", fontSize: "0.8rem", cursor: "pointer", textAlign: "left", borderRadius: "6px",
                                }}>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
