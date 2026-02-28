"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellRing, TrendingDown, AlertTriangle, Package, Check, X, Loader2 } from "lucide-react";

interface Alert {
    id: string;
    type: string;
    title: string;
    desc: string;
    severity: string;
    time: string;
    read: boolean;
}

const severityConfig: Record<string, { bg: string; color: string; icon: typeof AlertTriangle }> = {
    warning: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", icon: AlertTriangle },
    info: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", icon: BellRing },
    success: { bg: "rgba(16,185,129,0.1)", color: "#10b981", icon: TrendingDown },
    danger: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", icon: Package },
};

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({ salesDrop: true, anomaly: true, lowStock: true, peakSeason: true, returnRate: true });

    useEffect(() => {
        fetch("/api/user/alerts")
            .then(res => res.json())
            .then(data => {
                if (data.alerts && Array.isArray(data.alerts)) {
                    setAlerts(data.alerts);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load alerts:", err);
                setLoading(false);
            });
    }, []);

    const markRead = (id: string) => setAlerts(alerts.map((a) => a.id === id ? { ...a, read: true } : a));
    const unreadCount = alerts.filter((a) => !a.read).length;

    const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
        <button onClick={() => onChange(!value)} style={{
            width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
            background: value ? "var(--primary)" : "var(--bg-surface)", position: "relative", transition: "background 0.3s",
        }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: value ? 21 : 3, transition: "left 0.3s" }} />
        </button>
    );

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <Loader2 className="animate-spin text-gray-500" size={32} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "800px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "4px" }}>
                        <Bell size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--warning)" }} />
                        Smart Alerts
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{unreadCount} notifikasi belum dibaca</p>
                </div>
            </div>

            {/* Alert List */}
            <div style={{ marginBottom: "32px" }}>
                {alerts.length === 0 ? (
                    <div className="glass-card" style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>
                        <BellRing size={32} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px", color: "white" }}>Belum Ada Notifikasi</h3>
                        <p style={{ fontSize: "0.9rem" }}>Sistem AI kami akan memberitahu Anda ketika menemukan anomali atau peluang bisnis menarik pada data yang Anda unggah.</p>
                    </div>
                ) : (
                    alerts.map((alert, i) => {
                        const sev = severityConfig[alert.severity] || severityConfig.info;
                        const Icon = sev.icon;
                        return (
                            <motion.div key={alert.id} className="glass-card" style={{
                                padding: "16px 20px", marginBottom: "8px", display: "flex", gap: "16px", alignItems: "flex-start",
                                opacity: alert.read ? 0.6 : 1, borderLeft: `3px solid ${sev.color}`,
                            }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: alert.read ? 0.6 : 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                                <div style={{ width: 36, height: 36, borderRadius: "var(--radius)", background: sev.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon size={18} style={{ color: sev.color }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                        <h4 style={{ fontWeight: 700, fontSize: "0.92rem" }}>{alert.title}</h4>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{alert.time}</span>
                                    </div>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>{alert.desc}</p>
                                </div>
                                {!alert.read && (
                                    <button onClick={() => markRead(alert.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }} title="Tandai sudah dibaca">
                                        <Check size={16} />
                                    </button>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Alert Settings */}
            <motion.div className="glass-card" style={{ padding: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>⚙️ Pengaturan Alert</h3>
                {[
                    { key: "salesDrop", label: "Penurunan Penjualan", desc: "Notifikasi saat revenue turun > 15%" },
                    { key: "anomaly", label: "Deteksi Anomali", desc: "Alert saat ada pesanan tidak biasa" },
                    { key: "lowStock", label: "Prediksi Low Stock", desc: "Peringatan stok berdasarkan tren" },
                    { key: "peakSeason", label: "Peak Season", desc: "Info saat penjualan melonjak" },
                    { key: "returnRate", label: "Return Rate Naik", desc: "Alert saat return rate meningkat" },
                ].map((s) => (
                    <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-color)" }}>
                        <div><p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.label}</p><p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{s.desc}</p></div>
                        <Toggle value={settings[s.key as keyof typeof settings]} onChange={(v) => setSettings({ ...settings, [s.key]: v })} />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
