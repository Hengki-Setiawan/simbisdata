"use client";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="id" className="dark">
            <body style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0f0f23",
                color: "#f1f5f9",
                fontFamily: "system-ui, sans-serif",
                textAlign: "center",
                padding: "24px",
            }}>
                <div>
                    <div style={{ fontSize: "5rem", fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg, #ef4444, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        500
                    </div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "16px", marginBottom: "8px" }}>
                        Terjadi Kesalahan
                    </h1>
                    <p style={{ color: "#94a3b8", marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px" }}>
                        Maaf, terjadi kesalahan pada server kami. Tim teknis sudah diberitahu. Silakan coba lagi.
                    </p>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: "12px 28px",
                            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "1rem",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        🔄 Coba Lagi
                    </button>
                </div>
            </body>
        </html>
    );
}
