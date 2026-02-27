"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Headphones, MessageSquare, Clock, CheckCircle2, AlertCircle, User } from "lucide-react";

const mockTickets = [
    { id: "TKT-001", user: "Ahmad Rizky", email: "ahmad@test.com", subject: "Upload file error", message: "Saya tidak bisa upload file Excel. Muncul error 'Format tidak didukung' padahal file .xlsx.", status: "open", priority: "high", date: "2024-06-10 14:32" },
    { id: "TKT-002", user: "Siti Nurbaya", email: "siti@test.com", subject: "AI narration tidak muncul", message: "Setelah analisis selesai, bagian AI insight kosong. Sudah coba refresh tapi tetap sama.", status: "in_progress", priority: "medium", date: "2024-06-09 10:15" },
    { id: "TKT-003", user: "Budi Santoso", email: "budi@test.com", subject: "Request cancel subscription", message: "Saya ingin cancel langganan Pro dan kembali ke Free tier. Bagaimana caranya?", status: "resolved", priority: "low", date: "2024-06-08 09:20" },
    { id: "TKT-004", user: "Dewi Lestari", email: "dewi@test.com", subject: "Export PDF kosong", message: "File PDF yang dihasilkan hanya 1 halaman kosong. Browser Chrome terbaru.", status: "open", priority: "high", date: "2024-06-07 16:45" },
    { id: "TKT-005", user: "Rudi Hermawan", email: "rudi@test.com", subject: "Feature request: compare 3 periode", message: "Apakah bisa dibuat compare lebih dari 2 periode sekaligus? Sangat berguna untuk melihat tren quartal.", status: "open", priority: "low", date: "2024-06-06 11:30" },
];

const statusColors: Record<string, string> = { open: "#ef4444", in_progress: "#f59e0b", resolved: "#10b981" };
const statusLabels: Record<string, string> = { open: "Open", in_progress: "In Progress", resolved: "Resolved" };
const prioColors: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#64748b" };

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState(mockTickets);
    const [filter, setFilter] = useState("all");
    const [selected, setSelected] = useState<string | null>(null);

    const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

    const updateStatus = (id: string, status: string) => {
        setTickets(tickets.map((t) => t.id === id ? { ...t, status } : t));
    };

    return (
        <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
                <Headphones size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--danger)" }} />
                Support Tickets
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>Kelola tiket bantuan dari user</p>

            {/* KPI */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Open", count: tickets.filter((t) => t.status === "open").length, color: "#ef4444" },
                    { label: "In Progress", count: tickets.filter((t) => t.status === "in_progress").length, color: "#f59e0b" },
                    { label: "Resolved", count: tickets.filter((t) => t.status === "resolved").length, color: "#10b981" },
                ].map((s, i) => (
                    <motion.div key={i} className="glass-card" style={{ padding: "20px", cursor: "pointer", borderLeft: `4px solid ${s.color}` }} onClick={() => setFilter(s.label.toLowerCase().replace(" ", "_"))} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{s.label}</p>
                        <p style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.count}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filter */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {["all", "open", "in_progress", "resolved"].map((f) => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: "6px 16px", borderRadius: "100px", fontSize: "0.8rem", fontWeight: 600,
                        background: filter === f ? "var(--primary)" : "var(--bg-surface)", color: filter === f ? "white" : "var(--text-muted)",
                        border: filter === f ? "none" : "1px solid var(--border-color)", cursor: "pointer",
                    }}>{f === "all" ? "All" : statusLabels[f] || f}</button>
                ))}
            </div>

            {/* Ticket List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filtered.map((t, i) => (
                    <motion.div key={t.id} className="glass-card" style={{ padding: "20px 24px", cursor: "pointer", borderLeft: `3px solid ${statusColors[t.status]}` }} onClick={() => setSelected(selected === t.id ? null : t.id)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700 }}>{t.id}</span>
                                    <span style={{ padding: "2px 8px", borderRadius: "100px", fontSize: "0.68rem", fontWeight: 700, background: `${statusColors[t.status]}22`, color: statusColors[t.status] }}>{statusLabels[t.status]}</span>
                                    <span style={{ padding: "2px 8px", borderRadius: "100px", fontSize: "0.68rem", fontWeight: 700, background: `${prioColors[t.priority]}22`, color: prioColors[t.priority] }}>{t.priority}</span>
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{t.subject}</h3>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}><User size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {t.user} · {t.date}</span>
                            </div>
                        </div>

                        {selected === t.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
                                <div style={{ background: "var(--bg-surface)", padding: "14px", borderRadius: "8px", marginBottom: "12px" }}>
                                    <p style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "6px" }}><MessageSquare size={12} /> Pesan dari {t.user}:</p>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>{t.message}</p>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    {t.status !== "in_progress" && <button onClick={(e) => { e.stopPropagation(); updateStatus(t.id, "in_progress"); }} style={{ padding: "6px 14px", fontSize: "0.78rem", background: "rgba(245,158,11,0.15)", color: "var(--warning)", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> In Progress</button>}
                                    {t.status !== "resolved" && <button onClick={(e) => { e.stopPropagation(); updateStatus(t.id, "resolved"); }} style={{ padding: "6px 14px", fontSize: "0.78rem", background: "rgba(16,185,129,0.15)", color: "var(--success)", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={12} /> Resolve</button>}
                                    <button style={{ padding: "6px 14px", fontSize: "0.78rem", background: "rgba(99,102,241,0.15)", color: "var(--primary)", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><AlertCircle size={12} /> Reply</button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
