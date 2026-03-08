"use client";

import { motion } from "framer-motion";
import { ArrowRight, Upload, BarChart3, Brain, Zap, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection({ data }: { data?: any }) {
    const [stats, setStats] = useState({ totalRows: 0, totalUsers: 0 });

    useEffect(() => {
        fetch("/api/public/stats").then(r => r.json()).then(res => {
            if (res.success) setStats({ totalRows: res.totalRows || 0, totalUsers: res.totalUsers || 0 });
        }).catch(() => {});
    }, []);

    const fmtNum = (n: number) => n >= 1e6 ? (n / 1e6).toFixed(1) + "M+" : n >= 1e3 ? (n / 1e3).toFixed(0) + "K+" : String(n);
    const title = data?.title || "Ubah Data Penjualan Jadi";
    const gradientText = data?.gradientText || "Strategi Bisnis";
    const desc = data?.description || "Upload data marketplace, dapatkan insight AI dan analisis ML — tanpa keahlian data science.";

    return (
        <section style={{
            background: "var(--gradient-hero, linear-gradient(135deg, #eef2ff 0%, #f0fdfa 50%, #fff7ed 100%))",
            minHeight: "90vh", display: "flex", alignItems: "center",
            position: "relative", overflow: "hidden",
        }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "600px", height: "600px", borderRadius: "50%", background: "rgba(79,70,229,0.04)" }} />
            <div style={{ position: "absolute", bottom: "-15%", left: "-5%", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(13,148,136,0.04)" }} />

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center", position: "relative", zIndex: 1 }}>
                {/* Left: Text */}
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px",
                        borderRadius: "100px", background: "rgba(79,70,229,0.08)", marginBottom: "20px",
                        fontSize: "0.78rem", fontWeight: 600, color: "var(--primary)",
                    }}>
                        <Zap size={14} /> AI-Powered Analytics
                    </div>

                    <h1 style={{
                        fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, lineHeight: 1.15,
                        color: "var(--text-heading)", marginBottom: "16px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                        {title}{" "}
                        <span style={{
                            background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        }}>{gradientText}</span>
                    </h1>

                    <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "var(--text-secondary)", marginBottom: "28px", maxWidth: "520px" }}>
                        {desc}
                    </p>

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "40px" }}>
                        <Link href="/register" style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "14px 28px", borderRadius: "12px",
                            background: "var(--gradient-primary)", color: "#fff",
                            fontSize: "0.95rem", fontWeight: 700, textDecoration: "none",
                            boxShadow: "0 4px 16px rgba(79,70,229,0.25)", transition: "transform 0.2s",
                        }}>
                            <Upload size={18} /> Mulai Gratis <ArrowRight size={16} />
                        </Link>
                        <Link href="#features" style={{
                            display: "inline-flex", alignItems: "center", gap: "8px",
                            padding: "14px 28px", borderRadius: "12px",
                            background: "var(--bg-card)", color: "var(--text-primary)",
                            fontSize: "0.95rem", fontWeight: 600, textDecoration: "none",
                            border: "1px solid var(--border-color)", boxShadow: "var(--shadow-xs)",
                        }}>
                            Lihat Fitur
                        </Link>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", gap: "28px" }}>
                        {[
                            { value: "5+", label: "Algoritma ML", icon: <Brain size={16} /> },
                            { value: stats.totalRows > 0 ? fmtNum(stats.totalRows) : "1M+", label: "Data Diolah", icon: <BarChart3 size={16} /> },
                            { value: "AI", label: "Natural Language", icon: <Zap size={16} /> },
                            { value: stats.totalUsers > 0 ? fmtNum(stats.totalUsers) : "100+", label: "Pengguna", icon: <Users size={16} /> },
                        ].map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--primary)", marginBottom: "2px" }}>
                                    {s.icon}
                                    <span style={{ fontSize: "1.3rem", fontWeight: 800 }}>{s.value}</span>
                                </div>
                                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{s.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right: Dashboard Preview */}
                <motion.div initial={{ opacity: 0, x: 30, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
                    <div style={{
                        background: "var(--bg-card)", borderRadius: "20px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
                        padding: "24px", position: "relative",
                        animation: "heroFloat 6s ease-in-out infinite",
                    }}>
                        {/* Mock Dashboard Content */}
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                            {["var(--danger)", "var(--warning)", "var(--success)"].map((c, i) => (
                                <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
                            ))}
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "8px" }}>SimbisData Dashboard</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                            {[
                                { label: "Revenue", val: "Rp 12.5jt", color: "var(--success)" },
                                { label: "Orders", val: "847", color: "var(--info, var(--primary))" },
                                { label: "Growth", val: "+12%", color: "var(--accent)" },
                            ].map((kpi, i) => (
                                <div key={i} style={{ background: "var(--bg-surface)", borderRadius: "10px", padding: "12px" }}>
                                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: "4px" }}>{kpi.label}</p>
                                    <p style={{ fontSize: "1rem", fontWeight: 800, color: kpi.color }}>{kpi.val}</p>
                                </div>
                            ))}
                        </div>
                        {/* Mock chart bars */}
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "80px", padding: "0 4px" }}>
                            {[40,55,45,70,60,85,75,90,65,80].map((h, i) => (
                                <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.8 + i * 0.05, duration: 0.5 }}
                                    style={{ flex: 1, borderRadius: "4px 4px 0 0", background: i % 2 === 0 ? "var(--primary)" : "var(--accent)", opacity: 0.7 + (i * 0.03) }}
                                />
                            ))}
                        </div>
                        <div style={{ marginTop: "12px", padding: "10px", borderRadius: "8px", background: "var(--primary-surface, rgba(79,70,229,0.06))", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Zap size={14} style={{ color: "var(--primary)" }} />
                            <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>AI: Produk "Kaos XL" mendominasi 34% revenue...</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes heroFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
            `}</style>
        </section>
    );
}
