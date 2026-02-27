"use client";

import { motion } from "framer-motion";
import { CheckCircle2, X, Zap, Crown, Building2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        name: "Free", price: "Rp 0", yearly: "Rp 0", period: "selamanya",
        icon: Sparkles, color: "#94a3b8", bg: "rgba(148,163,184,0.08)",
        features: [
            { name: "2 file upload/bulan", ok: true },
            { name: "Max 500 baris/file", ok: true },
            { name: "5 metrik analisis dasar", ok: true },
            { name: "Export CSV", ok: true },
            { name: "Template narasi (offline)", ok: true },
            { name: "ML Algorithms", ok: false },
            { name: "AI Narasi (Groq)", ok: false },
            { name: "Sales Forecasting", ok: false },
            { name: "Export PDF/Excel", ok: false },
            { name: "Premium PDF", ok: false },
            { name: "Customer Segmentation", ok: false },
            { name: "Smart Alerts", ok: false },
        ],
    },
    {
        name: "Starter", price: "Rp 29K", yearly: "Rp 290K/tahun", period: "/bulan",
        icon: Zap, color: "#f59e0b", bg: "rgba(245,158,11,0.08)",
        features: [
            { name: "10 file upload/bulan", ok: true },
            { name: "Max 5.000 baris/file", ok: true },
            { name: "15 metrik analisis", ok: true },
            { name: "Export CSV + PDF + Excel", ok: true },
            { name: "10 AI Narasi/bulan", ok: true },
            { name: "3 ML Algorithms", ok: true },
            { name: "Sales Forecasting 30 hari", ok: true },
            { name: "Peta provinsi", ok: true },
            { name: "Compare 2 periode", ok: true },
            { name: "Riwayat 30 hari", ok: true },
            { name: "Customer Segmentation", ok: false },
            { name: "Premium PDF", ok: false },
        ],
    },
    {
        name: "Pro", price: "Rp 79K", yearly: "Rp 790K/tahun", period: "/bulan",
        icon: Crown, color: "#6366f1", bg: "rgba(99,102,241,0.08)", popular: true,
        features: [
            { name: "Unlimited upload", ok: true },
            { name: "Max 50.000 baris/file", ok: true },
            { name: "25+ metrik (semua analisis)", ok: true },
            { name: "Semua format export", ok: true },
            { name: "100 AI Narasi/bulan", ok: true },
            { name: "Semua ML Algorithms (7+)", ok: true },
            { name: "Sales Forecasting 90 hari", ok: true },
            { name: "Peta kota/kabupaten", ok: true },
            { name: "Premium PDF (Browserless)", ok: true },
            { name: "Customer Segmentation", ok: true },
            { name: "Smart Alerts (Email)", ok: true },
            { name: "Riwayat 1 tahun", ok: true },
        ],
    },
    {
        name: "Enterprise", price: "Rp 199K", yearly: "Rp 1.99jt/tahun", period: "/bulan",
        icon: Building2, color: "#10b981", bg: "rgba(16,185,129,0.08)",
        features: [
            { name: "Unlimited everything", ok: true },
            { name: "100.000+ baris/file", ok: true },
            { name: "Custom analisis", ok: true },
            { name: "White-label PDF", ok: true },
            { name: "Unlimited AI Narasi", ok: true },
            { name: "Semua ML + Custom", ok: true },
            { name: "Sales Forecasting 180 hari", ok: true },
            { name: "Peta hingga kecamatan", ok: true },
            { name: "API Access", ok: true },
            { name: "Multi-user team", ok: true },
            { name: "Smart Alerts (Email + WA)", ok: true },
            { name: "Dedicated support (2 jam)", ok: true },
        ],
    },
];

export default function PricingPage() {
    return (
        <div style={{ minHeight: "100vh", padding: "80px 24px 60px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <Link href="/" style={{ textDecoration: "none", color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "16px", display: "block" }}>
                        ← Kembali ke Beranda
                    </Link>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "16px" }}>
                        Pilih Paket yang <span className="gradient-text">Tepat</span>
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
                        Terjangkau untuk UMKM Indonesia. Mulai gratis, upgrade kapan saja.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                    {plans.map((plan, i) => {
                        const Icon = plan.icon;
                        return (
                            <motion.div key={plan.name} className="glass-card" style={{
                                padding: "32px 24px", position: "relative",
                                border: plan.popular ? "2px solid var(--primary)" : undefined,
                                background: plan.bg,
                            }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                                {plan.popular && (
                                    <div style={{
                                        position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                                        padding: "4px 20px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700,
                                        background: "var(--primary)", color: "white",
                                    }}>PALING POPULER</div>
                                )}
                                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                                    <Icon size={32} style={{ color: plan.color, marginBottom: "12px" }} />
                                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "8px" }}>{plan.name}</h3>
                                    <div><span style={{ fontSize: "2rem", fontWeight: 900 }}>{plan.price}</span><span style={{ color: "var(--text-muted)" }}>{plan.period}</span></div>
                                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>{plan.yearly}</p>
                                </div>
                                <div style={{ marginBottom: "24px" }}>
                                    {plan.features.map((f, j) => (
                                        <div key={j} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 0", fontSize: "0.83rem", color: f.ok ? "var(--text-secondary)" : "var(--text-muted)", opacity: f.ok ? 1 : 0.45 }}>
                                            {f.ok ? <CheckCircle2 size={15} style={{ color: plan.color, flexShrink: 0 }} /> : <X size={15} style={{ flexShrink: 0 }} />}
                                            {f.name}
                                        </div>
                                    ))}
                                </div>
                                <Link href="/register" className={plan.popular ? "btn-primary" : "btn-secondary"} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
                                    Mulai Sekarang <ArrowRight size={16} />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                <div style={{ textAlign: "center", marginTop: "48px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    <p>Semua harga dalam Rupiah. Hemat 17% dengan langganan tahunan.</p>
                    <p style={{ marginTop: "8px" }}>Butuh custom plan? <Link href="/register" style={{ color: "var(--primary-light)" }}>Hubungi kami</Link></p>
                </div>
            </div>
        </div>
    );
}
