"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitCompareArrows, Upload, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { db } from "@/lib/local-db";

const tooltipStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.8rem" };

interface PeriodData { label: string; revenue: number; orders: number; avgOrder: number; topProduct: string; }

function analyzePeriod(rows: Record<string, unknown>[], label: string): PeriodData {
    const revenue = rows.reduce((s, r) => s + (parseFloat(r["Total Pembayaran"] as string) || 0), 0);
    const productMap = new Map<string, number>();
    rows.forEach((r) => { const n = (r["Nama Produk"] as string) || ""; productMap.set(n, (productMap.get(n) || 0) + 1); });
    const topProduct = Array.from(productMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
    return { label, revenue, orders: rows.length, avgOrder: rows.length > 0 ? revenue / rows.length : 0, topProduct };
}

function DiffBadge({ a, b, suffix = "" }: { a: number; b: number; suffix?: string }) {
    if (b === 0) return <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>;
    const pct = ((a - b) / b) * 100;
    const color = pct > 0 ? "var(--success)" : pct < 0 ? "var(--danger)" : "var(--text-muted)";
    const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
    return <span style={{ color, fontSize: "0.82rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}><Icon size={14} />{pct > 0 ? "+" : ""}{pct.toFixed(1)}%{suffix}</span>;
}

export default function ComparePage() {
    const [rawData, setRawData] = useState<Record<string, unknown>[] | null>(null);
    const [splitMonth, setSplitMonth] = useState("");
    const [months, setMonths] = useState<string[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await db.getAllData();
                if (data && data.length > 0) {
                    setRawData(data);
                    const ms = new Set<string>();
                    data.forEach((r: Record<string, unknown>) => {
                        const d = r["Waktu Pesanan Dibuat"] || r["order_date"] || r["Tanggal"];
                        if (d) ms.add(new Date(d as string).toISOString().slice(0, 7));
                    });
                    const sorted = Array.from(ms).sort();
                    setMonths(sorted);
                    if (sorted.length >= 2) setSplitMonth(sorted[Math.floor(sorted.length / 2)]);
                }
            } catch { /* ignore */ }
        };
        load();
    }, []);

    if (!rawData) return (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <GitCompareArrows size={64} style={{ color: "var(--text-muted)", marginBottom: "24px" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>Belum Ada Data</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>Upload data untuk membandingkan periode.</p>
            <Link href="/dashboard/upload" className="btn-primary"><Upload size={18} /> Upload Data</Link>
        </div>
    );

    const periodA = rawData.filter((r) => { const d = r["Waktu Pesanan Dibuat"]; return d && new Date(d as string).toISOString().slice(0, 7) < splitMonth; });
    const periodB = rawData.filter((r) => { const d = r["Waktu Pesanan Dibuat"]; return d && new Date(d as string).toISOString().slice(0, 7) >= splitMonth; });
    const a = analyzePeriod(periodA, `Sebelum ${splitMonth}`);
    const b = analyzePeriod(periodB, `Sejak ${splitMonth}`);

    const chartData = [
        { metric: "Revenue", A: Math.round(a.revenue / 1000), B: Math.round(b.revenue / 1000) },
        { metric: "Orders", A: a.orders, B: b.orders },
        { metric: "Avg Order", A: Math.round(a.avgOrder / 1000), B: Math.round(b.avgOrder / 1000) },
    ];

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
                    <GitCompareArrows size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--primary)" }} />
                    Compare & Benchmark
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Bandingkan performa antar periode.</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Split di bulan:</span>
                <select value={splitMonth} onChange={(e) => setSplitMonth(e.target.value)} style={{
                    padding: "8px 16px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.9rem",
                }}>
                    {months.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Revenue", valA: `Rp ${(a.revenue / 1000).toFixed(0)}K`, valB: `Rp ${(b.revenue / 1000).toFixed(0)}K`, numA: a.revenue, numB: b.revenue },
                    { label: "Total Orders", valA: a.orders.toString(), valB: b.orders.toString(), numA: a.orders, numB: b.orders },
                    { label: "Avg Order Value", valA: `Rp ${(a.avgOrder / 1000).toFixed(0)}K`, valB: `Rp ${(b.avgOrder / 1000).toFixed(0)}K`, numA: a.avgOrder, numB: b.avgOrder },
                ].map((m, i) => (
                    <motion.div key={i} className="glass-card" style={{ padding: "20px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "12px" }}>{m.label}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <div>
                                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Periode A</p>
                                <p style={{ fontSize: "1.2rem", fontWeight: 800 }}>{m.valA}</p>
                            </div>
                            <DiffBadge a={m.numB} b={m.numA} />
                            <div style={{ textAlign: "right" }}>
                                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Periode B</p>
                                <p style={{ fontSize: "1.2rem", fontWeight: 800 }}>{m.valB}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>📊 Perbandingan Visual (×1000)</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis dataKey="metric" stroke="var(--text-muted)" fontSize={12} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend />
                        <Bar dataKey="A" name={a.label} fill="#6366f1" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="B" name={b.label} fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
}
