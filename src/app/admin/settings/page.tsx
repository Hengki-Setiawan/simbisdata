"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, CheckCircle2, Database, Zap, Shield, Bell } from "lucide-react";

export default function AdminSettingsPage() {
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState({
        siteName: "SimbisData",
        maintenanceMode: false,
        maxUploadSize: "10",
        groqEnabled: true,
        geminiEnabled: true,
        browserlessEnabled: true,
        emailNotifications: true,
        maxFreeAnalyses: "3",
        maxStarterAnalyses: "20",
        demoExpireDays: "7",
    });

    useEffect(() => {
        fetch("/api/admin/settings").then(r => r.json()).then(data => {
            if (data && Object.keys(data).length > 0) setConfig(data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        try {
            await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error("Failed to save settings:", e);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 14px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
        borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none",
    };

    const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
        <button onClick={() => onChange(!value)} style={{
            width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
            background: value ? "var(--primary)" : "var(--bg-surface)", position: "relative", transition: "background 0.3s",
        }}>
            <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "white", position: "absolute", top: "3px", left: value ? "23px" : "3px", transition: "left 0.3s" }} />
        </button>
    );

    return (
        <div style={{ maxWidth: "700px" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "24px" }}>
                <Settings size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--danger)" }} />
                System Settings
            </h1>

            {saved && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
                    padding: "12px 16px", borderRadius: "var(--radius)", marginBottom: "16px",
                    background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", gap: "10px", color: "var(--success)", fontSize: "0.9rem",
                }}><CheckCircle2 size={18} /> Settings saved!</motion.div>
            )}

            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}><Database size={18} style={{ color: "var(--danger)" }} /><h2 style={{ fontSize: "1rem", fontWeight: 700 }}>General</h2></div>
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>Site Name</label>
                    <input value={config.siteName} onChange={(e) => setConfig({ ...config, siteName: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Maintenance Mode</p><p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Nonaktifkan akses publik</p></div>
                    <Toggle value={config.maintenanceMode} onChange={(v) => setConfig({ ...config, maintenanceMode: v })} />
                </div>
            </motion.div>

            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}><Zap size={18} style={{ color: "var(--danger)" }} /><h2 style={{ fontSize: "1rem", fontWeight: 700 }}>AI & API</h2></div>
                {[
                    { label: "Groq API", key: "groqEnabled", desc: "Primary AI narration" },
                    { label: "Gemini API", key: "geminiEnabled", desc: "Fallback AI" },
                    { label: "Browserless.io", key: "browserlessEnabled", desc: "Premium PDF rendering" },
                ].map((item) => (
                    <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-color)" }}>
                        <div><p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.label}</p><p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.desc}</p></div>
                        <Toggle value={config[item.key as keyof typeof config] as boolean} onChange={(v) => setConfig({ ...config, [item.key]: v })} />
                    </div>
                ))}
            </motion.div>

            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "16px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}><Shield size={18} style={{ color: "var(--danger)" }} /><h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Tier Limits</h2></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div><label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>Free Analyses/month</label><input value={config.maxFreeAnalyses} onChange={(e) => setConfig({ ...config, maxFreeAnalyses: e.target.value })} style={inputStyle} type="number" /></div>
                    <div><label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>Starter Analyses/month</label><input value={config.maxStarterAnalyses} onChange={(e) => setConfig({ ...config, maxStarterAnalyses: e.target.value })} style={inputStyle} type="number" /></div>
                    <div><label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>Max Upload Size (MB)</label><input value={config.maxUploadSize} onChange={(e) => setConfig({ ...config, maxUploadSize: e.target.value })} style={inputStyle} type="number" /></div>
                    <div><label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>Demo Expire Days</label><input value={config.demoExpireDays} onChange={(e) => setConfig({ ...config, demoExpireDays: e.target.value })} style={inputStyle} type="number" /></div>
                </div>
            </motion.div>

            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}><Bell size={18} style={{ color: "var(--danger)" }} /><h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Notifications</h2></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><p style={{ fontWeight: 600, fontSize: "0.9rem" }}>Email Notifications</p><p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Kirim notifikasi error dan alerts</p></div>
                    <Toggle value={config.emailNotifications} onChange={(v) => setConfig({ ...config, emailNotifications: v })} />
                </div>
            </motion.div>

            <button onClick={handleSave} className="btn-primary" style={{ padding: "12px 32px" }}><Save size={18} /> Save Settings</button>
        </div>
    );
}
