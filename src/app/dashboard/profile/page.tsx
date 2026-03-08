"use client";

import { useSession } from "next-auth/react";
import { User, Mail, Shield, CheckCircle2, CreditCard, ArrowRight, Zap, Crown, AlertCircle } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useState } from "react";

type PlanTier = "Free" | "Starter" | "Pro";

export default function ProfilePage() {
    const { data: session } = useSession();
    
    // Default fallback values if session is not immediately available
    const userRole = (session?.user as any)?.role || "user";
    const userName = session?.user?.name || "Pengguna SimbisData";
    const userEmail = session?.user?.email || "user@simbisdata.com";
    
    // Simulate user's current plan (in a real app, this comes from the DB)
    const [currentPlan, setCurrentPlan] = useState<PlanTier>(userRole === "admin" ? "Pro" : "Free");
    
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleUpgradeClick = async (plan: PlanTier, price: number) => {
        if (plan === currentPlan) {
            alert("Anda sudah berlangganan paket ini.");
            return;
        }
        
        setIsProcessing(plan);
        try {
            const res = await fetch("/api/duitku/inquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId: plan,
                    amount: price,
                    customerName: userName,
                    customerEmail: userEmail
                })
            });
            const data = await res.json();
            if (data.success && data.paymentUrl) {
                // Redirect to actual Duitku sandbox payment gateway
                window.location.href = data.paymentUrl;
            } else {
                console.error(data.error);
                alert("Gagal memproses pembayaran: " + (data.error || "Coba lagi nanti."));
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan jaringan.");
        } finally {
            setIsProcessing(null);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const childVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <div style={{ maxWidth: "100%", margin: "0 auto", paddingBottom: "24px" }}>
            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                
                {/* Header Section */}
                <motion.div variants={childVariants} style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "8px", color: "var(--text-primary)" }}>Profil Pengguna</h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Kelola informasi akun dan paket langganan Anda.</p>
                    </div>
                </motion.div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "32px" }}>
                    {/* Personal Info Card */}
                    <motion.div variants={childVariants} className="glass-card" style={{ padding: "32px", flex: "1 1 300px", minWidth: 0 }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <User size={20} className="text-primary" /> Informasi Pribadi
                        </h2>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ 
                                    width: "50px", height: "50px", borderRadius: "50%", 
                                    background: "var(--primary-surface)", color: "var(--primary)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 800, fontSize: "1.2rem", flexShrink: 0
                                }}>
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Nama Lengkap</p>
                                    <p style={{ fontWeight: 600, fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</p>
                                </div>
                            </div>
                            
                            <div style={{ height: "1px", background: "var(--border-color)" }} />
                            
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ width: "50px", display: "flex", justifyContent: "center", color: "var(--text-muted)", flexShrink: 0 }}>
                                    <Mail size={20} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Email</p>
                                    <p style={{ fontWeight: 500, fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userEmail}</p>
                                </div>
                            </div>

                            <div style={{ height: "1px", background: "var(--border-color)" }} />

                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ width: "50px", display: "flex", justifyContent: "center", color: "var(--text-muted)", flexShrink: 0 }}>
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>Role Sistem</p>
                                    <span style={{ 
                                        display: "inline-block", 
                                        padding: "4px 10px", 
                                        borderRadius: "100px", 
                                        fontSize: "0.75rem", 
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                        background: userRole === "admin" ? "rgba(220, 38, 38, 0.1)" : "var(--primary-surface)",
                                        color: userRole === "admin" ? "var(--danger)" : "var(--primary)"
                                    }}>
                                        {userRole}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Current Plan Card */}
                    <motion.div variants={childVariants} className="glass-card" style={{ padding: "32px", position: "relative", overflow: "hidden", flex: "1 1 300px", minWidth: 0 }}>
                        {/* Decorative Background */}
                        <div style={{ 
                            position: "absolute", top: "-50px", right: "-50px", width: "150px", height: "150px", 
                            background: "var(--primary)",
                            opacity: 0.1, borderRadius: "50%", filter: "blur(40px)", zIndex: 0
                        }}></div>

                        <div style={{ position: "relative", zIndex: 1 }}>
                            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                                <CreditCard size={20} className="text-primary" /> Paket Saat Ini
                            </h2>

                            <div style={{ marginBottom: "24px" }}>
                                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "8px" }}>Status Langganan</p>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ fontSize: "2rem", fontWeight: 800 }}>{currentPlan}</span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--success)", fontSize: "0.85rem", fontWeight: 700, background: "rgba(22, 163, 74, 0.1)", padding: "4px 10px", borderRadius: "100px" }}>
                                        <CheckCircle2 size={14} /> Aktif
                                    </span>
                                </div>
                            </div>

                            <div style={{ background: "var(--bg-main)", padding: "16px", borderRadius: "12px", marginBottom: "24px" }}>
                                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "12px" }}>Fitur yang Anda dapatkan:</p>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {currentPlan === "Free" && (
                                        <>
                                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}><CheckCircle2 size={14} className="text-success flex-shrink-0" /> Akses Dashboard Basic</li>
                                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}><CheckCircle2 size={14} className="text-success flex-shrink-0" /> Upload Data Terbatas (Max 1MB)</li>
                                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}><CheckCircle2 size={14} className="text-success flex-shrink-0" /> Fitur Cleaning Dasar</li>
                                        </>
                                    )}
                                    {currentPlan === "Starter" && (
                                        <>
                                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}><CheckCircle2 size={14} className="text-success flex-shrink-0" /> Semua Fitur Free</li>
                                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}><CheckCircle2 size={14} className="text-success flex-shrink-0" /> Upload Data hingga 10MB</li>
                                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}><CheckCircle2 size={14} className="text-success flex-shrink-0" /> Laporan PDF Otomatis</li>
                                        </>
                                    )}
                                    {currentPlan === "Pro" && (
                                        <>
                                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}><CheckCircle2 size={14} className="text-success flex-shrink-0" /> ML Analytics (K-Means, RFM)</li>
                                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}><CheckCircle2 size={14} className="text-success flex-shrink-0" /> Upload Data Tak Terbatas</li>
                                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}><CheckCircle2 size={14} className="text-success flex-shrink-0" /> Akses Korelasi AI Lanjutan</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Upgrade Plans Section */}
                <motion.div variants={childVariants}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "24px" }}>Upgrade Paket Anda</h2>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                        
                        {/* Starter Plan */}
                        <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", border: currentPlan === "Starter" ? "2px solid var(--primary)" : "", minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Starter</h3>
                                {currentPlan === "Starter" && <span style={{ background: "var(--primary)", color: "white", padding: "4px 10px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 700 }}>Current</span>}
                            </div>
                            <div style={{ marginBottom: "24px" }}>
                                <span style={{ fontSize: "2rem", fontWeight: 800 }}>Rp 99.000</span>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}> / bulan</span>
                            </div>
                            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                                <li style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem" }}><CheckCircle2 size={16} className="text-primary mt-1 flex-shrink-0" /> Kapasitas unggah 10MB</li>
                                <li style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem" }}><CheckCircle2 size={16} className="text-primary mt-1 flex-shrink-0" /> Fitur AI Synthesis (Laporan PDF)</li>
                                <li style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem" }}><CheckCircle2 size={16} className="text-primary mt-1 flex-shrink-0" /> Customer Support 24/7</li>
                            </ul>
                            <button 
                                onClick={() => handleUpgradeClick("Starter", 99000)}
                                disabled={currentPlan === "Starter" || isProcessing !== null}
                                style={{
                                    width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                                    background: currentPlan === "Starter" ? "var(--bg-main)" : "var(--primary)",
                                    color: currentPlan === "Starter" ? "var(--text-muted)" : "white",
                                    fontWeight: 700, cursor: (currentPlan === "Starter" || isProcessing) ? "not-allowed" : "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                {currentPlan === "Starter" ? "Plan Saat Ini" : isProcessing === "Starter" ? "Memproses..." : "Pilih Starter"}
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", position: "relative", border: currentPlan === "Pro" ? "2px solid var(--primary)" : "", minWidth: 0 }}>
                            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -50%)", background: "var(--gradient-1)", color: "white", padding: "4px 16px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "1px" }}>
                                REKOMENDASI
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}><Zap size={18} className="text-primary" /> Pro</h3>
                                {currentPlan === "Pro" && <span style={{ background: "var(--primary)", color: "white", padding: "4px 10px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 700 }}>Current</span>}
                            </div>
                            <div style={{ marginBottom: "24px" }}>
                                <span style={{ fontSize: "2rem", fontWeight: 800 }}>Rp 249.000</span>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}> / bulan</span>
                            </div>
                            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                                <li style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem" }}><CheckCircle2 size={16} className="text-primary mt-1 flex-shrink-0" /> Kapasitas unggah 5GB</li>
                                <li style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem" }}><CheckCircle2 size={16} className="text-primary mt-1 flex-shrink-0" /> Full Machine Learning Analytics</li>
                                <li style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem" }}><CheckCircle2 size={16} className="text-primary mt-1 flex-shrink-0" /> Peta Tematik & Optimalisasi Harga</li>
                            </ul>
                            <button 
                                onClick={() => handleUpgradeClick("Pro", 249000)}
                                disabled={currentPlan === "Pro" || isProcessing !== null}
                                style={{
                                    width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                                    background: currentPlan === "Pro" ? "var(--bg-main)" : "var(--text-primary)",
                                    color: currentPlan === "Pro" ? "var(--text-muted)" : "var(--bg-main)",
                                    fontWeight: 700, cursor: (currentPlan === "Pro" || isProcessing) ? "not-allowed" : "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                {currentPlan === "Pro" ? "Plan Saat Ini" : isProcessing === "Pro" ? "Memproses..." : "Pilih Pro"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
