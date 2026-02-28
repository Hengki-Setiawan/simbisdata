"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Upload } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
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
                            <div className="hero-stat-value gradient-text">48</div>
                            <div className="hero-stat-label">Kolom Data Diolah</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value gradient-text">AI</div>
                            <div className="hero-stat-label">Narasi Bahasa Indonesia</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value gradient-text">Rp 0</div>
                            <div className="hero-stat-label">Mulai Gratis</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
