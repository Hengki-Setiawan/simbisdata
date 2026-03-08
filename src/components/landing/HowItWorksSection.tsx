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
            description: "Berbagai model Machine Learning berjalan di browser Anda — dari forecasting, clustering, hingga anomaly detection. Tanpa antri server."
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

                <div style={{
                    display: "flex",
                    gap: "32px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    maxWidth: "1000px",
                    margin: "40px auto 0 auto", // Increased top margin to 40px
                    position: "relative"
                }}>
                    {/* Connecting line */}
                    <div style={{ position: "absolute", top: "60px", left: "15%", right: "15%", height: "2px", background: "linear-gradient(90deg, var(--border-color), var(--primary), var(--border-color))", display: "none" }} className="connecting-line" />

                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="glass-card"
                            style={{
                                flex: "1 1 280px",
                                maxWidth: "320px",
                                padding: "40px 24px 32px 24px",
                                textAlign: "center",
                                position: "relative",
                                transition: "all 0.3s ease",
                                overflow: "visible",
                                marginTop: "16px",
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

                            <div style={{ fontSize: "2.5rem", marginBottom: "20px", marginTop: "12px", background: "var(--primary-surface)", width: "64px", height: "64px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "12px auto 20px auto" }}>
                                {step.icon}
                            </div>
                            <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "12px", color: "var(--text-heading)" }}>
                                {step.title}
                            </h3>
                            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
