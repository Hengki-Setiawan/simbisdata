"use client";

import { motion } from "framer-motion";
import { DollarSign, Package, TrendingUp, RotateCcw } from "lucide-react";

function formatRupiah(num: number): string {
    if (num >= 1_000_000) return `Rp${(num / 1_000_000).toFixed(1)}jt`;
    if (num >= 1_000) return `Rp${(num / 1_000).toFixed(0)}K`;
    return `Rp${num.toFixed(0)}`;
}

interface MetricProps {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    returnRate: number;
    growthRate: number;
    productCount: number;
}

export default function MetricSnapshot({ totalRevenue, totalOrders, avgOrderValue, returnRate, growthRate, productCount }: MetricProps) {
    const metrics = [
        { icon: DollarSign, label: "Pendapatan", value: formatRupiah(totalRevenue), sub: `${growthRate >= 0 ? "↑" : "↓"} ${Math.abs(growthRate).toFixed(1)}%`, color: "var(--success)" },
        { icon: Package, label: "Pesanan", value: totalOrders.toLocaleString(), sub: `${productCount} produk`, color: "var(--primary)" },
        { icon: TrendingUp, label: "Rata-rata Order", value: formatRupiah(avgOrderValue), sub: "per pesanan", color: "var(--accent)" },
        { icon: RotateCcw, label: "Return Rate", value: `${returnRate.toFixed(1)}%`, sub: returnRate < 2 ? "✅ Sangat baik" : "⚠️ Perlu perhatian", color: returnRate < 2 ? "var(--success)" : "var(--warning)" },
    ];

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "20px" }}>
            {metrics.map((m, i) => (
                <motion.div key={i} className="glass-card" style={{ padding: "20px" }}
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "6px" }}>{m.label}</p>
                            <p style={{ fontSize: "1.5rem", fontWeight: 800 }}>{m.value}</p>
                            <p style={{ color: m.color, fontSize: "0.78rem", fontWeight: 600, marginTop: "4px" }}>{m.sub}</p>
                        </div>
                        <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${m.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <m.icon size={20} style={{ color: m.color }} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
