"use client";

import { motion } from "framer-motion";
import {
    Users, DollarSign, Activity, TrendingUp,
    BarChart3, FileSpreadsheet, Shield,
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import Link from "next/link";

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b"];

const tooltipStyle = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "0.8rem",
};

// Mock admin data (replace with real API data later)
const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalAnalyses: 3456,
    revenue: 12500000,
};

const userGrowth = [
    { month: "Sep", users: 120 }, { month: "Oct", users: 280 },
    { month: "Nov", users: 450 }, { month: "Dec", users: 680 },
    { month: "Jan", users: 920 }, { month: "Feb", users: 1247 },
];

const tierDistribution = [
    { name: "Free", value: 856, color: "#94a3b8" },
    { name: "Starter", value: 245, color: "#f59e0b" },
    { name: "Pro", value: 112, color: "#6366f1" },
    { name: "Enterprise", value: 34, color: "#10b981" },
];

const revenueByMonth = [
    { month: "Sep", revenue: 850 }, { month: "Oct", revenue: 2100 },
    { month: "Nov", revenue: 3500 }, { month: "Dec", revenue: 5200 },
    { month: "Jan", revenue: 8400 }, { month: "Feb", revenue: 12500 },
];

const recentUsers = [
    { name: "Ahmad Rizki", email: "ahmad@email.com", tier: "Pro", joined: "25 Feb 2026" },
    { name: "Siti Nurhaliza", email: "siti@email.com", tier: "Starter", joined: "24 Feb 2026" },
    { name: "Budi Santoso", email: "budi@email.com", tier: "Free", joined: "23 Feb 2026" },
    { name: "Dewi Lestari", email: "dewi@email.com", tier: "Pro", joined: "22 Feb 2026" },
    { name: "Eko Prasetyo", email: "eko@email.com", tier: "Enterprise", joined: "21 Feb 2026" },
];

const activityLogs = [
    { action: "User registrasi", user: "ahmad@email.com", time: "5 menit lalu" },
    { action: "Upgrade ke Pro", user: "siti@email.com", time: "1 jam lalu" },
    { action: "Upload file Excel", user: "budi@email.com", time: "2 jam lalu" },
    { action: "Generate AI insight", user: "dewi@email.com", time: "3 jam lalu" },
    { action: "Export PDF Premium", user: "eko@email.com", time: "4 jam lalu" },
    { action: "Password reset", user: "ahmad@email.com", time: "6 jam lalu" },
];

function formatRupiah(num: number) {
    if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)}jt`;
    if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)}K`;
    return `Rp ${num}`;
}

export default function AdminPage() {
    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "4px" }}>
                        <Shield size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--primary)" }} />
                        Admin Dashboard
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Platform overview dan user management</p>
                </div>
                <Link href="/dashboard" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                    <BarChart3 size={16} /> User Dashboard
                </Link>
            </div>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { icon: Users, label: "Total Users", value: stats.totalUsers.toLocaleString(), sub: "+18% bulan ini", color: "var(--primary)" },
                    { icon: Activity, label: "Active Users", value: stats.activeUsers.toLocaleString(), sub: `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}% retention`, color: "var(--accent)" },
                    { icon: FileSpreadsheet, label: "Total Analisis", value: stats.totalAnalyses.toLocaleString(), sub: "~2.8 per user", color: "var(--success)" },
                    { icon: DollarSign, label: "Revenue (MRR)", value: formatRupiah(stats.revenue), sub: "+32% MoM", color: "var(--warning)" },
                ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={i} className="glass-card" style={{ padding: "20px" }}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "6px" }}>{kpi.label}</p>
                                    <p style={{ fontSize: "1.5rem", fontWeight: 800 }}>{kpi.value}</p>
                                    <p style={{ color: kpi.color, fontSize: "0.78rem", fontWeight: 600, marginTop: "2px" }}>{kpi.sub}</p>
                                </div>
                                <div style={{ width: 38, height: 38, borderRadius: "var(--radius)", background: `${kpi.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon size={20} style={{ color: kpi.color }} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>📈 Pertumbuhan User</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={userGrowth}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area type="monotone" dataKey="users" stroke="#6366f1" fill="url(#colorUsers)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>💎 Distribusi Tier</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={tierDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                                {tierDistribution.map((t, i) => <Cell key={i} fill={t.color} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: "8px" }}>
                        {tierDistribution.map((t, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", marginBottom: "4px" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} />
                                <span style={{ flex: 1, color: "var(--text-secondary)" }}>{t.name}</span>
                                <span style={{ fontWeight: 700 }}>{t.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Revenue Chart */}
            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>
                    <TrendingUp size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
                    Revenue Growth (×1000 Rp)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="revenue" name="Revenue (K)" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Users Table + Activity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>👤 User Terbaru</h3>
                    {recentUsers.map((u, i) => (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "10px 0", borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem",
                        }}>
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: "2px" }}>{u.name}</p>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{u.email}</p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <span style={{
                                    padding: "2px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 700,
                                    background: u.tier === "Pro" ? "rgba(99,102,241,0.15)" : u.tier === "Enterprise" ? "rgba(16,185,129,0.15)" :
                                        u.tier === "Starter" ? "rgba(245,158,11,0.15)" : "rgba(148,163,184,0.15)",
                                    color: u.tier === "Pro" ? "#6366f1" : u.tier === "Enterprise" ? "#10b981" :
                                        u.tier === "Starter" ? "#f59e0b" : "#94a3b8",
                                }}>
                                    {u.tier}
                                </span>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "4px" }}>{u.joined}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>📋 Activity Log</h3>
                    {activityLogs.map((log, i) => (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "10px 0", borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem",
                        }}>
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: "2px" }}>{log.action}</p>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{log.user}</p>
                            </div>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", whiteSpace: "nowrap" }}>{log.time}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
