"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const faqs = [
    { q: "Apa itu simbisai?", a: "simbisai adalah platform SaaS yang membantu UMKM Indonesia menganalisis data penjualan menggunakan Machine Learning dan AI. Upload file Excel dari marketplace manapun (Shopee, Tokopedia, Lazada, TikTok Shop) atau data penjualan sendiri, dan dapatkan insight bisnis otomatis." },
    { q: "File apa saja yang bisa diupload?", a: "simbisai mendukung file Excel (.xlsx, .xls) dan CSV dari marketplace manapun: Shopee, Tokopedia, Lazada, TikTok Shop, Bukalapak, atau data penjualan UMKM sendiri. Sistem akan otomatis mendeteksi format dan memetakan kolom." },
    { q: "Apakah data saya aman?", a: "Ya, semua data diproses secara aman. File yang diupload hanya digunakan untuk analisis dan tidak dibagikan ke pihak ketiga. Data dienkripsi saat transit dan disimpan di server yang aman." },
    { q: "Apa perbedaan antara tiap paket?", a: "Paket Free cocok untuk mencoba dengan batas 2 file/bulan dan 500 baris. Starter menambah ML algorithms dan AI narasi. Pro memberikan akses ke semua fitur termasuk Premium PDF dan Customer Segmentation. Enterprise untuk skala besar dengan API access dan multi-user." },
    { q: "Bagaimana cara kerja AI Insight?", a: "Setelah data dianalisis oleh algoritma ML, hasilnya dikirim ke Groq AI (LLM super cepat) yang menterjemahkan angka-angka menjadi narasi dan rekomendasi bisnis dalam bahasa Indonesia yang mudah dipahami." },
    { q: "Berapa lama proses analisis?", a: "Analisis biasanya selesai dalam 5-15 detik tergantung jumlah baris data. AI narasi membutuhkan 2-5 detik tambahan. Total di bawah 20 detik untuk sebagian besar file." },
    { q: "Bisa cancel subscription kapan saja?", a: "Ya, Anda bisa cancel subscription kapan saja dari halaman Settings. Akses fitur premium akan tetap aktif sampai akhir periode billing yang sudah dibayar." },
    { q: "Apakah tersedia versi demo?", a: "Ya, hubungi tim kami untuk mendapatkan demo token 7 hari dengan akses Pro tier. Anda bisa mencoba semua fitur premium tanpa komitmen." },
    { q: "Algoritma ML apa saja yang digunakan?", a: "simbisai menggunakan K-Means Clustering (segmentasi customer), Anomaly Detection (Z-Score), Product Performance Scoring, RFM Analysis, Time Series Forecasting, Association Rule Mining, dan lainnya." },
    { q: "Bagaimana cara export laporan?", a: "Tersedia 4 format: PDF (laporan text), Excel (12 sheet terpisah), CSV (ringkasan), dan Premium PDF (render pixel-perfect via Browserless.io untuk tier Pro+). Cukup klik tombol Export di dashboard." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div className="glass-card" style={{ padding: "0", marginBottom: "8px", overflow: "hidden" }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => setOpen(!open)} style={{
                width: "100%", padding: "20px 24px", background: "none", border: "none",
                color: "var(--text-primary)", cursor: "pointer", display: "flex", justifyContent: "space-between",
                alignItems: "center", textAlign: "left", fontSize: "0.95rem", fontWeight: 600,
            }}>
                {q}
                {open ? <ChevronUp size={18} style={{ flexShrink: 0, color: "var(--primary)" }} /> : <ChevronDown size={18} style={{ flexShrink: 0, color: "var(--text-muted)" }} />}
            </button>
            {open && (
                <div style={{ padding: "0 24px 20px", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                    {a}
                </div>
            )}
        </motion.div>
    );
}

export default function FAQPage() {
    return (
        <div style={{ minHeight: "100vh", padding: "80px 24px 60px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <Link href="/" style={{ textDecoration: "none", color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "16px", display: "block" }}>← Kembali ke Beranda</Link>
                    <HelpCircle size={48} style={{ color: "var(--primary)", marginBottom: "16px" }} />
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "12px" }}>Pertanyaan yang Sering Diajukan</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>Jawaban untuk pertanyaan umum tentang simbisai.</p>
                </div>
                {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
                <div style={{ textAlign: "center", marginTop: "40px" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "16px" }}>Masih ada pertanyaan?</p>
                    <Link href="/register" className="btn-primary" style={{ padding: "12px 32px" }}>Hubungi Kami</Link>
                </div>
            </div>
        </div>
    );
}
