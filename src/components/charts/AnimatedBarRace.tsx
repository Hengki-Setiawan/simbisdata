"use client";

import { useEffect, useState, useMemo } from "react";
import { ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import type { ChartRecommendation } from "@/lib/ai-viz-recommender";

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#a78bfa", "#f472b6", "#34d399", "#8b5cf6", "#ec4899"];

interface Props {
    rec: ChartRecommendation;
    data: any[];
}

export function AnimatedBarRace({ rec, data }: Props) {
    const { xField, categoryField, yField } = rec; // xField = Date/Timeline, categoryField = Name, yField = Value
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    // Grouping data by timeline (xField)
    const timeSeriesData = useMemo(() => {
        if (!xField || !categoryField || !yField) return [];

        const grouped = new Map<string, Record<string, number>>();
        const allCategories = new Set<string>();

        // Sort data chronologically if xField is a date
        const sortedData = [...data].sort((a, b) => new Date(a[xField]).getTime() - new Date(b[xField]).getTime());

        // Accumulator to keep values cumulative or strictly snapshot (assuming snapshot per period)
        sortedData.forEach(row => {
            let timeKey = String(row[xField]).split('T')[0]; // Simple formatting
            const cat = String(row[categoryField]);
            const val = Number(row[yField]) || 0;

            allCategories.add(cat);
            if (!grouped.has(timeKey)) grouped.set(timeKey, {});
            grouped.get(timeKey)![cat] = (grouped.get(timeKey)![cat] || 0) + val;
        });

        const timelineKeys = Array.from(grouped.keys());

        // Build final frames, sorting top 10 categories per frame
        return timelineKeys.map(time => {
            const frameCats = grouped.get(time)!;
            const sortedCats = Array.from(allCategories).map(cat => ({
                name: cat,
                value: frameCats[cat] || 0
            })).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10

            return { time, data: sortedCats };
        });
    }, [data, rec]);

    useEffect(() => {
        if (!isPlaying || timeSeriesData.length === 0) return;

        const interval = setInterval(() => {
            setCurrentStep(prev => (prev >= timeSeriesData.length - 1 ? 0 : prev + 1));
            // Stop at end
            if (currentStep >= timeSeriesData.length - 2) setIsPlaying(false);
        }, 1500); // 1.5s per frame

        return () => clearInterval(interval);
    }, [isPlaying, timeSeriesData, currentStep]);

    if (timeSeriesData.length === 0) return <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>Data tidak cocok untuk Bar Race (butuh Tanggal, Kategori, Angka).</div>;

    const currentFrame = timeSeriesData[currentStep];
    const maxValInFrame = Math.max(...currentFrame.data.map(d => d.value), 1);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `Rp${(num / 1000000).toFixed(1)}jt`;
        if (num >= 1000) return `Rp${(num / 1000).toFixed(0)}K`;
        return num.toLocaleString();
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", flexDirection: "column", padding: "10px" }}>
            {/* Header / Controls */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, opacity: 0.5 }}>{currentFrame.time}</h3>
                <button
                    onClick={() => {
                        if (currentStep >= timeSeriesData.length - 1) setCurrentStep(0);
                        setIsPlaying(!isPlaying);
                    }}
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "4px 12px", borderRadius: "16px", cursor: "pointer", fontSize: "0.8rem", color: "var(--text-primary)" }}
                >
                    {isPlaying ? "⏸ Pause" : "▶️ Play"}
                </button>
            </div>

            {/* Bars */}
            <div style={{ position: "relative", flex: 1 }}>
                <AnimatePresence>
                    {currentFrame.data.map((item, index) => {
                        if (item.value === 0) return null;
                        const widthPct = (item.value / maxValInFrame) * 100;

                        // Hash string to color
                        const colorHash = Array.from(item.name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const color = COLORS[colorHash % COLORS.length];

                        return (
                            <motion.div
                                key={item.name}
                                initial={false}
                                animate={{
                                    y: index * 32, // Vertical position based on rank
                                    width: `${Math.max(widthPct, 5)}%` // min 5% width
                                }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                style={{
                                    position: "absolute",
                                    height: "26px",
                                    left: 0,
                                    background: color,
                                    borderRadius: "0 4px 4px 0",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "0 8px",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                }}
                            >
                                <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.75rem", whiteSpace: "nowrap", textShadow: "0 1px 2px rgba(0,0,0,0.4)", zIndex: 10 }}>
                                    {item.name}
                                </span>
                                <motion.span
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ position: "absolute", right: "-4px", transform: "translateX(100%)", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}
                                >
                                    {formatNumber(item.value)}
                                </motion.span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
