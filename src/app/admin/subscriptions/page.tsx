"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Search, Filter, TrendingUp, Users, DollarSign } from "lucide-react";

const mockSubs = [
    { id: "sub_001", user: "Ahmad Rizky", email: "ahmad@test.com", plan: "pro", status: "active", startDate: "2024-03-01", endDate: "2025-03-01", amount: "Rp 79.000/bln" },
    { id: "sub_002", user: "Siti Nurbaya", email: "siti@test.com", plan: "starter", status: "active", startDate: "2024-04-15", endDate: "2025-04-15", amount: "Rp 29.000/bln" },
    { id: "sub_003", user: "Budi Santoso", email: "budi@test.com", plan: "enterprise", status: "active", startDate: "2024-01-10", endDate: "2025-01-10", amount: "Rp 199.000/bln" },
    { id: "sub_004", user: "Dewi Lestari", email: "dewi@test.com", plan: "pro", status: "expired", startDate: "2024-01-01", endDate: "2024-07-01", amount: "Rp 79.000/bln" },
    { id: "sub_005", user: "Rudi Hermawan", email: "rudi@test.com", plan: "starter", status: "cancelled", startDate: "2024-05-01", endDate: "2024-06-01", amount: "Rp 29.000/bln" },
];

const tierColors: Record<string, string> = { free: "#64748b", starter: "#6366f1", pro: "#10b981", enterprise: "#f59e0b" };
const statusColors: Record<string, string> = { active: "#10b981", expired: "#f59e0b", cancelled: "#ef4444" };

export default function AdminSubscriptionsPage() {
    const [search, setSearch] = useState("");
    const [filterPlan, setFilterPlan] = useState("all");

    const filtered = mockSubs.filter((s) => {
        if (search && !s.user.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterPlan !== "all" && s.plan !== filterPlan) return false;
        return true;
    });

    const activeCount = mockSubs.filter((s) => s.status === "active").length;
    const mrr = mockSubs.filter((s) => s.status === "active").reduce((sum, s) => sum + parseInt(s.amount.replace(/[^\d]/g, "")), 0);

    return (
        <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
                <CreditCard size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--danger)" }} />
                Subscription Management
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>Kelola langganan dan billing user</p>

            {/* KPI */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Active Subscriptions", value: activeCount, icon: Users, color: "var(--success)" },
                    { label: "MRR", value: `Rp ${(mrr / 1000).toFixed(0)}K`, icon: DollarSign, color: "var(--primary)" },
                    { label: "Churn Rate", value: "8.2%", icon: TrendingUp, color: "var(--warning)" },
                ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={i} className="glass-card" style={{ padding: "20px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{kpi.label}</p>
                                <Icon size={16} style={{ color: kpi.color }} />
                            </div>
                            <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>{kpi.value}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari user..." style={{
                        width: "100%", padding: "10px 10px 10px 38px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.85rem",
                    }} />
                </div>
                <div style={{ position: "relative" }}>
                    <Filter size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)} style={{
                        padding: "10px 16px 10px 36px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.85rem",
                    }}>
                        <option value="all">Semua Plan</option><option value="starter">Starter</option>
                        <option value="pro">Pro</option><option value="enterprise">Enterprise</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead><tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                        {["User", "Plan", "Status", "Start", "End", "Amount", "Action"].map((h) => (
                            <th key={h} style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.78rem" }}>{h}</th>
                        ))}
                    </tr></thead>
                    <tbody>
                        {filtered.map((s) => (
                            <tr key={s.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                <td style={{ padding: "12px 8px" }}><p style={{ fontWeight: 600 }}>{s.user}</p><p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{s.email}</p></td>
                                <td style={{ padding: "12px 8px" }}><span style={{ padding: "2px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 700, background: `${tierColors[s.plan]}22`, color: tierColors[s.plan], textTransform: "uppercase" }}>{s.plan}</span></td>
                                <td style={{ padding: "12px 8px" }}><span style={{ padding: "2px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 700, background: `${statusColors[s.status]}22`, color: statusColors[s.status], textTransform: "uppercase" }}>{s.status}</span></td>
                                <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>{s.startDate}</td>
                                <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>{s.endDate}</td>
                                <td style={{ padding: "12px 8px", fontWeight: 600 }}>{s.amount}</td>
                                <td style={{ padding: "12px 8px" }}><button style={{ padding: "4px 12px", fontSize: "0.75rem", background: "rgba(99,102,241,0.15)", color: "var(--primary)", border: "none", borderRadius: "6px", cursor: "pointer" }}>Manage</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
