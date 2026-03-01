"use client";

export default function TestimonialsSection({ data }: { data?: any[] }) {
    const testimonialsList = data && data.length > 0 ? data : [];

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
                    {testimonialsList.map((t, i) => {
                        const avatar = t.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

                        return (
                            <div key={i} className="glass-card" style={{ padding: "28px", transition: "all 0.3s ease" }}>
                                {/* Stars */}
                                <div style={{ marginBottom: "16px" }}>
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <span key={j} style={{ color: "#f59e0b", fontSize: "1.1rem" }}>★</span>
                                    ))}
                                </div>

                                {/* Text */}
                                <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px", fontStyle: "italic" }}>
                                    "{t.content}"
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
                                        {avatar}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{t.name}</p>
                                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{t.role} @ {t.company}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
