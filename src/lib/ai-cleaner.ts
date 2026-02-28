/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * AI-Augmented Smart Cleaner — extends rule-based cleaning with AI for edge cases
 * Strategy: Rule-based first → AI only for unresolved issues (hemat token)
 */

export interface CleaningIssue {
    type: "format_ambiguous" | "currency_mixed" | "date_unparseable" | "encoding_broken" | "missing_critical" | "fuzzy_duplicate";
    column: string;
    sampleValues: string[];
    rowIndices: number[];
    autoFixed: boolean;
    description: string;
}

export interface AICleanSuggestion {
    column: string;
    action: "normalize" | "convert" | "fill" | "fix_encoding" | "skip";
    targetType: "number" | "date" | "text" | "category";
    transformRule: string; // e.g. "remove_currency_then_parse"
    sampleBefore: string[];
    sampleAfter: string[];
    confidence: number;
}

/**
 * Detect issues that rule-based cleaning can't handle
 */
export function detectUnresolvedIssues(rows: Record<string, any>[], cleanReport: any): CleaningIssue[] {
    const issues: CleaningIssue[] = [];
    if (rows.length === 0) return issues;

    const columns = Object.keys(rows[0]);

    for (const col of columns) {
        const values = rows.map((r, i) => ({ val: r[col], idx: i })).filter(v => v.val != null && v.val !== "");

        // 1. Mixed currency detection
        const currencySymbols = new Set<string>();
        const currencyPatterns = /^(Rp\.?\s*|IDR\s*|\$\s*|USD\s*|RM\s*|¥\s*|€\s*|£\s*)/i;
        values.forEach(v => {
            const match = String(v.val).match(currencyPatterns);
            if (match) currencySymbols.add(match[1].trim().toUpperCase());
        });
        if (currencySymbols.size > 1) {
            issues.push({
                type: "currency_mixed",
                column: col,
                sampleValues: values.slice(0, 5).map(v => String(v.val)),
                rowIndices: values.slice(0, 10).map(v => v.idx),
                autoFixed: false,
                description: `Campuran mata uang terdeteksi: ${[...currencySymbols].join(", ")}`,
            });
        }

        // 2. Unparseable dates (after rule-based date fix)
        const dateishCol = /tanggal|date|waktu|time|created|tgl|hari/i.test(col);
        if (dateishCol) {
            const unparseable = values.filter(v => {
                const s = String(v.val);
                const d = new Date(s);
                if (!isNaN(d.getTime())) return false;
                // Also check DD/MM/YYYY
                const parts = s.split(/[\/\-]/);
                if (parts.length === 3) return false;
                return true;
            });
            if (unparseable.length > 0 && unparseable.length < values.length * 0.5) {
                issues.push({
                    type: "date_unparseable",
                    column: col,
                    sampleValues: unparseable.slice(0, 5).map(v => String(v.val)),
                    rowIndices: unparseable.slice(0, 10).map(v => v.idx),
                    autoFixed: false,
                    description: `${unparseable.length} tanggal tidak dapat di-parse otomatis`,
                });
            }
        }

        // 3. Encoding issues (mojibake detection)
        const mojibakePattern = /[ï¿½Ã¤Ã¶Ã¼â€™â€œâ€]/;
        const brokenEncoding = values.filter(v => mojibakePattern.test(String(v.val)));
        if (brokenEncoding.length > 0) {
            issues.push({
                type: "encoding_broken",
                column: col,
                sampleValues: brokenEncoding.slice(0, 5).map(v => String(v.val)),
                rowIndices: brokenEncoding.slice(0, 10).map(v => v.idx),
                autoFixed: false,
                description: `${brokenEncoding.length} cell kemungkinan encoding error`,
            });
        }

        // 4. Ambiguous format (looks numeric but has mixed formats)
        const numPatterns = values.map(v => {
            const s = String(v.val).trim();
            if (/^\d+$/.test(s)) return "integer";
            if (/^\d+[.,]\d+$/.test(s)) return "decimal";
            if (/^[\d.,]+$/.test(s)) return "formatted_number";
            if (/^\d+[kKjJrR]?[btBT]?$/i.test(s)) return "abbreviation"; // 89k, 1jt, 2rb
            return "text";
        });
        const uniquePatterns = new Set(numPatterns);
        if (uniquePatterns.size > 2 && !uniquePatterns.has("text")) {
            issues.push({
                type: "format_ambiguous",
                column: col,
                sampleValues: values.slice(0, 5).map(v => String(v.val)),
                rowIndices: values.slice(0, 10).map(v => v.idx),
                autoFixed: false,
                description: `Format numerik campur: ${[...uniquePatterns].join(", ")}`,
            });
        }

        // 5. Fuzzy Duplicates (Inconsistent spelling/casing like "iPhone 13" vs "iphone-13")
        if (values.length > 0) {
            const strValues = values.map(v => String(v.val));
            // Only check if it looks like a categorical or text column with some repetitions
            const uniqueRaw = new Set(strValues);
            if (uniqueRaw.size > 1 && uniqueRaw.size < strValues.length * 0.4) {
                // Normalize by stripping space, case, symbols
                const normalized = new Map<string, string[]>();
                for (const raw of uniqueRaw) {
                    const norm = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
                    if (norm.length > 3) {
                        if (!normalized.has(norm)) normalized.set(norm, []);
                        normalized.get(norm)!.push(raw);
                    }
                }
                const fuzzySets = Array.from(normalized.values()).filter(arr => arr.length > 1);
                if (fuzzySets.length > 0) {
                    issues.push({
                        type: "fuzzy_duplicate",
                        column: col,
                        sampleValues: fuzzySets[0],
                        rowIndices: values.filter(v => fuzzySets[0].includes(String(v.val))).slice(0, 10).map(v => v.idx),
                        autoFixed: false,
                        description: `Terdeteksi penulisan tidak konsisten: ${fuzzySets.slice(0, 2).map(s => `[${s.join(", ")}]`).join(", ")}`,
                    });
                }
            }
        }

        // 6. Missing Critical (High missing rate > 20% but < 90%) - "Smart Fill" candidate
        const missingCount = rows.length - values.length;
        const missingRatio = missingCount / rows.length;
        if (missingRatio > 0.2 && missingRatio < 0.9) {
            issues.push({
                type: "missing_critical",
                column: col,
                sampleValues: values.slice(0, 3).map(v => String(v.val)),
                rowIndices: [], // Too many missing rows to list usefully
                autoFixed: false,
                description: `${(missingRatio * 100).toFixed(0)}% data kosong, direkomendasikan Smart Fill (Imputasi AI)`,
            });
        }
    }

    return issues;
}

/**
 * Build AI prompt for cleaning unresolved issues — minimal tokens
 */
export function buildCleaningPrompt(issues: CleaningIssue[]): string {
    if (issues.length === 0) return "";

    const issuesSummary = issues.map((issue, i) => {
        return `${i + 1}. Kolom "${issue.column}" — ${issue.description}\n   Sampel: ${JSON.stringify(issue.sampleValues.slice(0, 3))}`;
    }).join("\n");

    return `Kamu adalah Data Engineer. Fix masalah cleaning berikut dan berikan solusi dalam JSON.

Masalah:
${issuesSummary}

Format jawaban JSON:
{
  "solutions": [
    {
      "column": "nama_kolom",
      "action": "normalize|convert|fill|fix_encoding|skip",
      "targetType": "number|date|text",
      "transformRule": "penjelasan singkat cara fix",
      "confidence": 0.0-1.0
    }
  ]
}`;
}

/**
 * Apply AI cleaning suggestions to data
 */
export function applyAICleanSuggestions(
    rows: Record<string, any>[],
    suggestions: AICleanSuggestion[]
): { cleaned: Record<string, any>[]; appliedCount: number } {
    let appliedCount = 0;
    let cleaned = [...rows];

    for (const suggestion of suggestions) {
        if (suggestion.confidence < 0.6) continue; // Skip low confidence

        const col = suggestion.column;

        if (suggestion.action === "normalize" && suggestion.targetType === "number") {
            // Normalize numbers with abbreviations (89k → 89000, 1jt → 1000000)
            cleaned = cleaned.map(row => {
                const val = row[col];
                if (val == null) return row;
                const s = String(val).trim().toLowerCase();

                let num: number | null = null;
                if (/\d+[kK]$/.test(s)) num = parseFloat(s) * 1000;
                else if (/\d+[jJ][tT]?$/.test(s)) num = parseFloat(s) * 1000000;
                else if (/\d+[rR][bB]?$/.test(s)) num = parseFloat(s) * 1000;

                if (num !== null && !isNaN(num)) {
                    appliedCount++;
                    return { ...row, [col]: num };
                }
                return row;
            });
        }

        if (suggestion.action === "convert" && suggestion.targetType === "date") {
            // Try more date formats via AI guidance
            cleaned = cleaned.map(row => {
                const val = row[col];
                if (val == null) return row;
                const s = String(val).trim();

                // Try month name format: "15 Mar 2024", "Mar 15, 2024"
                const monthNames: Record<string, number> = {
                    jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, may: 5, jun: 6,
                    jul: 7, ags: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, des: 12, dec: 12,
                };
                const monthMatch = s.match(/(\d{1,2})\s+(\w{3,})\s+(\d{2,4})/i);
                if (monthMatch) {
                    const day = parseInt(monthMatch[1]);
                    const monthKey = monthMatch[2].slice(0, 3).toLowerCase();
                    const month = monthNames[monthKey];
                    const year = parseInt(monthMatch[3]) < 100 ? 2000 + parseInt(monthMatch[3]) : parseInt(monthMatch[3]);
                    if (month && day <= 31) {
                        appliedCount++;
                        return { ...row, [col]: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` };
                    }
                }
                return row;
            });
        }
    }

    return { cleaned, appliedCount };
}
