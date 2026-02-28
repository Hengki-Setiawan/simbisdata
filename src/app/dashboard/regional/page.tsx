"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Upload, TrendingUp, Brain, Loader2 } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { db } from "@/lib/local-db";

const tooltipStyle = { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.8rem" };

// Indonesia provinces with relative coordinates for the SVG map
const provinceCoords: Record<string, { x: number; y: number }> = {
    "Jawa Barat": { x: 270, y: 340 }, "Jawa Tengah": { x: 310, y: 335 }, "Jawa Timur": { x: 350, y: 330 },
    "DKI Jakarta": { x: 260, y: 330 }, "Banten": { x: 248, y: 335 }, "DI Yogyakarta": { x: 315, y: 345 },
    "Sumatera Utara": { x: 160, y: 210 }, "Sumatera Barat": { x: 165, y: 250 }, "Sumatera Selatan": { x: 195, y: 290 },
    "Lampung": { x: 225, y: 310 }, "Riau": { x: 180, y: 230 }, "Kalimantan Barat": { x: 280, y: 250 },
    "Kalimantan Selatan": { x: 330, y: 280 }, "Kalimantan Timur": { x: 340, y: 230 },
    "Sulawesi Selatan": { x: 380, y: 290 }, "Sulawesi Utara": { x: 400, y: 220 },
    "Bali": { x: 370, y: 345 }, "NTB": { x: 390, y: 345 }, "NTT": { x: 420, y: 350 },
    "Papua": { x: 560, y: 280 }, "Maluku": { x: 490, y: 260 },
    "Bengkulu": { x: 190, y: 280 }, "Jambi": { x: 185, y: 260 },
    "Kep. Bangka Belitung": { x: 225, y: 275 }, "Kep. Riau": { x: 200, y: 215 },
};

interface RegionData { province: string; orders: number; revenue: number; }

function analyzeRegions(rows: Record<string, unknown>[]): RegionData[] {
    const map = new Map<string, { orders: number; revenue: number }>();
    if (rows.length === 0) return [];

    const keys = Object.keys(rows[0]);
    const provKey = keys.find(k => /provinsi|kota|region|wilayah|state|city/i.test(k)) || keys[0];
    const revenueKey = keys.find(k => /total|pembayaran|revenue|harga|amount/i.test(k));

    rows.forEach((r) => {
        const prov = (r[provKey] as string) || "";
        if (!prov) return;
        const existing = map.get(prov) || { orders: 0, revenue: 0 };
        existing.orders += 1;
        existing.revenue += revenueKey ? (parseFloat(String(r[revenueKey]).replace(/[^\d.-]/g, '')) || 0) : 0;
        map.set(prov, existing);
    });
    return Array.from(map.entries())
        .map(([province, data]) => ({ province, ...data }))
        .sort((a, b) => b.orders - a.orders);
}

function getHeatColor(value: number, max: number): string {
    if (max === 0) return "rgba(99,102,241,0.1)";
    const ratio = value / max;
    if (ratio > 0.5) return "rgba(99,102,241,0.9)";
    if (ratio > 0.3) return "rgba(99,102,241,0.6)";
    if (ratio > 0.15) return "rgba(99,102,241,0.4)";
    if (ratio > 0.05) return "rgba(99,102,241,0.25)";
    return "rgba(99,102,241,0.12)";
}

export default function RegionalPage() {
    const [regions, setRegions] = useState<RegionData[]>([]);
    const [hovered, setHovered] = useState<string | null>(null);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [loadingInsight, setLoadingInsight] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await db.getAllData();
                if (data && data.length > 0) setRegions(analyzeRegions(data));
            } catch { /* ignore */ }
        };
        load();
    }, []);

    const maxOrders = regions.length > 0 ? regions[0].orders : 1;
    const top10 = regions.slice(0, 10);

    const generateRegionalInsight = async () => {
        setLoadingInsight(true);
        try {
            const sumData = top10.map(r => `${r.province}: ${r.orders} pesanan, Rev Rp${r.revenue}`).join(" | ");
            const prompt = `Analisis performa regional berikut: ${sumData}. Berikan penjelasan eksekutif singkat mengenai distribusi penjualan ini, potensi perluasan logistik, dan rekomendasinya.`;
            const res = await fetch("/api/ai/narrate", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, type: "executive" })
            });
            const data = await res.json();
            setAiInsight(data.narrative);
        } catch (err) {
            setAiInsight("Gagal memuat insight AI.");
        } finally {
            setLoadingInsight(false);
        }
    };

    if (regions.length === 0) return (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <MapPin size={64} style={{ color: "var(--text-muted)", marginBottom: "24px" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "12px" }}>Belum Ada Data Regional</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>Upload data untuk melihat peta distribusi penjualan.</p>
            <Link href="/dashboard/upload" className="btn-primary"><Upload size={18} /> Upload Data</Link>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
                    <MapPin size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--primary)" }} />
                    Peta Distribusi Penjualan
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{regions.length} provinsi tercakup</p>
            </div>

            {/* Interactive Indonesia Map */}
            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>🗺️ Peta Indonesia — Distribusi Pesanan</h3>
                <div style={{ position: "relative", width: "100%", height: "400px", background: "rgba(15,15,35,0.5)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                    {/* Water background */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,182,212,0.05) 0%, rgba(6,182,212,0.02) 100%)" }} />

                    {/* Province dots */}
                    <svg width="100%" height="100%" viewBox="0 0 650 420" style={{ position: "absolute", inset: 0 }}>
                        {/* Simple Indonesia outline */}
                        <text x="325" y="390" textAnchor="middle" fill="var(--text-muted)" fontSize="10" opacity="0.4">INDONESIA</text>

                        {regions.map((region) => {
                            const coords = provinceCoords[region.province];
                            if (!coords) return null;
                            const size = Math.max(6, Math.min(24, (region.orders / maxOrders) * 24));
                            const isHovered = hovered === region.province;

                            return (
                                <g key={region.province}
                                    onMouseEnter={() => setHovered(region.province)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{ cursor: "pointer" }}>
                                    <circle cx={coords.x} cy={coords.y} r={size + 4} fill={getHeatColor(region.orders, maxOrders)} opacity={0.3} />
                                    <circle cx={coords.x} cy={coords.y} r={size} fill={getHeatColor(region.orders, maxOrders)} stroke={isHovered ? "white" : "rgba(99,102,241,0.5)"} strokeWidth={isHovered ? 2 : 1} />
                                    <text x={coords.x} y={coords.y + size + 14} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontWeight={isHovered ? "700" : "400"}>
                                        {region.province.length > 12 ? region.province.slice(0, 10) + ".." : region.province}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Hover tooltip */}
                    {hovered && regions.find((r) => r.province === hovered) && (
                        <div style={{
                            position: "absolute", top: "16px", right: "16px", padding: "12px 16px",
                            background: "var(--bg-card)", border: "1px solid var(--border-color)",
                            borderRadius: "var(--radius)", fontSize: "0.85rem", minWidth: "180px",
                        }}>
                            <p style={{ fontWeight: 700, marginBottom: "8px" }}>{hovered}</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                📦 {regions.find((r) => r.province === hovered)!.orders} pesanan
                            </p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                💰 Rp {(regions.find((r) => r.province === hovered)!.revenue / 1000).toFixed(0)}K
                            </p>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div style={{ display: "flex", gap: "16px", marginTop: "12px", justifyContent: "center", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {[">50%", "30-50%", "15-30%", "5-15%", "<5%"].map((label, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: getHeatColor([0.6, 0.35, 0.2, 0.1, 0.02][i], 1) }} />
                            {label}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Top 10 Bar Chart */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>
                        <TrendingUp size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                        Top 10 Provinsi (Orders)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={top10} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                            <YAxis type="category" dataKey="province" stroke="var(--text-muted)" fontSize={10} width={100} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="orders" fill="#6366f1" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>📋 Detail per Provinsi</h3>
                    <div style={{ maxHeight: "340px", overflow: "auto" }}>
                        {regions.map((r, i) => (
                            <div key={r.province} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "8px 0", borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", width: "20px" }}>#{i + 1}</span>
                                    <span style={{ fontWeight: i < 3 ? 700 : 400 }}>{r.province}</span>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span style={{ fontWeight: 700 }}>{r.orders}</span>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginLeft: "8px" }}>
                                        Rp {(r.revenue / 1000).toFixed(0)}K
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* AI Insight Section */}
            <motion.div className="glass-card" style={{ padding: "24px", marginTop: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Brain size={24} style={{ color: "var(--primary)" }} />
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>AI Logistics Insight</h3>
                    </div>
                    <button onClick={generateRegionalInsight} className="btn-primary" disabled={loadingInsight} style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
                        {loadingInsight ? <Loader2 size={16} className="spin" /> : <Brain size={16} />}
                        {loadingInsight ? "Menganalisis Peta..." : "Generate AI Insight"}
                    </button>
                </div>

                {aiInsight ? (
                    <div style={{ padding: "20px", borderRadius: "12px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                        {aiInsight}
                    </div>
                ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", borderRadius: "12px", background: "var(--bg-card)", border: "1px dashed var(--border-color)" }}>
                        <p>Klik tombol untuk membiarkan AI menganalisis distribusi peta regional dan potensi logistik bisnis Anda.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
