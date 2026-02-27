"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus, Send, Calendar, Users, Trash2 } from "lucide-react";

const mockAnnouncements = [
    { id: 1, title: "🚀 Fitur Baru: ML Analysis Tab", content: "Sekarang kamu bisa menganalisis data penjualan dengan 15 algoritma ML. Cek di Dashboard → ML Analysis!", target: "all", status: "published", date: "2024-06-01", views: 234 },
    { id: 2, title: "💎 Promo Tahun Baru: Diskon 30%", content: "Upgrade ke Pro atau Enterprise dan dapatkan diskon 30% untuk langganan tahunan. Berlaku hingga 15 Januari.", target: "free", status: "published", date: "2024-05-15", views: 189 },
    { id: 3, title: "🔧 Maintenance Scheduled", content: "Sistem akan mengalami maintenance pada 20 Juni 2024 jam 02:00-04:00 WIB. Mohon maaf atas ketidaknyamanannya.", target: "all", status: "draft", date: "2024-06-10", views: 0 },
];

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState(mockAnnouncements);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: "", content: "", target: "all" });

    const handleCreate = () => {
        setAnnouncements([{ id: Date.now(), ...form, status: "draft", date: new Date().toISOString().split("T")[0], views: 0 }, ...announcements]);
        setForm({ title: "", content: "", target: "all" });
        setShowModal(false);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "4px" }}>
                        <Megaphone size={28} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px", color: "var(--danger)" }} />
                        Announcements
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Kelola pengumuman untuk user</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}><Plus size={16} /> Buat Baru</button>
            </div>

            {/* Announcement Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {announcements.map((a, i) => (
                    <motion.div key={a.id} className="glass-card" style={{ padding: "20px 24px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                    <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{a.title}</h3>
                                    <span style={{
                                        padding: "2px 10px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 700,
                                        background: a.status === "published" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                                        color: a.status === "published" ? "var(--success)" : "var(--warning)",
                                    }}>{a.status}</span>
                                </div>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "10px" }}>{a.content}</p>
                                <div style={{ display: "flex", gap: "16px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                    <span><Calendar size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />{a.date}</span>
                                    <span><Users size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />{a.target === "all" ? "Semua User" : `Tier: ${a.target}`}</span>
                                    <span>👁 {a.views} views</span>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                {a.status === "draft" && <button style={{ padding: "6px 14px", fontSize: "0.78rem", background: "rgba(16,185,129,0.15)", color: "var(--success)", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><Send size={12} /> Publish</button>}
                                <button onClick={() => setAnnouncements(announcements.filter((x) => x.id !== a.id))} style={{ padding: "6px 10px", fontSize: "0.78rem", background: "rgba(239,68,68,0.1)", color: "var(--danger)", border: "none", borderRadius: "8px", cursor: "pointer" }}><Trash2 size={12} /></button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={() => setShowModal(false)}>
                    <motion.div className="glass-card" style={{ padding: "32px", width: "500px" }} onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <h2 style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: "20px" }}>📢 Buat Pengumuman</h2>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Judul</label>
                            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul pengumuman..." style={{ width: "100%", padding: "10px 14px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.9rem" }} />
                        </div>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Konten</label>
                            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} placeholder="Isi pengumuman..." style={{ width: "100%", padding: "10px 14px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.9rem", resize: "vertical" }} />
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Target</label>
                            <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} style={{ padding: "10px 14px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.9rem" }}>
                                <option value="all">Semua User</option><option value="free">Free Tier</option>
                                <option value="starter">Starter</option><option value="pro">Pro</option>
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>Batal</button>
                            <button onClick={handleCreate} className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>Buat Draft</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
