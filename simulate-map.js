const XLSX = require("xlsx");
const fs = require("fs");

try {
    const file = fs.readFileSync("d:/Vibe coding (tugas)/Software Simbisdis/Planing website/Data penjualan kaos kami.xlsx");
    const workbook = XLSX.read(file, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    const header = Object.keys(data[0]).map(h => h.toLowerCase());
    
    const kotaCol = Object.keys(data[0]).find(h => ["kota", "city", "kabupaten"].some(l => h.toLowerCase().includes(l)));
    const provCol = Object.keys(data[0]).find(h => ["provinsi", "province", "daerah", "region"].some(l => h.toLowerCase().includes(l)));
    const alamatCol = Object.keys(data[0]).find(h => ["alamat", "address"].some(l => h.toLowerCase().includes(l)));

    const counts = {};
    data.forEach(row => {
        let locParts = [];
        if (kotaCol && row[kotaCol]) {
            locParts.push(String(row[kotaCol]).replace(/KOTA|KAB\.|KABUPATEN/ig, '').trim());
        }
        if (provCol && row[provCol]) {
            locParts.push(String(row[provCol]).replace(/PROVINSI/ig, '').trim());
        }
        
        if (locParts.length > 0) {
            const clean = locParts.join(', ').toUpperCase();
            if (clean.length > 3) counts[clean] = (counts[clean] || 0) + 1;
        }
    });

    const top = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 15);
    console.log("TOP 15 LOCATIONS:");
    top.forEach(t => console.log(t[0], "COUNT:", t[1]));

} catch (e) {
    console.error(e);
}
