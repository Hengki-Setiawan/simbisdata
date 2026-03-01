import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kebijakan Privasi — SimbisData", description: "Kebijakan privasi dan perlindungan data pengguna SimbisData." };

export default function PrivacyPage() {
    return (
        <div style={{ minHeight: "100vh", padding: "80px 24px 60px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <Link href="/" style={{ textDecoration: "none", color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "16px", display: "block" }}>← Kembali ke Beranda</Link>
                <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "8px" }}>Kebijakan Privasi</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "32px" }}>Terakhir diperbarui: Februari 2026</p>

                {[
                    { title: "1. Data yang Kami Kumpulkan", content: "Kami mengumpulkan data yang Anda berikan secara langsung: nama, email, password (terenkripsi). Serta data yang diupload: file Excel penjualan dari marketplace atau data UMKM sendiri. Kami juga mengumpulkan data penggunaan platform secara anonim (halaman yang dikunjungi, fitur yang digunakan) untuk peningkatan layanan." },
                    { title: "2. Bagaimana Kami Menggunakan Data", content: "Data profil digunakan untuk autentikasi dan manajemen akun. Data penjualan yang diupload diproses oleh algoritma ML dan AI secara real-time untuk menghasilkan analisis. Data ini TIDAK disimpan permanen di server kami kecuali Anda memilih untuk menyimpan riwayat." },
                    { title: "3. Penyimpanan & Keamanan Data", content: "Data disimpan di server Turso (SQLite) yang terenkripsi. Transfer data menggunakan HTTPS/TLS. Password di-hash menggunakan algoritma yang aman. Kami menerapkan prinsip minimum data — hanya menyimpan data yang diperlukan." },
                    { title: "4. Sharing Data", content: "Kami TIDAK menjual data Anda kepada pihak ketiga. Data hanya dibagikan ke: (a) penyedia layanan AI (Groq) dalam bentuk ringkasan statistik tanpa data mentah, (b) penyedia pembayaran (Duitku) untuk proses transaksi." },
                    { title: "5. Retensi Data", content: "Data riwayat analisis disimpan sesuai tier: Free (7 hari), Starter (30 hari), Pro (1 tahun), Enterprise (unlimited). File Excel yang diupload diproses dan dihapus dari server dalam 24 jam kecuali disimpan ke storage." },
                    { title: "6. Hak Pengguna", content: "Anda berhak: (a) mengakses data Anda, (b) meminta penghapusan akun dan semua data terkait, (c) mengexport data Anda dalam format standar, (d) menolak penggunaan data untuk analytics. Hubungi kami melalui email untuk menggunakan hak-hak ini." },
                    { title: "7. Cookie & Tracking", content: "Kami menggunakan cookie untuk session management (login). Untuk analytics, kami menggunakan PostHog (self-hosted compatible) dengan opsi opt-out. Kami tidak menggunakan cookie iklan pihak ketiga." },
                    { title: "8. Perubahan Kebijakan", content: "Kebijakan privasi ini dapat diperbarui sewaktu-waktu. Kami akan mengirimkan notifikasi untuk perubahan material. Penggunaan layanan setelah perubahan dianggap sebagai penerimaan kebijakan baru." },
                ].map((s, i) => (
                    <div key={i} style={{ marginBottom: "28px" }}>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "10px", color: "var(--primary-light)" }}>{s.title}</h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.8 }}>{s.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
