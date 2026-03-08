/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Pipeline Engine — Main Orchestrator for SimbisData 6-Stage Pipeline
 * Runs Stage 1→6 and produces a unified PipelineResult
 */

import { engineerFeatures, type FeatureResult, type CustomerProfile, type ProductProfile, type TemporalProfile } from "./feature-engine";
import { crossAnalyze, type CrossAnalysisResult } from "./cross-analyzer";
import * as ml from "./ml-algorithms";
import { analyzeData, type AnalysisResult } from "./analysis";
import { getFieldStr } from "./data-accessor";
import { getCached, setCache } from "./api-cache";

// ==================== PIPELINE RESULT ====================

export interface PipelineResult {
  ingestion: {
    platform: string;
    rowCount: number;
    columnCount: number;
  };
  cleaning: {
    qualityScore: number;
    cleanedRowCount: number;
  };
  features: {
    derivedFeatures: string[];
    customerProfiles: CustomerProfile[];
    productProfiles: ProductProfile[];
    temporalProfile: TemporalProfile;
  };
  mlResults: {
    clustering: ml.ClusterResult | null;
    abc: ml.ProductScore[] | null;
    rfm: ml.RFMResult | null;
    forecast: any | null;
    anomalies: ml.AnomalyResult | null;
    crossInsights: string[];
  };
  metrics: AnalysisResult | null;
  aiSynthesis: {
    health: any | null;      // Will use HealthResult type
    insights: any | null;    // Will use InsightResult type
    narratives: any | null;  // Will use NarrativeResult type
    fullNarrative?: string;
  } | null;
  processedAt: string;
  processingDuration: number;
  dataHash: string;
  version: number;
}

// ==================== HASH ====================

function hashData(rows: any[]): string {
  const sample = rows.slice(0, 5).map(r => JSON.stringify(r)).join("");
  let hash = 0;
  for (let i = 0; i < sample.length; i++) {
    hash = ((hash << 5) - hash + sample.charCodeAt(i)) | 0;
  }
  return `h${Math.abs(hash).toString(36)}_${rows.length}`;
}

// ==================== MAIN PIPELINE ====================

export async function runPipeline(
  cleanedRows: Record<string, unknown>[],
  platform: string = "auto",
  onProgress?: (stage: string, pct: number) => void
): Promise<PipelineResult> {
  const startTime = Date.now();
  const dataHash = hashData(cleanedRows);

  // Check cache first
  const cached = getCached<PipelineResult>(`pipeline:${dataHash}`);
  if (cached) return cached;

  onProgress?.("Menganalisis pola data...", 10);

  // Stage 3: Feature Engineering
  const featureResult: FeatureResult = engineerFeatures(cleanedRows);
  onProgress?.("Menjalankan algoritma ML...", 30);

  // Stage 4: Multi-Algorithm Analysis (parallel)
  let clustering: ml.ClusterResult | null = null;
  let abc: ml.ProductScore[] | null = null;
  let rfm: ml.RFMResult | null = null;
  let anomalies: ml.AnomalyResult | null = null;
  let forecast: any = null;

  try { clustering = ml.kMeansClustering(cleanedRows, 3); } catch { /* skip */ }
  try { abc = ml.calculateProductScores(cleanedRows); } catch { /* skip */ }
  try { rfm = ml.rfmAnalysis(cleanedRows); } catch { /* skip */ }
  try { anomalies = ml.detectAnomalies(cleanedRows); } catch { /* skip */ }
  try { forecast = ml.timeSeriesForecast(cleanedRows); } catch { /* skip */ }

  onProgress?.("Mengkorelasikan hasil analisis...", 60);

  // Stage 4.6: Cross-Algorithm Correlation
  const crossResult: CrossAnalysisResult = crossAnalyze(
    clustering, anomalies, abc, rfm,
    featureResult.customerProfiles,
    featureResult.productProfiles,
    featureResult.temporalProfile
  );

  onProgress?.("Menghitung metrik bisnis...", 75);

  // Basic metrics
  let metrics: AnalysisResult | null = null;
  try { metrics = analyzeData(cleanedRows); } catch { /* skip */ }

  onProgress?.("Menyiapkan dashboard...", 85);

  // Stage 5: AI Synthesis (3 prompts concurrently)
  let aiSynthesisResult: any = null;
  onProgress?.("Membangun narasi AI...", 90);
  try {
    const mlSummary = {
      metrics: metrics?.overview,
      crossInsights: crossResult.crossInsights,
      topProducts: featureResult.productProfiles.slice(0, 5),
    };
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
    
    // Run both AI endpoints concurrently
    const [consultRes, narrateRes] = await Promise.all([
        fetch(`${baseUrl}/api/ai/consultant`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mlSummary }),
        }).catch(() => null),
        
        fetch(`${baseUrl}/api/ai/narrate`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ metrics }),
        }).catch(() => null)
    ]);
    
    if (consultRes && consultRes.ok) {
        aiSynthesisResult = await consultRes.json();
    }
    
    if (narrateRes && narrateRes.ok && aiSynthesisResult) {
        const narrateData = await narrateRes.json();
        aiSynthesisResult.fullNarrative = narrateData.fullNarrative;
    }
  } catch (err) {
      console.warn("AI Synthesis failed during pipeline execution", err);
  }

  // Detect platform from data
  const detectedPlatform = platform !== "auto" ? platform : detectPlatform(cleanedRows);

  const result: PipelineResult = {
    ingestion: {
      platform: detectedPlatform,
      rowCount: cleanedRows.length,
      columnCount: cleanedRows.length > 0 ? Object.keys(cleanedRows[0]).length : 0,
    },
    cleaning: {
      qualityScore: 85, // Will be populated by cleaner
      cleanedRowCount: cleanedRows.length,
    },
    features: {
      derivedFeatures: featureResult.derivedFeatures,
      customerProfiles: featureResult.customerProfiles,
      productProfiles: featureResult.productProfiles,
      temporalProfile: featureResult.temporalProfile,
    },
    mlResults: {
      clustering,
      abc,
      rfm,
      forecast,
      anomalies,
      crossInsights: crossResult.crossInsights,
    },
    metrics,
    aiSynthesis: aiSynthesisResult,
    processedAt: new Date().toISOString(),
    processingDuration: Date.now() - startTime,
    dataHash,
    version: 1,
  };

  // Cache result
  setCache(`pipeline:${dataHash}`, result, "news"); // ~30 min TTL

  onProgress?.("Selesai!", 100);
  return result;
}

// ==================== HELPERS ====================

function detectPlatform(rows: any[]): string {
  if (rows.length === 0) return "other";
  const keys = Object.keys(rows[0]).map(k => k.toLowerCase());
  const joined = keys.join(" ");

  if (joined.includes("nomor pesanan") && joined.includes("status pesanan")) return "shopee";
  if (joined.includes("nomor invoice") || joined.includes("nama produk")) return "tokopedia";
  if (joined.includes("order id") && joined.includes("sku")) return "tiktokshop";
  return "other";
}
