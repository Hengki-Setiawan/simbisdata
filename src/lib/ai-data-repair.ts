/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * AI Data Repair — Fix typos, normalize categories, smart merge duplicates
 * Uses AI only for complex repairs; simple fixes are rule-based
 */

export interface RepairSuggestion {
    row: number;
    column: string;
    currentValue: any;
    suggestedValue: any;
    reason: string;
    confidence: number;
    autoApply: boolean; // true if confidence > 0.9
    type: "typo" | "category_merge" | "address_normalize" | "outlier" | "cross_field" | "case_fix";
}

export interface RepairReport {
    suggestions: RepairSuggestion[];
    autoApplied: number;
    needsReview: number;
    summary: string;
}

/**
 * Rule-based data repairs (no AI needed)
 */
export function ruleBasedRepair(rows: Record<string, any>[]): RepairReport {
    const suggestions: RepairSuggestion[] = [];
    if (rows.length === 0) return { suggestions, autoApplied: 0, needsReview: 0, summary: "No data" };

    const columns = Object.keys(rows[0]);

    for (const col of columns) {
        const values = rows.map(r => r[col]).filter(v => v != null && String(v).trim() !== "");
        const strValues = values.map(v => String(v).trim());

        // 1. Case normalization for categories
        const lowerMap = new Map<string, string[]>();
        strValues.forEach(v => {
            const lower = v.toLowerCase();
            if (!lowerMap.has(lower)) lowerMap.set(lower, []);
            lowerMap.get(lower)!.push(v);
        });

        for (const [, variants] of lowerMap) {
            const uniqueVariants = [...new Set(variants)];
            if (uniqueVariants.length > 1) {
                // Pick most common variant
                const counts = new Map<string, number>();
                variants.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
                const mostCommon = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];

                rows.forEach((row, idx) => {
                    const val = row[col];
                    if (val != null && String(val).trim().toLowerCase() === mostCommon.toLowerCase() && String(val).trim() !== mostCommon) {
                        suggestions.push({
                            row: idx, column: col,
                            currentValue: val, suggestedValue: mostCommon,
                            reason: `Normalisasi case: "${val}" → "${mostCommon}"`,
                            confidence: 0.95, autoApply: true, type: "case_fix",
                        });
                    }
                });
            }
        }

        // 2. Indonesian address normalization
        const addressPatterns: [RegExp, string][] = [
            [/\bkab\b\.?\s*/gi, "Kab. "],
            [/\bkota\b\s*/gi, "Kota "],
            [/\bprov\b\.?\s*/gi, "Prov. "],
            [/\bkec\b\.?\s*/gi, "Kec. "],
            [/\bkel\b\.?\s*/gi, "Kel. "],
            [/\bjl\b\.?\s*/gi, "Jl. "],
            [/\bgg\b\.?\s*/gi, "Gg. "],
        ];

        const isAddressCol = /kota|city|alamat|address|provinsi|province|kabupaten|district/i.test(col);
        if (isAddressCol) {
            rows.forEach((row, idx) => {
                const val = row[col];
                if (val == null || typeof val !== "string") return;
                let normalized = val.trim();
                let changed = false;

                for (const [pattern, replacement] of addressPatterns) {
                    const newVal = normalized.replace(pattern, replacement);
                    if (newVal !== normalized) {
                        normalized = newVal;
                        changed = true;
                    }
                }

                if (changed) {
                    suggestions.push({
                        row: idx, column: col,
                        currentValue: val, suggestedValue: normalized.trim(),
                        reason: `Normalisasi alamat: "${val}" → "${normalized.trim()}"`,
                        confidence: 0.92, autoApply: true, type: "address_normalize",
                    });
                }
            });
        }

        // 3. Payment method consolidation
        const isPaymentCol = /payment|bayar|pembayaran|metode/i.test(col);
        if (isPaymentCol) {
            const paymentAliases: Record<string, string[]> = {
                "COD": ["cod", "cash on delivery", "bayar di tempat", "bayar ditempat"],
                "Transfer Bank": ["transfer", "bank transfer", "transfer bank", "tf"],
                "ShopeePay": ["shopeepay", "shopee pay", "s-pay"],
                "OVO": ["ovo"],
                "GoPay": ["gopay", "go-pay", "go pay"],
                "DANA": ["dana"],
                "QRIS": ["qris"],
                "Kartu Kredit": ["credit card", "kartu kredit", "cc", "credit", "kredit"],
            };

            rows.forEach((row, idx) => {
                const val = row[col];
                if (val == null) return;
                const lower = String(val).trim().toLowerCase();

                for (const [canonical, aliases] of Object.entries(paymentAliases)) {
                    if (aliases.includes(lower) && String(val).trim() !== canonical) {
                        suggestions.push({
                            row: idx, column: col,
                            currentValue: val, suggestedValue: canonical,
                            reason: `Konsolidasi pembayaran: "${val}" → "${canonical}"`,
                            confidence: 0.95, autoApply: true, type: "category_merge",
                        });
                        break;
                    }
                }
            });
        }

        // 4. Numeric outlier detection
        const numValues = values.map(v => parseFloat(String(v))).filter(n => !isNaN(n));
        if (numValues.length > 5) {
            const mean = numValues.reduce((a, b) => a + b, 0) / numValues.length;
            const std = Math.sqrt(numValues.reduce((a, b) => a + (b - mean) ** 2, 0) / numValues.length);
            const threshold = 3; // 3 standard deviations

            if (std > 0) {
                rows.forEach((row, idx) => {
                    const val = parseFloat(String(row[col]));
                    if (isNaN(val)) return;
                    const zScore = Math.abs((val - mean) / std);
                    if (zScore > threshold) {
                        // Check if it's a possible digit error (e.g., 8900 vs 89000)
                        const ratio = val / mean;
                        let reason = `Outlier terdeteksi (Z-score: ${zScore.toFixed(1)})`;
                        if (ratio > 5 && ratio < 15) reason += ` — mungkin kelebihan digit?`;
                        else if (ratio < 0.2 && ratio > 0.05) reason += ` — mungkin kekurangan digit?`;

                        suggestions.push({
                            row: idx, column: col,
                            currentValue: val, suggestedValue: null,
                            reason,
                            confidence: 0.6, autoApply: false, type: "outlier",
                        });
                    }
                });
            }
        }
    }

    // 5. Cross-field validation
    rows.forEach((row, idx) => {
        const qty = parseFloat(String(row.quantity || row.Jumlah || row.qty || 0));
        const price = parseFloat(String(row.unit_price || row.original_price || row.sale_price || row["Harga Awal"] || 0));
        const total = parseFloat(String(row.total_payment || row.subtotal || row["Total Pembayaran"] || 0));

        if (qty > 0 && price > 0 && total > 0) {
            const expected = qty * price;
            const ratio = total / expected;
            // Allow up to 30% diff (discounts, shipping)
            if (ratio > 2 || ratio < 0.3) {
                suggestions.push({
                    row: idx, column: "total_payment",
                    currentValue: total,
                    suggestedValue: null,
                    reason: `Total Rp${total.toLocaleString()} ≠ Qty(${qty}) × Harga(Rp${price.toLocaleString()}) = Rp${expected.toLocaleString()}`,
                    confidence: 0.5, autoApply: false, type: "cross_field",
                });
            }
        }
    });

    const autoApplied = suggestions.filter(s => s.autoApply).length;
    const needsReview = suggestions.filter(s => !s.autoApply).length;

    return {
        suggestions,
        autoApplied,
        needsReview,
        summary: `Ditemukan ${suggestions.length} perbaikan: ${autoApplied} otomatis, ${needsReview} perlu review`,
    };
}

/**
 * Apply repair suggestions to data
 */
export function applyRepairs(rows: Record<string, any>[], suggestions: RepairSuggestion[], onlyAutoApply = true): Record<string, any>[] {
    const toApply = onlyAutoApply ? suggestions.filter(s => s.autoApply) : suggestions.filter(s => s.suggestedValue != null);
    const repairMap = new Map<string, Map<number, any>>(); // col → row → value

    for (const s of toApply) {
        if (!repairMap.has(s.column)) repairMap.set(s.column, new Map());
        repairMap.get(s.column)!.set(s.row, s.suggestedValue);
    }

    return rows.map((row, idx) => {
        const newRow = { ...row };
        for (const [col, fixes] of repairMap) {
            if (fixes.has(idx)) {
                newRow[col] = fixes.get(idx);
            }
        }
        return newRow;
    });
}

/**
 * Build AI prompt for complex repairs that rule-based can't handle
 */
export function buildRepairPrompt(issues: RepairSuggestion[]): string {
    const complexIssues = issues.filter(s => !s.autoApply && s.type !== "outlier");
    if (complexIssues.length === 0) return "";

    const summary = complexIssues.slice(0, 10).map((s, i) =>
        `${i + 1}. Kolom "${s.column}", baris ${s.row}: "${s.currentValue}" — ${s.reason}`
    ).join("\n");

    return `Kamu Data Engineer. Analisis masalah data berikut dan berikan saran perbaikan dalam JSON.

Masalah:
${summary}

Format JSON:
{
  "repairs": [
    { "row": 0, "column": "x", "suggestedValue": "y", "reason": "z", "confidence": 0.9 }
  ]
}`;
}
