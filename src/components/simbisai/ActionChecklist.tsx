"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Check } from "lucide-react";

interface ActionItem {
    task: string;
    urgency: "high" | "medium" | "low";
    reason?: string;
}

const URGENCY_COLORS: Record<string, string> = {
    high: "var(--error)", medium: "var(--warning)", low: "var(--success)",
};
const URGENCY_LABELS: Record<string, string> = {
    high: "Mendesak", medium: "Penting", low: "Opsional",
};

export default function ActionChecklist({ items }: { items: ActionItem[] }) {
    const [checked, setChecked] = useState<Set<number>>(new Set());

    const toggle = (i: number) => {
        const next = new Set(checked);
        if (next.has(i)) next.delete(i); else next.add(i);
        setChecked(next);
    };

    if (!items.length) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ padding: "20px 24px", borderRadius: "14px", border: "1px solid rgba(168,85,247,0.2)", background: "rgba(168,85,247,0.04)", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <Zap size={20} style={{ color: "var(--primary)" }} />
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Aksi yang Direkomendasikan AI</h3>
                <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "100px", background: "rgba(99,102,241,0.12)", color: "var(--primary)", fontWeight: 600 }}>
                    {checked.size}/{items.length} selesai
                </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {items.map((item, i) => (
                    <div key={i} onClick={() => toggle(i)} style={{
                        display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 14px",
                        borderRadius: "10px", background: checked.has(i) ? "rgba(16,185,129,0.06)" : "var(--bg-surface)",
                        border: `1px solid ${checked.has(i) ? "rgba(16,185,129,0.2)" : "var(--border-color)"}`,
                        cursor: "pointer", transition: "all 0.2s",
                        textDecoration: checked.has(i) ? "line-through" : "none",
                        opacity: checked.has(i) ? 0.6 : 1,
                    }}>
                        <div style={{
                            width: 22, height: 22, borderRadius: "6px", flexShrink: 0, marginTop: "1px",
                            border: `2px solid ${checked.has(i) ? "var(--success)" : "var(--border-color)"}`,
                            background: checked.has(i) ? "var(--success)" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            {checked.has(i) && <Check size={14} style={{ color: "white" }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--text-primary)" }}>{item.task}</p>
                            {item.reason && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "3px" }}>{item.reason}</p>}
                        </div>
                        <span style={{
                            fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: "100px",
                            color: URGENCY_COLORS[item.urgency], background: `${URGENCY_COLORS[item.urgency]}15`,
                        }}>
                            {URGENCY_LABELS[item.urgency]}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
