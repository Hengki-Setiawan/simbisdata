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
                        <img src="/logo.png" alt="simbisai Logo" width={28} height={28} style={{ borderRadius: "4px" }} />
                        <span className="gradient-text">simbisai</span>
                    </Link>

                    <ul className="navbar-links">
                        <li><a href="#features">Fitur</a></li>
                        <li><a href="#algorithms">Algoritma</a></li>
                        <li><a href="#pricing">Harga</a></li>
                    </ul>

                    <div className="navbar-actions">
                        <Link href="/login" className="btn-secondary" style={{ padding: "8px 20px", fontSize: "0.9rem" }}>
                            Masuk
                        </Link>
                        <Link href="/register" className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.9rem" }}>
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
                    background: "var(--bg-card)",
                    borderBottom: "1px solid var(--border-color)",
                    padding: "24px",
                }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <a href="#features" onClick={() => setMobileOpen(false)} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Fitur</a>
                        <a href="#algorithms" onClick={() => setMobileOpen(false)} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Algoritma</a>
                        <a href="#pricing" onClick={() => setMobileOpen(false)} style={{ color: "var(--text-secondary)", textDecoration: "none" }}>Harga</a>
                    </div>
                </div>
            )}
        </nav>
    );
}
