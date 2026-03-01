import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { autoMapColumns, applyMapping } from './src/lib/column-mapper';
import { analyzeData } from './src/lib/analysis';

const filePath = '../Planing website/Data penjualan kaos kami.xlsx';
const buf = fs.readFileSync(filePath);
const workbook = xlsx.read(buf, { type: 'buffer' });
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];
const rawRows = xlsx.utils.sheet_to_json(worksheet);

console.log(`Read ${rawRows.length} rows`);

const mappings = autoMapColumns(rawRows as any[]);
const mappedRows = applyMapping(rawRows as any[], mappings);

console.log('MAPPINGS:');
mappings.filter(m => m.mappedTo).forEach(m => console.log(`- ${m.originalName} -> ${m.mappedTo} (${m.mappedLabel})`));

const unmapped = mappings.filter(m => !m.mappedTo);
if (unmapped.length > 0) {
    console.log('\nUNMAPPED:');
    unmapped.forEach(m => console.log(`- ${m.originalName}`));
}

// Check sample raw numeric values like "Total Pembayaran", "Harga Setelah Diskon"
console.log('\nSAMPLE DATA:');
console.log('RAW: Total Pembayaran:', rawRows[0]['Total Pembayaran']);
console.log('RAW: Harga Setelah Diskon:', rawRows[0]['Harga Setelah Diskon']);
console.log('MAPPED: total_payment:', mappedRows[0]['total_payment']);

// Try to run analysis
try {
    const analysis = analyzeData(mappedRows);
    console.log('\nANALYSIS OVERVIEW:');
    console.log(`Total Orders: ${analysis.overview.totalOrders}`);
    console.log(`Total Revenue: ${analysis.overview.totalRevenue}`);
    console.log(`Total Discount: ${analysis.financialAnalysis.totalDiscount}`);
} catch (e) {
    console.error('Analysis error:', e);
}
