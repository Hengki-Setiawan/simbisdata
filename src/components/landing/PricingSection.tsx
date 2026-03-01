"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Free",
        emoji: "🆓",
        price: "Rp 0",
        period: "selamanya",
        description: "Untuk mencoba fitur dasar",
        features: [
            { text: "2 upload / bulan", included: true },
            { text: "Max 500 baris data", included: true },
            { text: "5 metrik statistik", included: true },
            { text: "Template narasi (bukan AI)", included: true },
            { text: "Algoritma ML", included: false },
            { text: "Sales Forecasting", included: false },
            { text: "Export PDF", included: false },
        ],
        cta: "Mulai Gratis",
        popular: false,
    },
    {
        name: "Starter",
        emoji: "⭐",
        price: "Rp 29K",
        period: "/ bulan",
        description: "Untuk seller pemula",
        features: [
            { text: "10 upload / bulan", included: true },
            { text: "Max 5.000 baris data", included: true },
            { text: "15 metrik statistik", included: true },
            { text: "10 narasi AI / bulan", included: true },
            { text: "3 algoritma ML", included: true },
            { text: "Forecast 30 hari", included: true },
            { text: "Export PDF basic", included: true },
        ],
        cta: "Pilih Starter",
        popular: false,
    },
    {
        name: "Pro",
        emoji: "💎",
        price: "Rp 79K",
        period: "/ bulan",
        description: "Untuk seller serius",
        features: [
            { text: "Upload unlimited", included: true },
            { text: "Max 50.000 baris data", included: true },
            { text: "25+ metrik lengkap", included: true },
            { text: "100 narasi AI / bulan", included: true },
            { text: "Semua 15+ algoritma ML", included: true },
            { text: "Forecast 90 hari", included: true },
            { text: "Export PDF branded", included: true },
        ],
        cta: "Pilih Pro",
        popular: true,
    },
];

export default function PricingSection() {
    return (
        <section id="pricing" className="section">
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="section-title">
                        Harga <span className="gradient-text">Terjangkau</span>
                    </h2>
                    <p className="section-subtitle">
                        Mulai gratis, upgrade kapan saja. Semua plan termasuk dashboard analytics
                        interaktif dan visualisasi data yang menarik.
                    </p>
                </motion.div>

                <div className="pricing-grid">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            className={`glass-card pricing-card ${plan.popular ? "popular" : ""}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div>
                                <span style={{ fontSize: "1.5rem" }}>{plan.emoji}</span>
                                <span
                                    style={{
                                        fontSize: "0.85rem",
                                        fontWeight: 700,
                                        marginLeft: "8px",
                                        color: plan.popular ? "var(--primary-light)" : "var(--text-secondary)",
                                    }}
                                >
                                    {plan.name}
                                </span>
                            </div>
                            <div className="pricing-price">
                                {plan.price}
                                <span
                                    style={{
                                        fontSize: "0.9rem",
                                        fontWeight: 400,
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    {" "}{plan.period}
                                </span>
                            </div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                {plan.description}
                            </p>

                            <ul className="pricing-features">
                                {plan.features.map((feature, j) => (
                                    <li key={j}>
                                        {feature.included ? (
                                            <Check size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
                                        ) : (
                                            <X size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                                        )}
                                        <span style={{ color: feature.included ? "var(--text-secondary)" : "var(--text-muted)" }}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/register"
                                className={plan.popular ? "btn-primary" : "btn-secondary"}
                                style={{ textAlign: "center", justifyContent: "center", width: "100%" }}
                            >
                                {plan.cta}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
