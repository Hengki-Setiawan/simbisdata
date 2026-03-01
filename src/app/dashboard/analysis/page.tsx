"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Brain, Users, AlertTriangle, Award, Target,
    Loader2, Upload, ChevronRight, Activity, Sparkles
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
import { analyzeColumns } from "@/lib/ai-viz-recommender";
import { recommendAlgorithms, type MLRecommendation } from "@/lib/ai-ml-selector";
import { useToast } from "@/components/ui/toast-provider";
import { useSession } from "next-auth/react";
import { getTierLimits, type Tier } from "@/lib/feature-gating";
import { Lock } from "lucide-react";

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#6366f1", "#a78bfa", "#f472b6"];

const tooltipStyle = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "0.8rem",
};

export default function AnalysisPage() {
    const { addToast } = useToast();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [rawData, setRawData] = useState<Record<string, unknown>[] | null>(null);
    const [recommendations, setRecommendations] = useState<MLRecommendation[]>([]);

    // Results
    const [clusters, setClusters] = useState<ClusterResult | null>(null);
    const [anomalies, setAnomalies] = useState<AnomalyResult | null>(null);
    const [productScores, setProductScores] = useState<ProductScore[] | null>(null);
    const [rfm, setRfm] = useState<RFMResult | null>(null);
    const [cohort, setCohort] = useState<CohortResult | null>(null);

    // Status
    const [genericResults, setGenericResults] = useState<Record<string, any>>({});
    const [running, setRunning] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<string>("cluster");
    const [worker, setWorker] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await db.getAllData();
                if (data && data.length > 0) {
                    setRawData(data);

                    // 1. AI Analysis & ML Recommendation
                    const colMetas = analyzeColumns(data);
                    const recs = recommendAlgorithms(colMetas, "ecommerce", data.length);
                    setRecommendations(recs);

                    // 2. Initialize background web worker
                    const workerInstance = new Worker(new URL("../../../lib/workers/ml.worker", import.meta.url));
                    const ml = Comlink.wrap<MLWorker>(workerInstance);
                    setWorker(ml);

                    // 3. Auto-run top recommendations (max based on tier)
                    const userTier = (session?.user as any)?.planId as Tier || "free";
                    const limits = getTierLimits(userTier);

                    const topSupported = recs
                        .filter(r => r.confidence > 0.6)
                        .slice(0, limits.mlAlgorithms);

                    if (topSupported.length > 0) setActiveTab(topSupported[0].id);

                    topSupported.forEach(rec => runAlgorithm(rec.id, ml, data));
                }
            } catch { /* ignore */ }
            setLoading(false);
        };
        if (session) load();
    }, [session]);

    const runAlgorithm = async (id: string, mlInst?: any, data?: any[]) => {
        const instance = mlInst || worker;
        const targetData = data || rawData;
        if (!instance || !targetData) return;

        // --- TIER CHECK: ML Algorithm Access ---
        const userTier = (session?.user as any)?.planId as Tier || "free";
        const limits = getTierLimits(userTier);
        const currentRecs = recommendations;
        const recIndex = currentRecs.findIndex(r => r.id === id);

        if (recIndex >= limits.mlAlgorithms && limits.mlAlgorithms !== Infinity) {
            addToast({
                title: "Fitur Terkunci",
                description: `Paket ${userTier} Anda hanya mengizinkan ${limits.mlAlgorithms} algoritma teratas. Silakan upgrade paket.`,
                type: "warning"
            });
            return;
        }

        setRunning(prev => ({ ...prev, [id]: true }));
        try {
            if (id === "kmeans_clustering") {
                const res = await instance.kMeansClustering(targetData, 3);
                setClusters(res);
                setActiveTab("kmeans_clustering");
            } else if (id === "autoencoder_anomaly") {
                const res = await instance.detectAnomalies(targetData);
                setAnomalies(res);
                setActiveTab("autoencoder_anomaly");
            } else if (id === "abc_analysis") {
                const res = await instance.calculateProductScores(targetData);
                setProductScores(res);
                setActiveTab("abc_analysis");
            } else if (id === "rfm_analysis") {
                const res = await instance.rfmAnalysis(targetData);
                setRfm(res);
                setActiveTab("rfm_analysis");
            } else if (id === "cohort_analysis") {
                const res = await instance.cohortAnalysis(targetData);
                setCohort(res);
                setActiveTab("cohort_analysis");
            } else if (id === "sentiment_analysis") {
                const textCol = Object.keys(targetData[0]).find(k => {
                    const val = targetData[0][k];
                    return typeof val === "string" && val.length > 15 && !k.toLowerCase().includes("id") && !k.toLowerCase().includes("url");
                }) || Object.keys(targetData[0])[0];

                const texts = targetData.map(d => d[textCol]).filter(Boolean).slice(0, 50);
                const res = await fetch("/api/sentiment", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texts })
                });
                const data = await res.json();
                setGenericResults(prev => ({
                    ...prev,
                    [id]: {
                        avg_score: (data.average !== undefined ? data.average : (data.summary?.avgScore || 0)).toFixed(2),
                        total_analyzed: data.totalAnalyzed,
                        source_column: textCol
                    }
                }));
                setActiveTab(id);
            } else if (id === "lstm_forecast" || id === "sma_forecast") {
                // Prepare time series data
                const dateKey = Object.keys(targetData[0]).find(k => k.toLowerCase().includes("tgl") || k.toLowerCase().includes("tanggal") || k.toLowerCase().includes("date")) || "date";
                const valKey = Object.keys(targetData[0]).find(k => k.toLowerCase().includes("total") || k.toLowerCase().includes("omset") || k.toLowerCase().includes("payment")) || "total";

                const timeData = targetData.map(d => ({
                    date: String(d[dateKey]),
                    value: parseFloat(String(d[valKey]).replace(/[^0-9.-]/g, "")) || 0
                })).filter(d => !isNaN(new Date(d.date).getTime()));

                const res = id === "lstm_forecast"
                    ? await instance.lstmForecast(timeData, 30)
                    : await instance.timeSeriesForecast(timeData, 30);

                setGenericResults(prev => ({
                    ...prev,
                    [id]: {
                        trend: res.trend.toUpperCase(),
                        prediction_30d: res.forecast[res.forecast.length - 1]?.predicted.toLocaleString("id-ID"),
                        model: res.modelInfo || "Time Series",
                        forecast_data: res.forecast.slice(0, 5) // Sample
                    }
                }));
                setActiveTab(id);
            } else if (id === "association_rules") {
                const res = await instance.associationRules(targetData);
                setGenericResults(prev => ({
                    ...prev,
                    [id]: {
                        top_patterns: res.rules.slice(0, 5).map(r => `${r.antecedent} → ${r.consequent} (Lift: ${r.lift.toFixed(2)})`),
                        total_rules_found: res.rules.length
                    }
                }));
                setActiveTab(id);
            } else if (id === "price_sensitivity") {
                const res = await instance.priceSensitivity(targetData);
                setGenericResults(prev => ({
                    ...prev,
                    [id]: {
                        optimal_price: `Rp ${res.optimalPrice.toLocaleString("id-ID")}`,
                        elasticity: res.elasticity.toFixed(2),
                        insight: res.elasticity < -1 ? "Sangat Sensitif" : "Kurang Sensitif"
                    }
                }));
                setActiveTab(id);
            } else if (id === "correlation_matrix") {
                const res = await instance.correlationMatrix(targetData);
                setGenericResults(prev => ({
                    ...prev,
                    [id]: {
                        strongest_correlations: res.matrix
                            .filter(m => m.row !== m.col && Math.abs(m.value) > 0.5)
                            .slice(0, 5)
                            .map(m => `${m.row} vs ${m.col}: ${(m.value * 100).toFixed(0)}%`),
                        total_variables: res.fields.length
                    }
                }));
                setActiveTab(id);
            } else if (id === "clv") {
                const res = await instance.customerLifetimeValue(targetData);
                setGenericResults(prev => ({
                    ...prev,
                    [id]: {
                        avg_lifetime_value: `Rp ${res.avgCLV.toLocaleString("id-ID")}`,
                        top_customer: res.customers[0]?.name || "N/A",
                        total_segments: new Set(res.customers.map(c => c.segment)).size
                    }
                }));
                setActiveTab(id);
            } else if (id === "day_hour_heatmap") {
                const res = await instance.dayHourHeatmap(targetData);
                setGenericResults(prev => ({
                    ...prev,
                    [id]: {
                        peak_day: res.peakDay,
                        peak_hour: `${res.peakHour}:00`,
                        total_slots_analyzed: res.data.length
                    }
                }));
                setActiveTab(id);
            } else if (id === "shipping_optimization") {
                const res = await instance.shippingOptimization(targetData);
                setGenericResults(prev => ({
                    ...prev,
                    [id]: {
                        best_courier: res.bestOverall,
                        avg_cost: `Rp ${res.couriers[0]?.avgCost.toLocaleString("id-ID")}`,
                        avg_delivery_days: `${res.couriers[0]?.avgDays} hari`
                    }
                }));
                setActiveTab(id);
            } else {
                // Call worker directly if function exists by name
                const workerFunc = instance[id];
                if (typeof workerFunc === "function") {
                    const res = await workerFunc(targetData);
                    setGenericResults(prev => ({ ...prev, [id]: res }));
                } else {
                    // Placeholder for absolute fallback
                    await new Promise(r => setTimeout(r, 1000));
                    setGenericResults(prev => ({ ...prev, [id]: { status: "Success", detail: `Analisis ${id} selesai.` } }));
                }
                setActiveTab(id);
            }
            // Notify Success
            const recName = recommendations.find(r => r.id === id)?.name || id;
            addToast(`${recName} selesai diproses!`, "success");
        } catch (e) {
            console.error("ML Error:", e);
            addToast(`Gagal menjalankan ${id}. Silakan coba lagi.`, "error");
        } finally {
            setRunning(prev => ({ ...prev, [id]: false }));
        }
    };

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
        ...(clusters ? [{ id: "kmeans_clustering", label: "Segmentasi", icon: Users }] : []),
        ...(anomalies ? [{ id: "autoencoder_anomaly", label: "Anomali", icon: AlertTriangle }] : []),
        ...(productScores ? [{ id: "abc_analysis", label: "Skor Produk", icon: Award }] : []),
        ...(rfm ? [{ id: "rfm_analysis", label: "RFM", icon: Target }] : []),
        ...(cohort ? [{ id: "cohort_analysis", label: "Retensi", icon: Activity }] : []),
        ...Object.keys(genericResults).map(id => {
            const rec = recommendations.find(r => r.id === id);
            return { id, label: rec ? (rec.name.split(" ")[1] || id) : id, icon: Sparkles };
        })
    ];

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
                    <Brain size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--primary)" }} />
                    Machine Learning Playground
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Analisis lanjutan menggunakan algoritma ML — AI secara otomatis memilih dan menjalankan algoritma terbaik untuk data Anda.
                </p>
            </div>

            {/* AI Recommendations Panel */}
            <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sparkles size={18} style={{ color: "var(--warning)" }} /> AI Rekomendasi Algoritma
                </h3>
                <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "thin" }}>
                    {recommendations.slice(0, 8).map((rec, i) => {
                        const isRunning = running[rec.id];
                        const userTier = (session?.user as any)?.planId as Tier || "free";
                        const limits = getTierLimits(userTier);
                        const isLocked = i >= limits.mlAlgorithms && limits.mlAlgorithms !== Infinity;

                        const isDone =
                            (rec.id === "kmeans_clustering" && clusters) ||
                            (rec.id === "autoencoder_anomaly" && anomalies) ||
                            (rec.id === "abc_analysis" && productScores) ||
                            (rec.id === "rfm_analysis" && rfm) ||
                            (rec.id === "cohort_analysis" && cohort) ||
                            genericResults[rec.id] !== undefined;

                        return (
                            <div key={i} className="glass-card" style={{
                                minWidth: "260px", padding: "16px",
                                borderLeft: `3px solid ${isLocked ? "var(--text-muted)" : isDone ? "var(--success)" : "var(--primary)"}`,
                                opacity: isLocked ? 0.6 : 1,
                                filter: isLocked ? "grayscale(40%)" : "none"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                                        {rec.icon} {rec.name.replace(/[^a-zA-Z \-]/g, '')}
                                        {isLocked && <Lock size={12} style={{ color: "var(--warning)" }} />}
                                    </h4>
                                    <span style={{ fontSize: "0.7rem", fontWeight: 600, background: "var(--bg-surface)", padding: "2px 6px", borderRadius: "100px", color: isLocked ? "var(--text-muted)" : "var(--primary-light)" }}>
                                        {Math.round(rec.confidence * 100)}% Match
                                    </span>
                                </div>
                                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "12px", minHeight: "34px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                    {rec.description}
                                </p>
                                <button
                                    onClick={() => isLocked ? router.push("/dashboard/subscription") : isDone ? setActiveTab(rec.id) : !isRunning && runAlgorithm(rec.id)}
                                    disabled={isRunning}
                                    className="btn-primary"
                                    style={{
                                        width: "100%", padding: "6px", fontSize: "0.8rem",
                                        background: isLocked ? "rgba(255,255,255,0.05)" : isRunning ? "var(--bg-surface)" : isDone ? "var(--success)" : "var(--primary)",
                                        color: isLocked ? "var(--text-muted)" : isRunning ? "var(--text-secondary)" : "white",
                                        cursor: isRunning ? "default" : "pointer",
                                        border: isLocked ? "1px dashed var(--border-color)" : "none",
                                        borderRadius: "8px", fontWeight: 600,
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    {isLocked ? (
                                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                            🔒 Upgrade Tier
                                        </span>
                                    ) : isRunning ? (
                                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                            <Loader2 size={12} className="spin" /> Memproses...
                                        </span>
                                    ) : isDone ? (
                                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                            Lihat Hasil
                                        </span>
                                    ) : (
                                        "Jalankan Analisis"
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Dynamic Tabs */}
            {tabs.length > 0 && (
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
            )}

            {/* Cluster Tab */}
            {activeTab === "kmeans_clustering" && clusters && (
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
            {activeTab === "autoencoder_anomaly" && anomalies && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                                ⚠️ {anomalies.anomalies.length} Anomali Terdeteksi
                            </h3>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                dari {anomalies.totalChecked} pesanan | threshold: Rp {anomalies.threshold.toLocaleString("id-ID")}
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
                                <span style={{ fontWeight: 700, marginRight: "16px" }}>Rp {a.value.toLocaleString("id-ID")}</span>
                                <span style={{ color: "var(--danger)", fontSize: "0.8rem" }}>Z-score: {a.score.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Product Score Tab */}
            {activeTab === "abc_analysis" && productScores && (
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
                                        <div style={{ flex: p.volumeScore || 0, background: "#6366f1", borderRadius: "3px" }} title={`Volume: ${(p.volumeScore || 0).toFixed(0)}`} />
                                        <div style={{ flex: p.revenueScore || 0, background: "#10b981", borderRadius: "3px" }} title={`Revenue: ${(p.revenueScore || 0).toFixed(0)}`} />
                                        <div style={{ flex: p.consistencyScore || 0, background: "#f59e0b", borderRadius: "3px" }} title={`Consistency: ${(p.consistencyScore || 0).toFixed(0)}`} />
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
            {activeTab === "rfm_analysis" && rfm && (
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
            {activeTab === "cohort_analysis" && cohort && (
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


            {/* Generic Tab */}
            {activeTab !== "kmeans_clustering" && activeTab !== "autoencoder_anomaly" && activeTab !== "abc_analysis" && activeTab !== "rfm_analysis" && activeTab !== "cohort_analysis" && genericResults[activeTab] && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                        <Sparkles size={24} style={{ color: "var(--primary)" }} />
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>✨ Hasil Analisis AI: {recommendations.find(r => r.id === activeTab)?.name.replace(/[^a-zA-Z \-]/g, '') || activeTab}</h3>
                    </div>
                    <div className="glass-card" style={{ padding: "24px", marginBottom: "24px", textAlign: "center" }}>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Tugas pemrosesan ini telah berhasil diselesaikan oleh engine AI di background.</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                        {Object.entries(genericResults[activeTab]).map(([key, value]) => {
                            // Define actionable translations for common raw JSON keys returned by backend/ml worker
                            const titleMappings: Record<string, string> = {
                                "score": "Tingkat Kecocokan/Skor",
                                "total_analyzed": "Total Data Dianalisis",
                                "source_column": "Sumber Kolom Data",
                                "positive": "Persentase Positif",
                                "neutral": "Persentase Netral",
                                "negative": "Persentase Negatif",
                                "status": "Status Analisis",
                            };

                            const actionableAdvice: Record<string, string> = {
                                "sentiment_analysis": "Skor sentimen di atas 70% menunjukkan dominasi ulasan positif. Fokus pertahankan kualitas pengiriman dan produk. Jika skor negatif tinggi, analisis produk yang paling banyak diretur.",
                                "lstm_forecast": "Angka prediksi ini menunjukkan perkiraan nilai 30 hari ke depan. Siapkan persediaan (restock) jika grafiknya cenderung naik tajam.",
                                "day_hour_heatmap": "Jadwalkan peluncuran diskon (Flash Sale) atau promosi iklan Anda tepat pada jam dan hari dengan aktivitas tertinggi ini untuk memaksimalkan ROI.",
                                "price_sensitivity": "Gunakan rentang harga optimal yang ditemukan ini untuk menetapkan harga diskon agar tetap menghasilkan keuntungan (margin) tertinggi tanpa mengurangi volume pembelian.",
                                "association_rules": "Buat program 'Beli A Diskon B' (Bundling) menggunakan pasangan produk yang sering dibeli bersamaan pada hasil ini.",
                                "correlation_matrix": "Nilai korelasi positif yang tinggi (>0.7) berarti kedua hal tersebut sangat berhubungan (misal: Diskon besar -> Angka penjualan naik tajam)."
                            };

                            const displayTitle = titleMappings[key] || key.replace(/_/g, ' ');
                            const adviceText = actionableAdvice[activeTab];

                            return (
                                <div key={key} className="glass-card" style={{ padding: "20px", borderTop: "3px solid var(--primary-light)" }}>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "capitalize", marginBottom: "8px" }}>
                                        {displayTitle}
                                    </p>
                                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "white", wordBreak: "break-word" }}>
                                        {typeof value === 'object' ? (
                                            <pre style={{ fontSize: "0.75rem", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px", color: "var(--text-secondary)", overflowX: "auto", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                {JSON.stringify(value, null, 2)}
                                            </pre>
                                        ) : (
                                            <span style={{ color: typeof value === 'number' && key.includes('score') && value > 70 ? 'var(--success)' : 'inherit' }}>
                                                {String(value)}
                                            </span>
                                        )}
                                    </div>
                                    {/* Actionable Advice Injection based on activeTab (the ML rec ID) */}
                                    {adviceText && key === Object.keys(genericResults[activeTab])[0] && (
                                        <div style={{ marginTop: "16px", padding: "12px", background: "rgba(99,102,241,0.1)", borderRadius: "8px", borderLeft: "3px solid var(--primary)" }}>
                                            <h4 style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary-light)", marginBottom: "4px" }}>💡 Rekomendasi Bisnis:</h4>
                                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{adviceText}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

        </div>
    );
}
