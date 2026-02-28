/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Corrections Store — AI Learning Loop
 * Saves user corrections to IndexedDB so the system gets smarter over time
 * Next upload: check corrections first → fewer AI calls needed
 */

import Dexie, { type Table } from "dexie";

export interface ColumnCorrection {
    id?: number;
    originalName: string;       // e.g. "Jml Terjual"
    normalizedName: string;     // lowercase trimmed
    mappedTo: string;           // e.g. "quantity"
    source: "user" | "ai";     // who made the correction
    platform?: string;          // e.g. "shopee", "tokopedia"
    createdAt: string;
    usageCount: number;         // how many times this mapping was reused
}

export interface CategoryCorrection {
    id?: number;
    column: string;             // e.g. "payment_method"
    originalValue: string;      // e.g. "Cash on Delivery"
    correctedValue: string;     // e.g. "COD"
    createdAt: string;
    usageCount: number;
}

export interface FormatCorrection {
    id?: number;
    column: string;
    originalFormat: string;     // e.g. "89k"
    correctedValue: any;        // e.g. 89000
    transformRule: string;      // e.g. "multiply_1000"
    createdAt: string;
}

class CorrectionsDB extends Dexie {
    columnCorrections!: Table<ColumnCorrection>;
    categoryCorrections!: Table<CategoryCorrection>;
    formatCorrections!: Table<FormatCorrection>;

    constructor() {
        super("simbis-corrections");
        this.version(1).stores({
            columnCorrections: "++id, normalizedName, mappedTo, platform",
            categoryCorrections: "++id, column, originalValue, correctedValue",
            formatCorrections: "++id, column, originalFormat",
        });
        this.version(2).stores({
            columnCorrections: "++id, normalizedName, mappedTo, platform, usageCount",
            categoryCorrections: "++id, column, originalValue, correctedValue",
            formatCorrections: "++id, column, originalFormat",
        });
    }
}

const correctionsDb = new CorrectionsDB();

// ═══════════════════════════════════════════
// COLUMN MAPPING CORRECTIONS
// ═══════════════════════════════════════════

/**
 * Save a mapping correction (user manually mapped a column)
 */
export async function saveColumnCorrection(
    originalName: string,
    mappedTo: string,
    source: "user" | "ai" = "user",
    platform?: string
): Promise<void> {
    const normalized = originalName.toLowerCase().trim();

    // Check if exists
    const existing = await correctionsDb.columnCorrections
        .where("normalizedName").equals(normalized)
        .and(c => c.mappedTo === mappedTo)
        .first();

    if (existing) {
        await correctionsDb.columnCorrections.update(existing.id!, {
            usageCount: existing.usageCount + 1,
        });
    } else {
        await correctionsDb.columnCorrections.add({
            originalName, normalizedName: normalized, mappedTo, source, platform,
            createdAt: new Date().toISOString(), usageCount: 1,
        });
    }
}

/**
 * Look up saved column corrections before calling AI
 */
export async function lookupColumnCorrection(columnName: string): Promise<string | null> {
    const normalized = columnName.toLowerCase().trim();
    const correction = await correctionsDb.columnCorrections
        .where("normalizedName").equals(normalized)
        .sortBy("usageCount");

    if (correction.length > 0) {
        // Increment usage
        const best = correction[correction.length - 1]; // highest usage
        await correctionsDb.columnCorrections.update(best.id!, {
            usageCount: best.usageCount + 1,
        });
        return best.mappedTo;
    }
    return null;
}

/**
 * Get all saved column corrections (for export/display)
 */
export async function getAllColumnCorrections(): Promise<ColumnCorrection[]> {
    return correctionsDb.columnCorrections.orderBy("usageCount").reverse().toArray();
}

// ═══════════════════════════════════════════
// CATEGORY CORRECTIONS
// ═══════════════════════════════════════════

/**
 * Save a category correction (e.g., "Cash on Delivery" → "COD")
 */
export async function saveCategoryCorrection(
    column: string, originalValue: string, correctedValue: string
): Promise<void> {
    const existing = await correctionsDb.categoryCorrections
        .where({ column, originalValue }).first();

    if (existing) {
        await correctionsDb.categoryCorrections.update(existing.id!, {
            correctedValue, usageCount: existing.usageCount + 1,
        });
    } else {
        await correctionsDb.categoryCorrections.add({
            column, originalValue, correctedValue,
            createdAt: new Date().toISOString(), usageCount: 1,
        });
    }
}

/**
 * Apply saved category corrections to data
 */
export async function applyCategoryCorrections(rows: Record<string, any>[]): Promise<{ corrected: Record<string, any>[]; appliedCount: number }> {
    const corrections = await correctionsDb.categoryCorrections.toArray();
    if (corrections.length === 0) return { corrected: rows, appliedCount: 0 };

    // Build lookup map: column → originalValue → correctedValue
    const corrMap = new Map<string, Map<string, string>>();
    for (const c of corrections) {
        if (!corrMap.has(c.column)) corrMap.set(c.column, new Map());
        corrMap.get(c.column)!.set(c.originalValue.toLowerCase(), c.correctedValue);
    }

    let appliedCount = 0;
    const corrected = rows.map(row => {
        const newRow = { ...row };
        for (const [col, valueMap] of corrMap) {
            const val = row[col];
            if (val == null) continue;
            const lower = String(val).trim().toLowerCase();
            if (valueMap.has(lower) && String(val).trim() !== valueMap.get(lower)) {
                newRow[col] = valueMap.get(lower);
                appliedCount++;
            }
        }
        return newRow;
    });

    return { corrected, appliedCount };
}

// ═══════════════════════════════════════════
// FORMAT CORRECTIONS
// ═══════════════════════════════════════════

export async function saveFormatCorrection(
    column: string, originalFormat: string, correctedValue: any, transformRule: string
): Promise<void> {
    await correctionsDb.formatCorrections.add({
        column, originalFormat, correctedValue, transformRule,
        createdAt: new Date().toISOString(),
    });
}

/**
 * Get statistics about saved corrections
 */
export async function getCorrectionStats(): Promise<{
    totalColumnMappings: number;
    totalCategoryFixes: number;
    totalFormatFixes: number;
    topMappings: { from: string; to: string; count: number }[];
}> {
    const columns = await correctionsDb.columnCorrections.count();
    const categories = await correctionsDb.categoryCorrections.count();
    const formats = await correctionsDb.formatCorrections.count();
    const topMappings = (await correctionsDb.columnCorrections.orderBy("usageCount").reverse().limit(10).toArray())
        .map(c => ({ from: c.originalName, to: c.mappedTo, count: c.usageCount }));

    return { totalColumnMappings: columns, totalCategoryFixes: categories, totalFormatFixes: formats, topMappings };
}

/**
 * Clear all corrections (reset learning)
 */
export async function clearAllCorrections(): Promise<void> {
    await correctionsDb.columnCorrections.clear();
    await correctionsDb.categoryCorrections.clear();
    await correctionsDb.formatCorrections.clear();
}
