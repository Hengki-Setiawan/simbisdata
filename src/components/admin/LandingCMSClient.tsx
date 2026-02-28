"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import {
    updateLandingHero,
    updateFeature, createFeature, deleteFeature,
    updateTestimonial, createTestimonial, deleteTestimonial
} from "@/actions/cms";

export default function LandingCMSClient({ initialHero, initialFeatures, initialTestimonials }: any) {
    const [hero, setHero] = useState(initialHero);
    const [features, setFeatures] = useState(initialFeatures);
    const [testimonials, setTestimonials] = useState(initialTestimonials);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const handleSaveHero = async () => {
        setSaving(true);
        const res = await updateLandingHero(hero);
        setSaving(false);
        if (res.success) {
            setSuccessMsg("Hero section saved!");
            setTimeout(() => setSuccessMsg(""), 3000);
        }
    };

    const inputStyle = {
        width: "100%", padding: "8px 12px", borderRadius: "8px",
        border: "1px solid var(--border-color)", background: "var(--bg-surface)",
        color: "var(--text-primary)", fontSize: "0.9rem", marginBottom: "12px"
    };

    return (
        <div style={{ maxWidth: "1000px" }}>
            <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>Landing Page CMS</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Ubah konten website secara langsung. Perubahan akan instan tampil di halaman depan.</p>
                </div>
                {successMsg && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", padding: "8px 16px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600 }}>
                        <CheckCircle2 size={16} /> {successMsg}
                    </motion.div>
                )}
            </div>

            {/* HERO SECTION */}
            <div className="glass-card" style={{ padding: "24px", marginBottom: "32px" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>Hero Section</h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                        <label className="text-sm font-semibold mb-1 block">Title (Hitam)</label>
                        <input style={inputStyle} value={hero.title} onChange={e => setHero({ ...hero, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-1 block">Title (Gradient Fokus)</label>
                        <input style={inputStyle} value={hero.gradientText} onChange={e => setHero({ ...hero, gradientText: e.target.value })} />
                    </div>
                </div>

                <label className="text-sm font-semibold mb-1 block">Deskripsi Utama</label>
                <textarea style={{ ...inputStyle, minHeight: "80px" }} value={hero.description} onChange={e => setHero({ ...hero, description: e.target.value })} />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                        <label className="text-sm font-semibold mb-1 block">Teks Tombol Utama</label>
                        <input style={inputStyle} value={hero.primaryCtaText} onChange={e => setHero({ ...hero, primaryCtaText: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-semibold mb-1 block">Teks Tombol Sekunder</label>
                        <input style={inputStyle} value={hero.secondaryCtaText} onChange={e => setHero({ ...hero, secondaryCtaText: e.target.value })} />
                    </div>
                </div>

                <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={handleSaveHero} disabled={saving} className="btn-primary">
                        <Save size={16} /> {saving ? "Menyimpan..." : "Simpan Hero"}
                    </button>
                </div>
            </div>

            {/* FEATURES SECTION (Read Only / Basic Implementation for demo) */}
            <div className="glass-card" style={{ padding: "24px", marginBottom: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Features Grid</h2>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Total: {features.length} fitur aktif</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                    {features.map((f: any) => (
                        <div key={f.id} style={{ border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px", background: "var(--bg-main)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{f.title}</span>
                                <span style={{ fontSize: "0.75rem", background: "var(--bg-surface)", padding: "2px 6px", borderRadius: "4px" }}>Icon: {f.icon}</span>
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{f.description}</p>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: "20px" }}>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>* Full CRUD (Create, Edit, Delete) features mapping CMS akan bisa diakses pada iterasi berikutnya dari CMS ini.</p>
                </div>
            </div>

            {/* TESTIMONIALS SECTION (Read Only Demo) */}
            <div className="glass-card" style={{ padding: "24px", marginBottom: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Testimonials</h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                    {testimonials.map((t: any) => (
                        <div key={t.id} style={{ border: "1px solid var(--border-color)", padding: "16px", borderRadius: "8px", background: "var(--bg-main)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{t.name}</span>
                                <span style={{ color: "#f59e0b", fontSize: "0.8rem" }}>★ {t.rating}</span>
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "var(--primary)", marginBottom: "8px", fontWeight: 500 }}>{t.role} @ {t.company}</p>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, fontStyle: "italic" }}>"{t.content}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
