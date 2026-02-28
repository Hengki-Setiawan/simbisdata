"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export default function ExecutiveSummary({ data }: { data: any[] }) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!data || data.length === 0) {
            setLoading(false);
            return;
        }

        const fetchSummary = async () => {
            try {
                // Summarize first to save tokens
                const rowCount = data.length;
                let numCols = 0;
                let textCols = 0;

                // Very basic metric extractions based on keys
                let totalRevenue = 0;
                let hasRevenue = false;

                if (data.length > 0) {
                    const keys = Object.keys(data[0]);
                    keys.forEach(k => {
                        if (typeof data[0][k] === "number") numCols++;
                        if (typeof data[0][k] === "string") textCols++;

                        // Heuristic for revenue
                        if (k.toLowerCase().includes("pric") || k.toLowerCase().includes("harg") || k.toLowerCase().includes("rev") || k.toLowerCase().includes("total")) {
                            hasRevenue = true;
                            totalRevenue = data.reduce((sum, row) => sum + (Number(row[k]) || 0), 0);
                        }
                    });
                }

                const prompt = `Dataset memiliki ${rowCount} baris, ${numCols} kolom metrik, ${textCols} kolom teks/kategori. ${hasRevenue ? `Total estimasi nilai/revenue: Rp ${totalRevenue.toLocaleString("id-ID")}.` : ""}`;

                const response = await fetch("/api/ai/narrate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt, type: "executive" })
                });

                const resData = await response.json();
                if (resData.narrative) {
                    setSummary(resData.narrative);
                }
            } catch (err) {
                console.error("Exec Summary error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [data]);

    if (loading) {
        return (
            <div className="glass-card" style={{ padding: "16px 24px", marginBottom: "24px", display: "flex", gap: "12px", alignItems: "center" }}>
                <Loader2 size={24} className="spin" style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>AI sedang menyusun Ringkasan Eksekutif...</span>
            </div>
        );
    }

    if (!summary) return null;

    return (
        <div className="glass-card" style={{ padding: "20px 24px", marginBottom: "24px", borderTop: "4px solid var(--primary)", background: "var(--bg-card)" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} style={{ color: "var(--warning)" }} /> Ringkasan Eksekutif AI
            </h2>
            <div style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)" }}>
                {summary.split('\n').map((line, i) => {
                    // Make asterisks bold if present
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                        <p key={i} style={{ marginBottom: "8px" }}>
                            {parts.map((p, j) =>
                                p.startsWith('**') && p.endsWith('**') ?
                                    <strong key={j}>{p.slice(2, -2)}</strong> :
                                    p
                            )}
                        </p>
                    );
                })}
            </div>
        </div>
    );
}
