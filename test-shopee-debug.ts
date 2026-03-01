import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { autoMapColumns, applyMapping } from './src/lib/column-mapper';

const filePath = '../Planing website/Data penjualan kaos kami.xlsx';
const buf = fs.readFileSync(filePath);
const workbook = xlsx.read(buf, { type: 'buffer' });
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];
const rawRows = xlsx.utils.sheet_to_json(worksheet);

// We want to see why e.g. "Total Berat" is unmapped
const unmappedCols = [
    "Total Berat",
    "Voucher Ditanggung Penjual",
    "Voucher Ditanggung Shopee",
    "Paket Diskon (Diskon dari Shopee)",
    "Paket Diskon (Diskon dari Penjual)",
    "Ongkos Kirim Pengembalian Barang",
    "Perkiraan Ongkos Kirim",
    "Username (Pembeli)",
    "Nama Penerima"
];

function normalize(text: string): string {
    return text.toLowerCase().trim().replace(/[_\-\.\/\\()]/g, " ").replace(/\s+/g, " ");
}

console.log("=== DEBUG NORMALIZE ===");
unmappedCols.forEach(c => {
    console.log(`"${c}" -> "${normalize(c)}"`);
});
