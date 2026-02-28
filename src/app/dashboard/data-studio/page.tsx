"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Database, Search, Filter, Download, RefreshCcw, Loader2,
    ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Trash2,
    ArrowUpDown, Eye, Wrench, Brain, MessageCircle, Send,
    Sparkles, FileText,
} from "lucide-react";
import { db } from "@/lib/local-db";
import { validateData, type DataQualityReport } from "@/lib/data-validator";
import { ruleBasedRepair, applyRepairs, type RepairReport, type RepairSuggestion } from "@/lib/ai-data-repair";
import { generateQualityAdvice, type QualityAdvice } from "@/lib/ai-quality-advisor";
import { getCorrectionStats } from "@/lib/corrections-store";

/* eslint-disable @typescript-eslint/no-explicit-any */

type ChatMessage = { role: "user" | "assistant"; content: string };
type SortConfig = { column: string; direction: "asc" | "desc" } | null;

export default function DataStudioPage() {
    const [rows, setRows] = useState<Record<string, any>[]>([]);
    const [loading, setLoading] = useState(true);
    const [columns, setColumns] = useState<string[]>([]);

    // Table view
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [page, setPage] = useState(0);
    const pageSize = 50;

    // Panels
    const [showRepairPanel, setShowRepairPanel] = useState(false);
    const [showChatPanel, setShowChatPanel] = useState(false);

    // Quality & Repair
    const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
    const [qualityAdvice, setQualityAdvice] = useState<QualityAdvice | null>(null);
    const [repairReport, setRepairReport] = useState<RepairReport | null>(null);
    const [selectedRepairs, setSelectedRepairs] = useState<Set<number>>(new Set());

    // Chat
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);

    // Stats
    const [correctionStats, setCorrectionStats] = useState<any>(null);

    // Load data from IndexedDB
    useEffect(() => {
        async function loadData() {
            try {
                const data = await db.getCurrentData();
                if (data && data.length > 0) {
                    setRows(data);
                    setColumns(Object.keys(data[0]));

                    // Run quality analysis
                    const quality = validateData(data);
                    setQualityReport(quality);
                    setQualityAdvice(generateQualityAdvice(quality));

                    // Run repair analysis
                    const repair = ruleBasedRepair(data);
                    setRepairReport(repair);

                    // Get correction stats
                    const stats = await getCorrectionStats();
                    setCorrectionStats(stats);
                }
            } catch (err) {
                console.error("Failed to load data:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Filtered & sorted rows
    const filteredRows = rows.filter(row => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return Object.values(row).some(v => String(v || "").toLowerCase().includes(q));
    });

    const sortedRows = sortConfig
        ? [...filteredRows].sort((a, b) => {
            const va = a[sortConfig.column];
            const vb = b[sortConfig.column];
            const numA = parseFloat(String(va));
            const numB = parseFloat(String(vb));
            if (!isNaN(numA) && !isNaN(numB)) {
                return sortConfig.direction === "asc" ? numA - numB : numB - numA;
            }
            return sortConfig.direction === "asc"
                ? String(va || "").localeCompare(String(vb || ""))
                : String(vb || "").localeCompare(String(va || ""));
        })
        : filteredRows;

    const pagedRows = sortedRows.slice(page * pageSize, (page + 1) * pageSize);
    const totalPages = Math.ceil(sortedRows.length / pageSize);

    const handleSort = (col: string) => {
        if (sortConfig?.column === col) {
            setSortConfig(sortConfig.direction === "asc" ? { column: col, direction: "desc" } : null);
        } else {
            setSortConfig({ column: col, direction: "asc" });
        }
    };

    // Apply selected repairs
    const handleApplyRepairs = async () => {
        if (!repairReport || selectedRepairs.size === 0) return;
        const toApply = repairReport.suggestions.filter((_, i) => selectedRepairs.has(i));
        const repaired = applyRepairs(rows, toApply, false);
        setRows(repaired);
        setSelectedRepairs(new Set());

        // Re-analyze
        const quality = validateData(repaired);
        setQualityReport(quality);
        setQualityAdvice(generateQualityAdvice(quality));
        setRepairReport(ruleBasedRepair(repaired));

        await db.saveNewData(repaired);
    };

    // Chat with AI about data
    const handleChat = async () => {
        if (!chatInput.trim()) return;
        const userMsg: ChatMessage = { role: "user", content: chatInput };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput("");
        setChatLoading(true);

        try {
            const dataSummary = {
                totalRows: rows.length,
                columns: columns.slice(0, 15),
                qualityScore: qualityReport?.score,
                sampleData: rows.slice(0, 3),
            };

            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: chatInput,
                    dataSummary,
                    history: chatMessages.slice(-4),
                }),
            });
            const data = await res.json();
            setChatMessages(prev => [...prev, { role: "assistant", content: data.answer || "Maaf, tidak dapat memproses." }]);
        } catch {
            setChatMessages(prev => [...prev, { role: "assistant", content: "⚠️ Gagal terhubung ke AI." }]);
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "12px" }}>
                <Loader2 size={32} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "1.1rem" }}>Memuat Data Studio...</span>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "80px 40px" }}>
                <Database size={64} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Belum Ada Data</h2>
                <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Upload file di halaman Upload untuk memulai.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "4px" }}>📊 Data Studio</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        Preview, edit, repair, dan analisis data interaktif dengan AI
                    </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setShowRepairPanel(!showRepairPanel)} className={showRepairPanel ? "btn-primary" : "btn-secondary"} style={{ padding: "8px 14px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Wrench size={14} /> Repair ({repairReport?.suggestions.length || 0})
                    </button>
                    <button onClick={() => setShowChatPanel(!showChatPanel)} className={showChatPanel ? "btn-primary" : "btn-secondary"} style={{ padding: "8px 14px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}>
                        <MessageCircle size={14} /> AI Chat
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
                <div className="glass-card" style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>Total Baris</p>
                    <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>{rows.length.toLocaleString()}</p>
                </div>
                <div className="glass-card" style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>Total Kolom</p>
                    <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>{columns.length}</p>
                </div>
                <div className="glass-card" style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>Skor Kualitas</p>
                    <p style={{ fontSize: "1.4rem", fontWeight: 800, color: qualityReport && qualityReport.score >= 80 ? "var(--success)" : "var(--warning)" }}>
                        {qualityReport?.score || 0}/100
                    </p>
                </div>
                <div className="glass-card" style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "4px" }}>AI Learning</p>
                    <p style={{ fontSize: "1.4rem", fontWeight: 800 }}>{correctionStats?.totalColumnMappings || 0}</p>
                    <p style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>corrections saved</p>
                </div>
            </div>

            {/* Quality Advisor Summary */}
            {qualityAdvice && (
                <div className="glass-card" style={{ padding: "14px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <Sparkles size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", flex: 1 }}>{qualityAdvice.summary}</p>
                    {qualityAdvice.canAutoFix && (
                        <span style={{ fontSize: "0.75rem", color: "var(--primary)", whiteSpace: "nowrap" }}>✨ Bisa naik ke {qualityAdvice.estimatedImprovement}/100</span>
                    )}
                </div>
            )}

            <div style={{ display: "flex", gap: "16px" }}>
                {/* Main Table */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Search + Filter bar */}
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                        <div style={{ flex: 1, position: "relative" }}>
                            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                                placeholder="Cari di semua kolom..."
                                style={{
                                    width: "100%", padding: "10px 12px 10px 36px", background: "var(--bg-surface)",
                                    border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "0.85rem",
                                }}
                            />
                        </div>
                        <span style={{ padding: "10px 16px", borderRadius: "8px", background: "var(--bg-surface)", border: "1px solid var(--border-color)", fontSize: "0.82rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                            {sortedRows.length.toLocaleString()} baris
                        </span>
                    </div>

                    {/* Data Table */}
                    <div className="glass-card" style={{ overflow: "auto", maxHeight: "65vh" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: "10px 8px", textAlign: "center", borderBottom: "1px solid var(--border-color)", position: "sticky", top: 0, background: "var(--bg-card)", zIndex: 1, fontSize: "0.7rem", color: "var(--text-muted)" }}>#</th>
                                    {columns.slice(0, 12).map(col => (
                                        <th key={col} onClick={() => handleSort(col)} style={{
                                            padding: "10px 8px", textAlign: "left", borderBottom: "1px solid var(--border-color)", cursor: "pointer",
                                            position: "sticky", top: 0, background: "var(--bg-card)", zIndex: 1, whiteSpace: "nowrap", userSelect: "none",
                                        }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.75rem" }}>
                                                {col}
                                                {sortConfig?.column === col && (
                                                    <ArrowUpDown size={10} style={{ color: "var(--primary)" }} />
                                                )}
                                            </span>
                                        </th>
                                    ))}
                                    {columns.length > 12 && (
                                        <th style={{ padding: "10px 8px", position: "sticky", top: 0, background: "var(--bg-card)", color: "var(--text-muted)", fontSize: "0.72rem" }}>+{columns.length - 12}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {pagedRows.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                        <td style={{ padding: "6px 8px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.7rem" }}>{page * pageSize + i + 1}</td>
                                        {columns.slice(0, 12).map(col => (
                                            <td key={col} style={{ padding: "6px 8px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)" }}>
                                                {String(row[col] ?? "")}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>← Prev</button>
                            <span style={{ padding: "6px 12px", fontSize: "0.82rem", color: "var(--text-muted)" }}>{page + 1} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>Next →</button>
                        </div>
                    )}
                </div>

                {/* Repair Panel (sidebar) */}
                <AnimatePresence>
                    {showRepairPanel && repairReport && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="glass-card" style={{ width: "340px", padding: "16px", maxHeight: "75vh", overflow: "auto", flexShrink: 0 }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Wrench size={16} /> Data Repair
                            </h3>
                            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "12px" }}>{repairReport.summary}</p>

                            {selectedRepairs.size > 0 && (
                                <button onClick={handleApplyRepairs} className="btn-primary" style={{ width: "100%", padding: "8px", fontSize: "0.82rem", marginBottom: "12px" }}>
                                    ✅ Apply {selectedRepairs.size} Perbaikan
                                </button>
                            )}

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                {repairReport.suggestions.slice(0, 30).map((s: RepairSuggestion, i: number) => (
                                    <label key={i} style={{
                                        display: "flex", alignItems: "flex-start", gap: "8px", padding: "8px 10px",
                                        background: s.autoApply ? "rgba(16,185,129,0.05)" : "rgba(245,158,11,0.05)",
                                        borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem",
                                    }}>
                                        <input type="checkbox" checked={selectedRepairs.has(i) || s.autoApply}
                                            onChange={(e) => {
                                                const next = new Set(selectedRepairs);
                                                e.target.checked ? next.add(i) : next.delete(i);
                                                setSelectedRepairs(next);
                                            }}
                                            style={{ marginTop: "2px", flexShrink: 0 }}
                                        />
                                        <div>
                                            <span style={{ fontWeight: 600 }}>[{s.column}] </span>
                                            <span style={{ color: "var(--text-muted)" }}>{s.reason}</span>
                                            {s.suggestedValue != null && (
                                                <div style={{ marginTop: "2px" }}>
                                                    <span style={{ textDecoration: "line-through", color: "var(--danger)" }}>{String(s.currentValue)}</span>
                                                    {" → "}
                                                    <span style={{ color: "var(--success)", fontWeight: 600 }}>{String(s.suggestedValue)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chat Panel (sidebar) */}
                <AnimatePresence>
                    {showChatPanel && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="glass-card" style={{ width: "360px", padding: "16px", display: "flex", flexDirection: "column", maxHeight: "75vh", flexShrink: 0 }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Brain size={16} style={{ color: "var(--primary)" }} /> AI Data Chat
                            </h3>

                            {/* Messages */}
                            <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px", minHeight: "200px" }}>
                                {chatMessages.length === 0 && (
                                    <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--text-muted)" }}>
                                        <Brain size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
                                        <p style={{ fontSize: "0.82rem" }}>Tanyakan apa saja tentang data Anda!</p>
                                        <p style={{ fontSize: "0.75rem", marginTop: "4px" }}>Contoh: &quot;Produk mana yang paling laris?&quot;</p>
                                    </div>
                                )}
                                {chatMessages.map((msg, i) => (
                                    <div key={i} style={{
                                        padding: "10px 12px", borderRadius: "10px", fontSize: "0.82rem",
                                        background: msg.role === "user" ? "var(--primary)" : "var(--bg-surface)",
                                        color: msg.role === "user" ? "white" : "var(--text-primary)",
                                        alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                        maxWidth: "90%", whiteSpace: "pre-wrap",
                                    }}>
                                        {msg.content}
                                    </div>
                                ))}
                                {chatLoading && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> AI sedang berpikir...
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div style={{ display: "flex", gap: "6px" }}>
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !chatLoading && handleChat()}
                                    placeholder="Tanya tentang data..."
                                    style={{
                                        flex: 1, padding: "10px 12px", background: "var(--bg-surface)",
                                        border: "1px solid var(--border-color)", borderRadius: "8px",
                                        color: "var(--text-primary)", fontSize: "0.82rem",
                                    }}
                                />
                                <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()} className="btn-primary" style={{ padding: "10px 14px" }}>
                                    <Send size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
