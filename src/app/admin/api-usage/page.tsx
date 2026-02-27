"use client";

import { motion } from "framer-motion";
import { Activity, Zap, Clock, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const tooltipStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.8rem" };

const dailyUsage = [
    { day: "Mon", groq: 145, gemini: 23, template: 89 },
    { day: "Tue", groq: 198, gemini: 31, template: 56 },
    { day: "Wed", groq: 167, gemini: 18, template: 72 },
    { day: "Thu", groq: 212, gemini: 45, template: 34 },
    { day: "Fri", groq: 189, gemini: 28, template: 67 },
    { day: "Sat", groq: 98, gemini: 12, template: 45 },
    { day: "Sun", groq: 76, gemini: 8, template: 38 },
];

const hourlyLoad = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}:00`,
    requests: Math.floor(Math.random() * 50 + (h >= 9 && h <= 21 ? 30 : 5)),
}));

const endpointStats = [
    { endpoint: "/api/ai/narrate", calls: 1085, avgMs: 1200, errors: 12 },
    { endpoint: "/api/analysis/run", calls: 892, avgMs: 3400, errors: 5 },
    { endpoint: "/api/export/premium-pdf", calls: 234, avgMs: 5600, errors: 8 },
    { endpoint: "/api/auth/verify", calls: 2456, avgMs: 45, errors: 2 },
    { endpoint: "/api/files/upload", calls: 567, avgMs: 890, errors: 15 },
];

export default function AdminApiUsagePage() {
    const totalCalls = dailyUsage.reduce((s, d) => s + d.groq + d.gemini + d.template, 0);
    return (
        <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px" }}>
                <Activity size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--accent)" }} />
                API Usage Monitor
            </h1>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Total Calls (7d)", value: totalCalls.toLocaleString(), icon: Zap, color: "var(--primary)" },
                    { label: "Groq API", value: dailyUsage.reduce((s, d) => s + d.groq, 0).toString(), icon: Zap, color: "var(--success)" },
                    { label: "Avg Response", value: "1.2s", icon: Clock, color: "var(--accent)" },
                    { label: "Error Rate", value: "0.8%", icon: AlertTriangle, color: "var(--danger)" },
                ].map((s, i) => (
                    <motion.div key={i} className="glass-card" style={{ padding: "20px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "6px" }}>{s.label}</p>
                        <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>📊 AI Provider Usage (Weekly)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={dailyUsage}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="groq" name="Groq" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="gemini" name="Gemini" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="template" name="Template" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>⏱️ Hourly Load</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={hourlyLoad}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={10} interval={3} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>🔌 Endpoint Stats</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                            {["Endpoint", "Calls", "Avg Response", "Errors"].map((h) => (
                                <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {endpointStats.map((e, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: "0.82rem" }}>{e.endpoint}</td>
                                <td style={{ padding: "10px 12px", fontWeight: 700 }}>{e.calls.toLocaleString()}</td>
                                <td style={{ padding: "10px 12px" }}>{e.avgMs}ms</td>
                                <td style={{ padding: "10px 12px", color: e.errors > 10 ? "var(--danger)" : "var(--text-muted)" }}>{e.errors}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
