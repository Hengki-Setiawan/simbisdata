"use client";

import { motion } from "framer-motion";
import { BarChart3, Calendar, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";

const posts = [
    { slug: "cara-analisis-penjualan-umkm", title: "Cara Analisis Data Penjualan UMKM dengan Data Science", excerpt: "Pelajari langkah-langkah mengolah data penjualan dari file Excel mentah menjadi insight bisnis yang actionable menggunakan machine learning.", date: "20 Feb 2026", category: "Tutorial", readTime: "8 min" },
    { slug: "segmentasi-pelanggan-kmeans", title: "Segmentasi Pelanggan Menggunakan K-Means Clustering", excerpt: "Bagaimana algoritma K-Means bisa mengelompokkan pelanggan berdasarkan spending dan frekuensi belanja untuk strategi marketing yang lebih tepat.", date: "15 Feb 2026", category: "Machine Learning", readTime: "6 min" },
    { slug: "prediksi-penjualan-time-series", title: "Prediksi Penjualan: Memahami Time Series Forecasting", excerpt: "Gunakan Simple Moving Average dan analisis tren untuk memprediksi penjualan 30 hari ke depan dan optimasi stok produk.", date: "10 Feb 2026", category: "Tutorial", readTime: "7 min" },
    { slug: "optimasi-harga-marketplace", title: "5 Strategi Optimasi Harga di Marketplace Berdasarkan Data", excerpt: "Tips menentukan harga optimal berdasarkan analisis elastisitas permintaan, diskon efektif, dan benchmark kompetitor.", date: "5 Feb 2026", category: "Strategi", readTime: "5 min" },
    { slug: "rfm-analysis-ecommerce", title: "RFM Analysis: Identifikasi Pelanggan Terbaik & Terburuk", excerpt: "Pelajari teknik Recency-Frequency-Monetary untuk mengelompokkan pelanggan menjadi Champions, Loyal, At Risk, dan Lost.", date: "1 Feb 2026", category: "Machine Learning", readTime: "6 min" },
    { slug: "dashboard-penjualan-gratis", title: "Buat Dashboard Penjualan UMKM dalam 5 Menit", excerpt: "Step-by-step tutorial membuat dashboard analitik penjualan yang interaktif tanpa perlu coding atau keahlian data.", date: "25 Jan 2026", category: "Tutorial", readTime: "4 min" },
];

const categoryColors: Record<string, string> = { Tutorial: "#6366f1", "Machine Learning": "#10b981", Strategi: "#f59e0b" };

export default function BlogPage() {
    return (
        <div style={{ minHeight: "100vh" }}>
            <div className="bg-grid" />
            {/* Nav */}
            <nav style={{ padding: "20px 0", position: "sticky", top: 0, zIndex: 100, background: "rgba(15,15,35,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-color)" }}>
                <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Link href="/" className="navbar-logo"><BarChart3 size={28} style={{ color: "var(--primary)" }} /><span className="gradient-text">simbisai</span></Link>
                    <Link href="/register" className="btn-primary" style={{ padding: "10px 24px", fontSize: "0.9rem" }}>Mulai Gratis</Link>
                </div>
            </nav>

            {/* Header */}
            <section style={{ padding: "80px 0 48px", textAlign: "center" }}>
                <div className="container">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "16px" }}>
                            Blog <span className="gradient-text">simbisai</span>
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
                            Tips, tutorial, dan insight seputar analisis data penjualan UMKM.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="container" style={{ paddingBottom: "80px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>
                    {posts.map((post, i) => (
                        <motion.article key={post.slug} className="glass-card" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}>
                            {/* Gradient header */}
                            <div style={{ height: "8px", background: `linear-gradient(90deg, ${categoryColors[post.category] || "#6366f1"}, var(--accent))` }} />
                            <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                                    <span style={{ padding: "3px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 700, background: `${categoryColors[post.category] || "#6366f1"}22`, color: categoryColors[post.category] || "#6366f1" }}>
                                        <Tag size={10} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />{post.category}
                                    </span>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{post.readTime}</span>
                                </div>
                                <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "10px", lineHeight: 1.4 }}>{post.title}</h2>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.7, flex: 1, marginBottom: "16px" }}>{post.excerpt}</p>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "6px" }}><Calendar size={12} />{post.date}</span>
                                    <span style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>Baca <ArrowRight size={14} /></span>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </section>
        </div>
    );
}
