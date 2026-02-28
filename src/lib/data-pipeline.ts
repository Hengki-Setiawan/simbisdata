/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Unified Data Pipeline — Orchestrates the entire data processing flow
 * Detect → Map → Clean → Validate → Enrich → Analyze → Visualize → Narrate
 */

import { detectPlatform, type DetectionResult } from "./platform-detector";
import { detectDomain, type DomainDetectionResult } from "./data-domain-detector";
import { autoMapColumns, type ColumnMapping } from "./column-mapper";
import { validateData, type DataQualityReport } from "./data-validator";
import { analyzeColumns, recommendCharts, type ChartRecommendation, type ColumnMeta } from "./ai-viz-recommender";
import { recommendAlgorithms, type MLRecommendation } from "./ai-ml-selector";

export interface PipelineResult {
    // Stage 1: Detection
    platform: DetectionResult;
    domain: DomainDetectionResult;

    // Stage 2: Mapping
    columnMappings: ColumnMapping[];

    // Stage 3: Validation
    quality: DataQualityReport;

    // Stage 4: Column Analysis
    columnMeta: ColumnMeta[];

    // Stage 5: Recommendations
    chartRecommendations: ChartRecommendation[];
    mlRecommendations: MLRecommendation[];

    // Metadata
    processingTime: number;
    rowCount: number;
    columnCount: number;
}

export async function runPipeline(rows: Record<string, any>[]): Promise<PipelineResult> {
    const startTime = Date.now();

    if (rows.length === 0) {
        throw new Error("No data to process");
    }

    const columns = Object.keys(rows[0]);

    // Stage 1: Detect platform and domain
    const platform = detectPlatform(columns);
    const domain = detectDomain(columns, rows);

    // Stage 2: Auto-map columns
    const columnMappings = autoMapColumns(rows);

    // Stage 3: Validate data quality
    const quality = validateData(rows);

    // Stage 4: Analyze column metadata
    const columnMeta = analyzeColumns(rows);

    // Stage 5: Generate recommendations
    const chartRecommendations = recommendCharts(columnMeta, domain.domain, rows);
    const mlRecommendations = recommendAlgorithms(columnMeta, domain.domain, rows.length);

    return {
        platform, domain, columnMappings, quality, columnMeta,
        chartRecommendations, mlRecommendations,
        processingTime: Date.now() - startTime,
        rowCount: rows.length,
        columnCount: columns.length,
    };
}

/**
 * Quick analysis — runs only detection and recommendations (no ML)
 * Use this for instant dashboard updates
 */
export function quickAnalyze(rows: Record<string, any>[]): {
    domain: DomainDetectionResult;
    charts: ChartRecommendation[];
    ml: MLRecommendation[];
    meta: ColumnMeta[];
} {
    const columns = Object.keys(rows[0] || {});
    const domain = detectDomain(columns, rows);
    const meta = analyzeColumns(rows);
    const charts = recommendCharts(meta, domain.domain, rows);
    const ml = recommendAlgorithms(meta, domain.domain, rows.length);
    return { domain, charts, ml, meta };
}
