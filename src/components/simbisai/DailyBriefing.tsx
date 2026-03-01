"use client";

import { motion } from "framer-motion";
import { Sun, Moon, Sunrise, Sparkles } from "lucide-react";
import type { AnalysisResult } from "@/lib/analysis";

function getGreeting(): { text: string; icon: React.ReactNode } {
    const hour = new Date().getHours();
    if (hour < 11) return { text: "Selamat pagi", icon: <Sunrise size={24} style={{ color: "var(--warning)" }} /> };
    if (hour < 15) return { text: "Selamat siang", icon: <Sun size={24} style={{ color: "var(--warning)" }} /> };
    if (hour < 18) return { text: "Selamat sore", icon: <Sunrise size={24} style={{ color: "var(--accent)" }} /> };
    return { text: "Selamat malam", icon: <Moon size={24} style={{ color: "var(--primary)" }} /> };
}

function getHealthStatus(analysis: AnalysisResult): { label: string; color: string; emoji: string } {
    const { growthRate, returnRate } = analysis.overview;
    if (growthRate > 10 && returnRate < 3) return { label: "BAIK", color: "var(--success)", emoji: "✅" };
    if (growthRate < -10 || returnRate > 5) return { label: "PERLU PERHATIAN", color: "var(--warning)", emoji: "⚠️" };
    return { label: "STABIL", color: "var(--primary)", emoji: "📊" };
}

export default function DailyBriefing({ data, userName }: { data: AnalysisResult | null; userName?: string }) {
    const greeting = getGreeting();
    const health = data ? getHealthStatus(data) : null;
    const name = userName || "Seller";

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{
                padding: "24px 28px", marginBottom: "24px", borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.06))",
                border: "1px solid rgba(99,102,241,0.15)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                {greeting.icon}
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>
                    {greeting.text}, {name}!
                </h2>
                <Sparkles size={18} style={{ color: "var(--primary)", opacity: 0.6 }} />
            </div>

            {data && health ? (
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                        Kondisi bisnismu saat ini:{" "}
                        <span style={{ color: health.color, fontWeight: 700 }}>
                            {health.emoji} {health.label}
                        </span>
                    </p>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {data.overview.dateRange.start} — {data.overview.dateRange.end}
                    </span>
                </div>
            ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Upload data penjualanmu untuk mendapatkan analisis AI.
                </p>
            )}
        </motion.div>
    );
}
