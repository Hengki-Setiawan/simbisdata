"use client";

const testimonials = [
    {
        name: "Rina Sari",
        role: "Owner @KaosLokal.id",
        avatar: "RS",
        rating: 5,
        text: "Sebelumnya saya cuma lihat angka penjualan tanpa tahu artinya. Setelah pakai SimbisData, saya tahu produk mana yang harus ditambah stoknya dan kapan waktu terbaik untuk campaign. Revenue naik 30%!",
    },
    {
        name: "Budi Hartono",
        role: "Manager, Toko Elektronik Maju",
        avatar: "BH",
        rating: 5,
        text: "Fitur prediksi penjualannya sangat akurat. Saya bisa merencanakan restok lebih baik dan mengurangi dead stock sampai 40%. Tim saya langsung paham dari laporan PDF-nya.",
    },
    {
        name: "Dewi Anggraini",
        role: "Seller Shopee & Tokopedia",
        avatar: "DA",
        rating: 5,
        text: "Yang paling saya suka, upload file Excel langsung jadi dashboard keren. Tidak perlu belajar data science. Clustering customer-nya membantu saya bikin promo yang tepat sasaran.",
    },
    {
        name: "Ahmad Fauzi",
        role: "Dosen Bisnis Digital, Unpad",
        avatar: "AF",
        rating: 5,
        text: "Saya merekomendasikan SimbisData untuk tugas mahasiswa. Algoritmanya profesional, outputnya mudah dipahami, dan harganya sangat terjangkau untuk skala akademik.",
    },
];

export default function TestimonialsSection() {
    return (
        <section className="section" id="testimonials">
            <div className="container">
                <h2 className="section-title">
                    Dipercaya oleh <span className="gradient-text">UMKM Indonesia</span>
                </h2>
                <p className="section-subtitle">
                    Dengarkan langsung dari para pemilik bisnis yang sudah merasakan manfaat SimbisData.
                </p>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "24px",
                    maxWidth: "1100px",
                    margin: "0 auto",
                }}>
                    {testimonials.map((t, i) => (
                        <div key={i} className="glass-card" style={{ padding: "28px", transition: "all 0.3s ease" }}>
                            {/* Stars */}
                            <div style={{ marginBottom: "16px" }}>
                                {Array.from({ length: t.rating }).map((_, j) => (
                                    <span key={j} style={{ color: "#f59e0b", fontSize: "1.1rem" }}>★</span>
                                ))}
                            </div>

                            {/* Text */}
                            <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px", fontStyle: "italic" }}>
                                "{t.text}"
                            </p>

                            {/* Author */}
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "var(--gradient-1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.85rem",
                                    fontWeight: 700,
                                    color: "white",
                                    flexShrink: 0,
                                }}>
                                    {t.avatar}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{t.name}</p>
                                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
