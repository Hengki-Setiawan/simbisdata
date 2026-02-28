/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * TensorFlow.js Engine — Core ML Engine for Browser-Based Deep Learning
 * Provides LSTM forecasting, autoencoder anomaly detection, and demand prediction
 * All models run in the browser using WebGL GPU acceleration
 */

// We lazy-load TF.js to avoid SSR issues in Next.js
let tf: any = null;

async function loadTF() {
    if (tf) return tf;
    try {
        tf = await import("@tensorflow/tfjs");
        await tf.ready();
        console.log("TensorFlow.js loaded, backend:", tf.getBackend());
        return tf;
    } catch (e) {
        console.warn("TensorFlow.js not available, using fallback:", e);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════
// LSTM TIME SERIES FORECASTING
// ═══════════════════════════════════════════════════════════

export interface ForecastPoint {
    date: string;
    actual?: number;
    predicted: number;
    lower: number;
    upper: number;
}

export interface LSTMForecastResult {
    historical: { date: string; value: number }[];
    forecast: ForecastPoint[];
    rmse: number;
    trend: "up" | "down" | "stable";
    seasonality: boolean;
    modelInfo: string;
}

function normalizeArray(arr: number[]): { normalized: number[]; min: number; max: number } {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min || 1;
    return { normalized: arr.map(v => (v - min) / range), min, max };
}

function denormalize(value: number, min: number, max: number): number {
    return value * (max - min) + min;
}

export async function lstmForecast(
    timeValues: { date: string; value: number }[],
    daysAhead: number = 30,
    onProgress?: (progress: number) => void
): Promise<LSTMForecastResult> {
    const tfLib = await loadTF();

    // Fallback to SMA if TF.js unavailable
    if (!tfLib) {
        return smaFallbackForecast(timeValues, daysAhead);
    }

    const values = timeValues.map(t => t.value);
    const { normalized, min, max } = normalizeArray(values);

    // Prepare sequences (lookback = 7 for weekly patterns)
    const lookback = Math.min(7, Math.floor(values.length / 3));
    const xs: number[][] = [];
    const ys: number[] = [];

    for (let i = lookback; i < normalized.length; i++) {
        xs.push(normalized.slice(i - lookback, i));
        ys.push(normalized[i]);
    }

    if (xs.length < 5) return smaFallbackForecast(timeValues, daysAhead);

    // Build LSTM model
    const model = tfLib.sequential();
    model.add(tfLib.layers.lstm({
        units: 16, inputShape: [lookback, 1], returnSequences: false
    }));
    model.add(tfLib.layers.dense({ units: 8, activation: "relu" }));
    model.add(tfLib.layers.dense({ units: 1 }));

    model.compile({ optimizer: tfLib.train.adam(0.01), loss: "meanSquaredError" });

    // Train
    const xTensor = tfLib.tensor3d(xs.map(seq => seq.map(v => [v])));
    const yTensor = tfLib.tensor2d(ys.map(v => [v]));

    const epochs = 30;
    await model.fit(xTensor, yTensor, {
        epochs, batchSize: Math.min(32, xs.length),
        shuffle: true, verbose: 0,
        callbacks: {
            onEpochEnd: (epoch: number) => {
                onProgress?.(Math.round((epoch / epochs) * 100));
            }
        }
    });

    // Predict future
    let lastSeq = normalized.slice(-lookback);
    const forecasts: ForecastPoint[] = [];
    const lastDate = new Date(timeValues[timeValues.length - 1].date);

    for (let i = 0; i < daysAhead; i++) {
        const input = tfLib.tensor3d([lastSeq.map((v: number) => [v])]);
        const pred = model.predict(input) as any;
        const predVal = (await pred.data())[0];

        const denormVal = denormalize(predVal, min, max);
        const uncertainty = (i + 1) * (max - min) * 0.02;

        const forecastDate = new Date(lastDate);
        forecastDate.setDate(forecastDate.getDate() + i + 1);

        forecasts.push({
            date: forecastDate.toISOString().split("T")[0],
            predicted: Math.round(denormVal),
            lower: Math.round(denormVal - uncertainty),
            upper: Math.round(denormVal + uncertainty)
        });

        lastSeq = [...lastSeq.slice(1), predVal];
        input.dispose();
        pred.dispose();
    }

    // Calculate RMSE on training data
    const trainPred = model.predict(xTensor) as any;
    const trainPredArr = await trainPred.data();
    let squaredErrors = 0;
    for (let i = 0; i < ys.length; i++) {
        const actual = denormalize(ys[i], min, max);
        const predicted = denormalize(trainPredArr[i], min, max);
        squaredErrors += (actual - predicted) ** 2;
    }
    const rmse = Math.sqrt(squaredErrors / ys.length);

    // Detect trend
    const lastFew = forecasts.slice(-5).map(f => f.predicted);
    const trendDiff = lastFew[lastFew.length - 1] - lastFew[0];
    const trend = trendDiff > max * 0.05 ? "up" : trendDiff < -max * 0.05 ? "down" : "stable";

    // Cleanup
    model.dispose();
    xTensor.dispose();
    yTensor.dispose();
    trainPred.dispose();

    return {
        historical: timeValues,
        forecast: forecasts,
        rmse: Math.round(rmse),
        trend,
        seasonality: detectSeasonality(values),
        modelInfo: `LSTM (${lookback}-step lookback, 16 units, ${epochs} epochs)`
    };
}

function detectSeasonality(values: number[]): boolean {
    if (values.length < 14) return false;
    // Simple autocorrelation check at lag 7 (weekly)
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    let numerator = 0, denominator = 0;
    for (let i = 0; i < values.length - 7; i++) {
        numerator += (values[i] - mean) * (values[i + 7] - mean);
        denominator += (values[i] - mean) ** 2;
    }
    return denominator > 0 && (numerator / denominator) > 0.3;
}

function smaFallbackForecast(
    timeValues: { date: string; value: number }[],
    daysAhead: number
): LSTMForecastResult {
    const values = timeValues.map(t => t.value);
    const window = Math.min(7, values.length);
    const lastWindow = values.slice(-window);
    const avg = lastWindow.reduce((s, v) => s + v, 0) / window;

    // Simple linear trend
    const trend = values.length > 1 ? (values[values.length - 1] - values[0]) / values.length : 0;
    const forecasts: ForecastPoint[] = [];
    const lastDate = new Date(timeValues[timeValues.length - 1].date);

    for (let i = 0; i < daysAhead; i++) {
        const predicted = Math.round(avg + trend * (i + 1));
        const uncertainty = avg * 0.1 * (i + 1);
        const forecastDate = new Date(lastDate);
        forecastDate.setDate(forecastDate.getDate() + i + 1);
        forecasts.push({
            date: forecastDate.toISOString().split("T")[0],
            predicted, lower: Math.round(predicted - uncertainty),
            upper: Math.round(predicted + uncertainty)
        });
    }

    return {
        historical: timeValues, forecast: forecasts, rmse: 0,
        trend: trend > 0 ? "up" : trend < 0 ? "down" : "stable",
        seasonality: false, modelInfo: "SMA Fallback (TF.js unavailable)"
    };
}

// ═══════════════════════════════════════════════════════════
// AUTOENCODER ANOMALY DETECTION
// ═══════════════════════════════════════════════════════════

export interface AnomalyPoint {
    index: number;
    score: number;
    isAnomaly: boolean;
    fields: Record<string, number>;
    reason: string;
}

export interface AutoencoderResult {
    anomalies: AnomalyPoint[];
    threshold: number;
    totalChecked: number;
    anomalyRate: number;
    modelInfo: string;
}

export async function autoencoderAnomaly(
    rows: Record<string, any>[],
    numericFields: string[],
    onProgress?: (progress: number) => void
): Promise<AutoencoderResult> {
    const tfLib = await loadTF();

    // Extract numeric matrix
    const matrix = rows.map(r =>
        numericFields.map(f => parseFloat(String(r[f]).replace(/[^0-9.-]/g, "")) || 0)
    );

    // Normalize each column
    const mins = numericFields.map((_, i) => Math.min(...matrix.map(r => r[i])));
    const maxs = numericFields.map((_, i) => Math.max(...matrix.map(r => r[i])));
    const normalized = matrix.map(row =>
        row.map((v, i) => (maxs[i] - mins[i]) > 0 ? (v - mins[i]) / (maxs[i] - mins[i]) : 0)
    );

    if (!tfLib || matrix.length < 10) {
        return statisticalAnomalyFallback(rows, numericFields, matrix);
    }

    const inputDim = numericFields.length;
    const encodingDim = Math.max(2, Math.floor(inputDim / 2));

    // Build autoencoder
    const encoder = tfLib.sequential();
    encoder.add(tfLib.layers.dense({ units: encodingDim, activation: "relu", inputShape: [inputDim] }));

    const decoder = tfLib.sequential();
    decoder.add(tfLib.layers.dense({ units: inputDim, activation: "sigmoid", inputShape: [encodingDim] }));

    const autoencoder = tfLib.sequential();
    autoencoder.add(tfLib.layers.dense({ units: encodingDim, activation: "relu", inputShape: [inputDim] }));
    autoencoder.add(tfLib.layers.dense({ units: inputDim, activation: "sigmoid" }));

    autoencoder.compile({ optimizer: "adam", loss: "meanSquaredError" });

    const inputTensor = tfLib.tensor2d(normalized);
    const epochs = 20;

    await autoencoder.fit(inputTensor, inputTensor, {
        epochs, batchSize: Math.min(32, normalized.length),
        shuffle: true, verbose: 0,
        callbacks: {
            onEpochEnd: (epoch: number) => onProgress?.(Math.round((epoch / epochs) * 100))
        }
    });

    // Calculate reconstruction errors
    const reconstructed = autoencoder.predict(inputTensor) as any;
    const reconData = await reconstructed.data();
    const errors: number[] = [];

    for (let i = 0; i < normalized.length; i++) {
        let mse = 0;
        for (let j = 0; j < inputDim; j++) {
            mse += (normalized[i][j] - reconData[i * inputDim + j]) ** 2;
        }
        errors.push(mse / inputDim);
    }

    // Threshold = mean + 2 * std
    const meanErr = errors.reduce((s, v) => s + v, 0) / errors.length;
    const stdErr = Math.sqrt(errors.reduce((s, v) => s + (v - meanErr) ** 2, 0) / errors.length);
    const threshold = meanErr + 2 * stdErr;

    const anomalies: AnomalyPoint[] = errors.map((score, index) => {
        const fields: Record<string, number> = {};
        numericFields.forEach((f, i) => { fields[f] = matrix[index][i]; });

        // Find which field contributed most to anomaly
        let maxDev = 0, maxField = numericFields[0];
        numericFields.forEach((f, i) => {
            const dev = Math.abs(normalized[index][i] - reconData[index * inputDim + i]);
            if (dev > maxDev) { maxDev = dev; maxField = f; }
        });

        return {
            index, score, isAnomaly: score > threshold, fields,
            reason: score > threshold ? `Nilai ${maxField} sangat tidak biasa` : "Normal"
        };
    }).filter(a => a.isAnomaly).sort((a, b) => b.score - a.score).slice(0, 20);

    // Cleanup
    autoencoder.dispose();
    inputTensor.dispose();
    reconstructed.dispose();

    return {
        anomalies, threshold, totalChecked: rows.length,
        anomalyRate: Math.round((anomalies.length / rows.length) * 100),
        modelInfo: `Autoencoder (${inputDim}→${encodingDim}→${inputDim}, ${epochs} epochs)`
    };
}

function statisticalAnomalyFallback(
    rows: Record<string, any>[], numericFields: string[], matrix: number[][]
): AutoencoderResult {
    const means = numericFields.map((_, i) => {
        const col = matrix.map(r => r[i]);
        return col.reduce((s, v) => s + v, 0) / col.length;
    });
    const stds = numericFields.map((_, i) => {
        const col = matrix.map(r => r[i]);
        const mean = means[i];
        return Math.sqrt(col.reduce((s, v) => s + (v - mean) ** 2, 0) / col.length);
    });

    const anomalies: AnomalyPoint[] = matrix.map((row, index) => {
        const zScores = row.map((v, i) => stds[i] > 0 ? Math.abs((v - means[i]) / stds[i]) : 0);
        const maxZ = Math.max(...zScores);
        const maxField = numericFields[zScores.indexOf(maxZ)];
        const fields: Record<string, number> = {};
        numericFields.forEach((f, i) => { fields[f] = row[i]; });

        return {
            index, score: maxZ, isAnomaly: maxZ > 2.5, fields,
            reason: maxZ > 2.5 ? `${maxField} deviasi ${maxZ.toFixed(1)}σ dari rata-rata` : "Normal"
        };
    }).filter(a => a.isAnomaly).sort((a, b) => b.score - a.score).slice(0, 20);

    return {
        anomalies, threshold: 2.5, totalChecked: rows.length,
        anomalyRate: Math.round((anomalies.length / rows.length) * 100),
        modelInfo: "Z-Score Fallback (TF.js unavailable)"
    };
}
