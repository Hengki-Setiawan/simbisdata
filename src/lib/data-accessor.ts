/* eslint-disable @typescript-eslint/no-explicit-any */
import { UNIVERSAL_FIELDS, type UniversalField } from "./column-mapper";

/**
 * Universal Data Accessor for Marketplace Data
 * This utility ensures that we can read fields regardless of whether they are 
 * mapped to English universal keys or remain as raw Indonesian marketplace headers.
 */

export const FIELD_MAP: Record<string, string[]> = {
    product: ["product_name", "Nama Produk", "Item Name", "Nama Barang", "Product", "Item"],
    customer: ["customer_name", "Username (Pembeli)", "Nama Penerima", "Buyer Name", "Customer", "Pelanggan", "Nama Pembeli"],
    total: ["total_payment", "Total Pembayaran", "Total Penjualan (IDR)", "Grand Total", "Total", "total", "subtotal", "Total Harga Produk", "Subtotal", "Harga Awal", "Harga Jual", "Harga Jual (IDR)", "Subtotal After Discount", "original_price", "sale_price"],
    qty: ["quantity", "Jumlah", "Qty", "Quantity", "Jumlah Barang"],
    price: ["sale_price", "original_price", "Harga Setelah Diskon", "Harga Awal", "Harga", "Price", "Unit Price", "Harga Jual (IDR)"],
    date: ["order_date", "Waktu Pesanan Dibuat", "Tanggal", "Date", "Created at", "Tanggal Transaksi", "Created Time"],
    endDate: ["complete_date", "Waktu Pesanan Selesai", "Completed Date", "Tanggal Selesai"],
    variant: ["variant", "Nama Variasi", "Variant", "Variation", "Size", "Ukuran"],
    courier: ["courier", "Opsi Pengiriman", "Kurir", "Courier", "Shipping Method"],
    shipping: ["shipping_cost", "Ongkos Kirim Dibayar oleh Pembeli", "Ongkir", "Shipping Fee", "Biaya Kirim", "Perkiraan Ongkos Kirim"],
    discount: ["discount", "Total Diskon", "Discount", "Diskon"],
    seller_discount: ["seller_discount", "Diskon Dari Penjual", "Seller Discount"],
    platform_discount: ["platform_discount", "Diskon Dari Shopee", "Platform Discount", "Marketplace Discount"],
    province: ["province", "Provinsi", "Province", "Region", "Wilayah"],
    city: ["city", "Kota/Kabupaten", "Kota", "City", "District"],
    status: ["order_status", "Status Pesanan", "Status", "Order Status", "Status Terakhir"],
    orderId: ["order_id", "No. Pesanan", "Order Number", "No Transaksi", "Invoice"],
    payment_method: ["payment_method", "Metode Pembayaran", "Payment Method", "Metode Bayar"],
};

/**
 * Get a value from a row using a universal key or its Indonesian fallbacks.
 */
export function getFieldValue(row: any, fieldKey: string, customFallbacks: string[] = []): any {
    if (!row) return undefined;

    // 1. Try exact match on fieldKey (often the universal key like 'product_name')
    if (row[fieldKey] !== undefined && row[fieldKey] !== null && row[fieldKey] !== "") return row[fieldKey];

    // 2. Try FIELD_MAP lookups (handles 'product', 'total', etc.)
    const mapHits = FIELD_MAP[fieldKey] || [];
    for (const hit of mapHits) {
        if (row[hit] !== undefined && row[hit] !== null && row[hit] !== "") return row[hit];
    }

    // 3. Try Universal Label from column-mapper
    const label = UNIVERSAL_FIELDS[fieldKey as UniversalField];
    if (label && row[label] !== undefined && row[label] !== null && row[label] !== "") return row[label];

    // 4. Try custom fallbacks
    for (const fb of customFallbacks) {
        if (row[fb] !== undefined && row[fb] !== null && row[fb] !== "") return row[fb];
    }

    // 5. Case-insensitive search as a last resort
    const lowerKeys = Object.keys(row).map(k => k.toLowerCase());
    const searchTerms = [fieldKey, label, ...mapHits, ...customFallbacks]
        .filter(Boolean)
        .map(t => String(t).toLowerCase());

    const rowKeys = Object.keys(row);
    for (let i = 0; i < rowKeys.length; i++) {
        if (searchTerms.includes(lowerKeys[i]) && row[rowKeys[i]] !== undefined && row[rowKeys[i]] !== null && row[rowKeys[i]] !== "") {
            return row[rowKeys[i]];
        }
    }

    return undefined;
}

/**
 * Get a numeric value from a row safely.
 */
export function getFieldNum(row: any, key: string, fallbacks: string[] = []): number {
    const val = getFieldValue(row, key, fallbacks);
    if (val === undefined || val === null || val === "" || val === "-") return 0;

    let num = 0;
    if (typeof val === "number") {
        num = val;
    } else {
        // Clean string and parse
        const str = String(val).replace(/rp/gi, "").trim();
        const cleanStr = str.replace(/[^\d.,\-]/g, "").replace(/,/g, ".");
        num = parseFloat(cleanStr) || 0;
    }

    // Shopee/Tokopedia Excel exports sometimes parse "93.060" (93 thousand) as "93.06" in javascript 
    // due to locale decimal confusion. If number is unexpectedly tiny but has fractional parts that look like thousands:
    if (num > 0 && num < 1000) {
        // e.g. 93.06 -> multiply by 1000 -> 93060
        num = num * 1000;
    }

    return num;
}

/**
 * Get a string value from a row safely.
 */
export function getFieldStr(row: any, key: string, fallbacks: string[] = []): string {
    const val = getFieldValue(row, key, fallbacks);
    return val !== undefined && val !== null ? String(val).trim() : "";
}

/**
 * Get a Date object from a row safely.
 */
export function getFieldDate(row: any, key: string, fallbacks: string[] = []): Date | null {
    const val = getFieldValue(row, key, fallbacks);
    if (val === undefined || val === null || val === "") return null;

    // 1. Handle Excel Serial Date (e.g., 44927) or Unix Timestamps
    if (typeof val === 'number' || (typeof val === 'string' && /^\d+(\.\d+)?$/.test(val))) {
        const num = Number(val);
        // Valid Excel Date typical range (year ~1954 to ~2173) -> (20000 to 100000)
        if (num > 20000 && num < 100000) {
            const date = new Date((Math.floor(num) - 25569) * 86400 * 1000);
            return isNaN(date.getTime()) ? null : date;
        }
        // If Unix timestamp in ms or s
        if (num > 1000000000) {
            const dMs = new Date(num);
            if (dMs.getFullYear() === 1970) { // likely timestamp was in seconds
                const dS = new Date(num * 1000);
                return isNaN(dS.getTime()) ? null : dS;
            }
            return isNaN(dMs.getTime()) ? null : dMs;
        }
    }

    // 2. Handle DD/MM/YYYY or DD-MM-YYYY formats safely
    if (typeof val === 'string') {
        const str = val.trim();
        // Regex to capture DD/MM/YYYY or DD-MM-YYYY (and optional time)
        const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (dmyMatch) {
            const [_, day, month, year] = dmyMatch;
            const rest = str.substring(dmyMatch[0].length);
            // Construct standard ISO string for parsing
            const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}${rest}`;
            const d = new Date(formatted);
            if (!isNaN(d.getTime())) return d;
        }
    }

    // 3. Fallback to native JS Date parser
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
        const yr = d.getFullYear();
        // Ensure parsed year is reasonable for E-Commerce / modern systems to avoid 1970 fallback
        if (yr > 2000 && yr <= new Date().getFullYear() + 5) {
            return d;
        }
    }

    return null;
}
