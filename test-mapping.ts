import { applyMapping, type ColumnMapping } from "./src/lib/column-mapper";
import { analyzeData } from "./src/lib/analysis";

const sampleData = [
    { "Net Sales": "150000", "Order #": "ORD-001", "Item Name": "Blouse Merah", "qty": 2 },
    { "Net Sales": "75000", "Order #": "ORD-002", "Item Name": "Shirt Putih", "qty": 1 }
];

const mockAiMappings: ColumnMapping[] = [
    { originalName: "Net Sales", mappedTo: "total_payment", mappedLabel: "Total Pembayaran", confidence: 0.99, dataType: "number", sampleValues: [] },
    { originalName: "Order #", mappedTo: "order_id", mappedLabel: "ID Pesanan", confidence: 0.99, dataType: "text", sampleValues: [] },
    { originalName: "Item Name", mappedTo: "product_name", mappedLabel: "Nama Produk", confidence: 0.99, dataType: "text", sampleValues: [] },
    { originalName: "qty", mappedTo: "quantity", mappedLabel: "Jumlah", confidence: 0.99, dataType: "number", sampleValues: [] },
];

console.log("=== STEP 1: BEFORE MAPPING ===");
console.log(sampleData[0]);

const mappedData = applyMapping(sampleData, mockAiMappings);

console.log("\n=== STEP 2: AFTER applyMapping ===");
console.log(mappedData[0]);

console.log("\n=== STEP 3: AFTER analyzeData ===");
const results = analyzeData(mappedData);
console.log("Total Orders:", results.overview.totalOrders);
console.log("Total Revenue:", results.overview.totalRevenue);
console.log("Products:", results.productPerformance.map(p => `${p.name} (Qty: ${p.count}, Setengah/Percentage: ${p.percentage}%)`));
