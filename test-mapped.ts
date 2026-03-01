import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { cleanData } from './src/lib/data-cleaner';
import { autoMapColumns, applyMapping } from './src/lib/column-mapper';

const buf = fs.readFileSync('../Planing website/Data penjualan kaos kami.xlsx');
const workbook = xlsx.read(buf, { type: 'buffer' });
const json = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as Record<string, any>[];

console.log(`Original JSON length: ${json.length}`);
const { cleaned, report } = cleanData(json);
console.log(`Cleaned JSON length: ${cleaned.length}`);
console.log(`Cleaning fixes applied:`);
console.log(JSON.stringify(report.fixes, null, 2));

const mappings = autoMapColumns(cleaned);
const mapped = applyMapping(cleaned, mappings);

console.log("\n=== First Row Original ===");
console.log(JSON.stringify(cleaned[0], null, 2));

console.log("\n=== First Row Mapped ===");
console.log(JSON.stringify(mapped[0], null, 2));
