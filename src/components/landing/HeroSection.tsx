"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroSection() {
    const [stats, setStats] = useState({ totalRows: 0, totalUsers: 0 });

    useEffect(() => {
        fetch("/api/public/stats").then(r => r.json()).then(data => {
            if (data.success) {
                setStats({ totalRows: data.totalRows || 0, totalUsers: data.totalUsers || 0 });
            }
        }).catch(() => { });
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
        return num.toString();
    };

    return (
        <section className="hero">
            <div className="container">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="hero-title">
                        Ubah Data Penjualan Jadi{" "}
                        <span className="gradient-text">Insight Bisnis</span>
                    </h1>

                    <p className="hero-description">
                        Upload file Excel penjualan dari marketplace manapun atau data UMKM sendiri.
                        15+ algoritma ML dan narasi AI — tanpa perlu keahlian data science.
                    </p>

                    <div className="hero-actions">
                        <Link href="/register" className="btn-primary">
                            <Upload size={20} />
                            Mulai Gratis
                            <ArrowRight size={18} />
                        </Link>
                        <Link href="#features" className="btn-secondary">
                            Lihat Fitur
                        </Link>
                    </div>

                    <motion.div
                        className="hero-stats"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        <div className="hero-stat">
                            <div className="hero-stat-value gradient-text">15+</div>
                            <div className="hero-stat-label">Algoritma ML</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value gradient-text">{stats.totalRows > 0 ? formatNumber(stats.totalRows) : "1M+"}</div>
                            <div className="hero-stat-label">Baris Data Diolah</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value gradient-text">AI</div>
                            <div className="hero-stat-label">Natural Language</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value gradient-text">{stats.totalUsers > 0 ? formatNumber(stats.totalUsers * 1) : "100+"}</div>
                            <div className="hero-stat-label">Pengguna Aktif</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
