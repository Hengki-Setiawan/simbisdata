/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Universal Format Detector — Detect file type, structure, encoding, and data layout
 * Supports: Excel, CSV, TSV, JSON, XML, clipboard paste
 */

export type FileFormat = "xlsx" | "xls" | "csv" | "tsv" | "json" | "xml" | "ods" | "clipboard" | "unknown";

export type DataStructure = "flat_table" | "nested_json" | "key_value" | "multi_section" | "pivot" | "unknown";

export interface FormatDetectionResult {
    format: FileFormat;
    structure: DataStructure;
    encoding: string;
    delimiter?: string;     // for CSV/TSV
    headerRow: number;      // 0-indexed, -1 if no header
    dataStartRow: number;
    dataEndRow: number;     // -1 if until end
    sheetName?: string;     // for Excel
    totalSheets?: number;
    confidence: number;
    warnings: string[];
}

/**
 * Detect format from file extension and content
 */
export function detectFormat(file: File): FormatDetectionResult {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const warnings: string[] = [];

    const base: FormatDetectionResult = {
        format: "unknown",
        structure: "flat_table",
        encoding: "utf-8",
        headerRow: 0,
        dataStartRow: 1,
        dataEndRow: -1,
        confidence: 0.5,
        warnings,
    };

    switch (ext) {
        case "xlsx": case "xls":
            return { ...base, format: ext as FileFormat, confidence: 0.99 };
        case "ods":
            return { ...base, format: "ods", confidence: 0.99, warnings: ["Format ODS — konversi mungkin tidak sempurna"] };
        case "csv":
            return { ...base, format: "csv", delimiter: ",", confidence: 0.95 };
        case "tsv":
        case "txt":
            return { ...base, format: "tsv", delimiter: "\t", confidence: ext === "tsv" ? 0.95 : 0.7, warnings: ext === "txt" ? ["File .txt — asumsi tab-separated"] : [] };
        case "json":
            return { ...base, format: "json", structure: "nested_json", confidence: 0.95 };
        case "xml":
            return { ...base, format: "xml", structure: "nested_json", confidence: 0.90, warnings: ["Format XML — parsing mungkin butuh konfigurasi"] };
        default:
            return { ...base, warnings: [`Ekstensi .${ext} tidak dikenal — mencoba auto-detect`] };
    }
}

/**
 * Detect delimiter for CSV/text files from content
 */
export function detectDelimiter(content: string): { delimiter: string; confidence: number } {
    const lines = content.split("\n").slice(0, 5);
    const delimiters = [",", "\t", ";", "|"];
    let best = ",";
    let bestConsistency = 0;

    for (const d of delimiters) {
        const counts = lines.map(l => l.split(d).length);
        if (counts.length === 0) continue;

        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        const allSame = counts.every(c => c === counts[0]);

        if (avg > 1 && allSame && counts[0] > bestConsistency) {
            best = d;
            bestConsistency = counts[0];
        }
    }

    return { delimiter: best, confidence: bestConsistency > 2 ? 0.95 : 0.6 };
}

/**
 * Detect header row — sometimes data starts at row 2, 3, etc.
 */
export function detectHeaderRow(rows: any[][]): { headerRow: number; dataStartRow: number } {
    if (rows.length < 2) return { headerRow: 0, dataStartRow: 1 };

    // Strategy: header row is the one where most cells are non-numeric text
    for (let i = 0; i < Math.min(5, rows.length); i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const textCells = row.filter((cell: any) => {
            const s = String(cell || "").trim();
            return s.length > 0 && isNaN(parseFloat(s));
        }).length;

        const numericCells = row.filter((cell: any) => {
            const s = String(cell || "").trim();
            return s.length > 0 && !isNaN(parseFloat(s));
        }).length;

        // Header likely has mostly text, data rows have more numbers
        if (textCells > numericCells && textCells > row.length * 0.5) {
            return { headerRow: i, dataStartRow: i + 1 };
        }
    }

    return { headerRow: 0, dataStartRow: 1 };
}

/**
 * Parse JSON data into flat rows
 */
export function flattenJSON(data: any): Record<string, any>[] {
    if (Array.isArray(data)) {
        if (data.length === 0) return [];
        if (typeof data[0] === "object" && !Array.isArray(data[0])) {
            return data; // Already array of objects
        }
    }

    // Try to find array in nested structure
    if (typeof data === "object" && !Array.isArray(data)) {
        for (const key of Object.keys(data)) {
            if (Array.isArray(data[key]) && data[key].length > 0 && typeof data[key][0] === "object") {
                return data[key];
            }
        }
    }

    return [];
}

/**
 * Parse XML string to flat rows (simple implementation)
 */
export function parseXMLToRows(xmlString: string): Record<string, any>[] {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, "text/xml");

        // Find repeating elements (rows)
        const allElements = doc.querySelectorAll("*");
        const tagCounts = new Map<string, number>();

        allElements.forEach(el => {
            const tag = el.tagName;
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });

        // Most repeated tag with children is likely the row element
        let rowTag = "";
        let maxCount = 0;
        for (const [tag, count] of tagCounts) {
            if (count > maxCount && count > 1) {
                const el = doc.querySelector(tag);
                if (el && el.children.length > 0) {
                    rowTag = tag;
                    maxCount = count;
                }
            }
        }

        if (!rowTag) return [];

        const rowElements = doc.querySelectorAll(rowTag);
        const rows: Record<string, any>[] = [];

        rowElements.forEach(el => {
            const row: Record<string, any> = {};
            Array.from(el.children).forEach(child => {
                row[child.tagName] = child.textContent?.trim() || "";
            });
            if (Object.keys(row).length > 0) rows.push(row);
        });

        return rows;
    } catch {
        return [];
    }
}

/**
 * Parse clipboard text (tab or comma separated) to rows
 */
export function parseClipboard(text: string): Record<string, any>[] {
    const lines = text.trim().split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];

    const { delimiter } = detectDelimiter(text);
    const header = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ""));

    return lines.slice(1).map(line => {
        const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ""));
        const row: Record<string, any> = {};
        header.forEach((h, i) => {
            row[h] = values[i] || "";
        });
        return row;
    });
}
