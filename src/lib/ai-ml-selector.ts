/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * AI ML Algorithm Selector — Recommends the best ML algorithms 
 * based on data characteristics, column types, and domain context
 */

import { type ColumnMeta } from "./ai-viz-recommender";
import { type DataDomain } from "./data-domain-detector";

export interface MLRecommendation {
    id: string;
    name: string;
    icon: string;
    description: string;
    confidence: number;
    reason: string;
    requiredFields: string[];
    category: "prediction" | "segmentation" | "pattern" | "optimization" | "nlp";
    estimatedTime: string; // e.g. "~5 seconds"
    useTensorFlow: boolean;
}

export function recommendAlgorithms(
    columnMetas: ColumnMeta[],
    domain: DataDomain,
    rowCount: number
): MLRecommendation[] {
    const recs: MLRecommendation[] = [];

    const dateCols = columnMetas.filter(c => c.type === "date");
    const numCols = columnMetas.filter(c => c.type === "number");
    const catCols = columnMetas.filter(c => c.type === "category");

    const hasTimeData = dateCols.length > 0;
    const hasNumericData = numCols.length > 0;
    const hasCategoryData = catCols.length > 0;

    // 1. LSTM Forecast (TensorFlow.js)
    if (hasTimeData && hasNumericData && rowCount >= 30) {
        recs.push({
            id: "lstm_forecast", name: "🧠 LSTM Neural Network Forecast",
            icon: "🔮", description: "Prediksi nilai masa depan menggunakan deep learning LSTM",
            confidence: 0.95, reason: `${rowCount} baris data temporal terdeteksi — LSTM bisa memprediksi tren 30 hari ke depan`,
            requiredFields: [dateCols[0].name, numCols[0].name],
            category: "prediction", estimatedTime: "~8 detik", useTensorFlow: true
        });
    }

    // 2. Simple Forecast (fallback)
    if (hasTimeData && hasNumericData) {
        recs.push({
            id: "sma_forecast", name: "📈 Time Series Forecast (SMA)",
            icon: "📊", description: "Prediksi menggunakan Simple Moving Average + Trend",
            confidence: 0.8, reason: "Data waktu + angka terdeteksi — moving average cepat dan ringan",
            requiredFields: [dateCols[0].name, numCols[0].name],
            category: "prediction", estimatedTime: "~1 detik", useTensorFlow: false
        });
    }

    // 3. Autoencoder Anomaly Detection (TF.js)
    if (numCols.length >= 2 && rowCount >= 50) {
        recs.push({
            id: "autoencoder_anomaly", name: "🔍 Autoencoder Anomaly Detection",
            icon: "⚠️", description: "Deteksi transaksi anomali menggunakan neural network",
            confidence: 0.85, reason: `${numCols.length} kolom numerik — autoencoder bisa menemukan pola mencurigakan`,
            requiredFields: numCols.slice(0, 5).map(c => c.name),
            category: "pattern", estimatedTime: "~6 detik", useTensorFlow: true
        });
    }

    // 4. K-Means Clustering
    if (numCols.length >= 2 && rowCount >= 20) {
        recs.push({
            id: "kmeans_clustering", name: "🧠 K-Means Customer Segmentation",
            icon: "🧬", description: "Segmentasi pelanggan berdasarkan perilaku pembelian",
            confidence: 0.88, reason: "Multiple numeric columns → algoritma K-Means menemukan segmen pola belanja",
            requiredFields: numCols.slice(0, 4).map(c => c.name),
            category: "segmentation", estimatedTime: "~2 detik", useTensorFlow: false
        });
    }

    // 5. RFM Analysis (e-commerce specific)
    if (domain === "ecommerce" && hasTimeData) {
        recs.push({
            id: "rfm_analysis", name: "💎 RFM Customer Segmentation",
            icon: "💰", description: "Segmentasi pelanggan berdasarkan Recency, Frequency, Monetary",
            confidence: 0.9, reason: "Data e-commerce + waktu → RFM profiling pelanggan optimal",
            requiredFields: dateCols.length > 0 ? [dateCols[0].name] : [],
            category: "segmentation", estimatedTime: "~2 detik", useTensorFlow: false
        });
    }

    // 6. ABC Analysis
    if (hasCategoryData && hasNumericData) {
        recs.push({
            id: "abc_analysis", name: "📊 ABC Pareto Analysis",
            icon: "📦", description: "Klasifikasi item berdasarkan kontribusi revenue (80/20 rule)",
            confidence: 0.8, reason: "Kategori + angka terdeteksi → ABC mengidentifikasi item paling bernilai",
            requiredFields: [catCols[0].name, numCols[0].name],
            category: "optimization", estimatedTime: "~1 detik", useTensorFlow: false
        });
    }

    // Sort by confidence
    return recs.sort((a, b) => b.confidence - a.confidence);
}
