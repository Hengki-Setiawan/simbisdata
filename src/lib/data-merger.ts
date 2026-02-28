/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Data Merger — Batch merge multiple files, dedup across files, time-series merge
 */

export interface MergeResult {
    merged: Record<string, any>[];
    totalBefore: number;
    totalAfter: number;
    duplicatesRemoved: number;
    filesProcessed: number;
    dateRange: { start: string; end: string } | null;
    report: string;
}

export interface MergeOptions {
    dedup: boolean;
    sortByDate: boolean;
    dateColumn?: string;
    mergeStrategy: "append" | "smart_merge";
}

/**
 * Merge multiple datasets into one
 */
export function mergeDatasets(
    datasets: Record<string, any>[][],
    options: MergeOptions = { dedup: true, sortByDate: true, mergeStrategy: "smart_merge" }
): MergeResult {
    if (datasets.length === 0) {
        return { merged: [], totalBefore: 0, totalAfter: 0, duplicatesRemoved: 0, filesProcessed: 0, dateRange: null, report: "Tidak ada data" };
    }

    const totalBefore = datasets.reduce((sum, d) => sum + d.length, 0);

    // Step 1: Combine all rows
    let combined = datasets.flat();

    // Step 2: Dedup
    let duplicatesRemoved = 0;
    if (options.dedup) {
        const seen = new Set<string>();
        const deduped: Record<string, any>[] = [];

        for (const row of combined) {
            // Create a fingerprint from key fields
            const fingerprint = createFingerprint(row);
            if (!seen.has(fingerprint)) {
                seen.add(fingerprint);
                deduped.push(row);
            } else {
                duplicatesRemoved++;
            }
        }
        combined = deduped;
    }

    // Step 3: Sort by date if requested
    const dateCol = options.dateColumn || findDateColumn(combined);
    if (options.sortByDate && dateCol) {
        combined.sort((a, b) => {
            const da = new Date(String(a[dateCol] || ""));
            const db = new Date(String(b[dateCol] || ""));
            return da.getTime() - db.getTime();
        });
    }

    // Step 4: Calculate date range
    let dateRange: { start: string; end: string } | null = null;
    if (dateCol && combined.length > 0) {
        const dates = combined
            .map(r => new Date(String(r[dateCol] || "")))
            .filter(d => !isNaN(d.getTime()))
            .sort((a, b) => a.getTime() - b.getTime());

        if (dates.length > 0) {
            dateRange = {
                start: dates[0].toISOString().split("T")[0],
                end: dates[dates.length - 1].toISOString().split("T")[0],
            };
        }
    }

    return {
        merged: combined,
        totalBefore,
        totalAfter: combined.length,
        duplicatesRemoved,
        filesProcessed: datasets.length,
        dateRange,
        report: `Merged ${datasets.length} file: ${totalBefore} → ${combined.length} baris (${duplicatesRemoved} duplikat dihapus)${dateRange ? `. Periode: ${dateRange.start} s/d ${dateRange.end}` : ""}`,
    };
}

/**
 * Create fingerprint for dedup — uses order_id if available, else key fields
 */
function createFingerprint(row: Record<string, any>): string {
    // Try order_id first (most reliable)
    const orderId = row.order_id || row["No. Pesanan"] || row["Nomor Invoice"] || row["Order Number"] || row["Order ID"];
    if (orderId) {
        const product = row.product_name || row["Nama Produk"] || row["Item Name"] || "";
        return `${orderId}::${product}`;
    }

    // Fallback: hash of all values
    return JSON.stringify(Object.values(row).map(v => String(v || "").trim().toLowerCase()));
}

/**
 * Find the date column in data
 */
function findDateColumn(rows: Record<string, any>[]): string | null {
    if (rows.length === 0) return null;
    const columns = Object.keys(rows[0]);

    const dateKeywords = ["date", "tanggal", "waktu", "time", "created", "tgl", "order_date"];
    for (const col of columns) {
        if (dateKeywords.some(k => col.toLowerCase().includes(k))) return col;
    }
    return null;
}

/**
 * Detect overlap between two datasets
 */
export function detectOverlap(datasetA: Record<string, any>[], datasetB: Record<string, any>[]): {
    overlapCount: number;
    overlapPercentage: number;
    uniqueToA: number;
    uniqueToB: number;
} {
    const fpA = new Set(datasetA.map(createFingerprint));
    const fpB = new Set(datasetB.map(createFingerprint));

    let overlapCount = 0;
    for (const fp of fpA) {
        if (fpB.has(fp)) overlapCount++;
    }

    return {
        overlapCount,
        overlapPercentage: Math.round((overlapCount / Math.min(fpA.size, fpB.size)) * 100),
        uniqueToA: fpA.size - overlapCount,
        uniqueToB: fpB.size - overlapCount,
    };
}
