"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Gagal mendaftar");
                setLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } catch {
            setError("Terjadi kesalahan. Coba lagi.");
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "12px 12px 12px 44px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius)",
        color: "var(--text-primary)",
        fontSize: "0.95rem",
        outline: "none",
        transition: "border-color 0.3s",
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <div className="glass-card" style={{ width: "100%", maxWidth: "440px", padding: "48px 40px" }}>
                <div style={{ textAlign: "center", marginBottom: "36px" }}>
                    <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
                        <BarChart3 size={32} style={{ color: "var(--primary)" }} />
                        <span className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: 800 }}>simbisai</span>
                    </Link>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>Buat Akun Gratis</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Mulai analisis data penjualan kamu</p>
                </div>

                {error && (
                    <div style={{
                        padding: "12px 16px", borderRadius: "var(--radius)", marginBottom: "20px",
                        background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)",
                        display: "flex", alignItems: "center", gap: "10px", color: "var(--danger)", fontSize: "0.9rem",
                    }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        padding: "12px 16px", borderRadius: "var(--radius)", marginBottom: "20px",
                        background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)",
                        display: "flex", alignItems: "center", gap: "10px", color: "var(--success)", fontSize: "0.9rem",
                    }}>
                        <CheckCircle2 size={18} /> Akun berhasil dibuat! Mengalihkan ke halaman login...
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-secondary)" }}>Nama Lengkap</label>
                        <div style={{ position: "relative" }}>
                            <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "var(--primary)"} onBlur={(e) => e.target.style.borderColor = "var(--border-color)"} />
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-secondary)" }}>Email</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "var(--primary)"} onBlur={(e) => e.target.style.borderColor = "var(--border-color)"} />
                        </div>
                    </div>

                    <div style={{ marginBottom: "28px" }}>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", color: "var(--text-secondary)" }}>Password</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 karakter" required style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "var(--primary)"} onBlur={(e) => e.target.style.borderColor = "var(--border-color)"} />
                        </div>
                        {/* Password Strength Indicator */}
                        {password.length > 0 && (() => {
                            let score = 0;
                            if (password.length >= 6) score++;
                            if (password.length >= 8) score++;
                            if (/[A-Z]/.test(password)) score++;
                            if (/[0-9]/.test(password)) score++;
                            if (/[^A-Za-z0-9]/.test(password)) score++;
                            const colors = ["#ef4444", "#f59e0b", "#f59e0b", "#10b981", "#10b981"];
                            const labels = ["Sangat Lemah", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];
                            return (
                                <div style={{ marginTop: "10px" }}>
                                    <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                                        {[0, 1, 2, 3, 4].map(i => (
                                            <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", background: i < score ? colors[score - 1] : "var(--border-color)", transition: "background 0.3s" }} />
                                        ))}
                                    </div>
                                    <p style={{ fontSize: "0.75rem", color: colors[Math.max(score - 1, 0)], fontWeight: 600 }}>
                                        {labels[Math.max(score - 1, 0)]}
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "6px" }}>
                                        {[
                                            { ok: password.length >= 6, txt: "6+ karakter" },
                                            { ok: /[A-Z]/.test(password), txt: "Huruf besar" },
                                            { ok: /[0-9]/.test(password), txt: "Angka" },
                                            { ok: /[^A-Za-z0-9]/.test(password), txt: "Simbol" },
                                        ].map((c, i) => (
                                            <span key={i} style={{ fontSize: "0.7rem", color: c.ok ? "var(--success)" : "var(--text-muted)" }}>
                                                {c.ok ? "✓" : "○"} {c.txt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading || success}
                        style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "1rem" }}>
                        {loading ? "Mendaftar..." : "Daftar Sekarang"} {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Sudah punya akun?{" "}
                    <Link href="/login" style={{ color: "var(--primary-light)", textDecoration: "none", fontWeight: 600 }}>Masuk</Link>
                </p>
            </div>
        </div>
    );
}
