"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const TYPE_STYLES: Record<string, { border: string; bg: string; iconBg: string }> = {
    success: { border: "rgba(16,185,129,0.3)", bg: "rgba(16,185,129,0.05)", iconBg: "rgba(16,185,129,0.12)" },
    warning: { border: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.05)", iconBg: "rgba(245,158,11,0.12)" },
    info: { border: "rgba(99,102,241,0.3)", bg: "rgba(99,102,241,0.05)", iconBg: "rgba(99,102,241,0.12)" },
    action: { border: "rgba(168,85,247,0.3)", bg: "rgba(168,85,247,0.05)", iconBg: "rgba(168,85,247,0.12)" },
};

interface InsightCardProps {
    type: "success" | "warning" | "info" | "action";
    icon: string;
    title: string;
    summary: string;
    details?: string;
    actions?: { label: string; href?: string; onClick?: () => void }[];
    chart?: React.ReactNode;
    delay?: number;
}

export default function InsightCard({ type, icon, title, summary, details, actions, chart, delay = 0 }: InsightCardProps) {
    const [expanded, setExpanded] = useState(false);
    const style = TYPE_STYLES[type] || TYPE_STYLES.info;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            style={{
                padding: "20px", borderRadius: "14px", marginBottom: "12px",
                border: `1px solid ${style.border}`, background: style.bg,
            }}
        >
            <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <div style={{
                    width: 42, height: 42, borderRadius: "12px", background: style.iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0,
                }}>
                    {icon}
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>{title}</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>{summary}</p>

                    {details && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            style={{
                                background: "none", border: "none", color: "var(--primary)", fontSize: "0.8rem",
                                cursor: "pointer", padding: "6px 0", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600,
                            }}
                        >
                            {expanded ? "Tutup" : "Baca selengkapnya"}
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    )}

                    {expanded && details && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.7, marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--border-color)" }}>
                            {details}
                        </motion.div>
                    )}

                    {chart && <div style={{ marginTop: "12px" }}>{chart}</div>}

                    {actions && actions.length > 0 && (
                        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                            {actions.map((a, i) => (
                                a.href ? (
                                    <a key={i} href={a.href} style={{
                                        padding: "6px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600,
                                        background: "var(--primary)", color: "white", textDecoration: "none",
                                    }}>{a.label}</a>
                                ) : (
                                    <button key={i} onClick={a.onClick} style={{
                                        padding: "6px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600,
                                        background: "var(--bg-surface)", border: "1px solid var(--border-color)", color: "var(--text-secondary)", cursor: "pointer",
                                    }}>{a.label}</button>
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
