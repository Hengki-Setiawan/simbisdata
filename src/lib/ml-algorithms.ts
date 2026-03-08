/* eslint-disable @typescript-eslint/no-explicit-any */
import { kmeans as mlKmeans } from "ml-kmeans";
import { getFieldValue as F, getFieldNum as Fn, getFieldStr as Fs } from "./data-accessor";
import { UNIVERSAL_FIELDS, type UniversalField } from "./column-mapper";

/**
 * K-Means Clustering — Customer Segmentation
 * Groups customers based on order frequency and spending
 */
export interface ClusterResult {
    clusters: { id: number; label: string; color: string; count: number; avgSpending: number; avgOrders: number }[];
    assignments: { customer: string; cluster: number; spending: number; orders: number }[];
}

function euclidean(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

function normalize(values: number[]): number[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return values.map((v) => (v - min) / range);
}

export function kMeansClustering(rows: any[], k: number = 3): ClusterResult {
    // Build customer profiles: spending & order count
    const customerMap = new Map<string, { spending: number; orders: number }>();
    rows.forEach((r: any) => {
        const name = Fs(r, "customer") || `Customer_${Math.random().toString(36).slice(2, 8)}`;
        const existing = customerMap.get(name) || { spending: 0, orders: 0 };
        existing.spending += Fn(r, "total");
        existing.orders += 1;
        customerMap.set(name, existing);
    });

    const customers = Array.from(customerMap.entries());
    if (customers.length < k) return { clusters: [], assignments: [] };

    const spendingRaw = customers.map(([, d]) => d.spending);
    const ordersRaw = customers.map(([, d]) => d.orders);
    const spendingNorm = normalize(spendingRaw);
    const ordersNorm = normalize(ordersRaw);

    const dataMatrix = customers.map((_, i) => [spendingNorm[i], ordersNorm[i]]);

    // Run highly optimized K-Means from mljs
    const result = mlKmeans(dataMatrix, k, { initialization: "kmeans++", maxIterations: 100 });
    const assignments = result.clusters;
    const centroids = result.centroids.map((c: any) => Array.isArray(c) ? c : c.centroid);

    const labels = ["Low Value", "Medium Value", "High Value", "VIP"];
    const colors = ["#ef4444", "#f59e0b", "#10b981", "#6366f1"];

    // Sort clusters by average spending
    const clusterStats = centroids.map((_, ci) => {
        const members = customers.filter((_, pi) => assignments[pi] === ci);
        return {
            id: ci,
            label: labels[ci] || `Cluster ${ci}`,
            color: colors[ci] || "#94a3b8",
            count: members.length,
            avgSpending: members.reduce((s, [, d]) => s + d.spending, 0) / (members.length || 1),
            avgOrders: members.reduce((s, [, d]) => s + d.orders, 0) / (members.length || 1),
        };
    }).sort((a, b) => a.avgSpending - b.avgSpending);

    // Reassign labels after sort
    clusterStats.forEach((c, i) => {
        c.label = labels[i] || `Cluster ${i}`;
        c.color = colors[i] || "#94a3b8";
    });

    const assignmentDetails = customers.map(([name, data], i) => ({
        customer: name,
        cluster: assignments[i],
        spending: data.spending,
        orders: data.orders,
    }));

    return { clusters: clusterStats, assignments: assignmentDetails };
}

/**
 * Anomaly Detection — Isolation-based scoring
 * Finds outlier orders (unusually high/low values)
 */
export interface AnomalyResult {
    anomalies: { index: number; product: string; value: number; score: number; reason: string }[];
    threshold: number;
    totalChecked: number;
}

export function detectAnomalies(rows: any[]): AnomalyResult {
    const values = rows.map((r: any) => Fn(r, "total"));
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);
    const threshold = mean + 2 * stdDev; // 2 standard deviations

    const anomalies = rows
        .map((r: any, i: number) => {
            const val = Fn(r, "total");
            const zScore = stdDev > 0 ? Math.abs(val - mean) / stdDev : 0;
            return {
                index: i,
                product: Fs(r, "product") || "Unknown",
                value: val,
                score: zScore,
                reason: val > threshold ? "Nilai pesanan sangat tinggi" :
                    val < mean - 2 * stdDev ? "Nilai pesanan sangat rendah" : "",
            };
        })
        .filter((a) => a.score > 2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

    return { anomalies, threshold, totalChecked: rows.length };
}

/**
 * Product Performance Score
 * Composite score based on sales volume, revenue, growth, and consistency
 */
export interface ProductScore {
    name: string;
    score: number;
    grade: string;
    volumeScore: number;
    revenueScore: number;
    consistencyScore: number;
}

export function calculateProductScores(rows: any[]): ProductScore[] {
    const productMap = new Map<string, { count: number; revenue: number; dates: string[] }>();

    rows.forEach((r: any) => {
        const name = Fs(r, "product") || "Unknown";
        const existing = productMap.get(name) || { count: 0, revenue: 0, dates: [] };
        existing.count += Fn(r, "qty") || 1;
        existing.revenue += Fn(r, "total");
        const d = F(r, "date");
        if (d) existing.dates.push(d);
        productMap.set(name, existing);
    });

    const products = Array.from(productMap.entries());
    const maxCount = Math.max(...products.map(([, d]) => d.count));
    const maxRevenue = Math.max(...products.map(([, d]) => d.revenue));

    return products.map(([name, data]) => {
        const volumeScore = (data.count / maxCount) * 100;
        const revenueScore = (data.revenue / maxRevenue) * 100;

        // Consistency: how spread out are the sales dates
        const uniqueDates = new Set(data.dates.map((d) => new Date(d).toISOString().split("T")[0])).size;
        const totalDays = rows.length > 0 ?
            Math.max(1, (new Date(F(rows[rows.length - 1], "date")).getTime() -
                new Date(F(rows[0], "date")).getTime()) / (1000 * 60 * 60 * 24)) : 1;
        const consistencyScore = Math.min(100, (uniqueDates / totalDays) * 100);

        const score = volumeScore * 0.4 + revenueScore * 0.4 + consistencyScore * 0.2;
        const grade = score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : score >= 20 ? "D" : "F";

        return { name, score, grade, volumeScore, revenueScore, consistencyScore };
    }).sort((a, b) => b.score - a.score);
}

/**
 * RFM Analysis — Recency, Frequency, Monetary
 */
export interface RFMResult {
    segments: { customer: string; recency: number; frequency: number; monetary: number; rScore: number; fScore: number; mScore: number; segment: string }[];
    summary: { segment: string; count: number; percentage: number }[];
}

export function rfmAnalysis(rows: any[]): RFMResult {
    const now = new Date();
    const customerMap = new Map<string, { lastDate: Date; orderCount: number; totalSpend: number }>();

    rows.forEach((r: any) => {
        const name = Fs(r, "customer") || "Unknown";
        const date = new Date(F(r, "date"));
        const spend = Fn(r, "total");
        const existing = customerMap.get(name) || { lastDate: date, orderCount: 0, totalSpend: 0 };
        if (date > existing.lastDate) existing.lastDate = date;
        existing.orderCount += 1;
        existing.totalSpend += spend;
        customerMap.set(name, existing);
    });

    const customers = Array.from(customerMap.entries()).map(([name, data]) => {
        const recency = Math.floor((now.getTime() - data.lastDate.getTime()) / (1000 * 60 * 60 * 24));
        return { customer: name, recency, frequency: data.orderCount, monetary: data.totalSpend };
    });

    // Score 1-5 for each dimension (quintiles)
    const scoreQuintile = (values: number[], reverse: boolean = false) => {
        const sorted = [...values].sort((a, b) => a - b);
        return values.map((v) => {
            const rank = sorted.indexOf(v) / sorted.length;
            const score = Math.ceil(rank * 5) || 1;
            return reverse ? 6 - score : score;
        });
    };

    const rScores = scoreQuintile(customers.map((c) => c.recency), true); // Lower recency = better
    const fScores = scoreQuintile(customers.map((c) => c.frequency));
    const mScores = scoreQuintile(customers.map((c) => c.monetary));

    const segmentMap: Record<string, string> = {
        "555": "Champions", "554": "Champions", "545": "Champions",
        "544": "Loyal", "535": "Loyal", "534": "Loyal",
        "443": "Potential Loyalists", "453": "Potential Loyalists",
        "553": "Potential Loyalists", "543": "Potential Loyalists",
        "551": "Recent Customers", "552": "Recent Customers",
        "541": "Recent Customers", "542": "Recent Customers",
        "331": "About to Sleep", "321": "About to Sleep",
        "311": "At Risk", "312": "At Risk", "211": "At Risk",
        "111": "Lost", "112": "Lost", "121": "Lost",
    };

    const getSegment = (r: number, f: number, m: number): string => {
        const key = `${r}${f}${m}`;
        if (segmentMap[key]) return segmentMap[key];
        const avg = (r + f + m) / 3;
        if (avg >= 4) return "Champions";
        if (avg >= 3) return "Potential Loyalists";
        if (avg >= 2) return "At Risk";
        return "Lost";
    };

    const segments = customers.map((c, i) => ({
        ...c,
        rScore: rScores[i],
        fScore: fScores[i],
        mScore: mScores[i],
        segment: getSegment(rScores[i], fScores[i], mScores[i]),
    }));

    const segmentCounts = new Map<string, number>();
    segments.forEach((s) => segmentCounts.set(s.segment, (segmentCounts.get(s.segment) || 0) + 1));
    const summary = Array.from(segmentCounts.entries())
        .map(([segment, count]) => ({ segment, count, percentage: (count / segments.length) * 100 }))
        .sort((a, b) => b.count - a.count);

    return { segments, summary };
}

/**
 * Time Series Forecasting — Simple Moving Average + Trend
 */
export interface ForecastResult {
    historical: { date: string; value: number }[];
    forecast: { date: string; value: number; lower: number; upper: number }[];
    trend: "up" | "down" | "stable";
    growthRate: number;
}

export function timeSeriesForecast(rows: any[], daysAhead: number = 30): ForecastResult {
    // Group by date
    const dailyMap = new Map<string, number>();
    rows.forEach((r: any) => {
        const d = F(r, "date");
        if (d) {
            const dateStr = new Date(d).toISOString().split("T")[0];
            dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + Fn(r, "total"));
        }
    });

    const sorted = Array.from(dailyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const historical = sorted.map(([date, value]) => ({ date, value }));
    if (historical.length < 3) return { historical, forecast: [], trend: "stable", growthRate: 0 };

    // Simple Moving Average (window = 7 or fewer)
    const window = Math.min(7, Math.floor(historical.length / 2));
    const values = historical.map((h) => h.value);
    const lastWindow = values.slice(-window);
    const sma = lastWindow.reduce((a, b) => a + b, 0) / lastWindow.length;

    // Linear trend
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    values.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) ** 2; });
    const slope = den !== 0 ? num / den : 0;

    // Generate forecast
    const lastDate = new Date(historical[historical.length - 1].date);
    const forecast: ForecastResult["forecast"] = [];
    for (let i = 1; i <= daysAhead; i++) {
        const futureDate = new Date(lastDate);
        futureDate.setDate(futureDate.getDate() + i);
        const predicted = Math.max(0, sma + slope * i);
        const uncertainty = predicted * 0.15 * Math.sqrt(i);
        forecast.push({
            date: futureDate.toISOString().split("T")[0],
            value: Math.round(predicted),
            lower: Math.max(0, Math.round(predicted - uncertainty)),
            upper: Math.round(predicted + uncertainty),
        });
    }

    const firstHalf = values.slice(0, Math.floor(n / 2));
    const secondHalf = values.slice(Math.floor(n / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const growthRate = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    const trend = growthRate > 5 ? "up" : growthRate < -5 ? "down" : "stable";

    return { historical, forecast, trend, growthRate };
}
