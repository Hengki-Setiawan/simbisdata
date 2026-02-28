"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Headphones, MessageSquare, Clock, CheckCircle2, AlertCircle, User, Loader2 } from "lucide-react";

interface Ticket {
    id: number;
    userId: number;
    subject: string;
    message: string;
    status: string;
    priority: string;
    adminReply: string | null;
    createdAt: number;
    userName?: string;
    userEmail?: string;
}

const statusColors: Record<string, string> = { open: "#ef4444", in_progress: "#f59e0b", resolved: "#10b981" };
const statusLabels: Record<string, string> = { open: "Open", in_progress: "In Progress", resolved: "Resolved" };
const prioColors: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#64748b" };

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [selected, setSelected] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");

    useEffect(() => { fetchTickets(); }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch("/api/admin/support");
            if (res.ok) setTickets(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const updateStatus = async (id: number, status: string) => {
        await fetch("/api/admin/support", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        });
        setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
    };

    const sendReply = async (id: number) => {
        if (!replyText.trim()) return;
        await fetch("/api/admin/support", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, adminReply: replyText, status: "in_progress" }),
        });
        setTickets(tickets.map(t => t.id === id ? { ...t, adminReply: replyText, status: "in_progress" } : t));
        setReplyText("");
    };

    const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                    <Headphones size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--danger)" }} />
                    Support Tickets
                </h1>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-surface)", padding: "4px 12px", borderRadius: "100px", border: "1px solid var(--border-color)" }}>Live Data</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>Kelola tiket bantuan dari user</p>

            {/* KPI */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Open", count: tickets.filter(t => t.status === "open").length, color: "#ef4444" },
                    { label: "In Progress", count: tickets.filter(t => t.status === "in_progress").length, color: "#f59e0b" },
                    { label: "Resolved", count: tickets.filter(t => t.status === "resolved").length, color: "#10b981" },
                ].map((s, i) => (
                    <motion.div key={i} className="glass-card" style={{ padding: "20px", cursor: "pointer", borderLeft: `4px solid ${s.color}` }}
                        onClick={() => setFilter(s.label.toLowerCase().replace(" ", "_"))}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{s.label}</p>
                        <p style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.count}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filter */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {["all", "open", "in_progress", "resolved"].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: "6px 16px", borderRadius: "100px", fontSize: "0.8rem", fontWeight: 600,
                        background: filter === f ? "var(--primary)" : "var(--bg-surface)", color: filter === f ? "white" : "var(--text-muted)",
                        border: filter === f ? "none" : "1px solid var(--border-color)", cursor: "pointer",
                    }}>{f === "all" ? "All" : statusLabels[f] || f}</button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>🎉 Tidak ada tiket {filter !== "all" ? `dengan status "${statusLabels[filter]}"` : ""}. Semua beres!</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {filtered.map((t, i) => (
                        <motion.div key={t.id} className="glass-card" style={{ padding: "20px 24px", cursor: "pointer", borderLeft: `3px solid ${statusColors[t.status]}` }}
                            onClick={() => setSelected(selected === t.id ? null : t.id)}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700 }}>#{t.id}</span>
                                        <span style={{ padding: "2px 8px", borderRadius: "100px", fontSize: "0.68rem", fontWeight: 700, background: `${statusColors[t.status]}22`, color: statusColors[t.status] }}>{statusLabels[t.status]}</span>
                                        <span style={{ padding: "2px 8px", borderRadius: "100px", fontSize: "0.68rem", fontWeight: 700, background: `${prioColors[t.priority]}22`, color: prioColors[t.priority] }}>{t.priority}</span>
                                    </div>
                                    <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>{t.subject}</h3>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                                        <User size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {t.userName || `User #${t.userId}`} · {new Date(t.createdAt * 1000).toLocaleDateString("id-ID")}
                                    </span>
                                </div>
                            </div>

                            {selected === t.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
                                    <div style={{ background: "var(--bg-surface)", padding: "14px", borderRadius: "8px", marginBottom: "12px" }}>
                                        <p style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "6px" }}><MessageSquare size={12} /> Pesan:</p>
                                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>{t.message}</p>
                                    </div>
                                    {t.adminReply && (
                                        <div style={{ background: "rgba(99,102,241,0.08)", padding: "14px", borderRadius: "8px", marginBottom: "12px", borderLeft: "3px solid var(--primary)" }}>
                                            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "6px" }}>💬 Admin reply:</p>
                                            <p style={{ color: "var(--text-primary)", fontSize: "0.9rem", lineHeight: 1.7 }}>{t.adminReply}</p>
                                        </div>
                                    )}
                                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                                        <input
                                            placeholder="Tulis balasan..."
                                            value={selected === t.id ? replyText : ""}
                                            onChange={e => setReplyText(e.target.value)}
                                            onClick={e => e.stopPropagation()}
                                            style={{ flex: 1, padding: "8px 14px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.85rem" }}
                                        />
                                        <button onClick={e => { e.stopPropagation(); sendReply(t.id); }} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>Reply</button>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        {t.status !== "in_progress" && <button onClick={e => { e.stopPropagation(); updateStatus(t.id, "in_progress"); }} style={{ padding: "6px 14px", fontSize: "0.78rem", background: "rgba(245,158,11,0.15)", color: "var(--warning)", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> In Progress</button>}
                                        {t.status !== "resolved" && <button onClick={e => { e.stopPropagation(); updateStatus(t.id, "resolved"); }} style={{ padding: "6px 14px", fontSize: "0.78rem", background: "rgba(16,185,129,0.15)", color: "var(--success)", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={12} /> Resolve</button>}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
