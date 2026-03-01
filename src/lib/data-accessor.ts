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
    total: ["total_payment", "Total Pembayaran", "Total Penjualan (IDR)", "Grand Total", "Total", "total", "subtotal", "Total Harga Produk", "Subtotal"],
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

    if (typeof val === "number") return val;

    // Clean string and parse
    const str = String(val).replace(/rp/gi, "").trim();
    const cleanStr = str.replace(/[^\d.,\-]/g, "").replace(/,/g, ".");
    return parseFloat(cleanStr) || 0;
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
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
}
