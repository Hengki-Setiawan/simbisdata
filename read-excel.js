const XLSX = require("xlsx");
const fs = require("fs");

try {
    const file = fs.readFileSync("d:/Vibe coding (tugas)/Software Simbisdis/Planing website/Data penjualan kaos kami.xlsx");
    const workbook = XLSX.read(file, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log("HEADERS:", Object.keys(data[0]));
    console.log("ROW 1:", data[0]);
} catch (e) {
    console.error(e);
}
