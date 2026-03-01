"use client";

export default function HowItWorksSection() {
    const steps = [
        {
            number: "01",
            icon: "📤",
            title: "Upload File Excel",
            description: "Drag & drop file penjualan dari Shopee, Tokopedia, Lazada, atau POS kasir. Sistem kami mendeteksi platform secara otomatis."
        },
        {
            number: "02",
            icon: "🧠",
            title: "AI & ML Menganalisis",
            description: "15 algoritma Machine Learning berjalan di browser Anda — dari forecasting, clustering, hingga anomaly detection. Tanpa antri server."
        },
        {
            number: "03",
            icon: "📊",
            title: "Dapatkan Insight Bisnis",
            description: "Dashboard interaktif + narasi AI dalam Bahasa Indonesia. Export ke PDF, Excel, atau PPTX untuk presentasi ke tim Anda."
        }
    ];

    return (
        <section className="section" id="how-it-works">
            <div className="container" style={{ paddingTop: "20px" }}>
                <h2 className="section-title">
                    Semudah <span className="gradient-text">3 Langkah</span>
                </h2>
                <p className="section-subtitle">
                    Dari file Excel mentah menjadi insight bisnis profesional — tanpa skill coding atau data science.
                </p>

                <div style={{ display: "flex", gap: "32px", justifyContent: "center", flexWrap: "wrap", maxWidth: "1000px", margin: "0 auto", position: "relative" }}>
                    {/* Connecting line */}
                    <div style={{ position: "absolute", top: "60px", left: "15%", right: "15%", height: "2px", background: "linear-gradient(90deg, var(--border-color), var(--primary), var(--border-color))", display: "none" }} className="connecting-line" />

                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="glass-card"
                            style={{
                                flex: "1 1 280px",
                                maxWidth: "320px",
                                padding: "32px 24px",
                                textAlign: "center",
                                position: "relative",
                                transition: "all 0.3s ease",
                            }}
                        >
                            {/* Step number badge */}
                            <div style={{
                                position: "absolute",
                                top: "-16px",
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "var(--gradient-1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: 800,
                                color: "white",
                            }}>
                                {step.number}
                            </div>

                            <div style={{ fontSize: "3rem", marginBottom: "16px", marginTop: "8px" }}>
                                {step.icon}
                            </div>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "12px", color: "var(--text-primary)" }}>
                                {step.title}
                            </h3>
                            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
