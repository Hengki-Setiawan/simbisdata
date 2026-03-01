"use client";

import { useEffect, useState } from "react";
import { Users, Activity, CreditCard, Box, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GrowthData {
    name: string;
    users: number;
    revenue: number;
}

interface PlatformStats {
    totalUsers: number;
    activeProUsers: number;
    totalTokensUsed: number;
    totalDemoTokens: number;
    growthData?: GrowthData[];
}

export default function AdminOverview() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error("Failed to fetch admin stats:", err);
        } finally {
            setLoading(false);
        }
    };

    const growthData = stats?.growthData || [
        { name: 'Jan', users: 0, revenue: 0 },
        { name: 'Feb', users: 0, revenue: 0 },
    ];

    const cardStyle = { background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" };

    const SkeletonCard = () => (
        <div className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ width: "80px", height: "14px", background: "var(--border-color)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
                <div style={{ width: "16px", height: "16px", background: "var(--border-color)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
            </div>
            <div style={{ width: "100px", height: "28px", background: "var(--border-color)", borderRadius: "4px", animation: "pulse 1.5s infinite", marginBottom: "8px" }} />
            <div style={{ width: "140px", height: "12px", background: "var(--border-color)", borderRadius: "4px", animation: "pulse 1.5s infinite" }} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight text-white pointer-events-none">Platform Overview</h2>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-surface)", padding: "4px 12px", borderRadius: "100px", border: "1px solid var(--border-color)" }}>
                    Live Data from Database
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        <div className="glass-card" style={{ padding: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)" }}>Total Users</p>
                                <Users size={16} style={{ color: "var(--primary-light)" }} />
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "4px" }}>
                                {stats?.totalUsers?.toLocaleString() || 0}
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "var(--success)", display: "flex", alignItems: "center", gap: "4px" }}>
                                <TrendingUp size={12} /> Registered users
                            </p>
                        </div>

                        <div className="glass-card" style={{ padding: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)" }}>Active PRO Users</p>
                                <CreditCard size={16} style={{ color: "#22d3ee" }} />
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "4px" }}>
                                {stats?.activeProUsers?.toLocaleString() || 0}
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                Starter + Pro
                            </p>
                        </div>

                        <div className="glass-card" style={{ padding: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)" }}>Estimated MRR</p>
                                <Activity size={16} style={{ color: "var(--success)" }} />
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "4px" }}>
                                Rp {((stats?.activeProUsers || 0) * 79000).toLocaleString('id-ID')}
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                Based on active paid users
                            </p>
                        </div>

                        <div className="glass-card" style={{ padding: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)" }}>AI Tokens Used</p>
                                <Box size={16} style={{ color: "#f59e0b" }} />
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "4px" }}>
                                {stats?.totalTokensUsed ? (stats.totalTokensUsed > 1000000 ? `${(stats.totalTokensUsed / 1000000).toFixed(1)}M` : stats.totalTokensUsed.toLocaleString()) : "0"}
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                From apiLogs table
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Analytics Chart */}
            <div className="glass-card" style={{ padding: "24px", marginTop: "24px" }}>
                <div style={{ marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white" }}>Platform Growth</h3>
                </div>
                <div>
                    <div style={{ height: "350px", width: "100%", paddingRight: "16px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" />
                                <YAxis yAxisId="left" stroke="var(--text-muted)" />
                                <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" />
                                <Tooltip contentStyle={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)", borderRadius: "8px" }} />
                                <Area yAxisId="left" type="monotone" dataKey="users" stroke="#6366f1" fill="url(#colorUsers)" strokeWidth={2} name="Total Users" />
                                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRevenue)" strokeWidth={2} name="Revenue (Rp x1000)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
