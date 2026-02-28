/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Platform Detector — Auto-detect data source from column fingerprints
 * Supports: Shopee, Tokopedia, Lazada, TikTok Shop, Bukalapak, POS Systems, Generic/UMKM
 */

export type Platform =
    | "shopee" | "tokopedia" | "lazada" | "tiktok_shop" | "bukalapak"
    | "pos_system" | "umkm_custom" | "unknown";

export interface DetectionResult {
    platform: Platform;
    confidence: number;
    label: string;
    icon: string;
    matchedColumns: string[];
}

// Unique fingerprint columns per platform
const PLATFORM_FINGERPRINTS: Record<Platform, { label: string; icon: string; columns: string[] }> = {
    shopee: {
        label: "Shopee", icon: "🛒",
        columns: [
            "No. Pesanan", "Status Pesanan", "Nama Produk", "Nama Variasi",
            "Waktu Pesanan Dibuat", "Waktu Pembayaran Dilakukan", "Waktu Pengiriman Diatur",
            "Total Pembayaran", "Ongkos Kirim Dibayar oleh Pembeli", "Username (Pembeli)",
            "Paket Diskon (Diskon dari Shopee)"
        ],
    },
    tokopedia: {
        label: "Tokopedia", icon: "🟢",
        columns: ["Nomor Invoice", "Nama Pembeli", "Nama Barang", "Harga Jual (IDR)",
            "Jumlah Barang", "Kurir", "Ongkos Kirim (IDR)", "Total Penjualan (IDR)",
            "Tanggal Pembayaran", "Status Terakhir"],
    },
    lazada: {
        label: "Lazada", icon: "🔵",
        columns: ["Order Number", "Order Status", "Item Name", "Variation",
            "Unit Price", "Seller Discount", "Shipping Fee (Paid By Buyer)",
            "Buyer Name", "Shipping Address", "Created at"],
    },
    tiktok_shop: {
        label: "TikTok Shop", icon: "🎵",
        columns: ["Order ID", "Product Name", "SKU Name", "Variation",
            "Original Price", "Deal Price", "Quantity", "Subtotal After Discount",
            "Shipping Fee", "Buyer Username", "Created Time"],
    },
    bukalapak: {
        label: "Bukalapak", icon: "🔴",
        columns: ["No Transaksi", "Produk", "Jumlah", "Harga Satuan",
            "Total Harga", "Kurir", "Ongkos Kirim", "Nama Penerima",
            "Status", "Tanggal Transaksi"],
    },
    pos_system: {
        label: "Sistem POS / Kasir", icon: "🏪",
        columns: ["No Nota", "Tanggal", "Kasir", "Item", "Qty", "Harga",
            "Subtotal", "Diskon", "Total", "Metode Bayar", "Tunai", "Kembalian"],
    },
    umkm_custom: {
        label: "Data UMKM Custom", icon: "📋",
        columns: [],  // fallback
    },
    unknown: {
        label: "Format Tidak Dikenal", icon: "❓",
        columns: [],
    },
};

function normalize(s: string): string {
    return s.toLowerCase().trim().replace(/[_\-\.\/\\()]/g, " ").replace(/\s+/g, " ");
}

/**
 * Detect which platform the data came from
 */
export function detectPlatform(columns: string[]): DetectionResult {
    const normalizedCols = columns.map(normalize);
    let bestPlatform: Platform = "unknown";
    let bestScore = 0;
    let bestMatches: string[] = [];

    for (const [platform, config] of Object.entries(PLATFORM_FINGERPRINTS)) {
        if (platform === "umkm_custom" || platform === "unknown") continue;

        const matched = config.columns.filter((fp) =>
            normalizedCols.some((col) => {
                const nfp = normalize(fp);
                return col === nfp || col.includes(nfp) || nfp.includes(col);
            })
        );

        const score = matched.length / config.columns.length;
        if (score > bestScore) {
            bestScore = score;
            bestPlatform = platform as Platform;
            bestMatches = matched;
        }
    }

    // If confidence too low, check for generic sales data patterns
    if (bestScore < 0.3) {
        const genericSalesFields = ["product", "produk", "item", "barang", "qty", "quantity", "jumlah",
            "price", "harga", "total", "date", "tanggal", "customer", "pelanggan", "pembeli"];
        const genericMatches = genericSalesFields.filter((gf) =>
            normalizedCols.some((col) => col.includes(gf))
        );

        if (genericMatches.length >= 3) {
            return {
                platform: "umkm_custom",
                confidence: Math.min(0.8, genericMatches.length / 5),
                label: PLATFORM_FINGERPRINTS.umkm_custom.label,
                icon: PLATFORM_FINGERPRINTS.umkm_custom.icon,
                matchedColumns: genericMatches,
            };
        }

        return {
            platform: "unknown",
            confidence: 0,
            label: PLATFORM_FINGERPRINTS.unknown.label,
            icon: PLATFORM_FINGERPRINTS.unknown.icon,
            matchedColumns: [],
        };
    }

    return {
        platform: bestPlatform,
        confidence: Math.round(bestScore * 100) / 100,
        label: PLATFORM_FINGERPRINTS[bestPlatform].label,
        icon: PLATFORM_FINGERPRINTS[bestPlatform].icon,
        matchedColumns: bestMatches,
    };
}
