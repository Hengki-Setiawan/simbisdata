import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { cleanData } from './src/lib/data-cleaner';
import { autoMapColumns, applyMapping } from './src/lib/column-mapper';
import { analyzeColumns, recommendCharts, ChartRecommendation } from './src/lib/ai-viz-recommender';

const buf = fs.readFileSync('../Planing website/Data penjualan kaos kami.xlsx');
const workbook = xlsx.read(buf, { type: 'buffer' });
const json = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as Record<string, any>[];

const { cleaned } = cleanData(json);
const mappings = autoMapColumns(cleaned);
const mapped = applyMapping(cleaned, mappings);

const meta = analyzeColumns(mapped);
const charts = recommendCharts(meta, 'ecommerce', mapped);

console.log(`Found ${charts.length} charts`);
if (charts.length > 0) {
    console.log(JSON.stringify(charts.map(c => ({ title: c.title, type: c.type, fields: c.fields })), null, 2));

    const rec = charts[0];
    console.log(`\nTesting agg for chart [${rec.title}] - ${rec.type}`);
    // Simulate simple aggregation
    const data = mapped.slice(0, 5).map(row => {
        const obj: any = {};
        if (rec.xField) obj[rec.xField] = row[rec.xField];
        if (rec.yField) obj[rec.yField] = row[rec.yField];
        if (rec.categoryField) obj[rec.categoryField] = row[rec.categoryField];
        return obj;
    });
    console.log("Sample Data slices for chart:", data);
}
