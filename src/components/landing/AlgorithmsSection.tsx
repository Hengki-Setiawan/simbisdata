"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlayCircle, BarChart2, Star, Lock } from "lucide-react";

type Tier = "Free" | "Starter" | "Pro" | "Enterprise";

const algorithms = [
    { name: "Time Series Forecasting", desc: "ARIMA / Prophet / Exponential Smoothing", category: "Prediksi", tier: "Starter" as Tier, details: "Menganalisis pola data historis (tren dan musim) untuk memprediksi volume penjualan dan revenue di masa depan hingga 90 hari ke depan.", demoHint: "Data bulan lalu dimasukkan ke dalam model statistik untuk menarik garis perkiraan penjualan bulan berikutnya." },
    { name: "K-Means Clustering", desc: "Segmentasi pelanggan otomatis", category: "Segmentasi", tier: "Pro" as Tier, details: "Menggunakan algoritma K-Means++ untuk mencari titik temu (centroid) dari karakteristik pelanggan dan membagi mereka ke dalam kelompok (misal: Sultan, Hemat, Langka).", demoHint: "Algoritma akan menata titik (pelanggan) yang berdekatan sifat belanjanya ke dalam satu warna secara otomatis di 3D Scatter Plot." },
    { name: "Association Rules", desc: "Apriori / FP-Growth bundling produk", category: "Produk", tier: "Starter" as Tier, details: "Market Basket Analysis. Mencari tahu jika produk A dibeli, probabilitas produk B ikut dibeli secara bersamaan berapa persen.", demoHint: "Jika 'Kaos Hitam' dibeli, sistem merekomendasikan bundling dengan 'Topi Hitam' (Confidence 85%)." },
    { name: "RFM Analysis", desc: "Recency, Frequency, Monetary scoring", category: "Pelanggan", tier: "Free" as Tier, details: "Memberikan skor 1-5 berdasarkan kapan terakhir beli (Recency), seberapa sering (Frequency), dan total belanjanya (Monetary).", demoHint: "Pelanggan yang sudah lama tidak beli (Recency rendah) akan otomatis difilter masuk ke daftar target Kampanye Promo Win-Back." },
    { name: "Customer Churn Prediction", desc: "Survival Analysis / Random Forest", category: "Pelanggan", tier: "Enterprise" as Tier, details: "Memprediksi probabilitas (dalam persen) pelanggan setia kamu akan pindah berbelanja ke toko lain alias berhenti berlangganan bulan depan.", demoHint: "Sistem mendeteksi gap pembelian yang mulai menjauh dan memperingatkan: 'User B kemungkinan besar akan Churn minggu depan'." },
    { name: "Inventory Optimization", desc: "Economic Order Quantity (EOQ)", category: "Logistik", tier: "Pro" as Tier, details: "Menghitung secara akurat berapa jumlah barang spesifik yang harus distok ulang kapan untuk meminimalkan biaya penyimpanan pergudangan namun mencegah kehabisan stok.", demoHint: "Sistem merekomendasikan: 'Restok hanya 40pcs variasi L pada 15 April untuk efisiensi gudang maksimal'." },
    { name: "Cohort Analysis", desc: "Retensi pelanggan per periode", category: "Pelanggan", tier: "Starter" as Tier, details: "Membuat Heatmap Segitiga untuk melacak dari 100% orang yang beli di Januari, berapa persen yang beli lagi di Februari, Maret, dsb.", demoHint: "Cell Heatmap akan berwarna semakin merah menyala jika tingkat retensinya menurun drastis di bulan ke-N." },
    { name: "Customer Lifetime Value", desc: "Prediksi nilai total pelanggan", category: "Pelanggan", tier: "Pro" as Tier, details: "Gagal paham batas wajar budget iklan? Algoritma ini memprediksi total uang yang RELATIF akan dibelanjakan pelanggan seumur hidup mereka pada tokomu.", demoHint: "Pelanggan C bernilai Rp2.500.000 selama 2 tahun ke depan, alokasikan CAC maksimal Rp250.000 untuk pelanggan serupa." },
    { name: "Price Sensitivity", desc: "Elastisitas harga & sweet spot", category: "Harga", tier: "Pro" as Tier, details: "Mendeteksi seberapa sensitif target pasarmu terhadap kenaikan harga dan menemukan 'Sweet Spot' di mana harga tertinggi vs demand seimbang.", demoHint: "Kurva Elastisitas akan menunjukkan margin keuntungan tertinggi jatuh pada harga diskon Rp89.000, bukan Rp95.000." },
    { name: "Anomaly Detection", desc: "Isolation Forest / Z-Score", category: "Deteksi", tier: "Pro" as Tier, details: "Mendeteksi secara otomatis penurunan sales tajam atau lonjakan ekstrem yang tidak biasa di data harianmu dan membersihkannya dari laporan utama.", demoHint: "Sistem menandai titik merah pada grafik penjulan Kamis lalu sebagai anomali akibat adanya bug checkout massal." },
    { name: "ABC Analysis", desc: "Klasifikasi produk 80/20 Pareto", category: "Produk", tier: "Free" as Tier, details: "Membagi produk ke klasifikasi A (menyumbang 80% revenue), B (15%), dan C (5%). Fokuskan stok dan energi ke kelas A (Super-star).", demoHint: "Grafik tangga memvisualisasikan bagaimana 3 produkmu nyatanya menopang 80% seluruh pendapatan toko bulanan." },
    { name: "Seasonal Decomposition", desc: "Pisah tren, musiman, noise", category: "Tren", tier: "Pro" as Tier, details: "Memecah gelombang data mentah menjadi 3 sub-gelombang: Tren jangka panjang, Siklus Musiman Mingguan/Bulanan, dan Random Noise.", demoHint: "Membantu menelanjangi pola 'Setiap selasa penjualan selalu turun' secara saintifik." },
    { name: "Funnel Analysis", desc: "Konversi tiap tahap order", category: "Konversi", tier: "Free" as Tier, details: "Diagram Corong dari tahap 'Dibuat', 'Dibayar', hingga 'Selesai'. Mencari di mana kebocoran pelanggan terbanyak saat proses checkout terjadi.", demoHint: "Terlihat 30% pelanggan batal beli setelah melihat Biaya Ongkos Kirim yang terlampau membengkak di layar Cart." },
    { name: "Geographic Heatmap", desc: "Distribusi penjualan per wilayah", category: "Regional", tier: "Starter" as Tier, details: "Visualisasi interaktif intensi pembelian ke dalam Peta Tematik Indonesia. Semakin gelap provinsinya, semakin laku terjual.", demoHint: "Jawa Barat berwana Paling Gelap, sistem menyarankan untuk mendaftar layanan Fulfillment (Gudang) di Bandung." },
    { name: "Shipping Optimization", desc: "Cost-efficiency per rute kirim", category: "Logistik", tier: "Pro" as Tier, details: "Analisis performa kurir dan optimalisasi beban subsidi ongkir per pulau agar margin keuntungan bersih tidak tergerus.", demoHint: "Sistem menyarankan: Hanya pakai J&T dan SiCepat di rute Sumatera, dan matikan opsi instant delivery luar radius 15km." },
    { name: "Product Scoring", desc: "Skor performa 0-100 per produk", category: "Produk", tier: "Starter" as Tier, details: "Memberikan nilai rapot (A-E) pada setiap produk berdasarkan gabungan bobot (laku keras, jarang diretur, dan margin profit tinggi).", demoHint: "Barang X dibilang Laku Keras tapi Return Rate nya 20%+, maka ML hanya memberinya skor C (Waspada)." },
];

const categoryColors: Record<string, string> = {
    Prediksi: "var(--primary)",
    Segmentasi: "var(--accent)",
    Pelanggan: "var(--success)",
    Produk: "var(--warning)",
    Deteksi: "var(--danger)",
    Harga: "#a78bfa",
    Tren: "var(--primary-light)",
    Statistik: "var(--accent-dark)",
    Konversi: "#f472b6",
    Regional: "#fbbf24",
    Logistik: "#34d399",
};

const tierColors: Record<Tier, string> = {
    Free: "linear-gradient(135deg, #10b981, #059669)",     // Emerald
    Starter: "linear-gradient(135deg, #3b82f6, #2563eb)",  // Blue
    Pro: "linear-gradient(135deg, #a855f7, #7e22ce)",      // Purple
    Enterprise: "linear-gradient(135deg, #eab308, #ca8a04)",// Gold
};

export default function AlgorithmsSection() {
    const [selectedAlgo, setSelectedAlgo] = useState<(typeof algorithms)[0] | null>(null);

    return (
        <section id="algorithms" className="section" style={{ background: "var(--bg-surface)", position: "relative" }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="section-title">
                        <span className="gradient-text">16+ Algoritma</span> Machine Learning
                    </h2>
                    <p className="section-subtitle">
                        Bukan sekadar grafik biasa. Saat kamu klik proses, sistem akan memuat Web Workers untuk mengkalkulasi Machine Learning kelas analitik pro di background secara mulus sesuai akses Tier Plan-mu.
                    </p>
                </motion.div>

                <motion.div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: "16px",
                    }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ staggerChildren: 0.05 }}
                >
                    {algorithms.map((algo, i) => (
                        <motion.div
                            key={i}
                            className="glass-card"
                            style={{ padding: "24px", cursor: "pointer", position: "relative", overflow: "hidden" }}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.03 }}
                            whileHover={{ scale: 1.02, y: -4, boxShadow: "0px 10px 30px rgba(0,0,0,0.3)" }}
                            onClick={() => setSelectedAlgo(algo)}
                        >
                            {/* Tier Badge */}
                            <div style={{
                                position: "absolute", top: "16px", right: "16px",
                                background: tierColors[algo.tier], color: "#fff",
                                padding: "4px 10px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 800,
                                display: "flex", alignItems: "center", gap: "4px",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                            }}>
                                {algo.tier === "Free" ? <Star size={10} fill="#fff" /> : <Lock size={10} />}
                                {algo.tier}
                            </div>

                            <span
                                style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "1px",
                                    color: categoryColors[algo.category] || "var(--text-muted)",
                                }}
                            >
                                {algo.category}
                            </span>
                            <h4 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "10px 0 8px", lineHeight: 1.3, paddingRight: "70px" }}>
                                {algo.name}
                            </h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                                {algo.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Interactive Algorithm Modal Popup */}
            <AnimatePresence>
                {selectedAlgo && (
                    <div style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 9999,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "20px"
                    }}>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAlgo(null)}
                            style={{
                                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                                background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)"
                            }}
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{
                                background: "var(--bg-glass)", border: "1px solid var(--border-color)",
                                padding: "32px", borderRadius: "24px", maxWidth: "500px", width: "100%",
                                position: "relative", zIndex: 10,
                                margin: "auto",
                                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                                overflow: "hidden" // Contains children
                            }}
                        >
                            {/* Accent Glow */}
                            <div style={{
                                position: "absolute", top: "-50px", left: "-50px", width: "200px", height: "200px",
                                background: categoryColors[selectedAlgo.category] || "var(--primary)",
                                filter: "blur(100px)", opacity: 0.15, borderRadius: "50%", zIndex: 0, pointerEvents: "none"
                            }} />

                            <div style={{ position: "relative", zIndex: 1 }}>
                                <button
                                    onClick={() => setSelectedAlgo(null)}
                                    style={{
                                        position: "absolute", top: "-10px", right: "-10px",
                                        background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", color: "white",
                                        width: "36px", height: "36px", borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer", transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "scale(1)"; }}
                                >
                                    <X size={18} />
                                </button>

                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                    <span style={{
                                        color: categoryColors[selectedAlgo.category] || "white",
                                        fontWeight: 800, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px"
                                    }}>
                                        {selectedAlgo.category}
                                    </span>
                                    <span style={{
                                        background: tierColors[selectedAlgo.tier], padding: "4px 10px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 800, color: "white",
                                        display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
                                    }}>
                                        {selectedAlgo.tier === "Free" ? <Star size={10} fill="#fff" /> : <Lock size={10} />}
                                        {selectedAlgo.tier} TIER
                                    </span>
                                </div>

                                <h3 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px", lineHeight: 1.2 }}>
                                    {selectedAlgo.name}
                                </h3>
                                <p style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: "1rem", marginBottom: "24px", lineHeight: 1.5 }}>
                                    {selectedAlgo.desc}
                                </p>

                                <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", marginBottom: "24px" }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
                                        <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                            <BarChart2 size={24} color={categoryColors[selectedAlgo.category] || "var(--accent)"} />
                                        </div>
                                        <div>
                                            <h5 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "6px", color: "white" }}>Cara Kerja Sains</h5>
                                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{selectedAlgo.details}</p>
                                        </div>
                                    </div>
                                    <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "16px 0" }} />
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                        <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                            <PlayCircle size={24} color="var(--success)" />
                                        </div>
                                        <div>
                                            <h5 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "6px", color: "white" }}>Contoh Eksekusi di Dashboard</h5>
                                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{selectedAlgo.demoHint}</p>
                                        </div>
                                    </div>
                                </div>

                                <button style={{
                                    width: "100%", padding: "16px", background: "white",
                                    border: "none", color: "black", fontWeight: 800, fontSize: "1rem", borderRadius: "14px",
                                    cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                                }}
                                    onClick={() => window.location.href = '/demo'}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(255,255,255,0.3)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                                >
                                    Coba Simulasi di Live Demo
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
