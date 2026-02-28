"use client";

import { motion } from "framer-motion";
import {
    BarChart3,
    Brain,
    Map,
    TrendingUp,
    ShieldCheck,
    Zap,
    Upload,
    Cpu,
    FileText,
    Sparkles
} from "lucide-react";

const getIcon = (name: string) => {
    switch (name) {
        case "upload": return <Upload size={28} />;
        case "cpu": return <Cpu size={28} />;
        case "file-text": return <FileText size={28} />;
        case "trending-up": return <TrendingUp size={28} />;
        case "brain": return <Brain size={28} />;
        case "bar-chart-3": return <BarChart3 size={28} />;
        case "map": return <Map size={28} />;
        case "zap": return <Zap size={28} />;
        case "shield-check": return <ShieldCheck size={28} />;
        default: return <Sparkles size={28} />;
    }
};

const colors = [
    { color: "var(--primary)", bg: "rgba(99, 102, 241, 0.15)" },
    { color: "var(--accent)", bg: "rgba(6, 182, 212, 0.15)" },
    { color: "var(--success)", bg: "rgba(16, 185, 129, 0.15)" },
    { color: "var(--warning)", bg: "rgba(245, 158, 11, 0.15)" },
    { color: "var(--danger)", bg: "rgba(239, 68, 68, 0.15)" },
    { color: "#a78bfa", bg: "rgba(167, 139, 250, 0.15)" },
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

export default function FeaturesSection({ data }: { data?: any[] }) {
    const featuresList = data && data.length > 0 ? data : [];

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
                    {featuresList.map((feature, index) => {
                        const theme = colors[index % colors.length];
                        return (
                            <motion.div
                                key={index}
                                className="glass-card feature-card"
                                variants={itemVariants}
                            >
                                <div
                                    className="feature-icon"
                                    style={{ background: theme.bg, color: theme.color }}
                                >
                                    {getIcon(feature.icon)}
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
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
