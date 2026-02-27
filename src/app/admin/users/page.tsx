"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, ChevronDown, MoreHorizontal, Shield, Crown, Zap, Sparkles } from "lucide-react";

const mockUsers = [
    { id: "1", name: "Ahmad Rizki", email: "ahmad@email.com", tier: "pro", analyses: 45, joined: "2026-01-15", status: "active" },
    { id: "2", name: "Siti Nurhaliza", email: "siti@email.com", tier: "starter", analyses: 12, joined: "2026-01-20", status: "active" },
    { id: "3", name: "Budi Santoso", email: "budi@email.com", tier: "free", analyses: 3, joined: "2026-02-01", status: "active" },
    { id: "4", name: "Dewi Lestari", email: "dewi@email.com", tier: "pro", analyses: 67, joined: "2025-12-10", status: "active" },
    { id: "5", name: "Eko Prasetyo", email: "eko@email.com", tier: "enterprise", analyses: 120, joined: "2025-11-05", status: "active" },
    { id: "6", name: "Fiona Wijaya", email: "fiona@email.com", tier: "free", analyses: 1, joined: "2026-02-20", status: "inactive" },
    { id: "7", name: "Gerry Halim", email: "gerry@email.com", tier: "starter", analyses: 8, joined: "2026-02-10", status: "active" },
    { id: "8", name: "Hana Putri", email: "hana@email.com", tier: "pro", analyses: 34, joined: "2026-01-25", status: "active" },
];

const tierIcons: Record<string, { icon: typeof Crown; color: string }> = {
    free: { icon: Sparkles, color: "#94a3b8" },
    starter: { icon: Zap, color: "#f59e0b" },
    pro: { icon: Crown, color: "#6366f1" },
    enterprise: { icon: Shield, color: "#10b981" },
};

export default function AdminUsersPage() {
    const [search, setSearch] = useState("");
    const [filterTier, setFilterTier] = useState("all");

    const filtered = mockUsers.filter((u) => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchTier = filterTier === "all" || u.tier === filterTier;
        return matchSearch && matchTier;
    });

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "4px" }}>
                    <Users size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--danger)" }} />
                    User Management
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{mockUsers.length} total users</p>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                        type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama atau email..."
                        style={{
                            width: "100%", padding: "10px 10px 10px 40px", background: "var(--bg-surface)",
                            border: "1px solid var(--border-color)", borderRadius: "var(--radius)",
                            color: "var(--text-primary)", fontSize: "0.9rem", outline: "none",
                        }}
                    />
                </div>
                <div style={{ position: "relative" }}>
                    <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} style={{
                        padding: "10px 36px 10px 14px", background: "var(--bg-surface)",
                        border: "1px solid var(--border-color)", borderRadius: "var(--radius)",
                        color: "var(--text-primary)", fontSize: "0.9rem", outline: "none",
                        appearance: "none", cursor: "pointer",
                    }}>
                        <option value="all">Semua Tier</option>
                        <option value="free">Free</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                    <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                </div>
            </div>

            {/* Users Table */}
            <motion.div className="glass-card" style={{ padding: "0", overflow: "hidden" }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                            {["User", "Tier", "Analisis", "Joined", "Status", ""].map((h, i) => (
                                <th key={i} style={{ textAlign: "left", padding: "14px 16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((user) => {
                            const ti = tierIcons[user.tier] || tierIcons.free;
                            const TierIcon = ti.icon;
                            return (
                                <tr key={user.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                    <td style={{ padding: "14px 16px" }}>
                                        <p style={{ fontWeight: 600, marginBottom: "2px" }}>{user.name}</p>
                                        <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{user.email}</p>
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <span style={{
                                            display: "inline-flex", alignItems: "center", gap: "6px",
                                            padding: "3px 12px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700,
                                            background: `${ti.color}18`, color: ti.color,
                                        }}>
                                            <TierIcon size={12} /> {user.tier}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 16px", fontWeight: 700 }}>{user.analyses}</td>
                                    <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>
                                        {new Date(user.joined).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <span style={{
                                            padding: "3px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 600,
                                            background: user.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(148,163,184,0.15)",
                                            color: user.status === "active" ? "#10b981" : "#94a3b8",
                                        }}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
