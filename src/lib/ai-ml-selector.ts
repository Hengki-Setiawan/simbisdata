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
    const geoCols = columnMetas.filter(c => c.type === "geo");
    const textCols = columnMetas.filter(c => c.type === "text");

    const hasTimeData = dateCols.length > 0;
    const hasNumericData = numCols.length > 0;
    const hasCategoryData = catCols.length > 0;
    const hasGeoData = geoCols.length > 0;
    const hasTextData = textCols.length > 0;

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
            id: "kmeans_clustering", name: "🎯 K-Means Clustering",
            icon: "🔵", description: "Segmentasi data ke dalam kelompok-kelompok berdasarkan kesamaan",
            confidence: 0.85, reason: "Multiple numeric columns → clustering menemukan segmen tersembunyi",
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

    // 7. Correlation Matrix
    if (numCols.length >= 3) {
        recs.push({
            id: "correlation_matrix", name: "🔥 Pearson Correlation Matrix",
            icon: "📐", description: "Temukan hubungan tersembunyi antar variabel numerik",
            confidence: 0.75, reason: `${numCols.length} variabel numerik → korelasi mengungkap dependensi`,
            requiredFields: numCols.map(c => c.name),
            category: "pattern", estimatedTime: "~1 detik", useTensorFlow: false
        });
    }

    // 8. Sentiment Analysis (NLP)
    if (hasTextData) {
        const longText = textCols.find(c => {
            const avgLen = c.sampleValues.reduce((s, v) => s + v.length, 0) / Math.max(1, c.sampleValues.length);
            return avgLen > 15;
        });
        if (longText) {
            recs.push({
                id: "sentiment_analysis", name: "💬 Sentiment Analysis (NLP)",
                icon: "😊", description: "Analisis sentimen dari teks review/feedback pelanggan",
                confidence: 0.85, reason: "Kolom teks panjang terdeteksi — NLP bisa ukur kepuasan pelanggan",
                requiredFields: [longText.name],
                category: "nlp", estimatedTime: "~5 detik (API)", useTensorFlow: false
            });
        }
    }

    // 9. CLV (Customer Lifetime Value)
    if (domain === "ecommerce" && hasTimeData && hasNumericData) {
        recs.push({
            id: "clv", name: "💎 Customer Lifetime Value",
            icon: "💰", description: "Hitung nilai seumur hidup setiap pelanggan",
            confidence: 0.85, reason: "Data transaksi berulang → CLV membantu prioritas pelanggan high-value",
            requiredFields: dateCols.length > 0 ? [dateCols[0].name] : [],
            category: "segmentation", estimatedTime: "~2 detik", useTensorFlow: false
        });
    }

    // 10. Cohort Analysis
    if (hasTimeData && rowCount >= 100) {
        recs.push({
            id: "cohort_analysis", name: "👥 Cohort Retention Analysis",
            icon: "📅", description: "Analisis retensi pelanggan berdasarkan cohort bulanan",
            confidence: 0.7, reason: `${rowCount} baris data temporal → cohort mengungkap pola retensi`,
            requiredFields: dateCols.length > 0 ? [dateCols[0].name] : [],
            category: "pattern", estimatedTime: "~3 detik", useTensorFlow: false
        });
    }

    // 11. Association Rules
    if (domain === "ecommerce" && hasCategoryData) {
        recs.push({
            id: "association_rules", name: "🔗 Association Rules (Market Basket)",
            icon: "🛒", description: "Temukan produk yang sering dibeli bersamaan",
            confidence: 0.75, reason: "Data produk e-commerce → association rules untuk cross-selling",
            requiredFields: catCols.length > 0 ? [catCols[0].name] : [],
            category: "pattern", estimatedTime: "~3 detik", useTensorFlow: false
        });
    }

    // 12. Price Sensitivity
    if (hasNumericData && numCols.length >= 2 && (domain === "ecommerce" || domain === "generic")) {
        recs.push({
            id: "price_sensitivity", name: "💲 Price Sensitivity Analysis",
            icon: "📉", description: "Analisis elastisitas harga vs volume penjualan",
            confidence: 0.7, reason: "Kolom harga + volume → temukan sweet spot harga optimal",
            requiredFields: numCols.slice(0, 2).map(c => c.name),
            category: "optimization", estimatedTime: "~1 detik", useTensorFlow: false
        });
    }

    // 13. Day × Hour Heatmap
    if (hasTimeData) {
        recs.push({
            id: "day_hour_heatmap", name: "⏰ Day × Hour Heatmap",
            icon: "📅", description: "Distribusi aktivitas berdasarkan hari dan jam",
            confidence: 0.7, reason: "Data temporal → heatmap mengidentifikasi peak hours dan best days",
            requiredFields: dateCols.length > 0 ? [dateCols[0].name] : [],
            category: "pattern", estimatedTime: "~1 detik", useTensorFlow: false
        });
    }

    // 14. Demand Prediction (TF.js)
    if (hasTimeData && hasCategoryData && hasNumericData && rowCount >= 50) {
        recs.push({
            id: "demand_prediction", name: "🔮 AI Demand Prediction",
            icon: "📦", description: "Prediksi permintaan produk menggunakan neural network",
            confidence: 0.8, reason: "Data historis produk + waktu → prediksi demand untuk optimasi stok",
            requiredFields: [dateCols[0].name, catCols[0].name, numCols[0].name],
            category: "prediction", estimatedTime: "~10 detik", useTensorFlow: true
        });
    }

    // 15. Geo Clustering
    if (hasGeoData && hasNumericData) {
        recs.push({
            id: "geo_clustering", name: "🗺️ Geographic Clustering",
            icon: "📍", description: "Segmentasi berdasarkan wilayah geografis",
            confidence: 0.8, reason: "Data lokasi + metrik → clustering geografis untuk strategi regional",
            requiredFields: [geoCols[0].name, numCols[0].name],
            category: "segmentation", estimatedTime: "~2 detik", useTensorFlow: false
        });
    }

    // Sort by confidence
    return recs.sort((a, b) => b.confidence - a.confidence);
}
