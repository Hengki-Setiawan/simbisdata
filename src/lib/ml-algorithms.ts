/* eslint-disable @typescript-eslint/no-explicit-any */
import { kmeans as mlKmeans } from "ml-kmeans";

/**
 * Universal field accessor — tries universal key, then Shopee column names, then generic names
 * This allows all ML algorithms to work with data from ANY marketplace
 */
const FIELD_MAP: Record<string, string[]> = {
    product: ["product_name", "Nama Produk", "Item Name", "Nama Barang", "Product", "Item"],
    customer: ["customer_name", "Username (Pembeli)", "Nama Penerima", "Buyer Name", "Customer", "Pelanggan", "Nama Pembeli"],
    total: ["total_payment", "Total Pembayaran", "Total Penjualan (IDR)", "Grand Total", "Total", "total", "subtotal", "Total Harga Produk", "Subtotal"],
    qty: ["quantity", "Jumlah", "Qty", "Quantity", "Jumlah Barang"],
    price: ["sale_price", "original_price", "Harga Setelah Diskon", "Harga Awal", "Harga", "Price", "Unit Price", "Harga Jual (IDR)"],
    date: ["order_date", "Waktu Pesanan Dibuat", "Tanggal", "Date", "Created at", "Tanggal Transaksi", "Created Time"],
    endDate: ["complete_date", "Waktu Pesanan Selesai", "Completed Date", "Tanggal Selesai"],
    variant: ["variant", "Nama Variasi", "Variant", "Variation", "Size"],
    courier: ["courier", "Opsi Pengiriman", "Kurir", "Courier", "Shipping Method"],
    shipping: ["shipping_cost", "Ongkos Kirim Dibayar oleh Pembeli", "Ongkir", "Shipping Fee"],
    discount: ["discount", "Total Diskon", "Discount", "Diskon"],
    subtotal: ["subtotal", "Total Harga Produk", "Subtotal"],
    province: ["province", "Provinsi", "Province"],
    status: ["order_status", "Status Pesanan", "Status", "Order Status"],
    orderId: ["order_id", "No. Pesanan", "Order Number", "No Transaksi", "Invoice"],
};
import { UNIVERSAL_FIELDS, type UniversalField } from "./column-mapper";

function F(r: any, key: string): any {
    const fields = FIELD_MAP[key] || [];

    // 1. Try match on mapped Universal Label (e.g. "Total Pembayaran")
    // Note: The 'key' passed to F() corresponds somewhat to UniversalField, but they don't map perfectly 1:1.
    // However, the fields array already contains the Universal Label.

    // 2. Try exact casing match
    for (const f of fields) { if (r[f] !== undefined && r[f] !== null && r[f] !== "") return r[f]; }

    // 3. Try case-insensitive fallback across all keys
    const rowKeys = Object.keys(r);
    const searchKeys = fields.filter(Boolean).map(k => String(k).toLowerCase());
    for (const rk of rowKeys) {
        if (searchKeys.includes(rk.toLowerCase()) && r[rk] !== undefined && r[rk] !== null && r[rk] !== "") {
            return r[rk];
        }
    }

    return undefined;
}
function Fn(r: any, key: string): number {
    const val = F(r, key);
    if (val == null || val === "" || val === "-") return 0;
    return parseFloat(String(val).replace(/[^\d.,\-]/g, "").replace(/,/g, ".")) || 0;
}
function Fs(r: any, key: string): string { return String(F(r, key) || ""); }

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

/**
 * Day × Hour Heatmap — Order distribution by day and hour
 */
export interface HeatmapResult {
    data: { day: string; hour: number; value: number }[];
    peakDay: string;
    peakHour: number;
}

export function dayHourHeatmap(rows: any[]): HeatmapResult {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const grid = new Map<string, number>();

    rows.forEach((r: any) => {
        const d = F(r, "date");
        if (!d) return;
        const date = new Date(d);
        const day = days[date.getDay()];
        const hour = date.getHours();
        const key = `${day}-${hour}`;
        grid.set(key, (grid.get(key) || 0) + 1);
    });

    const data: HeatmapResult["data"] = [];
    let peakDay = "Senin", peakHour = 12, peakVal = 0;
    days.forEach((day) => {
        for (let h = 0; h < 24; h++) {
            const value = grid.get(`${day}-${h}`) || 0;
            data.push({ day, hour: h, value });
            if (value > peakVal) { peakVal = value; peakDay = day; peakHour = h; }
        }
    });

    return { data, peakDay, peakHour };
}

/**
 * Funnel Analysis — Order status conversion
 */
export interface FunnelResult {
    stages: { name: string; count: number; percentage: number; dropoff: number }[];
}

export function funnelAnalysis(rows: any[]): FunnelResult {
    const total = rows.length;
    const paid = rows.filter((r: any) => F(r, "date")).length; // Assuming 'date' implies order created/paid
    const shipped = rows.filter((r: any) => F(r, "courier")).length; // Assuming 'courier' implies shipped
    const completed = rows.filter((r: any) => {
        const status = Fs(r, "status").toLowerCase();
        return status.includes("selesai") || status.includes("completed");
    }).length;
    const returned = rows.filter((r: any) => {
        // This field is not in FIELD_MAP, keeping original for now or assuming a generic 'return_status'
        const status = (r["Status Pembatalan/ Pengembalian"] || "").trim();
        return status && status !== "-" && status.length > 0;
    }).length;

    const stages = [
        { name: "Pesanan Dibuat", count: total, percentage: 100, dropoff: 0 },
        { name: "Pembayaran", count: paid, percentage: total > 0 ? (paid / total) * 100 : 0, dropoff: total > 0 ? ((total - paid) / total) * 100 : 0 },
        { name: "Pengiriman", count: shipped, percentage: total > 0 ? (shipped / total) * 100 : 0, dropoff: paid > 0 ? ((paid - shipped) / paid) * 100 : 0 },
        { name: "Selesai", count: completed, percentage: total > 0 ? (completed / total) * 100 : 0, dropoff: shipped > 0 ? ((shipped - completed) / shipped) * 100 : 0 },
    ];

    if (returned > 0) {
        stages.push({ name: "Return/Cancel", count: returned, percentage: (returned / total) * 100, dropoff: 0 });
    }

    return { stages };
}

/**
 * ABC Analysis — Inventory/Product Classification (Pareto)
 */
export interface ABCResult {
    items: { name: string; revenue: number; percentage: number; cumulative: number; category: "A" | "B" | "C" }[];
}

export function abcAnalysis(rows: any[]): ABCResult {
    const productMap = new Map<string, number>();
    rows.forEach((r: any) => {
        const name = Fs(r, "product") || "Unknown";
        productMap.set(name, (productMap.get(name) || 0) + Fn(r, "total"));
    });

    const totalRevenue = Array.from(productMap.values()).reduce((a, b) => a + b, 0);
    const sorted = Array.from(productMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, revenue]) => ({ name, revenue, percentage: (revenue / totalRevenue) * 100 }));

    let cumulative = 0;
    const items = sorted.map((item) => {
        cumulative += item.percentage;
        const category: "A" | "B" | "C" = cumulative <= 80 ? "A" : cumulative <= 95 ? "B" : "C";
        return { ...item, cumulative, category };
    });

    return { items };
}

/**
 * Cohort Analysis — Monthly retention
 */
export interface CohortResult {
    cohorts: { month: string; size: number; retention: number[] }[];
}

export function cohortAnalysis(rows: any[]): CohortResult {
    const customerFirstMonth = new Map<string, string>();
    const customerMonths = new Map<string, Set<string>>();

    rows.forEach((r: any) => {
        const name = Fs(r, "customer") || "Unknown";
        const d = F(r, "date");
        if (!d) return;
        const month = new Date(d).toISOString().slice(0, 7); // YYYY-MM

        if (!customerFirstMonth.has(name) || month < customerFirstMonth.get(name)!) {
            customerFirstMonth.set(name, month);
        }
        if (!customerMonths.has(name)) customerMonths.set(name, new Set());
        customerMonths.get(name)!.add(month);
    });

    // Group by first purchase month
    const cohortMap = new Map<string, Set<string>>();
    customerFirstMonth.forEach((month, customer) => {
        if (!cohortMap.has(month)) cohortMap.set(month, new Set());
        cohortMap.get(month)!.add(customer);
    });

    const allMonths = Array.from(new Set(Array.from(customerMonths.values()).flatMap((s) => Array.from(s)))).sort();

    const cohorts = Array.from(cohortMap.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([month, customers]) => {
        const size = customers.size;
        const startIdx = allMonths.indexOf(month);
        const retention = allMonths.slice(startIdx).map((m) => {
            const retained = Array.from(customers).filter((c) => customerMonths.get(c)?.has(m)).length;
            return size > 0 ? (retained / size) * 100 : 0;
        });
        return { month, size, retention };
    });

    return { cohorts };
}

/**
 * Association Rule Mining — Product co-purchase patterns
 */
export interface AssociationResult {
    rules: { antecedent: string; consequent: string; support: number; confidence: number; lift: number }[];
}

export function associationRules(rows: any[]): AssociationResult {
    // Group products by customer
    const customerProducts = new Map<string, Set<string>>();
    rows.forEach((r: any) => {
        const customer = Fs(r, "customer") || "Unknown";
        const product = Fs(r, "product") || "Unknown";
        if (!customerProducts.has(customer)) customerProducts.set(customer, new Set());
        customerProducts.get(customer)!.add(product);
    });

    const totalCustomers = customerProducts.size;
    const productCounts = new Map<string, number>();
    const pairCounts = new Map<string, number>();

    customerProducts.forEach((products) => {
        const arr = Array.from(products);
        arr.forEach((p) => productCounts.set(p, (productCounts.get(p) || 0) + 1));
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                const key = [arr[i], arr[j]].sort().join("→");
                pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
            }
        }
    });

    const rules: AssociationResult["rules"] = [];
    pairCounts.forEach((count, key) => {
        const [a, b] = key.split("→");
        const supportA = (productCounts.get(a) || 0) / totalCustomers;
        const supportB = (productCounts.get(b) || 0) / totalCustomers;
        const support = count / totalCustomers;
        const confidence = supportA > 0 ? support / supportA : 0;
        const lift = supportB > 0 ? confidence / supportB : 0;
        if (support > 0.01) {
            rules.push({ antecedent: a, consequent: b, support, confidence, lift });
            rules.push({ antecedent: b, consequent: a, support, confidence: supportB > 0 ? support / supportB : 0, lift });
        }
    });

    return { rules: rules.sort((a, b) => b.lift - a.lift).slice(0, 20) };
}

/**
 * Shipping Cost Optimization — Cost-efficiency per courier
 */
export interface ShippingResult {
    couriers: { name: string; orders: number; avgCost: number; avgDays: number; efficiency: number }[];
    bestOverall: string;
}

export function shippingOptimization(rows: any[]): ShippingResult {
    const courierMap = new Map<string, { orders: number; totalCost: number; totalDays: number }>();
    rows.forEach((r: any) => {
        const courier = Fs(r, "courier") || "Unknown";
        const cost = Fn(r, "shipping");
        const created = F(r, "date") ? new Date(F(r, "date")) : null;
        const completed = F(r, "endDate") ? new Date(F(r, "endDate")) : null;
        const days = created && completed ? Math.max(1, (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)) : 3;
        const existing = courierMap.get(courier) || { orders: 0, totalCost: 0, totalDays: 0 };
        existing.orders += 1; existing.totalCost += cost; existing.totalDays += days;
        courierMap.set(courier, existing);
    });

    const couriers = Array.from(courierMap.entries()).map(([name, d]) => {
        const avgCost = d.totalCost / d.orders;
        const avgDays = d.totalDays / d.orders;
        const efficiency = avgDays > 0 ? (1 / avgCost) * (1 / avgDays) * 10000 : 0;
        return { name, orders: d.orders, avgCost: Math.round(avgCost), avgDays: Math.round(avgDays * 10) / 10, efficiency: Math.round(efficiency * 100) / 100 };
    }).sort((a, b) => b.efficiency - a.efficiency);

    return { couriers, bestOverall: couriers[0]?.name || "N/A" };
}

/**
 * Customer Lifetime Value (CLV)
 */
export interface CLVResult {
    customers: { name: string; clv: number; avgSpend: number; frequency: number; lifespan: number; segment: string }[];
    avgCLV: number;
}

export function customerLifetimeValue(rows: any[]): CLVResult {
    const customerMap = new Map<string, { dates: Date[]; spending: number[] }>();
    rows.forEach((r: any) => {
        const name = Fs(r, "customer") || "Unknown";
        const date = new Date(F(r, "date"));
        const spend = Fn(r, "total");
        if (!customerMap.has(name)) customerMap.set(name, { dates: [], spending: [] });
        customerMap.get(name)!.dates.push(date);
        customerMap.get(name)!.spending.push(spend);
    });

    const customers = Array.from(customerMap.entries()).map(([name, data]) => {
        const frequency = data.dates.length;
        const avgSpend = data.spending.reduce((a, b) => a + b, 0) / frequency;
        const sortedDates = data.dates.sort((a, b) => a.getTime() - b.getTime());
        const lifespan = sortedDates.length > 1
            ? (sortedDates[sortedDates.length - 1].getTime() - sortedDates[0].getTime()) / (1000 * 60 * 60 * 24 * 30) // months
            : 1;
        const clv = avgSpend * frequency * Math.max(1, lifespan);
        const segment = clv > 500000 ? "High Value" : clv > 100000 ? "Medium Value" : "Low Value";
        return { name, clv: Math.round(clv), avgSpend: Math.round(avgSpend), frequency, lifespan: Math.round(lifespan * 10) / 10, segment };
    }).sort((a, b) => b.clv - a.clv);

    const avgCLV = customers.length > 0 ? customers.reduce((s, c) => s + c.clv, 0) / customers.length : 0;
    return { customers, avgCLV: Math.round(avgCLV) };
}

/**
 * Price Sensitivity / Demand Analysis
 */
export interface PriceSensitivityResult {
    pricePoints: { price: number; volume: number; revenue: number }[];
    optimalPrice: number;
    elasticity: number;
}

export function priceSensitivity(rows: any[]): PriceSensitivityResult {
    const priceMap = new Map<number, { volume: number; revenue: number }>();
    rows.forEach((r: any) => {
        const price = Math.round(Fn(r, "price") / 1000) * 1000;
        if (price <= 0) return;
        const existing = priceMap.get(price) || { volume: 0, revenue: 0 };
        existing.volume += Fn(r, "qty") || 1;
        existing.revenue += Fn(r, "total");
        priceMap.set(price, existing);
    });

    const pricePoints = Array.from(priceMap.entries())
        .map(([price, d]) => ({ price, volume: d.volume, revenue: Math.round(d.revenue) }))
        .sort((a, b) => a.price - b.price);

    const optimalPrice = pricePoints.reduce((best, p) => p.revenue > best.revenue ? p : best, pricePoints[0] || { price: 0, revenue: 0 }).price;

    // Simple elasticity: % change in qty / % change in price
    let elasticity = 0;
    if (pricePoints.length >= 2) {
        const first = pricePoints[0], last = pricePoints[pricePoints.length - 1];
        const pctQty = (last.volume - first.volume) / (first.volume || 1);
        const pctPrice = (last.price - first.price) / (first.price || 1);
        elasticity = pctPrice !== 0 ? Math.round((pctQty / pctPrice) * 100) / 100 : 0;
    }

    return { pricePoints, optimalPrice, elasticity };
}

/**
 * Correlation Matrix — Pearson correlation between numeric fields
 */
export interface CorrelationResult {
    matrix: { row: string; col: string; value: number }[];
    fields: string[];
}

export function correlationMatrix(rows: any[]): CorrelationResult {
    const numericFields = ["price", "qty", "subtotal", "discount", "shipping", "total"];
    const fields = numericFields.filter((f) => rows.some((r: any) => !isNaN(Fn(r, f))));

    const columns: number[][] = fields.map((f) => rows.map((r: any) => Fn(r, f)));

    const pearson = (x: number[], y: number[]): number => {
        const n = x.length;
        const mx = x.reduce((a, b) => a + b, 0) / n;
        const my = y.reduce((a, b) => a + b, 0) / n;
        let num = 0, dx = 0, dy = 0;
        for (let i = 0; i < n; i++) {
            num += (x[i] - mx) * (y[i] - my);
            dx += (x[i] - mx) ** 2;
            dy += (y[i] - my) ** 2;
        }
        return dx > 0 && dy > 0 ? num / Math.sqrt(dx * dy) : 0;
    };

    const matrix: CorrelationResult["matrix"] = [];
    fields.forEach((row, i) => {
        fields.forEach((col, j) => {
            matrix.push({ row, col, value: Math.round(pearson(columns[i], columns[j]) * 100) / 100 });
        });
    });

    return { matrix, fields };
}
