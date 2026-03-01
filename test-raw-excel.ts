import * as fs from 'fs';
import * as xlsx from 'xlsx';

const filePath = '../Planing website/Data penjualan kaos kami.xlsx';
const buf = fs.readFileSync(filePath);
const workbook = xlsx.read(buf, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Get raw rows with original types
const rawJson = xlsx.utils.sheet_to_json(worksheet, { raw: true }) as any[];

console.log("=== First Row Raw Values ===");
const firstRow = rawJson[0];
for (const [key, value] of Object.entries(firstRow)) {
    if (key.includes("Total Pembayaran") || key.includes("Harga")) {
        console.log(`${key}: ${JSON.stringify(value)} (Type: ${typeof value})`);
    }
}

// Check some values to see if they look like IDR thousands
const totalPaymentKey = Object.keys(firstRow).find(k => k.includes("Total Pembayaran"));
if (totalPaymentKey) {
    const values = rawJson.slice(0, 10).map(r => r[totalPaymentKey]);
    console.log(`\nSample ${totalPaymentKey}:`, values);
}
