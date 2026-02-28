/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * AI Visualization Recommender — Dynamically selects the best chart types
 * based on column metadata, data types, cardinality, and domain context
 */

import { type DataDomain } from "./data-domain-detector";

export type ChartType = "line" | "area" | "stacked_area" | "bar" | "horizontal_bar" |
    "grouped_bar" | "stacked_bar" | "pie" | "donut" | "scatter" | "bubble" | "heatmap" |
    "radar" | "waterfall" | "gauge" | "treemap" | "box_plot" | // Phase 6 Advanced Charts
    "funnel" | "map" | "calendar_heatmap" | "wordcloud" | "bar_race" | "sankey";

export interface ChartRecommendation {
    id: string;
    type: ChartType;
    title: string;
    description: string;
    confidence: number;
    xField?: string;
    yField?: string;
    categoryField?: string;
    fields: string[];
    reason: string;
    priority: number;
}

export interface ColumnMeta {
    name: string;
    type: "number" | "date" | "category" | "text" | "boolean" | "geo";
    uniqueCount: number;
    totalCount: number;
    sampleValues: string[];
    hasNulls: boolean;
}

function detectColumnType(values: any[]): ColumnMeta["type"] {
    const nonEmpty = values.filter(v => v != null && String(v).trim() !== "");
    if (nonEmpty.length === 0) return "text";

    const numCount = nonEmpty.filter(v => !isNaN(parseFloat(String(v).replace(/[Rp$€,.\s]/g, "")))).length;
    const datePattern = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/;
    const dateCount = nonEmpty.filter(v => datePattern.test(String(v))).length;
    const boolCount = nonEmpty.filter(v => ["true", "false", "ya", "tidak", "yes", "no", "1", "0"].includes(String(v).toLowerCase())).length;
    const geoKeywords = /provinsi|kota|city|province|state|region|wilayah|alamat|address|kabupaten|kecamatan/i;

    if (boolCount > nonEmpty.length * 0.8) return "boolean";
    if (dateCount > nonEmpty.length * 0.5) return "date";
    if (numCount > nonEmpty.length * 0.8) return "number";

    const uniqueCount = new Set(nonEmpty.map(String)).size;
    if (uniqueCount <= Math.min(30, nonEmpty.length * 0.3)) return "category";

    return "text";
}

function isGeoColumn(name: string, values: any[]): boolean {
    const geoKeywords = /provinsi|kota|city|province|state|region|wilayah|kabupaten|kecamatan|country|negara/i;
    if (geoKeywords.test(name)) return true;

    const indonesianProvinces = ["jawa barat", "jawa tengah", "jawa timur", "dki jakarta", "banten",
        "sumatera utara", "kalimantan", "sulawesi", "bali", "papua"];
    const sampleStr = values.slice(0, 20).map(v => String(v || "").toLowerCase()).join(" ");
    return indonesianProvinces.some(p => sampleStr.includes(p));
}

export function analyzeColumns(rows: Record<string, any>[]): ColumnMeta[] {
    if (rows.length === 0) return [];
    const columns = Object.keys(rows[0]);

    return columns.map(name => {
        const values = rows.map(r => r[name]);
        const nonEmpty = values.filter(v => v != null && String(v).trim() !== "");
        let type = detectColumnType(values);

        if (type === "category" && isGeoColumn(name, values)) type = "geo";

        return {
            name,
            type,
            uniqueCount: new Set(nonEmpty.map(String)).size,
            totalCount: values.length,
            sampleValues: Array.from(new Set(nonEmpty.map(String))).slice(0, 5),
            hasNulls: nonEmpty.length < values.length,
        };
    });
}

export function recommendCharts(
    columnMetas: ColumnMeta[],
    domain: DataDomain = "generic",
    rows: Record<string, any>[] = []
): ChartRecommendation[] {
    const charts: ChartRecommendation[] = [];
    let priority = 0;

    const dateCols = columnMetas.filter(c => c.type === "date");
    const numCols = columnMetas.filter(c => c.type === "number");
    const catCols = columnMetas.filter(c => c.type === "category");
    const geoCols = columnMetas.filter(c => c.type === "geo");
    const textCols = columnMetas.filter(c => c.type === "text");

    // 1. Date + Number → Line/Area Chart (trend)
    if (dateCols.length > 0 && numCols.length > 0) {
        const dateCol = dateCols[0];
        const numCol = numCols[0];
        charts.push({
            id: `trend_${dateCol.name}_${numCol.name}`,
            type: "area", title: `📈 Tren ${numCol.name} over Time`,
            description: `Visualisasi perubahan ${numCol.name} dari waktu ke waktu`,
            confidence: 0.95, xField: dateCol.name, yField: numCol.name,
            fields: [dateCol.name, numCol.name],
            reason: "Kolom tanggal + angka terdeteksi → tren temporal adalah visualisasi paling informatif",
            priority: priority++
        });

        if (numCols.length > 1) {
            charts.push({
                id: `multi_trend_${dateCol.name}`,
                type: "stacked_area", title: "📊 Multi-Metric Trend",
                description: `Perbandingan beberapa metrik numerik seiring waktu`,
                confidence: 0.85, xField: dateCol.name,
                fields: [dateCol.name, ...numCols.slice(0, 4).map(c => c.name)],
                reason: "Multiple numeric columns + date → stacked area menunjukkan kontribusi relatif",
                priority: priority++
            });
        }
    }

    // 2. Category (≤8 unique) + Number → Pie/Donut
    const smallCats = catCols.filter(c => c.uniqueCount <= 8);
    if (smallCats.length > 0 && numCols.length > 0) {
        charts.push({
            id: `pie_${smallCats[0].name}`,
            type: "donut", title: `🥧 Distribusi ${smallCats[0].name}`,
            description: `Proporsi tiap ${smallCats[0].name}`,
            confidence: 0.9, categoryField: smallCats[0].name, yField: numCols[0].name,
            fields: [smallCats[0].name, numCols[0].name],
            reason: `${smallCats[0].uniqueCount} kategori unik — ideal untuk pie/donut chart`,
            priority: priority++
        });
    }

    // 3. Category (9-30 unique) + Number → Bar Chart
    const medCats = catCols.filter(c => c.uniqueCount > 8 && c.uniqueCount <= 30);
    if (medCats.length > 0 && numCols.length > 0) {
        charts.push({
            id: `bar_${medCats[0].name}`,
            type: "horizontal_bar", title: `📊 Top ${medCats[0].name}`,
            description: `Perbandingan ${medCats[0].name} berdasarkan ${numCols[0].name}`,
            confidence: 0.85, categoryField: medCats[0].name, yField: numCols[0].name,
            fields: [medCats[0].name, numCols[0].name],
            reason: `${medCats[0].uniqueCount} kategori — bar chart horizontal lebih mudah dibaca`,
            priority: priority++
        });
    }

    // 4. Two Numbers → Scatter Plot
    if (numCols.length >= 2) {
        charts.push({
            id: `scatter_${numCols[0].name}_${numCols[1].name}`,
            type: "scatter", title: `🔵 Korelasi ${numCols[0].name} vs ${numCols[1].name}`,
            description: `Hubungan antara ${numCols[0].name} dan ${numCols[1].name}`,
            confidence: 0.75, xField: numCols[0].name, yField: numCols[1].name,
            fields: [numCols[0].name, numCols[1].name],
            reason: "Dua kolom numerik → scatter plot menunjukkan korelasi & outlier",
            priority: priority++
        });
    }

    // 5. Many Numbers → Heatmap / Correlation
    if (numCols.length >= 3) {
        charts.push({
            id: `heatmap_correlation`,
            type: "heatmap", title: "🔥 Matriks Korelasi",
            description: "Peta korelasi antar variabel numerik",
            confidence: 0.7, fields: numCols.map(c => c.name),
            reason: `${numCols.length} kolom numerik → heatmap korelasi mengungkap hubungan tersembunyi`,
            priority: priority++
        });
    }

    // 6. Geo Column → Map
    if (geoCols.length > 0) {
        charts.push({
            id: `map_${geoCols[0].name}`,
            type: "map", title: `🗺️ Peta Distribusi ${geoCols[0].name}`,
            description: "Visualisasi geografis data di peta interaktif",
            confidence: 0.9, categoryField: geoCols[0].name,
            fields: [geoCols[0].name, ...(numCols.length > 0 ? [numCols[0].name] : [])],
            reason: "Kolom lokasi/geografis terdeteksi → peta interaktif ideal",
            priority: priority++
        });
    }

    // 7. Text Columns (long text) → Word Cloud
    const longTextCols = textCols.filter(c => {
        const avgLen = c.sampleValues.reduce((s, v) => s + v.length, 0) / Math.max(1, c.sampleValues.length);
        return avgLen > 20;
    });
    if (longTextCols.length > 0) {
        charts.push({
            id: `wordcloud_${longTextCols[0].name}`,
            type: "wordcloud", title: `☁️ Word Cloud: ${longTextCols[0].name}`,
            description: "Kata yang paling sering muncul dalam data teks",
            confidence: 0.8, fields: [longTextCols[0].name],
            reason: "Kolom teks panjang terdeteksi → word cloud menunjukkan tema dominan",
            priority: priority++
        });
    }

    // 8. Date + Category + Number → Grouped Bar & Animated Bar Race
    if (dateCols.length > 0 && catCols.length > 0 && numCols.length > 0) {
        charts.push({
            id: `grouped_bar_${dateCols[0].name}_${catCols[0].name}`,
            type: "grouped_bar", title: `📊 ${catCols[0].name} per Periode`,
            description: `Perbandingan ${catCols[0].name} dari waktu ke waktu`,
            confidence: 0.7, xField: dateCols[0].name, yField: numCols[0].name, categoryField: catCols[0].name,
            fields: [dateCols[0].name, catCols[0].name, numCols[0].name],
            reason: "Tanggal + kategori + angka → grouped bar menunjukkan evolusi kategori",
            priority: priority++
        });

        // 8.5 Bar Chart Race
        charts.push({
            id: `bar_race_${dateCols[0].name}_${catCols[0].name}`,
            type: "bar_race", title: `🏎️ Animasi Balapan ${catCols[0].name}`,
            description: `Evolusi pergerakan ${catCols[0].name} sepanjang waktu`,
            confidence: 0.85, xField: dateCols[0].name, yField: numCols[0].name, categoryField: catCols[0].name,
            fields: [dateCols[0].name, catCols[0].name, numCols[0].name],
            reason: "Data longitudinal berseri dengan kategori unik → sangat cocok untuk visualisasi Bar Chart Race dinamis",
            priority: priority++
        });
    }

    // Phase 6 Advanced Visualizations: Radar, Treemap, Waterfall, Gauge, BoxPlot

    // 9. Multi-Metrics comparison (3-6 numerical) → Radar Chart
    if (numCols.length >= 3 && numCols.length <= 6 && catCols.length > 0) {
        charts.push({
            id: `radar_${catCols[0].name}`,
            type: "radar", title: `🕸️ Analisis Profil ${catCols[0].name}`,
            description: `Perbandingan multi-metrik untuk setiap ${catCols[0].name}`,
            confidence: 0.8, categoryField: catCols[0].name,
            fields: [catCols[0].name, ...numCols.slice(0, 5).map(c => c.name)],
            reason: `${numCols.length} dimensi angka ditemukan → Radar Chart memvisualisasikan kekuatan dan kelemahan secara asimetris`,
            priority: priority++
        });
    }

    // 10. Financial Flow / Sequential Change → Waterfall Chart
    const financialCols = numCols.filter(c => /cash|saldo|laba|rugi|profit|net|gross|margin|pajak|tax|fee|diskon/i.test(c.name));
    if (financialCols.length > 0 && catCols.length > 0) {
        charts.push({
            id: `waterfall_${catCols[0].name}_${financialCols[0].name}`,
            type: "waterfall", title: `💸 Aliran Keuangan ${financialCols[0].name}`,
            description: `Efek kumulatif nilai ${financialCols[0].name} berdasar ${catCols[0].name}`,
            confidence: 0.85, categoryField: catCols[0].name, yField: financialCols[0].name,
            fields: [catCols[0].name, financialCols[0].name],
            reason: "Istilah finansial/kumulatif terdeteksi → Waterfall chart ideal melacak kenaikan dan penurunan sebelum total",
            priority: priority++
        });
    }

    // 11. Hierarchical Data / High Cardinality → Treemap
    const highCardCats = catCols.filter(c => c.uniqueCount > 7 && c.uniqueCount < 50);
    if (highCardCats.length > 0 && numCols.length > 0) {
        charts.push({
            id: `treemap_${highCardCats[0].name}`,
            type: "treemap", title: `🗂️ Peta Komposisi ${highCardCats[0].name}`,
            description: `Proporsi struktural ${highCardCats[0].name} terhadap keseluruhan`,
            confidence: 0.82, categoryField: highCardCats[0].name, yField: numCols[0].name,
            fields: [highCardCats[0].name, numCols[0].name],
            reason: "Kategori memiliki banyak varian (7-50) → Treemap memanfaatkan ruang lebih baik daripada Pie Chart yang padat",
            priority: priority++
        });
    }

    // 12. Single KPI / Target / Percentage → Gauge Chart
    const ratioCols = numCols.filter(c => /persen|percent|rate|rasio|ratio|kpi|target|skor|score/i.test(c.name));
    if (ratioCols.length > 0 || (numCols.length === 1 && catCols.length === 0)) {
        const targetCol = ratioCols.length > 0 ? ratioCols[0] : numCols[0];
        charts.push({
            id: `gauge_${targetCol.name}`,
            type: "gauge", title: `🎯 Pencapaian Target ${targetCol.name}`,
            description: `Level pengukur (speedometer) untuk satu matriks kunci`,
            confidence: 0.78, yField: targetCol.name,
            fields: [targetCol.name],
            reason: "Satu metrik utama atau bentuk rasio persentase terdeteksi → Setengah lingkar Gauge chart memusatkan fokus.",
            priority: priority++
        });
    }

    // 13. Distribution logic → BoxPlot
    if (catCols.length > 0 && numCols.length > 0) {
        charts.push({
            id: `boxplot_${catCols[0].name}_${numCols[0].name}`,
            type: "box_plot", title: `📏 Sebaran Data ${numCols[0].name}`,
            description: `Deteksi Quartile dan Outlier pada ${catCols[0].name}`,
            confidence: 0.75, categoryField: catCols[0].name, yField: numCols[0].name,
            fields: [catCols[0].name, numCols[0].name],
            reason: "Ingin melihat varians, sebaran (spread), dan pencilan ekstrem data dalam berbagai grup kategori",
            priority: priority++
        });
    }

    // 9. Domain-specific: E-Commerce → Funnel
    if (domain === "ecommerce") {
        const statusCol = catCols.find(c => /status|state/i.test(c.name));
        if (statusCol) {
            charts.push({
                id: `funnel_${statusCol.name}`,
                type: "funnel", title: "🔻 Conversion Funnel",
                description: "Aliran pesanan dari awal hingga selesai",
                confidence: 0.85, categoryField: statusCol.name,
                fields: [statusCol.name],
                reason: "Data e-commerce + kolom status → funnel analysis menunjukkan bottleneck konversi",
                priority: priority++
            });
        }
    }

    // 10. Financial domain → Waterfall
    if (domain === "financial" && numCols.length >= 2) {
        charts.push({
            id: "waterfall_financial",
            type: "waterfall", title: "📊 Waterfall Revenue Breakdown",
            description: "Aliran pendapatan dari gross ke net",
            confidence: 0.8, fields: numCols.slice(0, 5).map(c => c.name),
            reason: "Data keuangan → waterfall chart menunjukkan komponen revenue/expense",
            priority: priority++
        });
    }

    // 11. Category with many items → Treemap
    const largeCats = catCols.filter(c => c.uniqueCount > 5);
    if (largeCats.length > 0 && numCols.length > 0) {
        charts.push({
            id: `treemap_${largeCats[0].name}`,
            type: "treemap", title: `🟩 Treemap ${largeCats[0].name}`,
            description: `Proporsi hierarkis ${largeCats[0].name}`,
            confidence: 0.65, categoryField: largeCats[0].name, yField: numCols[0].name,
            fields: [largeCats[0].name, numCols[0].name],
            reason: "Banyak kategori → treemap menunjukkan hierarki dan proporsi secara visual",
            priority: priority++
        });
    }

    // Sort by priority and return top recommendations
    return charts.sort((a, b) => b.confidence - a.confidence).slice(0, 12);
}
