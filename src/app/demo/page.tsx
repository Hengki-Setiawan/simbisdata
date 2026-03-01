"use client";

import { motion } from "framer-motion";
import { BarChart3, Upload, Brain, TrendingUp, Shield, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const tooltipStyle = { backgroundColor: "#1a1a3e", border: "1px solid #2d2d5e", borderRadius: "8px", color: "#f1f5f9", fontSize: "0.8rem" };
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

const demoRevenue = [
    { month: "Feb", revenue: 5200 }, { month: "Mar", revenue: 7800 }, { month: "Apr", revenue: 9100 },
    { month: "Mei", revenue: 8200 }, { month: "Jun", revenue: 6100 },
];

const demoProducts = [
    { name: "Lost Kitten (Hitam)", value: 235 }, { name: "Lost Kitten (Putih)", value: 72 },
    { name: "Born 2 Lose", value: 20 },
];

const demoRegion = [
    { region: "Jawa Barat", orders: 105 }, { region: "Jawa Tengah", orders: 57 },
    { region: "Jawa Timur", orders: 35 }, { region: "DKI Jakarta", orders: 28 },
    { region: "Banten", orders: 18 },
];

export default function DemoPage() {
    return (
        <div style={{ minHeight: "100vh" }}>
            <div className="bg-grid" />

            {/* Nav */}
            <nav style={{ padding: "20px 0", position: "sticky", top: 0, zIndex: 100, background: "rgba(15,15,35,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-color)" }}>
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link href="/" className="navbar-logo"><BarChart3 size={28} style={{ color: "var(--primary)" }} /><span className="gradient-text">simbisai</span></Link>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <Link href="/register" className="btn-primary" style={{ padding: "10px 24px", fontSize: "0.9rem" }}>Mulai Gratis <ArrowRight size={16} /></Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ padding: "80px 0 40px", textAlign: "center" }}>
                <div className="container">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="hero-badge">🎮 Interactive Demo</div>
                        <h1 style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "16px" }}>
                            Lihat <span className="gradient-text">simbisai</span> Beraksi
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 48px" }}>
                            Data sampel dari 327 pesanan — lihat bagaimana AI & ML menganalisis penjualan kamu.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Demo Dashboard */}
            <section className="container" style={{ paddingBottom: "80px" }}>
                {/* KPI Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    {[
                        { label: "Total Revenue", value: "Rp 36.4jt", icon: TrendingUp, color: "var(--success)" },
                        { label: "Total Orders", value: "327", icon: BarChart3, color: "var(--primary)" },
                        { label: "Avg Order", value: "Rp 111K", icon: Zap, color: "var(--accent)" },
                        { label: "Return Rate", value: "1.2%", icon: Shield, color: "var(--warning)" },
                    ].map((kpi, i) => {
                        const Icon = kpi.icon;
                        return (
                            <motion.div key={i} className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{kpi.label}</p>
                                    <Icon size={16} style={{ color: kpi.color }} />
                                </div>
                                <p style={{ fontSize: "1.5rem", fontWeight: 800 }}>{kpi.value}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Charts */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>📈 Tren Revenue (×1000 Rp)</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={demoRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: "#6366f1" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>
                    <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>🥧 Distribusi Produk</h3>
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie data={demoProducts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                                    {demoProducts.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                        {demoProducts.map((p, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", marginBottom: "2px" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i] }} />
                                <span style={{ color: "var(--text-secondary)", flex: 1 }}>{p.name}</span>
                                <span style={{ fontWeight: 700 }}>{p.value}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>🗺️ Top Provinsi</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={demoRegion} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis type="category" dataKey="region" stroke="var(--text-muted)" fontSize={11} width={100} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="orders" fill="#6366f1" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* AI Insight */}
                <motion.div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid var(--primary)", marginBottom: "48px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <Brain size={20} style={{ color: "var(--primary)" }} />
                        <h3 style={{ fontWeight: 700 }}>🤖 AI Insight</h3>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.8 }}>
                        Penjualan menunjukkan tren positif dari Februari-April (+75%), namun terjadi penurunan di Mei-Juni (-33%).
                        <strong> Lost Kitten (Hitam)</strong> mendominasi 72% penjualan. Pasar terkonsentrasi di Pulau Jawa (60%).
                        <br /><br />
                        <strong>Rekomendasi:</strong> Fokus restok size XL & L yang menyumbang 78% volume. Jalankan campaign di tanggal 12-15
                        untuk manfaatkan momentum gajian. Pertimbangkan ekspansi ke Sumatera Utara dan Kalimantan.
                    </p>
                </motion.div>

                {/* CTA */}
                <div style={{ textAlign: "center" }}>
                    <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "12px" }}>Siap Analisis Data Kamu Sendiri?</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>Upload file Excel penjualan — analisis pertama gratis!</p>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <Link href="/register" className="btn-primary"><Upload size={18} /> Mulai Gratis</Link>
                        <Link href="/pricing" className="btn-secondary">Lihat Pricing</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
