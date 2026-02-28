"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            // Always show success (to prevent email enumeration)
            setSent(true);
        } catch {
            setSent(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <motion.div className="glass-card" style={{ padding: "48px 40px", width: "100%", maxWidth: "440px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "24px" }}>
                    <ArrowLeft size={16} /> Kembali ke Login
                </Link>

                {sent ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <CheckCircle2 size={56} style={{ color: "var(--success)", marginBottom: "16px" }} />
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "12px" }}>Email Terkirim!</h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "24px" }}>
                            Kami telah mengirim link reset password ke <strong>{email}</strong>. Silakan cek inbox dan folder spam kamu.
                        </p>
                        <Link href="/login" className="btn-primary" style={{ justifyContent: "center", width: "100%" }}>Kembali ke Login</Link>
                    </div>
                ) : (
                    <>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>Lupa Password?</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "32px" }}>
                            Masukkan email kamu. Kami akan kirim link untuk reset password.
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-secondary)" }}>Email</label>
                                <div style={{ position: "relative" }}>
                                    <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required style={{
                                        width: "100%", padding: "12px 14px 12px 44px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                                        borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.95rem", outline: "none",
                                    }} />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "14px", opacity: loading ? 0.7 : 1 }}>
                                {loading ? "Mengirim..." : "Kirim Link Reset"}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
}
