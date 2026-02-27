"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Plus, Copy, Trash2, CheckCircle2, Clock, X as XIcon } from "lucide-react";

const initialTokens = [
    { id: "1", token: "DEMO-PRO-7D-A3F2K9", tier: "pro", days: 7, usedBy: "siti@email.com", status: "used", createdAt: "2026-02-20", expiresAt: "2026-02-27" },
    { id: "2", token: "DEMO-PRO-7D-B8H4M1", tier: "pro", days: 7, usedBy: null, status: "active", createdAt: "2026-02-24", expiresAt: "2026-03-03" },
    { id: "3", token: "DEMO-STARTER-14D-C2J7", tier: "starter", days: 14, usedBy: "budi@email.com", status: "expired", createdAt: "2026-02-01", expiresAt: "2026-02-15" },
    { id: "4", token: "DEMO-ENT-7D-D5K8P3", tier: "enterprise", days: 7, usedBy: null, status: "active", createdAt: "2026-02-25", expiresAt: "2026-03-04" },
];

const tierColors: Record<string, { bg: string; color: string }> = {
    starter: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
    pro: { bg: "rgba(99,102,241,0.15)", color: "#6366f1" },
    enterprise: { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
};

const statusIcons: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    active: { icon: Clock, color: "#10b981" },
    used: { icon: CheckCircle2, color: "#6366f1" },
    expired: { icon: XIcon, color: "#94a3b8" },
};

export default function AdminDemoPage() {
    const [tokens, setTokens] = useState(initialTokens);
    const [showModal, setShowModal] = useState(false);
    const [newTier, setNewTier] = useState("pro");
    const [newDays, setNewDays] = useState("7");
    const [copied, setCopied] = useState<string | null>(null);

    const generateToken = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        const token = `DEMO-${newTier.toUpperCase()}-${newDays}D-${rand}`;
        const now = new Date();
        const exp = new Date(now); exp.setDate(exp.getDate() + parseInt(newDays));
        setTokens([{ id: Date.now().toString(), token, tier: newTier, days: parseInt(newDays), usedBy: null, status: "active", createdAt: now.toISOString().split("T")[0], expiresAt: exp.toISOString().split("T")[0] }, ...tokens]);
        setShowModal(false);
    };

    const copyToken = (token: string) => { navigator.clipboard.writeText(token); setCopied(token); setTimeout(() => setCopied(null), 2000); };
    const deleteToken = (id: string) => setTokens(tokens.filter((t) => t.id !== id));

    const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none" };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "4px" }}>
                        <Ticket size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--warning)" }} />
                        Demo Management
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{tokens.filter((t) => t.status === "active").length} token aktif</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding: "10px 20px" }}>
                    <Plus size={18} /> Generate Token
                </button>
            </div>

            {/* Tokens Table */}
            <motion.div className="glass-card" style={{ padding: "0", overflow: "hidden" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                            {["Token", "Tier", "Durasi", "Digunakan Oleh", "Status", "Expires", ""].map((h, i) => (
                                <th key={i} style={{ textAlign: "left", padding: "12px 14px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tokens.map((t) => {
                            const tc = tierColors[t.tier] || tierColors.pro;
                            const sc = statusIcons[t.status] || statusIcons.active;
                            const StatusIcon = sc.icon;
                            return (
                                <tr key={t.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                    <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: "0.8rem" }}>
                                        <span>{t.token}</span>
                                        <button onClick={() => copyToken(t.token)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", marginLeft: "6px", padding: "2px" }}>
                                            {copied === t.token ? <CheckCircle2 size={12} style={{ color: "var(--success)" }} /> : <Copy size={12} />}
                                        </button>
                                    </td>
                                    <td style={{ padding: "12px 14px" }}>
                                        <span style={{ padding: "2px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 700, background: tc.bg, color: tc.color }}>{t.tier}</span>
                                    </td>
                                    <td style={{ padding: "12px 14px" }}>{t.days} hari</td>
                                    <td style={{ padding: "12px 14px", color: t.usedBy ? "var(--text-secondary)" : "var(--text-muted)", fontSize: "0.82rem" }}>{t.usedBy || "—"}</td>
                                    <td style={{ padding: "12px 14px" }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: sc.color }}>
                                            <StatusIcon size={12} /> {t.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 14px", color: "var(--text-muted)", fontSize: "0.82rem" }}>{t.expiresAt}</td>
                                    <td style={{ padding: "12px 14px" }}>
                                        <button onClick={() => deleteToken(t.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </motion.div>

            {/* Generate Modal */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }} onClick={() => setShowModal(false)}>
                    <motion.div className="glass-card" style={{ padding: "32px", width: "400px", maxWidth: "90vw" }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px" }}>🎫 Generate Demo Token</h3>
                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>Tier</label>
                            <select value={newTier} onChange={(e) => setNewTier(e.target.value)} style={{ ...inputStyle, appearance: "none" as const }}>
                                <option value="starter">Starter</option><option value="pro">Pro</option><option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>Durasi (hari)</label>
                            <input value={newDays} onChange={(e) => setNewDays(e.target.value)} style={inputStyle} type="number" min="1" max="30" />
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button className="btn-primary" onClick={generateToken} style={{ flex: 1, padding: "10px", justifyContent: "center" }}>Generate</button>
                            <button className="btn-secondary" onClick={() => setShowModal(false)} style={{ padding: "10px 20px" }}>Batal</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
