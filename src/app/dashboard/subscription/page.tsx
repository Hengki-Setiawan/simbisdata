"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, X, Zap, Crown, Building2, Sparkles } from "lucide-react";

import posthog from 'posthog-js';

const plans = [
    {
        name: "Free",
        price: "Rp 0",
        period: "selamanya",
        icon: Sparkles,
        color: "var(--text-muted)",
        features: [
            { name: "3 analisis ML/bulan", included: true },
            { name: "Segmentasi (K-Means)", included: true },
            { name: "AI Insight (Basic)", included: true },
            { name: "7 chart dasar", included: true },
            { name: "Export CSV", included: true },
            { name: "Export PDF & Excel", included: false },
            { name: "Deteksi Anomali", included: false },
            { name: "Prediksi Demand AI", included: false },
        ],
    },
    {
        name: "Starter",
        price: "Rp 49K",
        period: "/bulan",
        icon: Zap,
        color: "var(--accent)",
        features: [
            { name: "20 analisis ML/bulan", included: true },
            { name: "Semua fitur Free", included: true },
            { name: "Deteksi Anomali", included: true },
            { name: "Analisis Sentimen (NLP)", included: true },
            { name: "Export PDF + Excel", included: true },
            { name: "AI Insight (Premium)", included: true },
            { name: "Prediksi Demand AI", included: false },
            { name: "Cohort Retention", included: false },
        ],
    },
    {
        name: "Pro",
        price: "Rp 149K",
        period: "/bulan",
        icon: Crown,
        color: "var(--primary)",
        popular: true,
        features: [
            { name: "Unlimited everything", included: true },
            { name: "Semua fitur Starter", included: true },
            { name: "Prediksi Demand (LSTM)", included: true },
            { name: "Cohort Retention AI", included: true },
            { name: "Customer Lifetime Value", included: true },
            { name: "Semua format export", included: true },
            { name: "Premium PDF Report", included: true },
            { name: "API Access & Smart Alerts", included: true },
        ],
    },
];

import { useSession } from "next-auth/react";

export default function SubscriptionPage() {
    const { data: session } = useSession();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleSubscribe = async (plan: any) => {
        if (plan.name === "Free") return;
        setLoadingPlan(plan.name);

        // Track user clicking upgrade
        if (typeof window !== "undefined") {
            posthog.capture("Clicked Upgrade Premium", {
                planName: plan.name,
                planPrice: plan.price
            });
        }

        try {
            // Convert "Rp 149K" to 149000
            const numericPrice = parseInt(plan.price.replace(/\D/g, "")) * 1000;

            const res = await fetch("/api/payment/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planName: plan.name,
                    price: numericPrice,
                    userId: session?.user?.id || "unknown-user",
                    userName: session?.user?.name || "SimbisData User",
                    userEmail: session?.user?.email || "user@SimbisData.com",
                }),
            });

            const data = await res.json();
            if (data.checkoutUrl) {
                // Redirect user exactly to Duitku Checkout Page
                window.location.href = data.checkoutUrl;
            } else {
                alert("Gagal membuat pembayaran Duitku: " + (data.error || "Unknown error"));
                setLoadingPlan(null);
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan jaringan.");
            setLoadingPlan(null);
        }
    };

    const currentPlan = (session?.user as any)?.planId || "free";

    return (
        <div>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>Pilih Paket Langganan</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Upgrade akunmu untuk akses fitur premium SimbisData.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                {plans.map((plan, i) => {
                    const Icon = plan.icon;
                    const isCurrentPlan = plan.name.toLowerCase() === currentPlan.toLowerCase();

                    return (
                        <motion.div
                            key={plan.name}
                            className="glass-card"
                            style={{
                                padding: "28px 24px",
                                position: "relative",
                                border: isCurrentPlan ? "2px solid var(--success)" : plan.popular ? "2px solid var(--primary)" : undefined,
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            {isCurrentPlan ? (
                                <div style={{
                                    position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                                    padding: "4px 16px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700,
                                    background: "var(--success)", color: "white",
                                }}>
                                    AKTIF
                                </div>
                            ) : plan.popular ? (
                                <div style={{
                                    position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                                    padding: "4px 16px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700,
                                    background: "var(--primary)", color: "white",
                                }}>
                                    POPULER
                                </div>
                            ) : null}

                            <div style={{ textAlign: "center", marginBottom: "24px" }}>
                                <Icon size={28} style={{ color: plan.color, marginBottom: "12px" }} />
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>{plan.name}</h3>
                                <div>
                                    <span style={{ fontSize: "1.8rem", fontWeight: 800 }}>{plan.price}</span>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{plan.period}</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: "24px" }}>
                                {plan.features.map((feat, j) => (
                                    <div key={j} style={{
                                        display: "flex", alignItems: "center", gap: "10px",
                                        padding: "8px 0", fontSize: "0.85rem",
                                        color: feat.included ? "var(--text-secondary)" : "var(--text-muted)",
                                        opacity: feat.included ? 1 : 0.5,
                                    }}>
                                        {feat.included ? (
                                            <CheckCircle2 size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
                                        ) : (
                                            <X size={16} style={{ flexShrink: 0 }} />
                                        )}
                                        {feat.name}
                                    </div>
                                ))}
                            </div>

                            <button
                                className={isCurrentPlan ? "btn-secondary" : plan.popular ? "btn-primary" : "btn-secondary"}
                                style={{ width: "100%", justifyContent: "center", padding: "12px", opacity: loadingPlan === plan.name ? 0.7 : 1 }}
                                disabled={loadingPlan === plan.name || isCurrentPlan}
                                onClick={() => handleSubscribe(plan)}
                            >
                                {loadingPlan === plan.name ? "Memproses..." : (isCurrentPlan ? "Paket Saat Ini" : "Pilih Paket")}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
