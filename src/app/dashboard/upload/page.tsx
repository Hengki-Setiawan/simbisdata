"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2,
    ArrowRight, Table, Shield, Sparkles, RefreshCcw, ChevronDown, ChevronUp,
} from "lucide-react";
import { autoMapColumns, applyMapping, getAvailableFields, type ColumnMapping } from "@/lib/column-mapper";
import { cleanData, type CleaningReport } from "@/lib/data-cleaner";
import { validateData, type DataQualityReport } from "@/lib/data-validator";
import { db } from "@/lib/local-db";
import { uploadFiles } from "@/utils/uploadthing";

/* eslint-disable @typescript-eslint/no-explicit-any */

const gradeColors: Record<string, string> = { A: "#10b981", B: "#6366f1", C: "#f59e0b", D: "#ef4444", F: "#ef4444" };
const severityIcons: Record<string, string> = { error: "❌", warning: "⚠️", info: "ℹ️" };

export default function UploadPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
    const [preview, setPreview] = useState<{ columns: string[]; rows: Record<string, unknown>[]; total: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // Smart processing states
    const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
    const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
    const [cleaningReport, setCleaningReport] = useState<CleaningReport | null>(null);
    const [isCleaned, setIsCleaned] = useState(false);
    const [showMapping, setShowMapping] = useState(false);
    const [showIssues, setShowIssues] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const f = acceptedFiles[0];
        if (!f) return;

        setError(null);
        setFile(f);
        setProcessing(true);
        setIsCleaned(false);
        setCleaningReport(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array", cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

                if (json.length === 0) {
                    setError("File Excel kosong atau format tidak dikenali.");
                    setProcessing(false);
                    return;
                }

                const columns = Object.keys(json[0]);
                setRawRows(json as Record<string, any>[]);
                setPreview({ columns, rows: json.slice(0, 5), total: json.length });

                // Run quality validation
                const quality = validateData(json as Record<string, any>[]);
                setQualityReport(quality);

                // Auto-map columns
                const mappings = autoMapColumns(json as Record<string, any>[]);
                setColumnMappings(mappings);

                // Store raw data to IndexedDB (async to prevent freezing)
                await db.saveNewData(json as Record<string, any>[]);

                // Upload file to AWS Cloud via UploadThing in the background
                try {
                    console.log("Starting cloud upload to UploadThing...");
                    const res = await uploadFiles("excelUploader", {
                        files: [f],
                    });
                    console.log("Cloud upload success. URL:", res[0].url);
                } catch (uploadError) {
                    console.error("Cloud upload failed:", uploadError);
                }

                setProcessing(false);
            } catch {
                setError("Gagal membaca file. Coba file .xlsx atau .xls yang valid.");
                setProcessing(false);
            }
        };
        reader.readAsArrayBuffer(f);
    }, []);

    const handleClean = () => {
        const { cleaned, report } = cleanData(rawRows);
        setCleaningReport(report);
        setRawRows(cleaned);
        setIsCleaned(true);

        // Re-validate after cleaning
        const quality = validateData(cleaned);
        setQualityReport(quality);
        setPreview({ columns: Object.keys(cleaned[0] || {}), rows: cleaned.slice(0, 5), total: cleaned.length });

        // Re-map columns
        const mappings = autoMapColumns(cleaned);
        setColumnMappings(mappings);

        db.saveNewData(cleaned).catch(console.error);
    };

    const handleMappingChange = (index: number, newMapping: string | null) => {
        const updated = [...columnMappings];
        updated[index] = { ...updated[index], mappedTo: newMapping, confidence: newMapping ? 0.9 : 0 };
        setColumnMappings(updated);
    };

    const handleAnalyze = async () => {
        setProcessing(true);
        // Apply column mapping before navigating
        const mapped = applyMapping(rawRows, columnMappings);
        await db.saveNewData(mapped);
        router.push("/dashboard");
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
            "text/csv": [".csv"],
        },
        maxFiles: 1,
    });

    const mappedCount = columnMappings.filter((m) => m.mappedTo).length;
    const highConfidence = columnMappings.filter((m) => m.confidence >= 0.8).length;
    const lowConfidence = columnMappings.filter((m) => m.mappedTo && m.confidence < 0.6).length;

    return (
        <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>Upload Data Penjualan</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
                Upload file Excel dari Shopee atau marketplace lainnya. Sistem akan otomatis mendeteksi kolom dan membersihkan data.
            </p>

            {/* Dropzone */}
            <div {...getRootProps()} className="glass-card" style={{
                padding: "60px 40px", textAlign: "center", cursor: "pointer", borderStyle: "dashed", borderWidth: "2px",
                borderColor: isDragActive ? "var(--primary)" : "var(--border-color)",
                background: isDragActive ? "rgba(99,102,241,0.05)" : "var(--glass-bg)", transition: "all 0.3s ease",
            }}>
                <input {...getInputProps()} />
                <div style={{ marginBottom: "16px" }}>
                    {processing ? <Loader2 size={48} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
                        : file ? <CheckCircle2 size={48} style={{ color: "var(--success)" }} />
                            : <Upload size={48} style={{ color: "var(--primary)" }} />}
                </div>
                {processing ? <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-secondary)" }}>Membaca & menganalisis file...</p>
                    : file ? (
                        <>
                            <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--success)" }}><FileSpreadsheet size={20} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />{file.name}</p>
                            <p style={{ color: "var(--text-muted)", marginTop: "8px", fontSize: "0.9rem" }}>{(file.size / 1024).toFixed(1)} KB • Drop file lain untuk mengganti</p>
                        </>
                    ) : (
                        <>
                            <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>{isDragActive ? "Lepaskan file di sini..." : "Drag & drop file Excel di sini"}</p>
                            <p style={{ color: "var(--text-muted)", marginTop: "8px", fontSize: "0.9rem" }}>Format: .xlsx, .xls, .csv — dari Shopee atau marketplace lainnya</p>
                        </>
                    )}
            </div>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{
                        marginTop: "16px", padding: "16px 20px", borderRadius: "var(--radius)", background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: "12px", color: "var(--danger)",
                    }}>
                        <AlertCircle size={20} /><span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Data Quality & Cleaning Section */}
            <AnimatePresence>
                {qualityReport && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: "24px" }}>
                        {/* Quality Score + Clean Button */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                            {/* Score Card */}
                            <div className="glass-card" style={{ padding: "20px", textAlign: "center" }}>
                                <Shield size={20} style={{ color: gradeColors[qualityReport.grade], marginBottom: "8px" }} />
                                <div style={{ fontSize: "2.2rem", fontWeight: 900, color: gradeColors[qualityReport.grade] }}>
                                    {qualityReport.grade}
                                </div>
                                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Kualitas Data: {qualityReport.score}/100</p>
                            </div>

                            {/* Data Stats */}
                            <div className="glass-card" style={{ padding: "20px" }}>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "8px" }}>📊 Data Overview</p>
                                <p style={{ fontSize: "0.9rem" }}><strong>{qualityReport.totalRows}</strong> baris × <strong>{qualityReport.totalColumns}</strong> kolom</p>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                                    {qualityReport.issues.filter((i) => i.severity === "error").length} error · {qualityReport.issues.filter((i) => i.severity === "warning").length} warning
                                </p>
                            </div>

                            {/* Column Mapping Stats */}
                            <div className="glass-card" style={{ padding: "20px" }}>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "8px" }}>🔗 Kolom Terpetakan</p>
                                <p style={{ fontSize: "0.9rem" }}>
                                    <strong>{mappedCount}</strong> / {columnMappings.length} kolom
                                    {highConfidence > 0 && <span style={{ color: "var(--success)", fontSize: "0.78rem" }}> ({highConfidence} yakin)</span>}
                                </p>
                                {lowConfidence > 0 && <p style={{ fontSize: "0.78rem", color: "var(--warning)", marginTop: "4px" }}>⚠️ {lowConfidence} perlu review</p>}
                            </div>
                        </div>

                        {/* Summary + Action */}
                        <div className="glass-card" style={{ padding: "16px 20px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                                {qualityReport.summary}
                            </p>
                            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                {!isCleaned && qualityReport.issues.length > 0 && (
                                    <button onClick={handleClean} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                                        <Sparkles size={14} /> Auto-Clean
                                    </button>
                                )}
                                {isCleaned && (
                                    <span style={{ padding: "8px 16px", borderRadius: "var(--radius)", background: "rgba(16,185,129,0.15)", color: "var(--success)", fontSize: "0.8rem", fontWeight: 600 }}>
                                        ✓ Data Dibersihkan
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Cleaning Report */}
                        {cleaningReport && cleaningReport.fixes.length > 0 && (
                            <motion.div className="glass-card" style={{ padding: "16px 20px", marginBottom: "16px", borderLeft: "4px solid var(--success)" }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                                <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "8px" }}>
                                    <RefreshCcw size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                                    Cleaning Report — {cleaningReport.cleanedRows} baris tersisa
                                </p>
                                {cleaningReport.fixes.map((fix, i) => (
                                    <p key={i} style={{ fontSize: "0.82rem", color: "var(--text-secondary)", padding: "2px 0" }}>✓ {fix.description}</p>
                                ))}
                            </motion.div>
                        )}

                        {/* Issues (collapsible) */}
                        {qualityReport.issues.length > 0 && (
                            <div className="glass-card" style={{ padding: "16px 20px", marginBottom: "16px" }}>
                                <button onClick={() => setShowIssues(!showIssues)} style={{
                                    background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: "8px", width: "100%", fontWeight: 700, fontSize: "0.9rem",
                                }}>
                                    {showIssues ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    {qualityReport.issues.length} Issues Ditemukan
                                </button>
                                {showIssues && (
                                    <div style={{ marginTop: "12px" }}>
                                        {qualityReport.issues.map((issue, i) => (
                                            <div key={i} style={{ display: "flex", gap: "8px", padding: "6px 0", borderBottom: "1px solid var(--border-color)", fontSize: "0.82rem" }}>
                                                <span>{severityIcons[issue.severity]}</span>
                                                <span style={{ color: "var(--text-secondary)" }}>{issue.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Column Mapping (collapsible) */}
                        <div className="glass-card" style={{ padding: "16px 20px", marginBottom: "16px" }}>
                            <button onClick={() => setShowMapping(!showMapping)} style={{
                                background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: "8px", width: "100%", fontWeight: 700, fontSize: "0.9rem",
                            }}>
                                {showMapping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                🔗 Column Mapping ({mappedCount}/{columnMappings.length})
                            </button>
                            {showMapping && (
                                <div style={{ marginTop: "12px", maxHeight: "400px", overflow: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                                        <thead><tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                                            <th style={{ textAlign: "left", padding: "8px 4px", color: "var(--text-muted)", fontWeight: 600 }}>Kolom File</th>
                                            <th style={{ textAlign: "left", padding: "8px 4px", color: "var(--text-muted)", fontWeight: 600 }}>Tipe</th>
                                            <th style={{ textAlign: "left", padding: "8px 4px", color: "var(--text-muted)", fontWeight: 600 }}>→ Peta ke</th>
                                            <th style={{ textAlign: "center", padding: "8px 4px", color: "var(--text-muted)", fontWeight: 600 }}>Confidence</th>
                                        </tr></thead>
                                        <tbody>
                                            {columnMappings.map((m, i) => (
                                                <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                                    <td style={{ padding: "8px 4px", fontWeight: 600 }}>{m.originalName}</td>
                                                    <td style={{ padding: "8px 4px" }}>
                                                        <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "0.72rem", background: "rgba(99,102,241,0.1)", color: "var(--primary)" }}>{m.dataType}</span>
                                                    </td>
                                                    <td style={{ padding: "8px 4px" }}>
                                                        <select value={m.mappedTo || ""} onChange={(e) => handleMappingChange(i, e.target.value || null)} style={{
                                                            padding: "4px 8px", background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                                                            borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.78rem", maxWidth: "200px",
                                                        }}>
                                                            <option value="">— Tidak dipetakan —</option>
                                                            {m.mappedTo && <option value={m.mappedTo}>{m.mappedTo}</option>}
                                                            {getAvailableFields(columnMappings).map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: "8px 4px", textAlign: "center" }}>
                                                        {m.mappedTo ? (
                                                            <span style={{
                                                                padding: "2px 8px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 700,
                                                                background: m.confidence >= 0.8 ? "rgba(16,185,129,0.15)" : m.confidence >= 0.5 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)",
                                                                color: m.confidence >= 0.8 ? "var(--success)" : m.confidence >= 0.5 ? "var(--warning)" : "var(--danger)",
                                                            }}>{Math.round(m.confidence * 100)}%</span>
                                                        ) : <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>—</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Table */}
            <AnimatePresence>
                {preview && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: "16px" }}>
                        <div className="glass-card" style={{ padding: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <Table size={20} style={{ color: "var(--primary)" }} />
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Preview Data</h3>
                                    <span style={{ padding: "4px 12px", borderRadius: "100px", background: "rgba(99,102,241,0.15)", color: "var(--primary-light)", fontSize: "0.8rem", fontWeight: 600 }}>
                                        {preview.total.toLocaleString()} baris × {preview.columns.length} kolom
                                    </span>
                                </div>
                            </div>

                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                                    <thead><tr>
                                        {preview.columns.slice(0, 8).map((col, i) => (
                                            <th key={i} style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600, whiteSpace: "nowrap" }}>{col}</th>
                                        ))}
                                        {preview.columns.length > 8 && <th style={{ padding: "10px 12px", color: "var(--text-muted)" }}>+{preview.columns.length - 8} lagi</th>}
                                    </tr></thead>
                                    <tbody>
                                        {preview.rows.map((row, i) => (
                                            <tr key={i}>
                                                {preview.columns.slice(0, 8).map((col, j) => (
                                                    <td key={j} style={{ padding: "8px 12px", borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)", whiteSpace: "nowrap", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {String(row[col] ?? "")}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                                <button onClick={handleAnalyze} className="btn-primary">
                                    Analisis Sekarang <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
