"use client";

import { useEffect, useState, useTransition } from "react";
import { getAllDemoTokens, generateNewDemoToken } from "@/actions/admin";
import { motion } from "framer-motion";
import { KeyRound, Plus, Copy, Check, Loader2, Clock, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DemoTokensPage() {
    const [tokens, setTokens] = useState<any[]>([]);
    const [isPending, startTransition] = useTransition();
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => { loadTokens(); }, []);

    const loadTokens = async () => {
        try {
            const allTokens = await getAllDemoTokens();
            setTokens(allTokens);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateToken = () => {
        startTransition(async () => {
            await generateNewDemoToken();
            await loadTokens();
            addToast("Demo token berhasil dibuat!", "success");
        });
    };

    const copyToClipboard = (id: number, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        addToast("Token disalin ke clipboard", "info");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const activeTokens = tokens.filter(t => !t.isUsed && Date.now() < t.expiresAt * 1000);
    const usedTokens = tokens.filter(t => t.isUsed);

    if (loading) return <div style={{ textAlign: "center", padding: "80px" }}><Loader2 className="h-8 w-8 animate-spin text-gray-400" style={{ margin: "0 auto" }} /></div>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                    <KeyRound size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "#f59e0b" }} />
                    Demo Tokens
                </h1>
                <button
                    onClick={handleCreateToken}
                    disabled={isPending}
                    style={{
                        padding: "10px 20px", fontSize: "0.85rem", fontWeight: 600,
                        background: "var(--gradient-1)", color: "white",
                        border: "none", borderRadius: "var(--radius)", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "8px",
                        opacity: isPending ? 0.5 : 1,
                    }}
                >
                    <Plus size={16} />
                    {isPending ? "Generating..." : "Generate Token"}
                </button>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>Generate temporary PRO access for prospective clients</p>

            {/* KPI */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Total Tokens", count: tokens.length, icon: KeyRound, color: "#f59e0b" },
                    { label: "Active", count: activeTokens.length, icon: Clock, color: "var(--success)" },
                    { label: "Used", count: usedTokens.length, icon: UserCheck, color: "var(--primary-light)" },
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

            {/* Table */}
            <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {tokens.length === 0 ? (
                    <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "32px" }}>
                        Belum ada demo token. Klik &quot;Generate Token&quot; untuk membuat.
                    </p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                        <thead><tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                            {["Token Code", "Status", "Expires", "Used By", "Actions"].map(h => (
                                <th key={h} style={{ textAlign: "left", padding: "10px 8px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.78rem" }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {tokens.map(token => {
                                const isExpired = Date.now() > token.expiresAt * 1000;
                                const status = token.isUsed ? "used" : isExpired ? "expired" : "active";
                                const statusColor = status === "active" ? "#10b981" : status === "expired" ? "#f59e0b" : "#64748b";
                                return (
                                    <tr key={token.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                        <td style={{ padding: "12px 8px", fontFamily: "monospace", fontSize: "0.8rem", letterSpacing: "0.5px" }}>
                                            {token.token.slice(0, 16)}...
                                        </td>
                                        <td style={{ padding: "12px 8px" }}>
                                            <span style={{
                                                padding: "2px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 700,
                                                background: `${statusColor}22`, color: statusColor, textTransform: "uppercase"
                                            }}>{status}</span>
                                        </td>
                                        <td style={{ padding: "12px 8px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                                            {new Date(token.expiresAt * 1000).toLocaleDateString("id-ID")}
                                        </td>
                                        <td style={{ padding: "12px 8px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                                            {token.usedByEmail || "—"}
                                        </td>
                                        <td style={{ padding: "12px 8px" }}>
                                            <button
                                                onClick={() => copyToClipboard(token.id, token.token)}
                                                style={{
                                                    padding: "4px 12px", fontSize: "0.75rem",
                                                    background: "rgba(99,102,241,0.15)", color: "var(--primary-light)",
                                                    border: "none", borderRadius: "6px", cursor: "pointer",
                                                    display: "flex", alignItems: "center", gap: "4px",
                                                }}
                                            >
                                                {copiedId === token.id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </motion.div>
        </div>
    );
}
