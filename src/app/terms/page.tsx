import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Syarat & Ketentuan — simbisai", description: "Syarat dan ketentuan penggunaan platform simbisai." };

export default function TermsPage() {
    return (
        <div style={{ minHeight: "100vh", padding: "80px 24px 60px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <Link href="/" style={{ textDecoration: "none", color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "16px", display: "block" }}>← Kembali ke Beranda</Link>
                <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "8px" }}>Syarat & Ketentuan</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "32px" }}>Terakhir diperbarui: Februari 2026</p>

                {[
                    { title: "1. Penggunaan Layanan", content: "simbisai menyediakan layanan analisis data penjualan UMKM berbasis web. Dengan menggunakan layanan ini, Anda menyetujui untuk mematuhi syarat dan ketentuan berikut. Layanan ini ditujukan untuk penggunaan bisnis yang sah dan tidak boleh digunakan untuk aktivitas ilegal atau melanggar hak pihak ketiga." },
                    { title: "2. Akun Pengguna", content: "Anda bertanggung jawab untuk menjaga keamanan akun Anda, termasuk password dan informasi login. Setiap aktivitas yang terjadi di bawah akun Anda adalah tanggung jawab Anda. Satu akun hanya boleh digunakan oleh satu orang, kecuali pada paket Enterprise yang mendukung multi-user." },
                    { title: "3. Data & Privasi", content: "Data yang Anda upload ke simbisai hanya digunakan untuk keperluan analisis. Kami tidak menjual, membagikan, atau memanfaatkan data Anda untuk keperluan lain. Data diproses secara aman dan dihapus sesuai dengan kebijakan retensi data per tier langganan." },
                    { title: "4. Langganan & Pembayaran", content: "Langganan ditagihkan secara bulanan atau tahunan sesuai paket yang dipilih. Pembayaran dilakukan melalui Duitku. Anda dapat membatalkan langganan kapan saja; akses premium tetap aktif hingga akhir periode billing." },
                    { title: "5. Batasan Layanan", content: "simbisai menyediakan analisis berdasarkan data yang Anda upload. Kami tidak menjamin keakuratan prediksi atau rekomendasi AI. Hasil analisis bersifat informatif dan keputusan bisnis tetap menjadi tanggung jawab pengguna." },
                    { title: "6. Hak Kekayaan Intelektual", content: "Seluruh konten, desain, algoritma, dan teknologi di platform simbisai dilindungi hak cipta. Anda tidak diperkenankan meng-copy, mendistribusikan, atau merekayasa balik (reverse engineer) bagian manapun dari layanan." },
                    { title: "7. Perubahan Ketentuan", content: "Kami berhak memperbarui syarat dan ketentuan ini dari waktu ke waktu. Perubahan material akan diberitahukan melalui email atau notifikasi di platform minimal 14 hari sebelum berlaku efektif." },
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
