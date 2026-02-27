"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { History, FileSpreadsheet, Trash2, Eye, Clock } from "lucide-react";
import { db } from "@/lib/local-db";

interface HistoryItem {
    id: string;
    fileName: string;
    fileSize: string;
    rows: number;
    date: string;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const load = async () => {
            if (typeof window === "undefined") return;
            try {
                const data = await db.getAllData();
                if (data && data.length > 0) {
                    setHistory([{
                        id: "1",
                        fileName: "Data penjualan (IndexedDB)",
                        fileSize: "Tersimpan Lokal",
                        rows: data.length,
                        date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
                    }]);
                }
            } catch { /* ignore */ }
        };
        load();
    }, []);

    return (
        <div>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>Riwayat Analisis</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Daftar file yang pernah kamu upload dan analisis.</p>
            </div>

            {history.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ padding: "60px 40px", textAlign: "center" }}
                >
                    <History size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>Belum Ada Riwayat</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Upload file Excel untuk memulai analisis pertama kamu.</p>
                </motion.div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {history.map((item, i) => (
                        <motion.div
                            key={item.id}
                            className="glass-card"
                            style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: "var(--radius)",
                                    background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <FileSpreadsheet size={22} style={{ color: "var(--primary)" }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>{item.fileName}</p>
                                    <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                        <span>{item.fileSize}</span>
                                        <span>{item.rows.toLocaleString()} baris</span>
                                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Clock size={12} /> {item.date}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    onClick={() => window.location.href = "/dashboard"}
                                    style={{
                                        padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border-color)",
                                        background: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem",
                                    }}
                                >
                                    <Eye size={14} /> Lihat
                                </button>
                                <button
                                    onClick={async () => { await db.salesData.clear(); window.location.reload(); }}
                                    style={{
                                        padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid rgba(239, 68, 68, 0.3)",
                                        background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem",
                                    }}
                                >
                                    <Trash2 size={14} /> Hapus
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
