"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, CalendarDays, TrendingUp, AlertTriangle } from "lucide-react";
import { getMacroMarketInsights, type MarketInsightsData } from "@/lib/external-apis";

export function MarketInsights() {
    const [insights, setInsights] = useState<MarketInsightsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMacroMarketInsights()
            .then(data => {
                setInsights(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="glass-card" style={{ padding: "16px", marginBottom: "24px", display: "flex", gap: "16px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ height: "40px", flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "8px" }} />
                <div style={{ height: "40px", flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "8px" }} />
                <div style={{ height: "40px", flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "8px" }} />
            </div>
        );
    }

    if (!insights) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
                padding: "16px",
                marginBottom: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
                borderTop: "3px solid var(--primary)",
                background: "linear-gradient(145deg, rgba(20,20,30,0.8) 0%, rgba(30,30,45,0.6) 100%)"
            }}
        >
            {/* Exchange Rates */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                <div style={{ padding: "10px", background: "rgba(99,102,241,0.1)", borderRadius: "8px", color: "var(--primary-light)" }}>
                    <Globe size={20} />
                </div>
                <div>
                    <h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Kurs Global (IDR)</h4>
                    <div style={{ display: "flex", gap: "12px", fontSize: "0.9rem", fontWeight: 600 }}>
                        <span style={{ color: "var(--success)" }}>USD <span style={{ color: "white" }}>{insights.exchangeRate.USD.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span></span>
                        <span style={{ color: "var(--warning)" }}>EUR <span style={{ color: "white" }}>{insights.exchangeRate.EUR.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span></span>
                    </div>
                </div>
            </div>

            {/* Upcoming Holiday */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                <div style={{ padding: "10px", background: "rgba(245,158,11,0.1)", borderRadius: "8px", color: "var(--warning)" }}>
                    <CalendarDays size={20} />
                </div>
                <div>
                    <h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Libur Terdekat</h4>
                    {insights.nextHoliday ? (
                        <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "white" }}>
                            {insights.nextHoliday.name} <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>({new Date(insights.nextHoliday.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })})</span>
                        </div>
                    ) : (
                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Tidak ada data libur</div>
                    )}
                </div>
            </div>

            {/* News Headline */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                <div style={{ padding: "10px", background: "rgba(16,185,129,0.1)", borderRadius: "8px", color: "var(--success)" }}>
                    <TrendingUp size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Top Berita Bisnis</h4>
                    <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {insights.newsHeadline}
                    </div>
                </div>
            </div>

            {/* Warning Note */}
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "8px", alignItems: "center", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                <AlertTriangle size={12} /> Data makro ditarik otomatis dari ExchangeRate-API, Nager.Date, & NewsAPI untuk korelasi penjualan.
            </div>
        </motion.div>
    );
}
