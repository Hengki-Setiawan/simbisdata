/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Universal Column Mapper — Auto-detect & fuzzy-match columns from ANY sales data
 * Supports: Shopee, Tokopedia, Lazada, TikTok Shop, Bukalapak, POS, UMKM custom, generic English
 *
 * Maps everything to UNIVERSAL field names for the analysis engine.
 */

// ═══════════════════════════════════════════════════════════
// UNIVERSAL SCHEMA — all platforms map to these standard names
// ═══════════════════════════════════════════════════════════
export const UNIVERSAL_FIELDS = {
  order_id: "ID Pesanan",
  product_name: "Nama Produk",
  variant: "Variasi",
  sku: "SKU",
  original_price: "Harga Awal",
  sale_price: "Harga Jual",
  quantity: "Jumlah",
  subtotal: "Subtotal",
  total_payment: "Total Pembayaran",
  discount: "Diskon",
  platform_discount: "Diskon Platform",
  seller_discount: "Diskon Penjual",
  order_status: "Status",
  order_date: "Tanggal",
  payment_date: "Tanggal Bayar",
  ship_date: "Tanggal Kirim",
  complete_date: "Tanggal Selesai",
  courier: "Kurir",
  tracking_no: "No Resi",
  shipping_cost: "Ongkos Kirim",
  customer_name: "Nama Pelanggan",
  customer_phone: "Telepon",
  address: "Alamat",
  city: "Kota",
  province: "Provinsi",
  payment_method: "Metode Bayar",
  notes: "Catatan",
} as const;

export type UniversalField = keyof typeof UNIVERSAL_FIELDS;

// ═══════════════════════════════════════════════════════════
// COLUMN ALIASES — all known column name variants per field
// ═══════════════════════════════════════════════════════════
const COLUMN_ALIASES: Record<string, string[]> = {
  // === ORDER ID ===
  order_id: [
    "no. pesanan", "no pesanan", "order number", "order id", "nomor pesanan", "order no", "id pesanan", "no order",
    "nomor invoice", "no invoice", "invoice", "no transaksi", "nomor transaksi", "transaction id",
    "no nota", "nomor nota", "receipt no", "reference", "id", "kode",
  ],

  // === PRODUCT ===
  product_name: [
    "nama produk", "product name", "product", "produk", "nama_produk", "item name", "nama barang", "nama item",
    "judul produk", "item", "barang", "description", "deskripsi", "menu", "layanan", "service", "jasa",
  ],
  variant: [
    "nama variasi", "variant", "variasi", "variation", "size", "ukuran", "warna", "color", "varian",
    "sku name", "opsi", "option", "tipe", "type", "model",
  ],
  sku: ["sku", "sku induk", "nomor referensi sku", "sku number", "product sku", "kode produk", "kode sku",
    "kode barang", "barcode", "product code", "item code",
  ],

  // === PRICING ===
  original_price: [
    "harga awal", "harga asli", "original price", "price", "harga", "unit price", "harga satuan",
    "harga jual (idr)", "harga jual", "selling price", "harga per item", "modal", "hpp", "harga pokok",
  ],
  sale_price: [
    "harga setelah diskon", "harga diskon", "discounted price", "deal price", "sale price", "harga promo",
    "harga final", "final price", "net price",
  ],
  quantity: [
    "jumlah", "quantity", "qty", "kuantitas", "jumlah produk", "jumlah item", "amount",
    "jumlah barang", "pcs", "unit", "terjual", "sold",
  ],
  subtotal: [
    "total harga produk", "subtotal", "total harga", "total product price", "sub total",
    "subtotal after discount", "jumlah harga", "omset", "revenue", "pendapatan",
  ],
  total_payment: [
    "total pembayaran", "total payment", "total bayar", "grand total", "total order", "total",
    "amount paid", "total price", "total penjualan (idr)", "total penjualan", "total belanja",
    "total transaksi", "total (idr)", "bersih", "netto",
  ],

  // === DISCOUNTS ===
  discount: [
    "total diskon", "total discount", "diskon", "discount", "potongan", "potongan harga",
    "promo", "cashback", "sale",
  ],
  platform_discount: [
    "diskon dari shopee", "shopee discount", "diskon shopee", "platform discount",
    "diskon dari tokopedia", "diskon lazada", "diskon tiktok", "marketplace discount",
    "seller discount",
  ],
  seller_discount: [
    "diskon dari penjual", "seller discount", "diskon seller", "diskon penjual", "diskon toko",
    "voucher ditanggung penjual", "seller voucher", "voucher penjual",
    "voucher ditanggung shopee", "shopee voucher", "voucher shopee", "platform voucher",
  ],

  // === STATUS ===
  order_status: [
    "status pesanan", "order status", "status", "status order", "status terakhir",
    "status pembatalan/ pengembalian", "cancel status", "return status",
    "status transaksi", "keterangan",
  ],

  // === DATES ===
  order_date: [
    "waktu pesanan dibuat", "order date", "tanggal pesanan", "tanggal order", "created at",
    "date", "tanggal", "order time", "waktu order", "tgl pesanan", "created time",
    "tanggal pembayaran", "tanggal transaksi", "tgl transaksi", "transaction date",
    "waktu", "datetime", "hari", "bulan",
  ],
  payment_date: [
    "waktu pembayaran dilakukan", "payment date", "tanggal bayar", "paid at", "waktu bayar",
    "tgl bayar",
  ],
  ship_date: [
    "waktu pengiriman diatur", "shipping date", "tanggal kirim", "ship date",
    "tgl kirim", "shipped at",
  ],
  complete_date: [
    "waktu pesanan selesai", "completed date", "tanggal selesai", "delivered at",
    "completion date", "tgl selesai", "selesai",
  ],

  // === SHIPPING ===
  courier: [
    "opsi pengiriman", "shipping option", "kurir", "courier", "jasa kirim", "logistik",
    "shipping method", "ekspedisi", "carrier", "pengiriman",
  ],
  tracking_no: [
    "no. resi", "no resi", "tracking number", "resi", "tracking", "awb", "awb number", "nomor pelacakan",
  ],
  shipping_cost: [
    "ongkos kirim dibayar oleh pembeli", "shipping fee", "ongkir", "ongkos kirim",
    "biaya kirim", "shipping cost", "ongkos kirim (idr)", "shipping fee (paid by buyer)",
    "perkiraan ongkos kirim", "estimasi ongkir", "biaya ongkir", "pengiriman (idr)",
  ],

  // === CUSTOMER ===
  customer_name: [
    "username (pembeli)", "username", "pembeli", "buyer", "buyer name", "customer",
    "pelanggan", "nama pembeli", "customer name", "nama penerima", "recipient",
    "penerima", "recipient name", "nama customer", "nama pelanggan", "konsumen",
    "client", "nama client", "tamu", "klien",
  ],
  customer_phone: [
    "no. telepon", "no telepon", "phone", "telepon", "no hp", "handphone",
    "phone number", "hp", "nomor hp", "kontak", "whatsapp", "wa",
  ],
  address: [
    "alamat pengiriman", "address", "alamat", "shipping address", "alamat kirim",
    "alamat lengkap", "full address", "lokasi",
  ],
  city: [
    "kota/kabupaten", "kota", "kabupaten", "city", "district", "kota/kab",
    "kecamatan", "kelurahan",
  ],
  province: [
    "provinsi", "province", "propinsi", "state", "region", "wilayah", "area",
  ],

  // === PAYMENT ===
  payment_method: [
    "metode pembayaran", "payment method", "metode bayar", "cara bayar", "payment type",
    "metode", "pembayaran", "tunai", "cash", "transfer", "tipe pembayaran", "qris", "edc", "kredit",
  ],

  // === MISC ===
  notes: [
    "catatan", "notes", "keterangan", "remark", "memo", "pesan", "note", "deskripsi",
  ],
};

/** Normalize text for comparison */
function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/[_\-\.\/\\()]/g, " ").replace(/\s+/g, " ");
}

/** Calculate similarity between two strings */
function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1.0;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const wordsA = new Set(na.split(" "));
  const wordsB = new Set(nb.split(" "));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? intersection / union : 0;
}

export interface ColumnMapping {
  originalName: string;
  mappedTo: string | null;       // Universal field key (e.g. "product_name")
  mappedLabel: string | null;    // Human label (e.g. "Nama Produk")
  confidence: number;
  dataType: "text" | "number" | "date" | "category";
  sampleValues: string[];
}

/** Detect column data type from sample values */
function detectType(values: any[]): "text" | "number" | "date" | "category" {
  const nonEmpty = values.filter((v) => v != null && v !== "");
  if (nonEmpty.length === 0) return "text";
  const numericCount = nonEmpty.filter((v) => !isNaN(parseFloat(String(v).replace(/[^\d.,\-]/g, "")))).length;
  if (numericCount / nonEmpty.length > 0.7) return "number";
  const datePatterns = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/;
  const dateCount = nonEmpty.filter((v) => datePatterns.test(String(v)) || v instanceof Date).length;
  if (dateCount / nonEmpty.length > 0.5) return "date";
  const uniqueValues = new Set(nonEmpty.map(String));
  if (uniqueValues.size < Math.min(10, nonEmpty.length * 0.3)) return "category";
  return "text";
}

/**
 * Auto-map columns from any uploaded file to universal field names
 */
export function autoMapColumns(rows: Record<string, any>[]): ColumnMapping[] {
  if (rows.length === 0) return [];
  const columns = Object.keys(rows[0]);
  const mappings: ColumnMapping[] = [];
  const usedMappings = new Set<string>();

  for (const col of columns) {
    const sampleValues = rows.slice(0, 20).map((r) => r[col]).filter((v) => v != null && v !== "");
    const dataType = detectType(sampleValues);
    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const [universalKey, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (usedMappings.has(universalKey)) continue;
      const normalCol = normalize(col);

      // Exact alias match
      for (const alias of aliases) {
        if (normalCol === normalize(alias)) {
          bestMatch = universalKey;
          bestScore = 0.95;
          break;
        }
      }
      if (bestScore >= 0.95) break;

      // Fuzzy match
      const score = Math.max(...aliases.map((a) => similarity(col, a)));
      if (score > bestScore && score > 0.4) {
        bestMatch = universalKey;
        bestScore = score;
      }
    }

    if (bestMatch && bestScore >= 0.4) usedMappings.add(bestMatch);

    mappings.push({
      originalName: col,
      mappedTo: bestScore >= 0.4 ? bestMatch : null,
      mappedLabel: bestScore >= 0.4 && bestMatch ? (UNIVERSAL_FIELDS as any)[bestMatch] || bestMatch : null,
      confidence: Math.round(bestScore * 100) / 100,
      dataType,
      sampleValues: sampleValues.slice(0, 5).map(String),
    });
  }

  return mappings;
}

/**
 * Apply mapping — rename columns to universal field keys
 */
export function applyMapping(rows: Record<string, any>[], mappings: ColumnMapping[]): Record<string, any>[] {
  const map = new Map<string, string>();
  mappings.forEach((m) => {
    if (m.mappedTo) map.set(m.originalName, m.mappedTo);
  });

  return rows.map((row) => {
    const newRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      const mappedKey = map.get(key) || key;
      // Also inject the mappedLabel (e.g. "Total Pembayaran") so the universal analysis system
      // can gracefully fall back to it based on UNIVERSAL_FIELDS definitions if needed.
      newRow[mappedKey] = value;

      const uFieldLabel = UNIVERSAL_FIELDS[mappedKey as UniversalField];
      if (uFieldLabel) {
        newRow[uFieldLabel] = value;
      }
    }
    return newRow;
  });
}

/** Get unmapped columns that need user attention */
export function getUnmappedColumns(mappings: ColumnMapping[]): ColumnMapping[] {
  return mappings.filter((m) => !m.mappedTo || m.confidence < 0.6);
}

/** Get available universal fields not yet mapped */
export function getAvailableFields(mappings: ColumnMapping[]): { key: string; label: string }[] {
  const mapped = new Set(mappings.filter((m) => m.mappedTo).map((m) => m.mappedTo!));
  return Object.entries(UNIVERSAL_FIELDS)
    .filter(([key]) => !mapped.has(key))
    .map(([key, label]) => ({ key, label: `${label} (${key})` }));
}
