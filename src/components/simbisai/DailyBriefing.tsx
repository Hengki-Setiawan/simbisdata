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

export default function DailyBriefing({
    data,
    userName,
    fileName,
    processedDate
}: {
    data: AnalysisResult | null;
    userName?: string;
    fileName?: string;
    processedDate?: Date;
}) {
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
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                            Kondisi bisnismu saat ini:{" "}
                            <span style={{ color: health.color, fontWeight: 700 }}>
                                {health.emoji} {health.label}
                            </span>
                        </p>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "100px" }}>
                            {data.overview.dateRange.start} — {data.overview.dateRange.end}
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        {fileName && (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", border: "1px solid var(--border-color)", padding: "2px 8px", borderRadius: "6px" }}>
                                📄 {fileName}
                            </span>
                        )}
                        {processedDate && (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", border: "1px solid var(--border-color)", padding: "2px 8px", borderRadius: "6px" }}>
                                🕒 Diproses {processedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "2px 8px", borderRadius: "6px", fontWeight: 600 }}>
                            🤖 SimbisAI ML Engine Aktif
                        </span>
                    </div>
                </div>
            ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Upload data penjualanmu untuk mendapatkan analisis AI.
                </p>
            )}
        </motion.div>
    );
}
