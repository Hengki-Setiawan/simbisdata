import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { detectPlatform } from './src/lib/platform-detector';

const filePath = '../Planing website/Data penjualan kaos kami.xlsx';
const buf = fs.readFileSync(filePath);
const workbook = xlsx.read(buf, { type: 'buffer' });
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];
const rawRows = xlsx.utils.sheet_to_json(worksheet);

if (rawRows.length > 0) {
    const cols = Object.keys(rawRows[0] as object);
    const result = detectPlatform(cols);
    console.log('DETECTED PLATFORM:', result.platform);
    console.log('CONFIDENCE:', result.confidence);
    console.log('MATCHED:', result.matchedColumns.length);
}
