"use client";

import { useState, useEffect } from "react";
import { db, type FileRecord } from "@/lib/local-db";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
    FileSpreadsheet, Trash2, Download, ExternalLink, HardDrive, AlertTriangle, Sparkles, Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPage() {
    const { addToast } = useToast();
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const loadFiles = async () => {
        try {
            const allFiles = await db.files.orderBy("uploadedAt").reverse().limit(10).toArray();
            setFiles(allFiles);
        } catch (error) {
            console.error("Failed to load history", error);
            addToast("Gagal memuat riwayat file", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, []);

    const handleDelete = async (file: FileRecord) => {
        if (!file.id) return;
        if (!confirm("Hapus file ini dari riwayat? File asli akan ikut terhapus dari server cloud.")) return;
        
        try {
            // Delete from Cloud first, if URL exists
            if (file.url) {
                // If there are multiple comma-separated URLs, delete each one
                const urls = file.url.split(",");
                for (const url of urls) {
                    await fetch("/api/uploadthing/delete", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url: url.trim() })
                    });
                }
            }

            await db.files.delete(file.id);
            setFiles(prev => prev.filter(f => f.id !== file.id));
            addToast("File riwayat dan cloud berhasil dihapus", "success");
        } catch (err) {
            console.error(err);
            addToast("Gagal menghapus file sepenuhnya", "error");
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 16px", color: "var(--primary)" }} />
                <p>Memuat riwayat unggahan Anda...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px", paddingBottom: "16px", borderBottom: "1px solid var(--border-color)" }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "10px" }}>
                        <HardDrive size={24} style={{ color: "var(--primary)" }} /> Riwayat Unggahan
                    </h1>
                    <p style={{ color: "var(--text-muted)" }}>
                        Daftar 10 dataset terakhir yang pernah Anda proses. File asli tersimpan di UploadThing Cloud.
                    </p>
                </div>
            </div>

            {files.length === 0 ? (
                <div className="glass-card" style={{ padding: "60px 40px", textAlign: "center", color: "var(--text-muted)" }}>
                    <AlertTriangle size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px", color: "var(--text-primary)" }}>Belum ada file</h3>
                    <p style={{ maxWidth: "400px", margin: "0 auto" }}>Anda belum mengunggah dataset apapun. Buka menu Upload Data untuk memulai.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <AnimatePresence>
                        {files.map((file) => (
                            <motion.div 
                                key={file.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass-card" 
                                style={{ 
                                    padding: "20px 24px", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "space-between",
                                    gap: "16px" 
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flex: 1 }}>
                                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--primary-surface, #eef2ff)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <FileSpreadsheet size={24} />
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {file.name}
                                        </h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                                            <span>•</span>
                                            <span>{formatDistanceToNow(file.uploadedAt, { addSuffix: true, locale: id })}</span>
                                            {file.url && (
                                                <>
                                                    <span>•</span>
                                                    <span style={{ color: "var(--success)" }}>Cloud Synced</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {file.url ? (
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: "8px", display: "flex", alignItems: "center", gap: "6px" }} title="Unduh File Asli">
                                            <Download size={16} /> <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Unduh</span>
                                        </a>
                                    ) : (
                                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "8px" }}>Offline</span>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(file)}
                                        style={{ 
                                            width: "36px", height: "36px", borderRadius: "8px", 
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            background: "var(--danger-bg, #fef2f2)", color: "var(--danger)",
                                            border: "1px solid rgba(239, 68, 68, 0.2)", cursor: "pointer"
                                        }}
                                        title="Hapus Murni"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
