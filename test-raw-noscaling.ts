const XLSX = require("xlsx");
const workbook = XLSX.readFile("d:/Vibe coding (tugas)/Software Simbisdis/Planing website/Data penjualan kaos kami.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);
console.log("Sample row (raw):", JSON.stringify(data[0], null, 2));
