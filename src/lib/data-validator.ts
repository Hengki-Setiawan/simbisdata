/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Data Quality Validator — Analyze & score data quality
 */

export interface DataQualityReport {
    score: number; // 0-100
    grade: "A" | "B" | "C" | "D" | "F";
    totalRows: number;
    totalColumns: number;
    issues: DataIssue[];
    columnStats: ColumnStat[];
    summary: string;
}

export interface DataIssue {
    severity: "error" | "warning" | "info";
    column?: string;
    message: string;
    affectedRows: number;
}

export interface ColumnStat {
    name: string;
    type: "text" | "number" | "date" | "category" | "mixed";
    completeness: number; // 0-100
    uniqueCount: number;
    emptyCount: number;
    sampleValues: string[];
}

export function validateData(rows: Record<string, any>[]): DataQualityReport {
    if (rows.length === 0) {
        return { score: 0, grade: "F", totalRows: 0, totalColumns: 0, issues: [{ severity: "error", message: "File kosong — tidak ada data", affectedRows: 0 }], columnStats: [], summary: "Data kosong" };
    }

    const columns = Object.keys(rows[0]);
    const issues: DataIssue[] = [];
    const columnStats: ColumnStat[] = [];
    let totalScore = 100;

    // Check minimum data
    if (rows.length < 5) {
        issues.push({ severity: "warning", message: `Hanya ${rows.length} baris data — analisis mungkin kurang akurat`, affectedRows: rows.length });
        totalScore -= 10;
    }

    // Analyze each column
    for (const col of columns) {
        const values = rows.map((r) => r[col]);
        const nonEmpty = values.filter((v) => v != null && String(v).trim() !== "");
        const emptyCount = values.length - nonEmpty.length;
        const completeness = Math.round((nonEmpty.length / values.length) * 100);
        const uniqueValues = new Set(nonEmpty.map(String));

        // Detect type
        let type: ColumnStat["type"] = "text";
        const numCount = nonEmpty.filter((v) => !isNaN(parseFloat(String(v)))).length;
        const datePatterns = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/;
        const dateCount = nonEmpty.filter((v) => datePatterns.test(String(v))).length;

        if (numCount > nonEmpty.length * 0.8) type = "number";
        else if (dateCount > nonEmpty.length * 0.5) type = "date";
        else if (uniqueValues.size < Math.min(15, nonEmpty.length * 0.3)) type = "category";
        else if (numCount > 0 && dateCount > 0) type = "mixed";

        columnStats.push({
            name: col, type, completeness,
            uniqueCount: uniqueValues.size, emptyCount,
            sampleValues: Array.from(uniqueValues).slice(0, 5),
        });

        // Flag issues
        if (completeness < 50) {
            issues.push({ severity: "warning", column: col, message: `${col}: ${emptyCount} cell kosong (${100 - completeness}%)`, affectedRows: emptyCount });
            totalScore -= 5;
        } else if (emptyCount > 0 && completeness < 90) {
            issues.push({ severity: "info", column: col, message: `${col}: ${emptyCount} cell kosong`, affectedRows: emptyCount });
            totalScore -= 2;
        }

        if (type === "mixed") {
            issues.push({ severity: "warning", column: col, message: `${col}: tipe data campur (angka & teks)`, affectedRows: 0 });
            totalScore -= 3;
        }

        if (uniqueValues.size === 1 && nonEmpty.length > 5) {
            issues.push({ severity: "info", column: col, message: `${col}: semua nilai sama ("${Array.from(uniqueValues)[0]}")`, affectedRows: nonEmpty.length });
            totalScore -= 1;
        }
    }

    // Check for common issues
    const emptyRowCount = rows.filter((r) => Object.values(r).every((v) => v == null || String(v).trim() === "")).length;
    if (emptyRowCount > 0) {
        issues.push({ severity: "error", message: `${emptyRowCount} baris sepenuhnya kosong`, affectedRows: emptyRowCount });
        totalScore -= 10;
    }

    // Check for duplicates
    const rowStrings = rows.map((r) => JSON.stringify(Object.values(r)));
    const dupeCount = rowStrings.length - new Set(rowStrings).size;
    if (dupeCount > 0) {
        issues.push({ severity: "warning", message: `${dupeCount} baris duplikat ditemukan`, affectedRows: dupeCount });
        totalScore -= 5;
    }

    // Calculate grade
    totalScore = Math.max(0, Math.min(100, totalScore));
    const grade: DataQualityReport["grade"] = totalScore >= 90 ? "A" : totalScore >= 75 ? "B" : totalScore >= 60 ? "C" : totalScore >= 40 ? "D" : "F";

    // Generate summary
    const errorCount = issues.filter((i) => i.severity === "error").length;
    const warningCount = issues.filter((i) => i.severity === "warning").length;
    const summary = errorCount > 0
        ? `Data memiliki ${errorCount} masalah kritis. Perlu dibersihkan sebelum analisis.`
        : warningCount > 0
            ? `Data cukup baik dengan ${warningCount} peringatan minor. Rekomendasi: jalankan auto-clean.`
            : `Data berkualitas baik! Siap dianalisis.`;

    return { score: totalScore, grade, totalRows: rows.length, totalColumns: columns.length, issues, columnStats, summary };
}
