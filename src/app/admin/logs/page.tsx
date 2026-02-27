"use client";

import { motion } from "framer-motion";
import { ScrollText, Filter, Clock } from "lucide-react";
import { useState } from "react";

const mockLogs = [
    { id: "1", time: "2026-02-26 22:45:12", user: "ahmad@email.com", action: "LOGIN", details: "Login berhasil via credentials", level: "info" },
    { id: "2", time: "2026-02-26 22:40:05", user: "siti@email.com", action: "UPGRADE", details: "Upgrade dari Starter ke Pro", level: "info" },
    { id: "3", time: "2026-02-26 22:35:18", user: "budi@email.com", action: "UPLOAD", details: "Upload file: data_penjualan.xlsx (2.3MB, 1200 rows)", level: "info" },
    { id: "4", time: "2026-02-26 22:30:22", user: "dewi@email.com", action: "AI_NARRATE", details: "Generate AI narasi (Groq, 1.2s)", level: "info" },
    { id: "5", time: "2026-02-26 22:25:44", user: "eko@email.com", action: "EXPORT", details: "Premium PDF export via Browserless.io", level: "info" },
    { id: "6", time: "2026-02-26 22:20:11", user: "system", action: "ERROR", details: "Groq API rate limit exceeded, fallback to Gemini", level: "warning" },
    { id: "7", time: "2026-02-26 22:15:33", user: "fiona@email.com", action: "REGISTER", details: "New user registration (Free tier)", level: "info" },
    { id: "8", time: "2026-02-26 22:10:08", user: "system", action: "ERROR", details: "Browserless.io timeout (15s), fallback to jsPDF", level: "error" },
    { id: "9", time: "2026-02-26 22:05:55", user: "gerry@email.com", action: "ANALYSIS", details: "ML analysis complete: K-Means, RFM, Anomaly (3.4s)", level: "info" },
    { id: "10", time: "2026-02-26 22:00:19", user: "admin@simbisdata.com", action: "CONFIG", details: "Updated feature flags: enable cohort analysis", level: "info" },
    { id: "11", time: "2026-02-26 21:55:02", user: "hana@email.com", action: "PAYMENT", details: "Midtrans payment confirmed (Pro, Rp79.000)", level: "info" },
    { id: "12", time: "2026-02-26 21:50:41", user: "system", action: "CRON", details: "Daily backup completed (DB: 45MB)", level: "info" },
];

const levelColors: Record<string, { bg: string; color: string }> = {
    info: { bg: "rgba(99,102,241,0.12)", color: "#6366f1" },
    warning: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    error: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
};

export default function AdminLogsPage() {
    const [filter, setFilter] = useState("all");
    const filtered = filter === "all" ? mockLogs : mockLogs.filter((l) => l.level === filter);

    return (
        <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px" }}>
                <ScrollText size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--primary)" }} />
                Activity Logs
            </h1>

            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                <Filter size={16} style={{ color: "var(--text-muted)", marginTop: "10px" }} />
                {["all", "info", "warning", "error"].map((f) => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: "8px 16px", borderRadius: "var(--radius)", border: "1px solid var(--border-color)",
                        background: filter === f ? "rgba(99,102,241,0.15)" : "var(--bg-card)",
                        color: filter === f ? "var(--primary-light)" : "var(--text-muted)",
                        cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, textTransform: "capitalize",
                    }}>{f}</button>
                ))}
            </div>

            <motion.div className="glass-card" style={{ padding: "0", overflow: "hidden" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {filtered.map((log, i) => {
                    const lc = levelColors[log.level] || levelColors.info;
                    return (
                        <div key={log.id} style={{
                            padding: "14px 20px", borderBottom: "1px solid var(--border-color)",
                            display: "flex", gap: "16px", alignItems: "flex-start",
                            opacity: 1 - i * 0.03,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.78rem", minWidth: "150px", flexShrink: 0 }}>
                                <Clock size={12} /> {log.time.split(" ")[1]}
                            </div>
                            <span style={{
                                padding: "2px 10px", borderRadius: "4px", fontSize: "0.72rem", fontWeight: 700,
                                background: lc.bg, color: lc.color, minWidth: "60px", textAlign: "center", flexShrink: 0,
                            }}>{log.level.toUpperCase()}</span>
                            <span style={{ fontWeight: 600, fontSize: "0.82rem", minWidth: "100px", color: "var(--text-secondary)", flexShrink: 0 }}>{log.action}</span>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{log.details}</span>
                                <span style={{ marginLeft: "8px", fontSize: "0.75rem", color: "var(--text-muted)" }}>— {log.user}</span>
                            </div>
                        </div>
                    );
                })}
            </motion.div>
        </div>
    );
}
