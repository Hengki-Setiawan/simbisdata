"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BarChart3, Menu, X } from "lucide-react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
            <div className="container">
                <div className="navbar-inner">
                    <Link href="/" className="navbar-logo">
                        <img src="/logo-icon.svg" alt="SimbisData Logo" width={32} height={32} />
                        <span className="gradient-text">SimbisData</span>
                    </Link>

                    <ul className="navbar-links" style={{ gap: "32px", fontWeight: 500 }}>
                        <li><a href="#features" style={{ color: "var(--text-secondary)", transition: "color 0.2s" }}>Fitur</a></li>
                        <li><a href="#algorithms" style={{ color: "var(--text-secondary)", transition: "color 0.2s" }}>Algoritma</a></li>
                        <li><a href="#pricing" style={{ color: "var(--text-secondary)", transition: "color 0.2s" }}>Harga</a></li>
                    </ul>

                    <div className="navbar-actions">
                        <Link href="/login" className="btn-secondary" style={{ padding: "8px 24px", fontSize: "0.9rem", fontWeight: 600, borderRadius: "8px", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)" }}>
                            Masuk
                        </Link>
                        <Link href="/register" className="btn-primary" style={{ padding: "8px 24px", fontSize: "0.9rem", fontWeight: 600, borderRadius: "8px", background: "var(--primary)", color: "#fff", border: "none" }}>
                            Daftar Gratis
                        </Link>

                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            style={{
                                display: "none",
                                background: "none",
                                border: "none",
                                color: "var(--text-primary)",
                                cursor: "pointer",
                            }}
                            className="mobile-menu-btn"
                        >
                            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {mobileOpen && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "rgba(15, 15, 35, 0.95)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid var(--border-color)",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <a href="#features" onClick={() => setMobileOpen(false)} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "1.1rem" }}>Fitur</a>
                        <a href="#algorithms" onClick={() => setMobileOpen(false)} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "1.1rem" }}>Algoritma</a>
                        <a href="#pricing" onClick={() => setMobileOpen(false)} style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "1.1rem" }}>Harga</a>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "16px", borderTop: "1px solid var(--border-color)" }}>
                        <Link href="/login" className="btn-secondary" style={{ justifyContent: "center" }}>Masuk</Link>
                        <Link href="/register" className="btn-primary" style={{ justifyContent: "center" }}>Daftar Gratis</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
