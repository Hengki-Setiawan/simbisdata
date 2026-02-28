/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * AI Quality Advisor — Generates human-readable quality analysis with actionable suggestions
 * Uses rule-based scoring + optional AI narration for deeper insights
 */

import { type DataQualityReport, type DataIssue } from "./data-validator";

export interface QualityAdvice {
    score: number;
    grade: string;
    summary: string;
    adviceItems: AdviceItem[];
    canAutoFix: boolean;
    estimatedImprovement: number; // Score after fixes
}

export interface AdviceItem {
    icon: string;
    severity: "critical" | "warning" | "suggestion" | "good";
    title: string;
    description: string;
    fixable: boolean;
    fixAction?: string; // what the auto-fix would do
    impact: number; // estimated score improvement (0-15)
}

/**
 * Generate quality advice from quality report (rule-based, no AI needed)
 */
export function generateQualityAdvice(report: DataQualityReport): QualityAdvice {
    const adviceItems: AdviceItem[] = [];
    let estimatedImprovement = report.score;

    // Analyze each issue and generate advice
    for (const issue of report.issues) {
        if (issue.severity === "error") {
            adviceItems.push({
                icon: "🔴",
                severity: "critical",
                title: issue.message,
                description: getAdviceDescription(issue),
                fixable: isAutoFixable(issue),
                fixAction: getFixAction(issue),
                impact: 10,
            });
            if (isAutoFixable(issue)) estimatedImprovement += 8;
        } else if (issue.severity === "warning") {
            adviceItems.push({
                icon: "🟡",
                severity: "warning",
                title: issue.message,
                description: getAdviceDescription(issue),
                fixable: isAutoFixable(issue),
                fixAction: getFixAction(issue),
                impact: 5,
            });
            if (isAutoFixable(issue)) estimatedImprovement += 4;
        } else {
            adviceItems.push({
                icon: "🔵",
                severity: "suggestion",
                title: issue.message,
                description: getAdviceDescription(issue),
                fixable: isAutoFixable(issue),
                fixAction: getFixAction(issue),
                impact: 2,
            });
            if (isAutoFixable(issue)) estimatedImprovement += 1;
        }
    }

    // Add positive items
    if (report.score >= 80) {
        adviceItems.unshift({
            icon: "✅",
            severity: "good",
            title: "Kualitas data sudah baik!",
            description: `Skor ${report.score}/100 — data siap untuk analisis ML dengan hasil akurat.`,
            fixable: false,
            impact: 0,
        });
    }

    // Check column completeness
    const lowCompleteness = report.columnStats.filter(c => c.completeness < 70);
    if (lowCompleteness.length > 0) {
        adviceItems.push({
            icon: "📊",
            severity: "suggestion",
            title: `${lowCompleteness.length} kolom memiliki banyak cell kosong`,
            description: `Kolom: ${lowCompleteness.map(c => `${c.name} (${c.completeness}%)`).join(", ")}. Cell kosong akan menurunkan akurasi analisis.`,
            fixable: true,
            fixAction: "AI bisa mengisi berdasarkan konteks data lain",
            impact: lowCompleteness.length * 2,
        });
    }

    // Check for category variety
    const highCardinality = report.columnStats.filter(c => c.type === "text" && c.uniqueCount > 50);
    if (highCardinality.length > 0) {
        adviceItems.push({
            icon: "📋",
            severity: "suggestion",
            title: `${highCardinality.length} kolom teks dengan variasi tinggi`,
            description: `Kemungkinan ada typo atau inkonsistensi. AI bisa mendeteksi dan menggabungkan kategori yang mirip.`,
            fixable: true,
            fixAction: "AI kategori konsolidasi — gabung kategori mirip",
            impact: 3,
        });
    }

    estimatedImprovement = Math.min(100, estimatedImprovement);
    const canAutoFix = adviceItems.some(a => a.fixable);

    return {
        score: report.score,
        grade: report.grade,
        summary: generateSummary(report, adviceItems),
        adviceItems,
        canAutoFix,
        estimatedImprovement,
    };
}

function getAdviceDescription(issue: DataIssue): string {
    if (issue.message.includes("kosong")) {
        return `${issue.affectedRows} cell kosong ditemukan${issue.column ? ` di kolom "${issue.column}"` : ""}. Ini bisa mempengaruhi akurasi analisis regional dan segmentasi pelanggan.`;
    }
    if (issue.message.includes("duplikat")) {
        return `Baris duplikat kemungkinan disebabkan oleh double-export dari marketplace. Aman untuk dihapus secara otomatis.`;
    }
    if (issue.message.includes("campur")) {
        return `Kolom ini berisi campuran tipe data (angka & teks). AI bisa mendeteksi format yang benar dan melakukan konversi.`;
    }
    if (issue.message.includes("sama")) {
        return `Semua nilai di kolom ini identik — kolom mungkin tidak berguna untuk analisis dan bisa di-skip.`;
    }
    return `Issue terdeteksi yang perlu perhatian. Jalankan AI Auto-Fix untuk perbaikan otomatis.`;
}

function isAutoFixable(issue: DataIssue): boolean {
    const fixableTypes = ["duplikat", "kosong", "campur"];
    return fixableTypes.some(t => issue.message.toLowerCase().includes(t));
}

function getFixAction(issue: DataIssue): string | undefined {
    if (issue.message.includes("kosong")) return "Isi cell kosong dengan nilai default (0 untuk angka, '-' untuk teks)";
    if (issue.message.includes("duplikat")) return "Hapus baris duplikat secara otomatis";
    if (issue.message.includes("campur")) return "Konversi ke tipe data yang paling dominan";
    return undefined;
}

function generateSummary(report: DataQualityReport, items: AdviceItem[]): string {
    const critical = items.filter(i => i.severity === "critical").length;
    const warnings = items.filter(i => i.severity === "warning").length;
    const fixable = items.filter(i => i.fixable).length;

    if (report.score >= 90) {
        return `Data berkualitas excellent! ${report.totalRows} baris data siap dianalisis dengan akurasi tinggi.`;
    }
    if (report.score >= 75) {
        return `Data cukup baik (${report.score}/100). ${warnings > 0 ? `Ada ${warnings} peringatan minor.` : ""} ${fixable > 0 ? `${fixable} masalah bisa diperbaiki otomatis dengan AI Auto-Fix.` : ""}`;
    }
    if (report.score >= 50) {
        return `Data memerlukan perbaikan (${report.score}/100). ${critical > 0 ? `${critical} masalah kritis perlu ditangani.` : ""} Jalankan AI Auto-Fix untuk meningkatkan kualitas.`;
    }
    return `Data memiliki banyak masalah (${report.score}/100). Sangat disarankan untuk menjalankan AI Auto-Fix dan mereview data sebelum analisis.`;
}

/**
 * Build AI prompt for deeper quality analysis (optional enhancement)
 */
export function buildQualityAdvicePrompt(report: DataQualityReport): string {
    const issuesSummary = report.issues.slice(0, 8).map(i =>
        `- [${i.severity}] ${i.message}${i.column ? ` (kolom: ${i.column})` : ""}`
    ).join("\n");

    const colTypes = report.columnStats.slice(0, 15).map(c =>
        `${c.name}: ${c.type} (${c.completeness}% terisi, ${c.uniqueCount} unik)`
    ).join("\n");

    return `Analisis kualitas dataset ini dan berikan saran perbaikan dalam Bahasa Indonesia:

Skor: ${report.score}/100 (${report.grade})
Total: ${report.totalRows} baris, ${report.totalColumns} kolom

Masalah terdeteksi:
${issuesSummary}

Struktur kolom:
${colTypes}

Berikan 3-5 saran prioritas untuk meningkatkan kualitas data ini, format JSON:
{
  "insights": ["insight1", "insight2"],
  "priorities": ["aksi1", "aksi2"],
  "estimatedScoreAfterFix": 90
}`;
}
