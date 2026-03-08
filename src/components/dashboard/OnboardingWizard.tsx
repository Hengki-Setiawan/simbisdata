"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, CheckCircle2, Sparkles, LineChart, Brain } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

export default function OnboardingWizard() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Cek localStorage apakah user sudah pernah menyelesaikan onboarding
        const hasSeenOnboarding = localStorage.getItem("simbisdata_onboarding_completed");
        if (!hasSeenOnboarding) {
            // Beri sedikit delay agar UI render dulu
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem("simbisdata_onboarding_completed", "true");
        setIsOpen(false);
    };

    const steps = [
        {
            title: "Selamat Datang di SimbisData! 👋",
            desc: "Platform Business Intelligence pintar untuk Seller UMKM. Mari kita lihat cara kerjanya secara singkat.",
            icon: <Sparkles size={40} className="text-primary mb-4" />,
            color: "var(--primary-surface)",
            iconColor: "var(--primary)"
        },
        {
            title: "1. Upload File Penjualan",
            desc: "Drag & drop file Excel laporan penjualan Anda ke menu Upload. Kami mendukung platform Shopee, Tokopedia, dan TikTok Shop.",
            icon: <LineChart size={40} className="text-accent mb-4" />,
            color: "var(--accent-surface)",
            iconColor: "var(--accent)"
        },
        {
            title: "2. Deteksi & Mapping Kolom AI",
            desc: "Artificial Intelligence secara otomatis akan memformat data Anda, mendeteksi platform asalnya, dan membersihkan error.",
            icon: <Brain size={40} className="text-warning mb-4" />,
            color: "var(--warning-bg)",
            iconColor: "var(--warning)"
        },
        {
            title: "3. Insight Bisnis Otomatis",
            desc: "Dashboard Anda akan dihitung menggunakan 15 algoritma Machine Learning yang memberikan action plan untuk menaikkan revenue.",
            icon: <CheckCircle2 size={40} className="text-success mb-4" />,
            color: "var(--success-bg)",
            iconColor: "var(--success)"
        }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 9999, padding: "24px"
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-card"
                    style={{
                        maxWidth: "500px", width: "100%", background: "var(--bg-card)",
                        padding: "0", overflow: "hidden", position: "relative",
                        boxShadow: "var(--shadow-xl)"
                    }}
                >
                    <button onClick={completeOnboarding} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", zIndex: 10 }}>
                        <X size={20} />
                    </button>

                    <div style={{ background: steps[step].color, padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", transition: "background 0.3s ease" }}>
                        <div style={{ color: steps[step].iconColor, display: "flex", justifyContent: "center" }}>
                            {steps[step].icon}
                        </div>
                        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-heading)", marginBottom: "12px" }}>
                            {steps[step].title}
                        </h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                            {steps[step].desc}
                        </p>
                    </div>

                    <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-color)" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                            {steps.map((_, i) => (
                                <div key={i} style={{ width: i === step ? "24px" : "8px", height: "8px", borderRadius: "4px", background: i === step ? "var(--primary)" : "var(--border-color)", transition: "all 0.3s ease" }} />
                            ))}
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            {step > 0 && (
                                <button onClick={() => setStep(step - 1)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.9rem" }}>
                                    Kembali
                                </button>
                            )}
                            
                            {step < steps.length - 1 ? (
                                <button onClick={() => setStep(step + 1)} className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                    Lanjut <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button onClick={completeOnboarding} className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px", background: "var(--success)" }}>
                                    Mulai Gunakan <CheckCircle2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
