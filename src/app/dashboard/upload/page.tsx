"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2,
    ArrowRight, Table, Shield, Sparkles, RefreshCcw, ChevronDown, ChevronUp, Brain,
    Wrench, MessageCircle, Zap
} from "lucide-react";
import { autoMapColumns, applyMapping, getAvailableFields, type ColumnMapping } from "@/lib/column-mapper";
import { cleanData, type CleaningReport } from "@/lib/data-cleaner";
import { validateData, type DataQualityReport } from "@/lib/data-validator";
import { detectUnresolvedIssues, type CleaningIssue } from "@/lib/ai-cleaner";
import { ruleBasedRepair, applyRepairs, type RepairReport } from "@/lib/ai-data-repair";
import { generateQualityAdvice, type QualityAdvice } from "@/lib/ai-quality-advisor";
import { detectFormat } from "@/lib/format-detector";
import { lookupColumnCorrection, saveColumnCorrection } from "@/lib/corrections-store";
import { db } from "@/lib/local-db";
import { uploadFiles } from "@/utils/uploadthing";

/* eslint-disable @typescript-eslint/no-explicit-any */

const gradeColors: Record<string, string> = { A: "#10b981", B: "#6366f1", C: "#f59e0b", D: "#ef4444", F: "#ef4444" };
const severityIcons: Record<string, string> = { error: "❌", warning: "⚠️", info: "ℹ️" };

// Processing step type
type ProcessingStep = {
    id: string;
    label: string;
    status: "pending" | "running" | "done" | "error";
    detail?: string;
};

const INITIAL_STEPS: ProcessingStep[] = [
    { id: "parse", label: "File Parsing", status: "pending" },
    { id: "clean", label: "Auto-Clean", status: "pending" },
    { id: "detect", label: "Platform Detection", status: "pending" },
    { id: "map", label: "Column Mapping", status: "pending" },
    { id: "validate", label: "Data Validation", status: "pending" },
    { id: "repair", label: "Data Repair", status: "pending" },
    { id: "quality", label: "Quality Analysis", status: "pending" },
];

export default function UploadPage() {
    const router = useRouter();
    const [files, setFiles] = useState<File[]>([]);
    const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
    const [preview, setPreview] = useState<{ columns: string[]; rows: Record<string, unknown>[]; total: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // Processing progress
    const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
    const [currentStep, setCurrentStep] = useState(0);

    // Smart processing states
    const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
    const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
    const [cleaningReport, setCleaningReport] = useState<CleaningReport | null>(null);
    const [isCleaned, setIsCleaned] = useState(false);
    const [showMapping, setShowMapping] = useState(false);
    const [showIssues, setShowIssues] = useState(false);
    const [isMappingAi, setIsMappingAi] = useState(false);

    // AI-augmented states
    const [qualityAdvice, setQualityAdvice] = useState<QualityAdvice | null>(null);
    const [repairReport, setRepairReport] = useState<RepairReport | null>(null);
    const [unresolvedIssues, setUnresolvedIssues] = useState<CleaningIssue[]>([]);
    const [isRepairing, setIsRepairing] = useState(false);
    const [showAdvice, setShowAdvice] = useState(false);

    // Step updater helper
    const updateStep = (stepId: string, status: ProcessingStep["status"], detail?: string) => {
        setSteps(prev => prev.map(s => s.id === stepId ? { ...s, status, detail } : s));
        const idx = INITIAL_STEPS.findIndex(s => s.id === stepId);
        if (idx >= 0) setCurrentStep(idx + (status === "done" ? 1 : 0));
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setError(null);
        setFiles(acceptedFiles);
        setProcessing(true);
        setIsCleaned(false);
        setCleaningReport(null);
        setQualityAdvice(null);
        setRepairReport(null);
        setUnresolvedIssues([]);
        setSteps(INITIAL_STEPS);
        setCurrentStep(0);

        try {
            updateStep("parse", "running", `Membaca ${acceptedFiles.length} file...`);

            const allDatasets: Record<string, any>[][] = [];

            for (const f of acceptedFiles) {
                const formatInfo = detectFormat(f);
                const arrayBuffer = await f.arrayBuffer();
                let json: Record<string, any>[] = [];

                if (formatInfo.format === "json") {
                    const text = new TextDecoder().decode(arrayBuffer);
                    const parsed = JSON.parse(text);
                    const { flattenJSON } = await import("@/lib/format-detector");
                    json = flattenJSON(parsed);
                } else if (formatInfo.format === "xml") {
                    const text = new TextDecoder().decode(arrayBuffer);
                    const { parseXMLToRows } = await import("@/lib/format-detector");
                    json = parseXMLToRows(text);
                } else {
                    const data = new Uint8Array(arrayBuffer);
                    const workbook = XLSX.read(data, { type: "array", cellDates: true });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    json = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];
                }

                if (json.length > 0) allDatasets.push(json);
            }

            if (allDatasets.length === 0) {
                setError("Semua file kosong atau format tidak dikenali.");
                setProcessing(false);
                updateStep("parse", "error", "File kosong");
                return;
            }

            const { mergeDatasets } = await import("@/lib/data-merger");
            const mergeResult = mergeDatasets(allDatasets);
            const mergedJson = mergeResult.merged;

            updateStep("parse", "done", `Digabung menjadi ${mergedJson.length} baris`);

            // === Step 2: Auto-Clean ===
            updateStep("clean", "running", "Membersihkan data...");
            const { cleaned, report: cleanReport } = cleanData(mergedJson);
            setCleaningReport(cleanReport);
            setIsCleaned(true);
            updateStep("clean", "done", `${cleanReport.fixes.length} perbaikan`);

            // === Step 3: Platform Detection ===
            updateStep("detect", "running", "Mendeteksi platform...");
            const { detectPlatform } = await import("@/lib/platform-detector");
            const platform = detectPlatform(Object.keys(cleaned[0] || {}));
            updateStep("detect", "done", `${platform.icon} ${platform.label} (${Math.round(platform.confidence * 100)}%)`);

            // === Step 4: Column Mapping ===
            updateStep("map", "running", "Memetakan kolom...");
            const mappings = autoMapColumns(cleaned);
            // Check corrections store for better mappings
            for (let i = 0; i < mappings.length; i++) {
                if (!mappings[i].mappedTo || mappings[i].confidence < 0.6) {
                    const saved = await lookupColumnCorrection(mappings[i].originalName);
                    if (saved) {
                        mappings[i] = { ...mappings[i], mappedTo: saved, confidence: 0.93 };
                    }
                }
            }
            setColumnMappings(mappings);
            const mapped = mappings.filter(m => m.mappedTo).length;
            updateStep("map", "done", `${mapped}/${mappings.length} kolom terpetakan`);

            // === Step 5: Validation ===
            updateStep("validate", "running", "Menvalidasi data...");
            const quality = validateData(cleaned);
            setQualityReport(quality);
            updateStep("validate", "done", `Skor: ${quality.score}/100 (${quality.grade})`);

            // === Step 6: Data Repair (rule-based) ===
            updateStep("repair", "running", "Memeriksa data...");
            const repair = ruleBasedRepair(cleaned);
            setRepairReport(repair);
            // Auto-apply high-confidence repairs
            let finalData = cleaned;
            if (repair.autoApplied > 0) {
                finalData = applyRepairs(cleaned, repair.suggestions, true);
            }
            // Detect AI-needed issues
            const aiIssues = detectUnresolvedIssues(finalData, cleanReport);
            setUnresolvedIssues(aiIssues);
            updateStep("repair", "done", `${repair.autoApplied} auto-fix, ${repair.needsReview} perlu review`);

            // === Step 7: Quality Advisory ===
            updateStep("quality", "running", "Menganalisis kualitas...");
            const advice = generateQualityAdvice(quality);
            setQualityAdvice(advice);
            updateStep("quality", "done", advice.summary.slice(0, 60));

            // Set final data
            setRawRows(finalData);
            const columns = Object.keys(finalData[0] || {});
            setPreview({ columns, rows: finalData.slice(0, 5), total: finalData.length });

            // Store to IndexedDB
            await db.saveNewData(finalData);

            // Background cloud upload
            try {
                await uploadFiles("excelUploader", { files: acceptedFiles });
            } catch (uploadError) {
                console.error("Cloud upload failed:", uploadError);
            }

            setProcessing(false);
        } catch (err) {
            console.error(err);
            setError("Gagal membaca file. Pastikan format valid dan tidak korup.");
            setProcessing(false);
        }
    }, []);

    const handleClean = () => {
        const { cleaned, report } = cleanData(rawRows);
        setCleaningReport(report);

        // Apply rule-based repairs
        const repair = ruleBasedRepair(cleaned);
        setRepairReport(repair);
        const finalData = repair.autoApplied > 0 ? applyRepairs(cleaned, repair.suggestions, true) : cleaned;

        setRawRows(finalData);
        setIsCleaned(true);

        // Re-validate
        const quality = validateData(finalData);
        setQualityReport(quality);
        const advice = generateQualityAdvice(quality);
        setQualityAdvice(advice);
        setPreview({ columns: Object.keys(finalData[0] || {}), rows: finalData.slice(0, 5), total: finalData.length });

        const mappings = autoMapColumns(finalData);
        setColumnMappings(mappings);

        db.saveNewData(finalData).catch(console.error);
    };

    // AI-powered repair for complex issues
    const handleAIRepair = async () => {
        if (unresolvedIssues.length === 0) return;
        setIsRepairing(true);
        try {
            const res = await fetch("/api/ai/smart-clean", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ issues: unresolvedIssues, sampleData: rawRows.slice(0, 3) }),
            });
            const data = await res.json();
            if (data.suggestions?.length > 0) {
                // Re-validate after AI fixes
                const quality = validateData(rawRows);
                setQualityReport(quality);
                setQualityAdvice(generateQualityAdvice(quality));
            }
        } catch (err) {
            console.error("AI Repair failed:", err);
        } finally {
            setIsRepairing(false);
        }
    };

    const handleMappingChange = async (index: number, newMapping: string | null) => {
        const updated = [...columnMappings];
        const originalName = updated[index].originalName;
        updated[index] = { ...updated[index], mappedTo: newMapping, confidence: newMapping ? 0.9 : 0 };
        setColumnMappings(updated);

        // Save correction for learning loop
        if (newMapping) {
            await saveColumnCorrection(originalName, newMapping, "user").catch(console.error);
        }
    };

    const handleAnalyze = async () => {
        setProcessing(true);
        const mapped = applyMapping(rawRows, columnMappings);
        await db.saveNewData(mapped);
        router.push("/dashboard");
    };

    const handleAutoMapAI = async () => {
        if (!rawRows || rawRows.length === 0) return;
        setIsMappingAi(true);
        try {
            const cols = Object.keys(rawRows[0]);
            const sample = rawRows.slice(0, 2);
            const res = await fetch("/api/ai/map-columns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ columns: cols, sampleData: sample }),
            });
            const data = await res.json();
            if (data.mapping) {
                const updated = columnMappings.map((m) => {
                    const mappedKey = data.mapping[m.originalName];
                    if (mappedKey) {
                        return { ...m, mappedTo: mappedKey, confidence: 0.99 };
                    }
                    return m;
                });
                setColumnMappings(updated);
                setShowMapping(true);
            }
        } catch (err) {
            console.error("Failed to map with AI", err);
        } finally {
            setIsMappingAi(false);
        }
    };

    // --- Copy Paste Handler ---
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            // Ignore paste if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const clipboardData = e.clipboardData;
            if (!clipboardData) return;

            // Try to get plain text (usually tab-separated from Excel/Sheets)
            const pastedText = clipboardData.getData("text/plain");
            if (!pastedText || pastedText.trim() === "") return;

            // Simple heuristic to check if it looks like table data (contains tabs and newlines)
            if (pastedText.includes("\t") && pastedText.includes("\n")) {
                e.preventDefault();

                // Convert tab-separated text to a Blob/File
                // Replace tabs with commas for simple CSV parsing, but properly quote values containing commas
                const csvContent = pastedText.split('\n').map(row =>
                    row.split('\t').map(cell =>
                        cell.includes(',') ? `"${cell.replace(/"/g, '""')}"` : cell
                    ).join(',')
                ).join('\n');

                const file = new File([csvContent], `Pasted_Data_${new Date().getTime()}.csv`, { type: "text/csv" });
                onDrop([file]);
            }
        };

        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    }, [onDrop]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
            "text/csv": [".csv"],
            "text/tab-separated-values": [".tsv"],
            "application/json": [".json"],
            "text/xml": [".xml"],
            "application/vnd.oasis.opendocument.spreadsheet": [".ods"],
        },
        maxFiles: 10,
    });

    const mappedCount = columnMappings.filter((m) => m.mappedTo).length;
    const highConfidence = columnMappings.filter((m) => m.confidence >= 0.8).length;
    const lowConfidence = columnMappings.filter((m) => m.mappedTo && m.confidence < 0.6).length;

    const progressPercent = Math.round((currentStep / INITIAL_STEPS.length) * 100);

    return (
        <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>Upload Data Penjualan</h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
                Upload file dari marketplace manapun. Sistem AI akan otomatis mendeteksi, membersihkan, memetakan, dan memperbaiki data.
            </p>

            {/* Dropzone */}
            <div {...getRootProps()} className="glass-card" style={{
                padding: "60px 40px", textAlign: "center", cursor: "pointer", borderStyle: "dashed", borderWidth: "2px",
                borderColor: isDragActive ? "var(--primary)" : "var(--border-color)",
                background: isDragActive ? "rgba(99,102,241,0.05)" : "var(--glass-bg)", transition: "all 0.3s ease",
            }}>
                <input {...getInputProps()} />
                <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
                    {processing ? <Loader2 size={48} style={{ color: "var(--primary)", animation: "spin 1s linear infinite" }} />
                        : files.length > 0 ? <CheckCircle2 size={48} style={{ color: "var(--success)" }} />
                            : <Upload size={48} style={{ color: "var(--primary)" }} />}
                </div>
                {processing ? <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-secondary)" }}>Memproses data...</p>
                    : files.length > 0 ? (
                        <div style={{ margin: "0 auto", maxWidth: "80%" }}>
                            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", maxWidth: "100%", color: "var(--success)" }}>
                                <FileSpreadsheet size={24} style={{ flexShrink: 0, marginRight: "8px" }} />
                                <span style={{
                                    fontSize: "1.2rem", fontWeight: 600,
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                    display: "inline-block"
                                }} title={files.map(f => f.name).join(", ")}>
                                    {files.length === 1 ? files[0].name : `${files.length} File Digabung`}
                                </span>
                            </div>
                            <p style={{ color: "var(--text-muted)", marginTop: "12px", fontSize: "0.95rem" }}>
                                Total {(files.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(1)} KB • Drop file lain untuk mengganti
                            </p>
                        </div>
                    ) : (
                        <>
                            <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>{isDragActive ? "Lepaskan file di sini..." : "Drag & drop file, atau tekan Ctrl+V untuk Paste tabel"}</p>
                            <p style={{ color: "var(--text-muted)", marginTop: "8px", fontSize: "0.9rem" }}>Format: .xlsx, .xls, .csv, .tsv, .json, .xml, .ods — dari marketplace manapun</p>
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

            {/* Processing Progress Bar */}
            <AnimatePresence>
                {processing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="glass-card" style={{ marginTop: "16px", padding: "20px 24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>⚙️ Processing Pipeline</span>
                            <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 600 }}>{progressPercent}%</span>
                        </div>
                        <div style={{ height: "6px", background: "rgba(99,102,241,0.1)", borderRadius: "100px", marginBottom: "16px", overflow: "hidden" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.3 }}
                                style={{ height: "100%", background: "linear-gradient(90deg, var(--primary), #818cf8)", borderRadius: "100px" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {steps.map((step) => (
                                <div key={step.id} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem" }}>
                                    {step.status === "done" ? <CheckCircle2 size={14} style={{ color: "var(--success)", flexShrink: 0 }} />
                                        : step.status === "running" ? <Loader2 size={14} style={{ color: "var(--primary)", animation: "spin 1s linear infinite", flexShrink: 0 }} />
                                            : step.status === "error" ? <AlertCircle size={14} style={{ color: "var(--danger)", flexShrink: 0 }} />
                                                : <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--border-color)", flexShrink: 0 }} />}
                                    <span style={{ color: step.status === "done" ? "var(--success)" : step.status === "running" ? "var(--primary)" : "var(--text-muted)", fontWeight: step.status === "running" ? 600 : 400 }}>
                                        {step.label}
                                    </span>
                                    {step.detail && step.status === "done" && (
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: "auto" }}>— {step.detail}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Quality Advisor */}
            <AnimatePresence>
                {qualityAdvice && !processing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ marginTop: "16px", padding: "20px 24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <Zap size={18} style={{ color: "var(--primary)" }} />
                                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>AI Quality Advisor</span>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                {unresolvedIssues.length > 0 && (
                                    <button onClick={handleAIRepair} disabled={isRepairing} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "4px" }}>
                                        {isRepairing ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Wrench size={12} />}
                                        {isRepairing ? "AI Fixing..." : `AI Fix (${unresolvedIssues.length})`}
                                    </button>
                                )}
                                <button onClick={() => setShowAdvice(!showAdvice)} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.78rem" }}>
                                    {showAdvice ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                            </div>
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{qualityAdvice.summary}</p>
                        {qualityAdvice.canAutoFix && (
                            <p style={{ fontSize: "0.78rem", color: "var(--primary)", marginTop: "4px" }}>✨ Estimasi skor setelah fix: {qualityAdvice.estimatedImprovement}/100</p>
                        )}
                        <AnimatePresence>
                            {showAdvice && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: "12px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                                        {qualityAdvice.adviceItems.map((item, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.82rem", padding: "8px 12px", background: "var(--bg-card)", borderRadius: "8px" }}>
                                                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                                                <div>
                                                    <strong>{item.title}</strong>
                                                    <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "2px" }}>{item.description}</p>
                                                    {item.fixAction && <p style={{ color: "var(--primary)", fontSize: "0.75rem", marginTop: "4px" }}>💡 {item.fixAction}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {repairReport && repairReport.suggestions.length > 0 && (
                                        <div style={{ marginTop: "12px", padding: "12px", background: "rgba(99,102,241,0.05)", borderRadius: "8px" }}>
                                            <p style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: "4px" }}>🔧 Data Repair: {repairReport.summary}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                <Shield size={20} style={{ color: gradeColors[qualityReport?.grade || 'F'], marginBottom: "8px" }} />
                                <div style={{ fontSize: "2.2rem", fontWeight: 900, color: gradeColors[qualityReport?.grade || 'F'] }}>
                                    {qualityReport?.grade}
                                </div>
                                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Kualitas Data: {qualityReport?.score}/100</p>
                            </div>

                            {/* Data Stats */}
                            <div className="glass-card" style={{ padding: "20px" }}>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "8px" }}>📊 Data Overview</p>
                                <p style={{ fontSize: "0.9rem" }}><strong>{qualityReport?.totalRows}</strong> baris × <strong>{qualityReport?.totalColumns}</strong> kolom</p>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                                    {qualityReport?.issues?.filter((i) => i.severity === "error").length} error · {qualityReport?.issues?.filter((i) => i.severity === "warning").length} warning
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
                                {qualityReport?.summary}
                            </p>
                            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                {!isCleaned && qualityReport?.issues?.length > 0 && (
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

                        {/* Issues (collapsible) */}
                        <div className="glass-card" style={{ padding: "16px 20px", marginBottom: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <button onClick={() => setShowIssues(!showIssues)} style={{
                                    background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.9rem",
                                }}>
                                    {showIssues ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    <span>{qualityReport?.issues?.filter(i => i.severity === "error").length > 0 ? `${qualityReport?.issues?.filter(i => i.severity === "error").length} Kritikal` : "Analisis Issue"}</span>
                                </button>
                                {qualityReport?.issues?.length > 0 && (
                                    <button onClick={handleClean} disabled={isCleaned} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem", flexShrink: 0, whiteSpace: "nowrap" }}>
                                        <Sparkles size={14} /> Auto-Clean
                                    </button>
                                )}
                            </div>
                            <AnimatePresence>
                                {showIssues && qualityReport?.issues && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                                        <div style={{ padding: "20px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid var(--border-color)" }}>
                                            {/* Data issues */}
                                            {qualityReport?.issues?.length > 0 && (
                                                <div style={{ marginBottom: "20px" }}>
                                                    <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px", color: "var(--text-muted)" }}>Isu Ditemukan:</h4>
                                                    <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                        {qualityReport?.issues?.map((issue, i) => (
                                                            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem", padding: "8px 12px", background: "var(--bg-card)", borderRadius: "6px", wordBreak: "break-word" }}>
                                                                <span>{severityIcons[issue.severity]}</span>
                                                                <div>
                                                                    <strong style={{ color: issue.severity === "error" ? "var(--danger)" : "var(--warning)" }}>{issue.column ? `[${issue.column}] ` : ""}</strong>
                                                                    <span style={{ color: "var(--text-primary)" }}>{issue.message}</span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Cleaning Report */}
                                            {cleaningReport && (
                                                <div>
                                                    <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "12px", color: "var(--success)", display: "flex", alignItems: "center", gap: "6px" }}><Sparkles size={16} />  Pembaruan Pembersihan:</h4>
                                                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px" }}>Berhasil membersihkan data. {cleaningReport?.removedRows} baris tidak valid dihapus.</p>
                                                    <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                        {cleaningReport?.fixes?.map((fix, i) => (
                                                            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem", color: "var(--text-primary)", wordBreak: "break-word" }}>
                                                                <CheckCircle2 size={14} style={{ color: "var(--success)", flexShrink: 0, marginTop: "2px" }} /> {fix.description}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Column Mapping (collapsible) */}
                        <div className="glass-card" style={{ padding: "16px 20px", marginBottom: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <button onClick={() => setShowMapping(!showMapping)} style={{
                                    background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.9rem",
                                }}>
                                    {showMapping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    🔗 Column Mapping ({mappedCount}/{columnMappings.length})
                                </button>
                                <button onClick={handleAutoMapAI} disabled={isMappingAi} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px", flexShrink: 0, whiteSpace: "nowrap" }}>
                                    {isMappingAi ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Brain size={14} />}
                                    {isMappingAi ? "AI Berpikir..." : "Auto-Map AI"}
                                </button>
                            </div>
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
                                        {preview?.columns?.slice(0, 8).map((col, i) => (
                                            <th key={i} style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600, whiteSpace: "nowrap" }}>{col}</th>
                                        ))}
                                        {preview?.columns && preview.columns.length > 8 && <th style={{ padding: "10px 12px", color: "var(--text-muted)" }}>+{preview.columns.length - 8} lagi</th>}
                                    </tr></thead>
                                    <tbody>
                                        {preview?.rows?.map((row, i) => (
                                            <tr key={i}>
                                                {preview?.columns?.slice(0, 8).map((col, j) => (
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
