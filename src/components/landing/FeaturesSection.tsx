"use client";

import { motion } from "framer-motion";
import {
    BarChart3,
    Brain,
    Map,
    TrendingUp,
    ShieldCheck,
    Zap,
} from "lucide-react";

const features = [
    {
        icon: <TrendingUp size={28} />,
        title: "Prediksi Penjualan",
        description:
            "Forecast penjualan 30-180 hari ke depan dengan ARIMA, Prophet, dan Exponential Smoothing.",
        color: "var(--primary)",
        bg: "rgba(99, 102, 241, 0.15)",
    },
    {
        icon: <Brain size={28} />,
        title: "AI Narasi Cerdas",
        description:
            "Groq + Gemini AI menghasilkan penjelasan dan rekomendasi dalam bahasa Indonesia yang mudah dipahami.",
        color: "var(--accent)",
        bg: "rgba(6, 182, 212, 0.15)",
    },
    {
        icon: <BarChart3 size={28} />,
        title: "15+ Algoritma ML",
        description:
            "K-Means Clustering, RFM Analysis, Cohort Analysis, Anomaly Detection, dan banyak lagi.",
        color: "var(--success)",
        bg: "rgba(16, 185, 129, 0.15)",
    },
    {
        icon: <Map size={28} />,
        title: "Peta Distribusi",
        description:
            "Peta interaktif Indonesia menunjukkan distribusi penjualan per provinsi dan kota.",
        color: "var(--warning)",
        bg: "rgba(245, 158, 11, 0.15)",
    },
    {
        icon: <Zap size={28} />,
        title: "Upload & Analisis Instan",
        description:
            "Drag & drop file Excel penjualan, hasil analisis lengkap dalam hitungan detik.",
        color: "var(--danger)",
        bg: "rgba(239, 68, 68, 0.15)",
    },
    {
        icon: <ShieldCheck size={28} />,
        title: "Data Aman & Privat",
        description:
            "Data penjualan kamu terenkripsi dan hanya bisa diakses oleh kamu sendiri.",
        color: "#a78bfa",
        bg: "rgba(167, 139, 250, 0.15)",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
    return (
        <section id="features" className="section">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="section-title">
                        Fitur <span className="gradient-text">Canggih</span> untuk Seller
                    </h2>
                    <p className="section-subtitle">
                        Kombinasi Machine Learning dan AI yang mengubah data mentah menjadi
                        insight bisnis yang actionable.
                    </p>
                </motion.div>

                <motion.div
                    className="features-grid"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="glass-card feature-card"
                            variants={itemVariants}
                        >
                            <div
                                className="feature-icon"
                                style={{ background: feature.bg, color: feature.color }}
                            >
                                {feature.icon}
                            </div>
                            <h3
                                style={{
                                    fontSize: "1.2rem",
                                    fontWeight: 700,
                                    marginBottom: "12px",
                                }}
                            >
                                {feature.title}
                            </h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
