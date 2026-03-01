
import { db } from "./src/lib/local-db";

async function inspect() {
    console.log("--- DB INSPECTION ---");
    const hasData = await db.hasData();
    if (!hasData) {
        console.log("No data in DB.");
        return;
    }

    const data = await db.getAllData();
    console.log(`Total rows: ${data.length}`);
    console.log("First row sample keys:", Object.keys(data[0]));
    console.log("First row sample data:", JSON.stringify(data[0], null, 2));

    const productNames = data.map(r => r.product_name || r["Nama Produk"] || "MISSING");
    const uniqueProducts = new Set(productNames);
    console.log(`Unique products found: ${uniqueProducts.size}`);
    console.log("First 5 products:", Array.from(uniqueProducts).slice(0, 5));

    const totalPayments = data.map(r => r.total_payment || r["Total Pembayaran"]);
    console.log("Sample revenue values:", totalPayments.slice(0, 5));
}

inspect().catch(console.error);
