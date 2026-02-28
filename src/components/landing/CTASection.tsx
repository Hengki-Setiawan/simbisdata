import Link from "next/link";

export default function CTASection() {
    return (
        <section style={{ padding: "80px 0" }}>
            <div className="container">
                <div className="glass-card" style={{
                    padding: "48px 32px",
                    textAlign: "center",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    {/* Background glow */}
                    <div style={{
                        position: "absolute",
                        top: "-50%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "400px",
                        height: "400px",
                        borderRadius: "50%",
                        background: "rgba(99, 102, 241, 0.1)",
                        filter: "blur(100px)",
                        pointerEvents: "none",
                    }} />

                    <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "16px", position: "relative" }}>
                        Siap Mengubah Data Jadi <span className="gradient-text">Keputusan Bisnis?</span>
                    </h2>
                    <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto 32px", lineHeight: 1.7, position: "relative" }}>
                        Upload file Excel Anda sekarang — gratis, tanpa kartu kredit. Rasakan kekuatan 15 algoritma ML dan AI dalam hitungan detik.
                    </p>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
                        <Link href="/register" className="btn-primary" style={{ padding: "14px 36px", fontSize: "1.05rem" }}>
                            🚀 Mulai Gratis Sekarang
                        </Link>
                        <Link href="/demo" className="btn-secondary" style={{ padding: "14px 36px", fontSize: "1.05rem" }}>
                            👁️ Lihat Demo
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
