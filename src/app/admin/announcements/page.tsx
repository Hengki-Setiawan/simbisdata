"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus, Send, Calendar, Users, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

interface Announcement {
    id: number;
    title: string;
    content: string;
    type: string;
    isActive: boolean;
    startDate: number | null;
    endDate: number | null;
    createdAt: number;
}

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: "", content: "", type: "info" });
    const { addToast } = useToast();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/admin/announcements");
            if (res.ok) setAnnouncements(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch("/api/admin/announcements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const newItem = await res.json();
                setAnnouncements([newItem, ...announcements]);
                addToast("Pengumuman berhasil dibuat", "success");
            }
        } catch (e) { console.error(e); }
        setForm({ title: "", content: "", type: "info" });
        setShowModal(false);
    };

    const togglePublish = async (id: number, isActive: boolean) => {
        await fetch("/api/admin/announcements", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, isActive: !isActive }),
        });
        setAnnouncements(announcements.map(a => a.id === id ? { ...a, isActive: !isActive } : a));
        addToast(isActive ? "Pengumuman di-unpublish" : "Pengumuman di-publish", "info");
    };

    const handleDelete = async (id: number) => {
        await fetch("/api/admin/announcements", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setAnnouncements(announcements.filter(a => a.id !== id));
        addToast("Pengumuman dihapus", "success");
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;

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

            {announcements.length === 0 ? (
                <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
                    <p style={{ color: "var(--text-muted)" }}>📢 Belum ada pengumuman. Klik "Buat Baru" untuk memulai.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {announcements.map((a, i) => (
                        <motion.div key={a.id} className="glass-card" style={{ padding: "20px 24px" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                        <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{a.title}</h3>
                                        <span style={{
                                            padding: "2px 10px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 700,
                                            background: a.isActive ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                                            color: a.isActive ? "var(--success)" : "var(--warning)",
                                        }}>{a.isActive ? "Published" : "Draft"}</span>
                                        <span style={{
                                            padding: "2px 10px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 700,
                                            background: "rgba(99,102,241,0.15)", color: "var(--primary)",
                                        }}>{a.type}</span>
                                    </div>
                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "10px" }}>{a.content}</p>
                                    <div style={{ display: "flex", gap: "16px", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                        <span><Calendar size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />{new Date(a.createdAt * 1000).toLocaleDateString("id-ID")}</span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button onClick={() => togglePublish(a.id, a.isActive)} style={{ padding: "6px 14px", fontSize: "0.78rem", background: a.isActive ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)", color: a.isActive ? "var(--warning)" : "var(--success)", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                                        <Send size={12} /> {a.isActive ? "Unpublish" : "Publish"}
                                    </button>
                                    <button onClick={() => handleDelete(a.id)} style={{ padding: "6px 10px", fontSize: "0.78rem", background: "rgba(239,68,68,0.1)", color: "var(--danger)", border: "none", borderRadius: "8px", cursor: "pointer" }}><Trash2 size={12} /></button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={() => setShowModal(false)}>
                    <motion.div className="glass-card" style={{ padding: "32px", width: "500px" }} onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <h2 style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: "20px" }}>📢 Buat Pengumuman</h2>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Judul</label>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Judul pengumuman..." style={{ width: "100%", padding: "10px 14px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.9rem" }} />
                        </div>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Konten</label>
                            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} placeholder="Isi pengumuman..." style={{ width: "100%", padding: "10px 14px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.9rem", resize: "vertical" }} />
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Tipe</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ padding: "10px 14px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: "0.9rem" }}>
                                <option value="info">Info</option><option value="warning">Warning</option><option value="promo">Promo</option>
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>Batal</button>
                            <button onClick={handleCreate} className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>Simpan ke Database</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
