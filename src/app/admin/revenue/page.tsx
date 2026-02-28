"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Users, CreditCard, Loader2 } from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#94a3b8"];
const tooltipStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.8rem" };

interface RevenueData {
    totalPaidUsers: number;
    tierBreakdown: { name: string; count: number; color: string }[];
    mrr: number;
}

export default function AdminRevenuePage() {
    const [data, setData] = useState<RevenueData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/admin/revenue");
            if (res.ok) setData(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

    const mrr = data?.mrr || 0;
    const totalPaid = data?.totalPaidUsers || 0;

    const tierRevenue = data?.tierBreakdown || [
        { name: "Starter", count: 0, color: "#f59e0b" },
        { name: "Pro", count: 0, color: "#6366f1" },
        { name: "Enterprise", count: 0, color: "#10b981" },
    ];

    const pieData = tierRevenue.map(t => ({
        name: t.name,
        value: t.count * (t.name === "Starter" ? 29000 : t.name === "Pro" ? 79000 : 199000),
        color: t.color,
    }));

    const conversionFunnel = [
        { stage: "Free Users", count: Math.max(0, (data?.totalPaidUsers || 0) * 3), pct: 100 },
        { stage: "Starter", count: tierRevenue.find(t => t.name === "Starter")?.count || 0, pct: 0 },
        { stage: "Pro", count: tierRevenue.find(t => t.name === "Pro")?.count || 0, pct: 0 },
        { stage: "Enterprise", count: tierRevenue.find(t => t.name === "Enterprise")?.count || 0, pct: 0 },
    ];

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                    <DollarSign size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--success)" }} />
                    Revenue Dashboard
                </h1>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-surface)", padding: "4px 12px", borderRadius: "100px", border: "1px solid var(--border-color)" }}>
                    Live Data
                </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "MRR", value: `Rp ${mrr.toLocaleString("id-ID")}`, icon: DollarSign, color: "var(--success)" },
                    { label: "ARR", value: `Rp ${(mrr * 12).toLocaleString("id-ID")}`, icon: TrendingUp, color: "var(--primary)" },
                    { label: "Paying Users", value: totalPaid.toString(), icon: Users, color: "var(--accent)" },
                    { label: "ARPU", value: totalPaid > 0 ? `Rp ${Math.round(mrr / totalPaid).toLocaleString("id-ID")}` : "Rp 0", icon: CreditCard, color: "var(--warning)" },
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
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>🔄 Conversion Funnel</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={conversionFunnel} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis type="category" dataKey="stage" stroke="var(--text-muted)" fontSize={10} width={100} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                                {conversionFunnel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>💰 Revenue Split</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                                {pieData.map((t, i) => <Cell key={i} fill={t.color} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `Rp ${Number(v).toLocaleString("id-ID")}`} />
                        </PieChart>
                    </ResponsiveContainer>
                    {pieData.map((t, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", marginBottom: "4px" }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color }} />
                            <span style={{ flex: 1, color: "var(--text-secondary)" }}>{t.name}</span>
                            <span style={{ fontWeight: 700 }}>Rp {t.value.toLocaleString("id-ID")}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
