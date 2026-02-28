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
  // Sales / E-Commerce (Existing)
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
  customer_username: "Username Pelanggan", // new

  // Marketplace Logistics & Fees (Shopee/Tokped)
  product_weight: "Berat Produk (Gram)",
  pickup_instruction: "Instruksi Pengiriman",
  shipping_deadline: "Batas Waktu Kirim",
  estimated_shipping_fee: "Estimasi Ongkir",
  coin_cashback: "Cashback Koin",
  service_fee: "Biaya Layanan",
  admin_fee: "Biaya Admin",
  payment_fee: "Biaya Transaksi",
  bundle_discount: "Paket Diskon",
  voucher_code: "Kode Voucher",
  return_status: "Status Pengembalian",
  estimated_income: "Estimasi Pendapatan",
  total_weight: "Total Berat", // new
  seller_voucher: "Voucher Penjual", // new
  platform_voucher: "Voucher Platform", // new
  bundle_discount_seller: "Paket Diskon Penjual", // new
  bundle_discount_platform: "Paket Diskon Platform", // new
  return_shipping_cost: "Ongkir Pengembalian", // new
  total_quantity: "Total Jumlah Produk", // new
  credit_card_discount: "Diskon Kartu Kredit", // new
  shopee_coin_discount: "Potongan Koin Shopee", // new

  // Survey / Feedback
  question: "Pertanyaan",
  answer: "Jawaban",
  rating: "Rating/Skor",
  respondent: "Responden",
  survey_date: "Tanggal Survei",

  // Inventory / Stock
  warehouse: "Gudang",
  stock_current: "Stok Saat Ini",
  stock_in: "Barang Masuk",
  stock_out: "Barang Keluar",
  reorder_point: "Batas Restock",

  // HR / Employee
  employee_id: "ID Karyawan",
  employee_name: "Nama Karyawan",
  department: "Departemen",
  position: "Jabatan",
  salary: "Gaji",
  join_date: "Tanggal Bergabung",

  // Financial
  account_no: "No Rekening",
  debit: "Debit",
  credit: "Kredit",
  balance: "Saldo",
  transaction_type: "Tipe Transaksi",

  // Academic
  student_id: "NIM/NISN",
  student_name: "Nama Siswa/Mahasiswa",
  course: "Mata Pelajaran/Kuliah",
  grade: "Nilai",
  semester: "Semester",

  // Healthcare
  patient_id: "ID Pasien",
  diagnosis: "Diagnosis",
  treatment: "Tindakan",
  doctor: "Dokter",

  // Generic Generic (Fallback)
  category_1: "Kategori 1",
  category_2: "Kategori 2",
  value_1: "Nilai 1",
  value_2: "Nilai 2",
  generic_date: "Tanggal",
  generic_id: "ID",
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
    "no nota", "nomor nota", "receipt no", "reference", "kode",
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
    "harga final", "final price", "net price", "total harga produk"
  ],
  quantity: [
    "jumlah", "quantity", "qty", "kuantitas", "jumlah item", "amount",
    "jumlah barang", "pcs", "unit", "terjual", "sold",
  ],
  subtotal: [
    "total harga produk", "subtotal", "total harga", "total product price", "sub total",
    "subtotal after discount", "jumlah harga", "omset", "revenue", "pendapatan",
  ],
  total_payment: [
    "total pembayaran", "total payment", "total bayar", "grand total", "total order", "total pesanan",
    "amount paid", "total price", "total penjualan (idr)", "total penjualan", "total belanja",
    "total transaksi", "total (idr)", "bersih", "netto",
  ],

  // === DISCOUNTS ===
  discount: [
    "total diskon", "total discount", "diskon", "discount", "potongan", "potongan harga",
    "promo", "cashback", "sale",
  ],
  platform_discount: ["diskon dari shopee", "shopee discount", "diskon shopee", "platform discount", "diskon dari tokopedia", "diskon lazada", "diskon tiktok", "marketplace discount"],
  seller_discount: ["diskon dari penjual", "seller discount", "diskon seller", "diskon penjual", "diskon toko", "seller voucher", "voucher penjual", "platform voucher"],

  // === STATUS & LOGISTIK ===
  order_status: [
    "status pesanan", "status order", "status", "order status", "payment status",
    "status pembayaran", "kondisi", "state", "status_pesanan",
  ],
  order_date: [
    "waktu pesanan dibuat", "tanggal pesanan dibuat", "order date", "tanggal", "tanggal order", "tanggal transaksi",
    "waktu pesanan", "date", "created at", "waktu", "waktu transaksi", "tgl", "hari",
  ],
  payment_date: ["waktu pembayaran dilakukan", "waktu pembayaran", "tanggal pembayaran", "payment date", "tanggal bayar", "paid at", "waktu bayar", "tgl bayar"],
  ship_date: ["waktu pengiriman diatur", "waktu pengiriman", "tanggal pengiriman", "ship date", "tanggal kirim", "shipped at"],
  complete_date: ["waktu pesanan selesai", "tanggal selesai", "waktu selesai", "completed at", "complete date", "tgl selesai"],

  courier: ["opsi pengiriman", "kurir", "courier", "jasa kirim", "ekspedisi", "pengiriman", "shipping method", "logistic"],
  tracking_no: ["no. resi", "no resi", "nomor resi", "tracking number", "tracking no", "resi", "awb", "waybill"],
  shipping_cost: [
    "ongkos kirim dibayar oleh pembeli", "ongkos kirim", "ongkir", "shipping cost", "shipping fee", "biaya pengiriman",
    "biaya kirim", "ongkir ditanggung penjual",
  ],

  // === MARKETPLACE LOGISTICS & FEES ===
  product_weight: ["berat produk", "berat", "weight"],
  pickup_instruction: ["antar ke counter/ pick-up", "pickup", "metode pengiriman", "jenis pengiriman"],
  shipping_deadline: ["pesanan harus dikirimkan sebelum", "pesanan harus dikirimkan sebelum menghindari keterlambatan", "batas pengiriman", "batas waktu kirim", "shipping deadline"],
  estimated_shipping_fee: ["estimasi potongan biaya pengiriman", "potongan ongkir", "diskon ongkir"],
  coin_cashback: ["cashback koin shopee", "koin shopee", "koin", "cashback koin"],
  service_fee: ["biaya layanan", "service fee", "biaya penganan"],
  admin_fee: ["biaya admin", "admin fee", "biaya administrasi"],
  payment_fee: ["biaya transaksi", "biaya penanganan", "transaction fee"],
  bundle_discount: ["paket diskon", "bundle", "combo"],
  voucher_code: ["kode voucher", "voucher code"],
  return_status: ["status pembatalan/ pengembalian", "status retur", "return status", "pembatalan"],
  estimated_income: ["perkiraan penghasilan", "estimasi pendapatan", "income"],
  total_weight: ["total berat"],
  seller_voucher: ["voucher ditanggung penjual"],
  platform_voucher: ["voucher ditanggung shopee"],
  bundle_discount_seller: ["paket diskon diskon dari penjual"],
  bundle_discount_platform: ["paket diskon diskon dari shopee"],
  return_shipping_cost: ["ongkos kirim pengembalian barang", "ongkos kirim pengembalian"],
  estimated_shipping_cost: ["perkiraan ongkos kirim"],
  total_quantity: ["jumlah produk di pesan", "total quantity"],
  credit_card_discount: ["diskon kartu kredit"],
  shopee_coin_discount: ["potongan koin shopee"],

  // === CUSTOMER ===
  customer_name: [
    "nama penerima", "nama pembeli", "nama pelanggan", "customer name", "customer", "pelanggan",
    "pembeli", "client", "klien", "buyer", "buyer name", "user"
  ],
  customer_username: ["username pembeli", "username"],
  customer_phone: ["no telepon", "no handphone", "telepon", "phone", "no hp", "nomor hp", "phone number", "whatsapp", "wa"],
  address: ["alamat pengiriman", "alamat", "address", "shipping address", "delivery address", "jalan", "street"],
  city: ["kota/kabupaten", "kota", "kabupaten", "city", "regency", "region", "kab"],
  province: ["provinsi", "province", "state", "wilayah", "daerah"],
  payment_method: ["metode pembayaran", "metode bayar", "payment method", "cara bayar", "payment", "tipe pembayaran", "tunai", "cash", "transfer", "qris", "edc", "kredit"],

  // === MISC ===
  notes: ["catatan dari pembeli", "catatan", "notes", "remark", "keterangan", "memo", "pesan", "note", "deskripsi"],

  // === SURVEY / FEEDBACK ===
  question: ["pertanyaan", "question", "soal", "item penilaian", "aspek", "indikator"],
  answer: ["jawaban", "answer", "respon", "tanggapan", "komentar", "saran", "feedback", "ulasan", "review", "opini"],
  rating: ["rating", "skor", "score", "nilai", "kepuasan", "satisfaction", "penilaian", "bintang", "stars", "nps"],
  respondent: ["responden", "nama responden", "peserta", "participant", "pengisi", "email responden"],
  survey_date: ["tanggal survei", "waktu pengisian", "submit time", "timestamp", "recorded date"],

  // === INVENTORY / STOCK ===
  warehouse: ["gudang", "warehouse", "lokasi", "location", "cabang", "branch", "toko", "store"],
  stock_current: ["stok saat ini", "stok", "stock", "current stock", "sisa", "available", "on hand", "jumlah stok", "inventory"],
  stock_in: ["barang masuk", "in", "masuk", "received", "penerimaan", "pembelian", "purchase"],
  stock_out: ["barang keluar", "out", "keluar", "sold", "pengeluaran", "pemakaian", "used"],
  reorder_point: ["batas restock", "reorder point", "minimum stock", "stok minimum", "batas minimum", "safety stock"],

  // === HR / EMPLOYEE ===
  employee_id: ["id karyawan", "nik", "nip", "employee id", "staff id", "id pegawai"],
  employee_name: ["nama karyawan", "karyawan", "employee", "staff name", "nama pegawai", "nama pekerja"],
  department: ["departemen", "department", "divisi", "division", "unit", "bagian", "team", "tim"],
  position: ["jabatan", "position", "role", "title", "posisi", "pangkat", "job title", "level"],
  salary: ["gaji", "salary", "upah", "wage", "pendapatan", "income", "thp", "take home pay", "bonus", "tunjangan"],
  join_date: ["tanggal bergabung", "join date", "hire date", "tanggal masuk", "tgl masuk", "mulai kerja"],

  // === FINANCIAL ===
  account_no: ["no rekening", "rekening", "account no", "account number", "norek", "akun"],
  debit: ["debit", "uang masuk", "pemasukan", "deposit", "inflow", "terima"],
  credit: ["kredit", "uang keluar", "pengeluaran", "withdrawal", "outflow", "bayar", "biaya", "expense"],
  balance: ["saldo", "balance", "sisa saldo", "sisa kas", "current balance"],
  transaction_type: ["tipe transaksi", "jenis transaksi", "transaction type", "kategori transaksi", "mutasi"],

  // === ACADEMIC ===
  student_id: ["nim", "nis", "nisn", "student id", "id siswa", "id mahasiswa", "nomer induk"],
  student_name: ["nama siswa", "nama mahasiswa", "siswa", "mahasiswa", "student", "murid", "peserta didik"],
  course: ["mata pelajaran", "mapel", "mata kuliah", "matkul", "course", "subject", "kelas", "class", "pelajaran"],
  grade: ["nilai", "grade", "skor ujian", "ipk", "gpa", "hasil", "score"],
  semester: ["semester", "term", "tahun ajaran", "periode akademik", "tahun"],

  // === HEALTHCARE ===
  patient_id: ["id pasien", "no rm", "rekam medis", "patient id", "nomor pasien", "mrn"],
  diagnosis: ["diagnosis", "diagnosa", "penyakit", "disease", "condition", "keluhan"],
  treatment: ["tindakan", "perawatan", "treatment", "obat", "resep", "prosedur", "procedure", "terapi"],
  doctor: ["dokter", "doctor", "physician", "nama dokter", "nakes", "perawat", "spesialis"],

  // === GENERIC ===
  generic_id: ["id", "no", "nomor", "index", "uid", "uuid", "key"],
};

/** Normalize text for comparison */
function normalize(text: string): string {
  // Be careful not to destroy exact letters, just lowercase and standardize spacing
  return text.toLowerCase().replace(/[_\-\.\/\\()]/g, " ").replace(/\s+/g, " ").trim();
}

/** Calculate similarity between two strings */
function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1.0;
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

/** Generate an AI prompt to resolve low-confidence mappings */
export function generateAIFallbackPrompt(mappings: ColumnMapping[], domain: string = "generic"): string {
  const unmapped = mappings.filter(m => !m.mappedTo || m.confidence < 0.6);
  if (unmapped.length === 0) return "";

  const fieldsList = Object.entries(UNIVERSAL_FIELDS)
    .map(([k, v]) => `- ${k} (${v})`)
    .join("\n");

  const unmappedContext = unmapped.map(m =>
    `Kolom Asli: "${m.originalName}"\nSampel Data: ${JSON.stringify(m.sampleValues)}`
  ).join("\n\n");

  return `Kamu adalah AI Data Engineer. Tugasmu adalah melakukan mapping kolom yang tidak dikenali ke dalam Universal Fields kami.
Konteks / Domain Data: ${domain}

Universal Fields yang tersedia:
${fieldsList}

Berikut adalah kolom yang gagal di-mapping oleh algoritma kami:
${unmappedContext}

Tentukan "mappedTo" (pilih persis dari daftar Universal Fields di atas) untuk setiap kolom. Jika benar-benar tidak ada yang cocok, biarkan null.

Format jawaban harus HANYA JSON berformat:
{
  "mappings": [
    { "originalName": "...", "mappedTo": "..." }
  ]
}`;
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
          // If exact match found, we MUST accept it immediately to avoid fuzzy overwrites
          bestMatch = universalKey;
          bestScore = 1.0;
          break;
        }
      }
      if (bestScore === 1.0) break; // Break outer loop if perfect match found

      // Fuzzy match
      const score = Math.max(...aliases.map((a) => similarity(col, a)));
      // Increase strictness to avoid misclassifications for non-exact aliases
      if (score > bestScore && score > 0.7) {
        bestMatch = universalKey;
        bestScore = score;
      }
    }

    if (bestMatch && bestScore >= 0.7) usedMappings.add(bestMatch);

    mappings.push({
      originalName: col,
      mappedTo: bestScore >= 0.7 ? bestMatch : null,
      mappedLabel: bestScore >= 0.7 && bestMatch ? (UNIVERSAL_FIELDS as any)[bestMatch] || bestMatch : null,
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
