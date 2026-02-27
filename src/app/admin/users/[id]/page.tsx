"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Calendar, Shield, CreditCard, BarChart3, FileText, Activity, Edit3 } from "lucide-react";
import Link from "next/link";

const mockUser = {
    id: "usr_001", name: "Ahmad Rizky", email: "ahmad@example.com", tier: "pro", role: "user",
    createdAt: "2024-02-15", lastLogin: "2024-06-10", status: "active",
    stats: { uploads: 24, analyses: 18, aiNarrations: 42, totalRevenue: "Rp 2.350.000" },
    files: [
        { name: "Penjualan Mei 2024.xlsx", rows: 1250, date: "2024-05-20" },
        { name: "Penjualan April 2024.xlsx", rows: 980, date: "2024-04-15" },
        { name: "Penjualan Maret 2024.xlsx", rows: 1100, date: "2024-03-10" },
    ],
    activity: [
        { action: "Upload file", detail: "Penjualan Mei 2024.xlsx", date: "2024-05-20 14:32" },
        { action: "Run analysis", detail: "ML + AI Narration", date: "2024-05-20 14:35" },
        { action: "Export PDF", detail: "Premium format", date: "2024-05-20 15:01" },
        { action: "Login", detail: "Chrome / Windows", date: "2024-05-19 09:15" },
    ],
};

const tierColors: Record<string, string> = { free: "#64748b", starter: "#6366f1", pro: "#10b981", enterprise: "#f59e0b" };

export default function AdminUserDetailPage() {
    const [tier, setTier] = useState(mockUser.tier);
    const u = mockUser;

    return (
        <div>
            <Link href="/admin/users" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "20px" }}>
                <ArrowLeft size={16} /> Kembali ke Users
            </Link>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "4px" }}>{u.name}</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>ID: {u.id}</p>
                </div>
                <span style={{
                    padding: "4px 14px", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 700,
                    background: `${tierColors[tier]}22`, color: tierColors[tier], textTransform: "uppercase",
                }}>{tier}</span>
            </div>

            {/* Info Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Email", value: u.email, icon: Mail },
                    { label: "Terdaftar", value: u.createdAt, icon: Calendar },
                    { label: "Login Terakhir", value: u.lastLogin, icon: Activity },
                    { label: "Status", value: u.status, icon: Shield },
                ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <motion.div key={i} className="glass-card" style={{ padding: "20px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                                <Icon size={14} /> {item.label}
                            </div>
                            <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{item.value}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Usage Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Uploads", value: u.stats.uploads, icon: FileText },
                    { label: "Analyses", value: u.stats.analyses, icon: BarChart3 },
                    { label: "AI Narrations", value: u.stats.aiNarrations, icon: Activity },
                    { label: "Lifetime Value", value: u.stats.totalRevenue, icon: CreditCard },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <motion.div key={i} className="glass-card" style={{ padding: "20px", background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.04))" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                            <Icon size={16} style={{ color: "var(--primary)", marginBottom: "8px" }} />
                            <p style={{ fontSize: "1.3rem", fontWeight: 800 }}>{s.value}</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{s.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Actions + Files + Activity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Actions */}
                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Edit3 size={16} /> Admin Actions</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", minWidth: "80px" }}>Tier:</label>
                            <select value={tier} onChange={(e) => setTier(e.target.value)} style={{
                                flex: 1, padding: "8px 12px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                                borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.85rem",
                            }}>
                                <option value="free">Free</option><option value="starter">Starter</option>
                                <option value="pro">Pro</option><option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                        <button className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>Save Changes</button>
                        <button className="btn-secondary" style={{ padding: "10px 20px", fontSize: "0.85rem", color: "var(--warning)" }}>Suspend User</button>
                        <button className="btn-secondary" style={{ padding: "10px 20px", fontSize: "0.85rem", color: "var(--danger)" }}>Delete User</button>
                    </div>
                </motion.div>

                {/* Recent Files */}
                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>📁 Recent Files</h3>
                    {u.files.map((f, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
                            <div><p style={{ fontWeight: 600 }}>{f.name}</p><p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{f.rows} rows</p></div>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{f.date}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Activity Log */}
            <motion.div className="glass-card" style={{ padding: "24px", marginTop: "16px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>📋 Activity Log</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead><tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "var(--text-muted)", fontWeight: 600 }}>Action</th>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "var(--text-muted)", fontWeight: 600 }}>Detail</th>
                        <th style={{ textAlign: "right", padding: "8px 0", color: "var(--text-muted)", fontWeight: 600 }}>When</th>
                    </tr></thead>
                    <tbody>
                        {u.activity.map((a, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                <td style={{ padding: "10px 0", fontWeight: 600 }}>{a.action}</td>
                                <td style={{ padding: "10px 0", color: "var(--text-secondary)" }}>{a.detail}</td>
                                <td style={{ padding: "10px 0", textAlign: "right", color: "var(--text-muted)", fontSize: "0.78rem" }}>{a.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
