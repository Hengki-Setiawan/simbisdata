"use client";

import { useEffect, useState } from "react";
import { Users, Activity, Box, TrendingUp, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PlatformStats {
    totalUsers: number;
    activeUsers: number;
}

export default function AdminOverview() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user stats directly from user count API
        fetch("/api/admin/users-count")
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setStats(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

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
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Platform Overview</h2>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-surface)", padding: "4px 12px", borderRadius: "100px", border: "1px solid var(--border-color)" }}>
                    Live Data
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
                ) : (
                    <>
                        <div className="glass-card" style={{ padding: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)" }}>Total Users</p>
                                <Users size={16} style={{ color: "var(--primary-light)" }} />
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "4px" }}>
                                {stats?.totalUsers?.toLocaleString() || 0}
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "var(--success)", display: "flex", alignItems: "center", gap: "4px" }}>
                                <TrendingUp size={12} /> Registered users
                            </p>
                        </div>

                        <div className="glass-card" style={{ padding: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)" }}>Active Users</p>
                                <Activity size={16} style={{ color: "var(--success)" }} />
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "4px" }}>
                                {stats?.activeUsers?.toLocaleString() || 0}
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                Currently active
                            </p>
                        </div>

                        <div className="glass-card" style={{ padding: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)" }}>Platform Status</p>
                                <Box size={16} style={{ color: "#f59e0b" }} />
                            </div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "4px", color: "var(--success)" }}>
                                ✓ Online
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                All services running
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
