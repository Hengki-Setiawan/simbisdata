"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#94a3b8"];
const tooltipStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.8rem" };

const monthlyRevenue = [
    { month: "Sep", free: 0, starter: 290, pro: 790, enterprise: 199 },
    { month: "Oct", free: 0, starter: 580, pro: 1580, enterprise: 398 },
    { month: "Nov", free: 0, starter: 870, pro: 3160, enterprise: 995 },
    { month: "Dec", free: 0, starter: 1160, pro: 4740, enterprise: 1791 },
    { month: "Jan", free: 0, starter: 1740, pro: 7900, enterprise: 2985 },
    { month: "Feb", free: 0, starter: 2320, pro: 11060, enterprise: 3980 },
];

const tierRevenue = [
    { name: "Starter", value: 2320, color: "#f59e0b" },
    { name: "Pro", value: 11060, color: "#6366f1" },
    { name: "Enterprise", value: 3980, color: "#10b981" },
];

const conversionFunnel = [
    { stage: "Free Users", count: 856, pct: 100 },
    { stage: "Trial Activated", count: 128, pct: 15 },
    { stage: "Paid (Starter)", count: 245, pct: 28.6 },
    { stage: "Upgrade (Pro)", count: 112, pct: 13.1 },
    { stage: "Enterprise", count: 34, pct: 4 },
];

export default function AdminRevenuePage() {
    const mrr = tierRevenue.reduce((s, t) => s + t.value, 0);
    return (
        <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px" }}>
                <DollarSign size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--success)" }} />
                Revenue Dashboard
            </h1>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "MRR", value: `Rp ${(mrr / 1000).toFixed(1)}jt`, icon: DollarSign, color: "var(--success)" },
                    { label: "ARR", value: `Rp ${(mrr * 12 / 1000).toFixed(0)}jt`, icon: TrendingUp, color: "var(--primary)" },
                    { label: "Paying Users", value: "391", icon: Users, color: "var(--accent)" },
                    { label: "ARPU", value: `Rp ${Math.round(mrr / 391 * 1000).toLocaleString()}`, icon: CreditCard, color: "var(--warning)" },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <motion.div key={i} className="glass-card" style={{ padding: "20px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "6px" }}>{s.label}</p>
                            <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>{s.value}</p>
                            <Icon size={0} />
                        </motion.div>
                    );
                })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>📈 Revenue by Tier (×1000 Rp)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area type="monotone" dataKey="enterprise" stackId="1" stroke="#10b981" fill="#10b98133" />
                            <Area type="monotone" dataKey="pro" stackId="1" stroke="#6366f1" fill="#6366f133" />
                            <Area type="monotone" dataKey="starter" stackId="1" stroke="#f59e0b" fill="#f59e0b33" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>💰 Revenue Split</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={tierRevenue} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                                {tierRevenue.map((t, i) => <Cell key={i} fill={t.color} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                    {tierRevenue.map((t, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", marginBottom: "4px" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} />
                            <span style={{ flex: 1, color: "var(--text-secondary)" }}>{t.name}</span>
                            <span style={{ fontWeight: 700 }}>Rp {(t.value / 1000).toFixed(1)}jt</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>🔄 Conversion Funnel</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={conversionFunnel} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis type="category" dataKey="stage" stroke="var(--text-muted)" fontSize={10} width={120} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                            {conversionFunnel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
}
