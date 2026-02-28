"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Info, Settings2, Sparkles, ChevronDown, Loader2 } from "lucide-react";
import type { ChartRecommendation } from "@/lib/ai-viz-recommender";
import { DynamicChartRenderer } from "./DynamicChartRenderer";

interface SmartChartCardProps {
    rec: ChartRecommendation;
    data: any[];
    delay?: number;
}

export function SmartChartCard({ rec, data, delay = 0 }: SmartChartCardProps) {
    const [showInsight, setShowInsight] = useState(false);
    const [insightText, setInsightText] = useState<string | null>(null);
    const [loadingInsight, setLoadingInsight] = useState(false);

    useEffect(() => {
        if (showInsight && !insightText && !loadingInsight) {
            const fetchInsight = async () => {
                setLoadingInsight(true);
                try {
                    // Summarize data to save tokens
                    const maxItems = 10;
                    const sampleData = data.slice(0, maxItems).map(d => {
                        const { id, ...rest } = d;
                        return Object.values(rest).join(" | ");
                    }).join("\n");

                    const prompt = `Analisis chart tipe "${rec.type}" berjudul "${rec.title}". 
Alasan awal direkomendasikan: ${rec.reason}. 
Data (Top ${maxItems}):\n${sampleData}\n`;

                    const res = await fetch("/api/ai/narrate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ prompt, type: "chart" })
                    });
                    const resData = await res.json();
                    if (resData.narrative) {
                        setInsightText(resData.narrative);
                    } else {
                        setInsightText("Gagal memuat insight. Silakan coba lagi nanti.");
                    }
                } catch {
                    setInsightText("⚠️ Terjadi kesalahan koneksi saat memuat insight.");
                } finally {
                    setLoadingInsight(false);
                }
            };
            fetchInsight();
        }
    }, [showInsight, insightText, loadingInsight, rec, data]);

    return (
        <motion.div
            className="glass-card"
            style={{ padding: "20px", height: "100%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
        >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", zIndex: 2 }}>
                <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                        {rec.title}
                        {rec.confidence > 0.8 && <Sparkles size={14} style={{ color: "var(--warning)" }} />}
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{rec.description}</p>
                </div>

                {/* AI Reason Badge */}
                <div
                    title={rec.reason}
                    style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        padding: "3px 8px", borderRadius: "100px", cursor: "help",
                        background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                        fontSize: "0.7rem", color: "var(--primary)", fontWeight: 600
                    }}
                >
                    <Brain size={12} /> AI Pick {(rec.confidence * 100).toFixed(0)}%
                </div>
            </div>

            {/* Chart Area */}
            <div style={{ flex: 1, position: "relative", minHeight: "220px", zIndex: 1 }}>
                <DynamicChartRenderer rec={rec} data={data} />
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", zIndex: 2, borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                <button
                    onClick={() => setShowInsight(!showInsight)}
                    style={{
                        background: showInsight ? "rgba(99,102,241,0.1)" : "transparent",
                        border: showInsight ? "1px solid var(--primary-light)" : "1px dashed var(--border-color)",
                        padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600,
                        color: showInsight ? "var(--primary)" : "var(--text-secondary)",
                        display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", transition: "all 0.2s"
                    }}
                >
                    <Brain size={14} /> Insight AI
                    <ChevronDown size={14} style={{ transform: showInsight ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }} />
                </button>

                <button
                    style={{
                        background: "transparent", border: "none", color: "var(--text-muted)",
                        cursor: "pointer", display: "flex", alignItems: "center", padding: "4px"
                    }}
                    title="Setting visualisasi"
                >
                    <Settings2 size={16} />
                </button>
            </div>

            {/* Collapsible Insight Panel */}
            <AnimatePresence>
                {showInsight && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden", zIndex: 2 }}
                    >
                        <div style={{
                            marginTop: "12px", padding: "16px", borderRadius: "8px",
                            background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                            fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6,
                            borderLeft: "3px solid var(--primary)"
                        }}>
                            {loadingInsight ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}>
                                    <Loader2 size={16} className="spin" style={{ color: "var(--primary)" }} />
                                    AI sedang menganalisis pola chart ini...
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontWeight: 700, color: "var(--text-primary)" }}>
                                        <Sparkles size={16} style={{ color: "var(--warning)" }} /> AI Insight
                                    </div>
                                    {insightText ? (
                                        insightText.split('\n').map((line, i) => {
                                            const parts = line.split(/(\*\*.*?\*\*)/g);
                                            return line.trim() ? (
                                                <p key={i} style={{ marginBottom: "6px" }}>
                                                    {parts.map((p, j) =>
                                                        p.startsWith('**') && p.endsWith('**') ?
                                                            <strong key={j}>{p.slice(2, -2)}</strong> :
                                                            p
                                                    )}
                                                </p>
                                            ) : <div key={i} style={{ height: "4px" }} />;
                                        })
                                    ) : (
                                        <span style={{ color: "var(--text-muted)" }}>Insight belum tersedia.</span>
                                    )}
                                    <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px dashed var(--border-color)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                        🎯 Rekomendasi awal: {rec.reason}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
