"use client";

import { CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react";
import type { HealthResult } from "@/lib/ai-consultant";
import Link from "next/link";

export default function HealthBadge({ result }: { result: HealthResult | null }) {
    if (!result) {
        return (
            <div className="glass-card" style={{ padding: "16px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "16px", borderRadius: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(100,116,139,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid var(--text-muted)" }} />
                </div>
                <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Menganalisis Kesehatan Bisnis...</h3>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>Menunggu AI selesai memproses data</p>
                </div>
            </div>
        );
    }

    const { businessHealth, healthScore, healthReason } = result;

    const getConfig = () => {
        switch (businessHealth) {
            case "BAIK": return { icon: <CheckCircle2 size={24} />, color: "var(--success)", bg: "var(--success-bg, rgba(16,185,129,0.1))", border: "rgba(16,185,129,0.2)" };
            case "PERLU PERHATIAN": return { icon: <AlertTriangle size={24} />, color: "var(--warning)", bg: "var(--warning-bg, rgba(245,158,11,0.1))", border: "rgba(245,158,11,0.2)" };
            case "KRITIS": return { icon: <XCircle size={24} />, color: "var(--danger)", bg: "var(--danger-bg, rgba(239,68,68,0.1))", border: "rgba(239,68,68,0.2)" };
            default: return { icon: <CheckCircle2 size={24} />, color: "var(--primary)", bg: "var(--primary-glow)", border: "rgba(79,70,229,0.2)" };
        }
    };

    const config = getConfig();

    return (
        <div className="glass-card flex-between" style={{ padding: "16px 20px", background: "var(--bg-card)", border: `1px solid ${config.border}`, borderRadius: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: config.bg, color: config.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {config.icon}
                </div>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Kesehatan Bisnis</span>
                        <span style={{ padding: "2px 8px", borderRadius: "100px", background: config.color, color: "#fff", fontSize: "0.7rem", fontWeight: 800 }}>Skor: {healthScore}</span>
                    </div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: config.color }}>{businessHealth}</h3>
                </div>
            </div>
            
            <div style={{ maxWidth: "45%", textAlign: "right" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {healthReason}
                </p>
                <Link href="/dashboard/analysis" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", color: "var(--primary)", fontWeight: 600, marginTop: "6px", cursor: "pointer", textDecoration: "none" }}>
                    Lihat Detail Metrik <ChevronRight size={14} />
                </Link>
            </div>
        </div>
    );
}
