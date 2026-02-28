"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Search, Filter, TrendingUp, Users, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

interface SubItem {
    id: number;
    userId: number;
    planId: string;
    status: string;
    endDate: number;
    createdAt: number;
    userName?: string;
    userEmail?: string;
}

const tierColors: Record<string, string> = { free: "#64748b", starter: "#6366f1", pro: "#10b981", enterprise: "#f59e0b" };
const statusColors: Record<string, string> = { active: "#10b981", expired: "#f59e0b", cancelled: "#ef4444" };
const tierPrices: Record<string, number> = { starter: 29000, pro: 79000, enterprise: 199000 };

export default function AdminSubscriptionsPage() {
    const [subs, setSubs] = useState<SubItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterPlan, setFilterPlan] = useState("all");
    const { addToast } = useToast();

    useEffect(() => {
        fetch("/api/admin/subscriptions")
            .then(r => r.json())
            .then(data => {
                setSubs(data);
                if (data.length > 0) addToast(`${data.length} langganan dimuat`, "info");
            })
            .catch(() => addToast("Gagal memuat data langganan", "error"))
            .finally(() => setLoading(false));
    }, []);

    const filtered = subs.filter(s => {
        if (search && !(s.userName || "").toLowerCase().includes(search.toLowerCase()) && !(s.userEmail || "").toLowerCase().includes(search.toLowerCase())) return false;
        if (filterPlan !== "all" && s.planId !== filterPlan) return false;
        return true;
    });

    const activeCount = subs.filter(s => s.status === "active").length;
    const mrr = subs.filter(s => s.status === "active").reduce((sum, s) => sum + (tierPrices[s.planId] || 0), 0);
    const churnRate = subs.length > 0 ? ((subs.filter(s => s.status === "cancelled" || s.status === "expired").length / subs.length) * 100).toFixed(1) : "0";

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                    <CreditCard size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--danger)" }} />
                    Subscription Management
                </h1>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-surface)", padding: "4px 12px", borderRadius: "100px", border: "1px solid var(--border-color)" }}>Live Data</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>Kelola langganan dan billing user</p>

            {/* KPI */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Active Subscriptions", value: activeCount, icon: Users, color: "var(--success)" },
                    { label: "MRR", value: `Rp ${mrr.toLocaleString("id-ID")}`, icon: DollarSign, color: "var(--primary)" },
                    { label: "Churn Rate", value: `${churnRate}%`, icon: TrendingUp, color: "var(--warning)" },
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
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari user..." style={{
                        width: "100%", padding: "10px 10px 10px 38px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.85rem",
                    }} />
                </div>
                <div style={{ position: "relative" }}>
                    <Filter size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} style={{
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
                {filtered.length === 0 ? (
                    <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>Tidak ada data langganan ditemukan.</p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                        <thead><tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                            {["User", "Plan", "Status", "Start", "End", "Amount"].map(h => (
                                <th key={h} style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.78rem" }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                    <td style={{ padding: "12px 8px" }}><p style={{ fontWeight: 600 }}>{s.userName || `User #${s.userId}`}</p><p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{s.userEmail}</p></td>
                                    <td style={{ padding: "12px 8px" }}><span style={{ padding: "2px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 700, background: `${tierColors[s.planId] || "#64748b"}22`, color: tierColors[s.planId] || "#64748b", textTransform: "uppercase" }}>{s.planId}</span></td>
                                    <td style={{ padding: "12px 8px" }}><span style={{ padding: "2px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 700, background: `${statusColors[s.status] || "#64748b"}22`, color: statusColors[s.status] || "#64748b", textTransform: "uppercase" }}>{s.status}</span></td>
                                    <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>{new Date(s.createdAt * 1000).toLocaleDateString("id-ID")}</td>
                                    <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>{new Date(s.endDate * 1000).toLocaleDateString("id-ID")}</td>
                                    <td style={{ padding: "12px 8px", fontWeight: 600 }}>Rp {(tierPrices[s.planId] || 0).toLocaleString("id-ID")}/bln</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </motion.div>
        </div>
    );
}
