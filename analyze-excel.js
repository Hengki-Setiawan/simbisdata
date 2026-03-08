const XLSX = require("xlsx");
const fs = require("fs");

try {
    const file = fs.readFileSync("d:/Vibe coding (tugas)/Software Simbisdis/Planing website/Data penjualan kaos kami.xlsx");
    const workbook = XLSX.read(file, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    console.log("Total rows:", data.length);
    
    const cols = Object.keys(data[0]);
    
    // Import the compiled logic or just mock it to test
    // To properly test, I'll just write the simulation directly
    const PLATFORM_FINGERPRINTS = {
        shopee: { columns: ["No. Pesanan", "Status Pesanan", "Nama Produk", "Nama Variasi", "Waktu Pesanan Dibuat", "Waktu Pembayaran Dilakukan", "Waktu Pengiriman Diatur", "Total Pembayaran", "Ongkos Kirim Dibayar oleh Pembeli", "Username (Pembeli)", "Paket Diskon (Diskon dari Shopee)"] },
        tokopedia: { columns: ["Nomor Invoice", "Nama Pembeli", "Nama Barang", "Harga Jual (IDR)", "Jumlah Barang", "Kurir", "Ongkos Kirim (IDR)", "Total Penjualan (IDR)", "Tanggal Pembayaran", "Status Terakhir"] }
    };

    function normalize(s) { return s.toLowerCase().trim().replace(/[_\-\.\/\\()]/g, " ").replace(/\s+/g, " "); }
    const normalizedCols = cols.map(normalize);
    
    for (const [platform, config] of Object.entries(PLATFORM_FINGERPRINTS)) {
        const matched = config.columns.filter((fp) =>
            normalizedCols.some((col) => {
                const nfp = normalize(fp);
                return col === nfp || col.includes(nfp);
            })
        );
        console.log(`${platform} matched: ${matched.length}/${config.columns.length} columns`);
    }
    
} catch (e) {
    console.error(e);
}
