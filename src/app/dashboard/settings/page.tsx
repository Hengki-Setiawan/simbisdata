"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Settings, User, CreditCard, Bell, Shield, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [saved, setSaved] = useState(false);
    const [name, setName] = useState(session?.user?.name || "User");
    const [email] = useState(session?.user?.email || "user@email.com");
    const [notifications, setNotifications] = useState(true);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "12px 16px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius)",
        color: "var(--text-primary)",
        fontSize: "0.95rem",
        outline: "none",
        transition: "border-color 0.3s",
    };

    const tierInfo: Record<string, { label: string; color: string; features: string }> = {
        free: { label: "Free", color: "var(--text-muted)", features: "3 analisis/bulan, export CSV" },
        starter: { label: "Starter", color: "var(--accent)", features: "20 analisis/bulan, export PDF + Excel" },
        pro: { label: "Pro", color: "var(--primary)", features: "Unlimited, Premium PDF, AI Insight" },
        enterprise: { label: "Enterprise", color: "var(--success)", features: "White-label, Priority support" },
    };

    const currentTier = (session?.user as { tier?: string })?.tier || "free";
    const tier = tierInfo[currentTier] || tierInfo.free;

    return (
        <div style={{ maxWidth: "700px" }}>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>Pengaturan</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Kelola akun dan preferensi kamu.</p>
            </div>

            {saved && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{
                        padding: "12px 16px", borderRadius: "var(--radius)", marginBottom: "20px",
                        background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)",
                        display: "flex", alignItems: "center", gap: "10px", color: "var(--success)", fontSize: "0.9rem",
                    }}
                >
                    <CheckCircle2 size={18} /> Pengaturan berhasil disimpan!
                </motion.div>
            )}

            {/* Profile */}
            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <User size={20} style={{ color: "var(--primary)" }} />
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Profil</h2>
                </div>
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-secondary)" }}>Nama</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = "var(--primary)"} onBlur={(e) => e.target.style.borderColor = "var(--border-color)"} />
                </div>
                <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-secondary)" }}>Email</label>
                    <input type="email" value={email} disabled style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
                </div>
            </motion.div>

            {/* Subscription */}
            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <CreditCard size={20} style={{ color: "var(--primary)" }} />
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Langganan</h2>
                </div>
                <div style={{
                    padding: "16px 20px", borderRadius: "var(--radius)",
                    background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ fontWeight: 700 }}>Paket</span>
                            <span style={{
                                padding: "2px 10px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 700,
                                background: `${tier.color}22`, color: tier.color,
                            }}>
                                {tier.label}
                            </span>
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{tier.features}</p>
                    </div>
                    {currentTier !== "enterprise" && (
                        <button className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.85rem" }}>
                            Upgrade
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Notifications */}
            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <Bell size={20} style={{ color: "var(--primary)" }} />
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Notifikasi</h2>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <p style={{ fontWeight: 600, marginBottom: "4px" }}>Email Notifikasi</p>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Terima insight mingguan dan update fitur</p>
                    </div>
                    <button
                        onClick={() => setNotifications(!notifications)}
                        style={{
                            width: "48px", height: "26px", borderRadius: "13px", border: "none", cursor: "pointer",
                            background: notifications ? "var(--primary)" : "var(--bg-surface)",
                            position: "relative", transition: "background 0.3s",
                        }}
                    >
                        <div style={{
                            width: "20px", height: "20px", borderRadius: "50%", background: "white",
                            position: "absolute", top: "3px", transition: "left 0.3s",
                            left: notifications ? "25px" : "3px",
                        }} />
                    </button>
                </div>
            </motion.div>

            {/* Security */}
            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <Shield size={20} style={{ color: "var(--primary)" }} />
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Keamanan</h2>
                </div>
                <button style={{
                    padding: "10px 20px", borderRadius: "var(--radius)", border: "1px solid var(--border-color)",
                    background: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.9rem",
                }}>
                    Ubah Password
                </button>
            </motion.div>

            {/* Save */}
            <button onClick={handleSave} className="btn-primary" style={{ padding: "12px 32px" }}>
                <Save size={18} />
                <Settings size={0} /> {/* suppress unused warning */}
                Simpan Perubahan
            </button>
        </div>
    );
}
