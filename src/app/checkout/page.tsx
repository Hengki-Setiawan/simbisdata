"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowLeft, CreditCard, Shield, Zap } from "lucide-react";

const plans = [
    { id: "starter", name: "Starter", price: 29000, priceYearly: 290000, features: ["10 upload/bulan", "5.000 rows/file", "15 metrik analisis", "3 ML algorithms", "10 AI narasi/bulan", "Export PDF basic"] },
    { id: "pro", name: "Pro", price: 79000, priceYearly: 790000, popular: true, features: ["Unlimited upload", "50.000 rows/file", "25+ metrik analisis", "Semua ML algorithms", "100 AI narasi/bulan", "Export branded PDF", "Customer segmentation", "Smart alerts email"] },
    { id: "enterprise", name: "Enterprise", price: 199000, priceYearly: 1990000, features: ["Semua fitur Pro", "100.000+ rows/file", "Unlimited AI narasi", "Export PowerPoint", "API Access", "WhatsApp support 2h", "Custom analytics", "White-label reports"] },
];

export default function CheckoutPage() {
    const [selectedPlan, setSelectedPlan] = useState("pro");
    const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
    const [processing, setProcessing] = useState(false);

    const plan = plans.find(p => p.id === selectedPlan)!;
    const price = billing === "monthly" ? plan.price : plan.priceYearly;
    const savings = billing === "yearly" ? Math.round((plan.price * 12 - plan.priceYearly) / (plan.price * 12) * 100) : 0;

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            const res = await fetch("/api/payment/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: selectedPlan, billing }),
            });
            const data = await res.json();
            if (data.paymentUrl) {
                window.open(data.paymentUrl, "_blank");
            } else {
                alert("Payment gateway sedang dalam proses setup. Silakan hubungi admin untuk upgrade manual.");
            }
        } catch (err) {
            alert("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <motion.div style={{ width: "100%", maxWidth: "900px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Link href="/dashboard/subscription" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px" }}>
                    <ArrowLeft size={16} /> Kembali ke Dashboard
                </Link>

                <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "8px" }}>
                    <CreditCard size={32} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
                    Upgrade Langganan
                </h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Pilih paket yang sesuai dengan kebutuhan bisnis Anda.</p>

                {/* Billing Toggle */}
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
                    <button onClick={() => setBilling("monthly")} style={{
                        padding: "8px 24px", borderRadius: "100px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
                        background: billing === "monthly" ? "var(--primary)" : "var(--bg-surface)", color: billing === "monthly" ? "white" : "var(--text-muted)",
                        border: billing === "monthly" ? "none" : "1px solid var(--border-color)",
                    }}>Bulanan</button>
                    <button onClick={() => setBilling("yearly")} style={{
                        padding: "8px 24px", borderRadius: "100px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
                        background: billing === "yearly" ? "var(--primary)" : "var(--bg-surface)", color: billing === "yearly" ? "white" : "var(--text-muted)",
                        border: billing === "yearly" ? "none" : "1px solid var(--border-color)",
                    }}>Tahunan (hemat 17%)</button>
                </div>

                {/* Plan Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
                    {plans.map(p => (
                        <div
                            key={p.id}
                            className="glass-card"
                            onClick={() => setSelectedPlan(p.id)}
                            style={{
                                padding: "24px",
                                cursor: "pointer",
                                border: selectedPlan === p.id ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                                position: "relative",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {p.popular && (
                                <div style={{ position: "absolute", top: "-10px", right: "12px", background: "var(--gradient-1)", padding: "2px 12px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 700, color: "white" }}>
                                    Populer
                                </div>
                            )}
                            <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "8px" }}>{p.name}</h3>
                            <p style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "4px" }}>
                                Rp {(billing === "monthly" ? p.price : p.priceYearly).toLocaleString("id-ID")}
                            </p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "16px" }}>
                                /{billing === "monthly" ? "bulan" : "tahun"}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {p.features.map((f, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                                        <Check size={14} style={{ color: "var(--success)", flexShrink: 0 }} /> {f}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Checkout Summary */}
                <div className="glass-card" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>Paket {plan.name} — {billing === "monthly" ? "Bulanan" : "Tahunan"}</p>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            Rp {price.toLocaleString("id-ID")} {billing === "yearly" && `(hemat ${savings}%)`}
                        </p>
                    </div>
                    <button onClick={handleCheckout} disabled={processing} className="btn-primary" style={{ padding: "14px 32px", fontSize: "1rem", opacity: processing ? 0.7 : 1 }}>
                        {processing ? "Memproses..." : `💳 Bayar Rp ${price.toLocaleString("id-ID")}`}
                    </button>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "24px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "var(--text-muted)" }}><Shield size={14} /> Pembayaran aman</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "var(--text-muted)" }}><Zap size={14} /> Akses instan</span>
                </div>
            </motion.div>
        </div>
    );
}
