"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { BarChart3, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Email atau password salah.");
            setLoading(false);
        } else {
            window.location.href = "/dashboard";
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            <BarChart3 size={32} style={{ color: "var(--primary)" }} />
                            <span className="gradient-text" style={{ fontSize: "1.5rem", fontWeight: 800 }}>simbisai</span>
                        </Link>
                        <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-muted)", padding: "6px 12px", borderRadius: "20px", background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
                            <ArrowLeft size={14} /> Kembali
                        </Link>
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>Selamat Datang Kembali</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Masuk ke akun kamu untuk mulai analisis</p>
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

                <form onSubmit={handleLogin}>
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
                            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "var(--primary)"} onBlur={(e) => e.target.style.borderColor = "var(--border-color)"} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}
                        style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "1rem" }}>
                        {loading ? "Memproses..." : "Masuk"} {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "24px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Belum punya akun?{" "}
                    <Link href="/register" style={{ color: "var(--primary-light)", textDecoration: "none", fontWeight: 600 }}>Daftar Gratis</Link>
                </p>
            </div>
        </div>
    );
}
