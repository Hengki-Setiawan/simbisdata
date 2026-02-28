import Link from "next/link";

export default function NotFound() {
    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-main)",
            color: "var(--text-primary)",
            textAlign: "center",
            padding: "24px",
        }}>
            <div>
                <div style={{ fontSize: "6rem", fontWeight: 900, lineHeight: 1 }} className="gradient-text">
                    404
                </div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "16px", marginBottom: "8px" }}>
                    Halaman Tidak Ditemukan
                </h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "400px" }}>
                    Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/" className="btn-primary">
                        🏠 Kembali ke Beranda
                    </Link>
                    <Link href="/dashboard" className="btn-secondary">
                        📊 Buka Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
