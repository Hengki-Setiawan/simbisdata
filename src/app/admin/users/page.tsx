"use client";

import { useEffect, useState, useTransition } from "react";
import { getAllUsers, toggleUserStatus, changeUserTier } from "@/actions/admin";
import { motion } from "framer-motion";
import { Users, Search, Loader2, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

/* eslint-disable @typescript-eslint/no-explicit-any */

const tierColors: Record<string, string> = { free: "#64748b", starter: "#6366f1", pro: "#10b981", enterprise: "#f59e0b" };

export default function UsersManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isPending, startTransition] = useTransition();
    const { addToast } = useToast();

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = (userId: number, currentStatus: boolean) => {
        startTransition(async () => {
            const res = await toggleUserStatus(userId, currentStatus);
            if (res.success) {
                await loadUsers();
                addToast(currentStatus ? "User dinonaktifkan" : "User diaktifkan", "success");
            }
        });
    };

    const handleChangeTier = (userId: number, newTier: string) => {
        startTransition(async () => {
            const res = await changeUserTier(userId, newTier);
            if (res.success) {
                await loadUsers();
                addToast(`Tier diubah ke ${newTier}`, "success");
            } else {
                addToast(res.error || "Gagal mengubah tier", "error");
            }
        });
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                    <Users size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--primary-light)" }} />
                    User Management
                </h1>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-surface)", padding: "4px 12px", borderRadius: "100px", border: "1px solid var(--border-color)" }}>
                    {users.length} total users
                </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>Kelola semua pengguna platform</p>

            {/* KPI */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Total Users", count: users.length, icon: Users, color: "var(--primary-light)" },
                    { label: "Active", count: users.filter(u => u.isActive).length, icon: ShieldCheck, color: "var(--success)" },
                    { label: "Admin", count: users.filter(u => u.role === "admin").length, icon: Shield, color: "var(--warning)" },
                ].map((kpi, i) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={i} className="glass-card" style={{ padding: "20px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{kpi.label}</p>
                                <Icon size={16} style={{ color: kpi.color }} />
                            </div>
                            <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>{kpi.count}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari email atau nama..." style={{
                    width: "100%", padding: "10px 10px 10px 38px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.85rem",
                }} />
            </div>

            {/* Table */}
            <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "40px" }}><Loader2 className="h-8 w-8 animate-spin text-gray-400" style={{ margin: "0 auto" }} /></div>
                ) : filteredUsers.length === 0 ? (
                    <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "24px" }}>Tidak ada user ditemukan.</p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                        <thead><tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                            {["User", "Role", "Plan Tier", "Status", "Sub Expires", "Actions"].map(h => (
                                <th key={h} style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.78rem" }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                    <td style={{ padding: "12px 8px" }}>
                                        <p style={{ fontWeight: 600 }}>{user.name}</p>
                                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{user.email}</p>
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>
                                        <span style={{
                                            padding: "2px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 700,
                                            background: user.role === "admin" ? "rgba(99,102,241,0.2)" : "rgba(100,116,139,0.2)",
                                            color: user.role === "admin" ? "#818cf8" : "#94a3b8",
                                            textTransform: "uppercase"
                                        }}>{user.role}</span>
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>
                                        <span style={{
                                            padding: "2px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 700,
                                            background: `${tierColors[user.planId] || "#64748b"}22`,
                                            color: tierColors[user.planId] || "#64748b",
                                            textTransform: "uppercase"
                                        }}>{user.planId}</span>
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>
                                        <span style={{
                                            padding: "2px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 700,
                                            background: user.isActive ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                                            color: user.isActive ? "#10b981" : "#ef4444",
                                        }}>{user.isActive ? "Active" : "Disabled"}</span>
                                    </td>
                                    <td style={{ padding: "12px 8px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                                        {user.sub ? new Date(user.sub.endDate * 1000).toLocaleDateString("id-ID") : "—"}
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <select
                                                value={user.planId || "free"}
                                                onChange={e => handleChangeTier(user.id, e.target.value)}
                                                disabled={isPending}
                                                style={{
                                                    padding: "4px 8px", fontSize: "0.75rem",
                                                    background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                                                    borderRadius: "6px", color: "var(--text-primary)", cursor: "pointer",
                                                }}
                                            >
                                                <option value="free">Free</option>
                                                <option value="starter">Starter</option>
                                                <option value="pro">Pro</option>
                                                <option value="enterprise">Enterprise</option>
                                            </select>
                                            {user.role !== "admin" && (
                                                <button
                                                    onClick={() => handleToggleActive(user.id, user.isActive)}
                                                    disabled={isPending}
                                                    style={{
                                                        padding: "4px 12px", fontSize: "0.75rem",
                                                        background: user.isActive ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
                                                        color: user.isActive ? "#ef4444" : "#10b981",
                                                        border: "none", borderRadius: "6px", cursor: "pointer",
                                                    }}
                                                >
                                                    {user.isActive ? "Deactivate" : "Activate"}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </motion.div>
        </div>
    );
}
