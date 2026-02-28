/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Data Cleaner — Fix dirty, messy, and inconsistent Excel data
 */

export interface CleaningReport {
    totalRows: number;
    cleanedRows: number;
    removedRows: number;
    fixes: CleaningFix[];
}

export interface CleaningFix {
    type: "empty_row" | "whitespace" | "type_coerce" | "duplicate" | "missing_fill" | "date_fix" | "number_fix" | "trim_text";
    column?: string;
    count: number;
    description: string;
}

/**
 * Clean an array of row objects from a messy Excel file
 */
export function cleanData(rows: Record<string, any>[]): { cleaned: Record<string, any>[]; report: CleaningReport } {
    const fixes: CleaningFix[] = [];
    let removedRows = 0;

    // Step 1: Remove completely empty rows
    let cleaned = rows.filter((row) => {
        const hasValue = Object.values(row).some((v) => v != null && String(v).trim() !== "");
        if (!hasValue) removedRows++;
        return hasValue;
    });
    if (removedRows > 0) fixes.push({ type: "empty_row", count: removedRows, description: `${removedRows} baris kosong dihapus` });

    // Step 2: Trim whitespace from all text values
    let trimCount = 0;
    cleaned = cleaned.map((row) => {
        const newRow: Record<string, any> = {};
        for (const [key, value] of Object.entries(row)) {
            const trimmedKey = key.trim();
            if (typeof value === "string") {
                const trimmed = value.trim().replace(/\s+/g, " ");
                if (trimmed !== value) trimCount++;
                newRow[trimmedKey] = trimmed;
            } else {
                newRow[trimmedKey] = value;
            }
        }
        return newRow;
    });
    if (trimCount > 0) fixes.push({ type: "whitespace", count: trimCount, description: `${trimCount} cell dibersihkan spasi berlebih` });

    // Step 3: Fix numeric values (remove Rp, dots, commas from numbers)
    let numFixCount = 0;
    const numericPatterns = /[Rr]p\.?\s*|IDR\s*|\$\s*|USD\s*|Rp/gi;
    const columns = Object.keys(cleaned[0] || {});

    for (const col of columns) {
        const values = cleaned.map((r) => r[col]).filter((v) => v != null && v !== "");
        const hasNumeric = values.some((v) => {
            const s = String(v).replace(numericPatterns, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
            return !isNaN(parseFloat(s)) && s.length > 0;
        });

        // Check if this column looks like it should be numeric
        const looksNumeric = values.filter((v) => {
            const s = String(v).replace(numericPatterns, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
            return !isNaN(parseFloat(s));
        }).length > values.length * 0.4; // Lower threshold to 40% to catch messy currency columns

        if (looksNumeric && hasNumeric) {
            let fixed = 0;
            cleaned = cleaned.map((row) => {
                const val = row[col];
                if (val == null || val === "") return row;
                const str = String(val);
                // Remove currency symbols & thousand separators (Indonesian format assumes . is thousand, , is decimal)
                // Also handles spaces like "Rp 1 000 000"
                const cleaned_str = str.replace(numericPatterns, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".").trim();
                const num = parseFloat(cleaned_str);

                // Extra safety: If it's a valid number but original was a string with symbols
                if (!isNaN(num) && (str !== String(num) || typeof val === "string")) {
                    fixed++;
                    return { ...row, [col]: num };
                }
                return row;
            });
            if (fixed > 0) {
                numFixCount += fixed;
                fixes.push({ type: "number_fix", column: col, count: fixed, description: `${col}: ${fixed} nilai dikonversi ke angka` });
            }
        }
    }

    // Step 4: Fix date values (normalize to ISO format)
    let dateFixCount = 0;
    for (const col of columns) {
        const values = cleaned.map((r) => r[col]).filter((v) => v != null && v !== "");
        const datePatterns = [
            /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/, // DD/MM/YYYY or MM/DD/YYYY
            /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/, // YYYY-MM-DD
        ];
        const looksDate = values.filter((v) => datePatterns.some((p) => p.test(String(v)))).length > values.length * 0.5;

        if (looksDate) {
            let fixed = 0;
            cleaned = cleaned.map((row) => {
                const val = row[col];
                if (val == null || val === "") return row;
                const str = String(val);
                const d = new Date(str);
                if (!isNaN(d.getTime())) {
                    // Check if it's an Excel serial date number
                    if (typeof val === "number" && val > 30000 && val < 60000) {
                        const excelEpoch = new Date(1899, 11, 30);
                        const date = new Date(excelEpoch.getTime() + val * 86400000);
                        fixed++;
                        return { ...row, [col]: date.toISOString().split("T")[0] };
                    }
                    return row;
                }
                // Try DD/MM/YYYY format (common in Indonesian data)
                const parts = str.split(/[\/\-]/);
                if (parts.length === 3) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]);
                    const year = parseInt(parts[2]);
                    if (day > 0 && day <= 31 && month > 0 && month <= 12) {
                        const fullYear = year < 100 ? year + 2000 : year;
                        const isoDate = `${fullYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        const testDate = new Date(isoDate);
                        if (!isNaN(testDate.getTime())) {
                            fixed++;
                            return { ...row, [col]: isoDate };
                        }
                    }
                }
                return row;
            });
            if (fixed > 0) {
                dateFixCount += fixed;
                fixes.push({ type: "date_fix", column: col, count: fixed, description: `${col}: ${fixed} tanggal diformat ulang` });
            }
        }
    }

    // Step 5: Handle missing values — fill with defaults
    let missingFillCount = 0;
    for (const col of columns) {
        const values = cleaned.map((r) => r[col]);
        const nonEmpty = values.filter((v) => v != null && String(v).trim() !== "");
        const emptyCount = values.length - nonEmpty.length;

        if (emptyCount > 0 && emptyCount < values.length * 0.5) {
            // Determine fill strategy
            const isNumeric = nonEmpty.every((v) => !isNaN(parseFloat(String(v))));

            if (isNumeric) {
                // Fill numeric with 0
                cleaned = cleaned.map((row) => {
                    if (row[col] == null || String(row[col]).trim() === "") {
                        missingFillCount++;
                        return { ...row, [col]: 0 };
                    }
                    return row;
                });
            } else {
                // Fill text with "-"
                cleaned = cleaned.map((row) => {
                    if (row[col] == null || String(row[col]).trim() === "") {
                        missingFillCount++;
                        return { ...row, [col]: "-" };
                    }
                    return row;
                });
            }
        }
    }
    if (missingFillCount > 0) fixes.push({ type: "missing_fill", count: missingFillCount, description: `${missingFillCount} cell kosong diisi default (0 atau "-")` });

    // Step 6: Remove duplicate rows
    const seen = new Set<string>();
    const beforeDedup = cleaned.length;
    cleaned = cleaned.filter((row) => {
        const key = JSON.stringify(Object.values(row));
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    const dupeCount = beforeDedup - cleaned.length;
    if (dupeCount > 0) fixes.push({ type: "duplicate", count: dupeCount, description: `${dupeCount} baris duplikat dihapus` });

    return {
        cleaned,
        report: {
            totalRows: rows.length,
            cleanedRows: cleaned.length,
            removedRows: rows.length - cleaned.length,
            fixes,
        },
    };
}
