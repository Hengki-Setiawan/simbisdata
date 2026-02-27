"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Brain, Users, AlertTriangle, Award, Target,
    Loader2, Upload, ChevronRight, Activity
} from "lucide-react";
import Link from "next/link";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis,
} from "recharts";
import type { ClusterResult, AnomalyResult, ProductScore, RFMResult, CohortResult } from "@/lib/ml-algorithms";
import * as Comlink from "comlink";
import type { MLWorker } from "@/lib/workers/ml.worker";
import { db } from "@/lib/local-db";
import Scatter3D from "@/components/charts/Scatter3D";
import CohortHeatmap from "@/components/charts/CohortHeatmap";

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#6366f1", "#a78bfa", "#f472b6"];

const tooltipStyle = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "0.8rem",
};

export default function AnalysisPage() {
    const [loading, setLoading] = useState(true);
    const [rawData, setRawData] = useState<Record<string, unknown>[] | null>(null);
    const [clusters, setClusters] = useState<ClusterResult | null>(null);
    const [anomalies, setAnomalies] = useState<AnomalyResult | null>(null);
    const [productScores, setProductScores] = useState<ProductScore[] | null>(null);
    const [rfm, setRfm] = useState<RFMResult | null>(null);
    const [cohort, setCohort] = useState<CohortResult | null>(null);
    const [activeTab, setActiveTab] = useState<"cluster" | "anomaly" | "score" | "rfm" | "cohort">("cluster");

    useEffect(() => {
        const load = async () => {
            try {
                const data = await db.getAllData();
                if (data && data.length > 0) {
                    setRawData(data);

                    // Initialize background web worker
                    const workerInstance = new Worker(new URL("../../../lib/workers/ml.worker", import.meta.url));
                    const ml = Comlink.wrap<MLWorker>(workerInstance);

                    // Execute heavy calculations concurrently off main thread
                    const [c, a, p, r, coh] = await Promise.all([
                        ml.kMeansClustering(data, 3),
                        ml.detectAnomalies(data),
                        ml.calculateProductScores(data),
                        ml.rfmAnalysis(data),
                        ml.cohortAnalysis(data)
                    ]);

                    setClusters(c);
                    setAnomalies(a);
                    setProductScores(p);
                    setRfm(r);
                    setCohort(coh);
                }
            } catch { /* ignore */ }
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
            <Loader2 size={40} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
        </div>
    );

    if (!rawData) return (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <Brain size={64} style={{ color: "var(--text-muted)", marginBottom: "24px" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>Belum Ada Data</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>Upload data penjualan untuk melihat analisis ML.</p>
            <Link href="/dashboard/upload" className="btn-primary"><Upload size={18} /> Upload Data</Link>
        </div>
    );

    const tabs = [
        { id: "cluster" as const, label: "Segmentasi", icon: Users },
        { id: "anomaly" as const, label: "Anomali", icon: AlertTriangle },
        { id: "score" as const, label: "Skor Produk", icon: Award },
        { id: "rfm" as const, label: "RFM", icon: Target },
        { id: "cohort" as const, label: "Retensi", icon: Activity },
    ];

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
                    <Brain size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--primary)" }} />
                    Machine Learning Analysis
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Analisis lanjutan menggunakan algoritma ML — segmentasi, deteksi anomali, skor produk, dan RFM.
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            padding: "10px 20px", borderRadius: "var(--radius)", border: "1px solid var(--border-color)",
                            background: activeTab === tab.id ? "rgba(99, 102, 241, 0.15)" : "var(--bg-card)",
                            color: activeTab === tab.id ? "var(--primary-light)" : "var(--text-muted)",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 600,
                            transition: "all 0.2s ease",
                        }}>
                            <Icon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Cluster Tab */}
            {activeTab === "cluster" && clusters && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        <div className="glass-card" style={{ padding: "24px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>👥 Distribusi Segmen</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={clusters.clusters} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                                        {clusters.clusters.map((c, i) => <Cell key={i} fill={c.color || COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ marginTop: "12px" }}>
                                {clusters.clusters.map((c, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", marginBottom: "6px" }}>
                                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }} />
                                        <span style={{ flex: 1, color: "var(--text-secondary)" }}>{c.label}</span>
                                        <span style={{ fontWeight: 700 }}>{c.count} customer</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: "24px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>📊 Rata-rata per Segmen</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={clusters.clusters}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="avgSpending" name="Avg Spending" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Anomaly Tab */}
            {activeTab === "anomaly" && anomalies && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                                ⚠️ {anomalies.anomalies.length} Anomali Terdeteksi
                            </h3>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                dari {anomalies.totalChecked} pesanan | threshold: Rp {(anomalies.threshold * 1000).toLocaleString("id-ID")}
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="index" name="Order #" stroke="var(--text-muted)" fontSize={11} />
                                <YAxis dataKey="value" name="Value" stroke="var(--text-muted)" fontSize={11} />
                                <ZAxis dataKey="score" range={[30, 200]} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Scatter data={anomalies.anomalies} fill="#ef4444" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="glass-card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>Detail Anomali</h3>
                        {anomalies.anomalies.slice(0, 10).map((a, i) => (
                            <div key={i} style={{
                                display: "flex", justifyContent: "space-between", padding: "10px 0",
                                borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem",
                            }}>
                                <span style={{ color: "var(--text-secondary)", flex: 1 }}>{a.product}</span>
                                <span style={{ fontWeight: 700, marginRight: "16px" }}>Rp {(a.value * 1000).toLocaleString("id-ID")}</span>
                                <span style={{ color: "var(--danger)", fontSize: "0.8rem" }}>Z-score: {a.score.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Product Score Tab */}
            {activeTab === "score" && productScores && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="glass-card" style={{ padding: "24px" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>🏆 Product Performance Score</h3>
                        {productScores.map((p, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: "16px", padding: "14px 0",
                                borderBottom: "1px solid var(--border-color)",
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "0.85rem", fontWeight: 800,
                                    background: p.grade === "A" ? "rgba(16,185,129,0.2)" : p.grade === "B" ? "rgba(99,102,241,0.2)" : "rgba(245,158,11,0.2)",
                                    color: p.grade === "A" ? "#10b981" : p.grade === "B" ? "#6366f1" : "#f59e0b",
                                }}>
                                    {p.grade}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "6px" }}>{p.name}</p>
                                    <div style={{ display: "flex", gap: "4px", height: "6px" }}>
                                        <div style={{ flex: p.volumeScore, background: "#6366f1", borderRadius: "3px" }} title={`Volume: ${p.volumeScore.toFixed(0)}`} />
                                        <div style={{ flex: p.revenueScore, background: "#10b981", borderRadius: "3px" }} title={`Revenue: ${p.revenueScore.toFixed(0)}`} />
                                        <div style={{ flex: p.consistencyScore, background: "#f59e0b", borderRadius: "3px" }} title={`Consistency: ${p.consistencyScore.toFixed(0)}`} />
                                    </div>
                                </div>
                                <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>{p.score.toFixed(0)}</span>
                            </div>
                        ))}
                        <div style={{ display: "flex", gap: "16px", marginTop: "16px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            <span>🟣 Volume</span> <span>🟢 Revenue</span> <span>🟡 Consistency</span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* RFM Tab */}
            {activeTab === "rfm" && rfm && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        <div className="glass-card" style={{ padding: "24px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>🎯 Distribusi Segmen RFM</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={rfm.summary} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                                    <YAxis type="category" dataKey="segment" stroke="var(--text-muted)" fontSize={10} width={120} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="count" name="Customer" radius={[0, 6, 6, 0]}>
                                        {rfm.summary.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="glass-card" style={{ padding: "24px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>📋 Detail Segmen</h3>
                            {rfm.summary.map((s, i) => (
                                <div key={i} style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    padding: "10px 0", borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                                        <span style={{ color: "var(--text-secondary)" }}>{s.segment}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <span style={{ fontWeight: 700 }}>{s.count}</span>
                                        <span style={{ color: "var(--text-muted)" }}>{s.percentage.toFixed(1)}%</span>
                                        <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Cohort Tab */}
            {activeTab === "cohort" && cohort && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="glass-card" style={{ padding: "24px", marginBottom: "16px", overflowX: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                                📅 Retensi Pelanggan dari Waktu ke Waktu (Cohort Heatmap)
                            </h3>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "12px" }}>
                                {cohort.cohorts.length} Cohort
                            </span>
                        </div>
                        <CohortHeatmap data={cohort} />
                    </div>
                </motion.div>
            )}

            {/* Cohort Tab */}
            {activeTab === "cohort" && cohort && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="glass-card" style={{ padding: "24px", marginBottom: "16px", overflowX: "auto" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                                📅 Retensi Pelanggan dari Waktu ke Waktu (Cohort Heatmap)
                            </h3>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "12px" }}>
                                {cohort.cohorts.length} Cohort
                            </span>
                        </div>
                        <CohortHeatmap data={cohort} />
                    </div>
                </motion.div>
            )}
        </div>
    );
}
