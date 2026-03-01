import * as React from "react";

interface WelcomeEmailProps {
    firstName: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
    firstName,
}) => (
    <div style={{ fontFamily: "sans-serif", color: "#333", maxWidth: "600px", margin: "0 auto", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
        <h1 style={{ color: "#4f46e5", fontSize: "24px", marginBottom: "16px" }}>Selamat datang di simbisai, {firstName}! 🚀</h1>
        <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
            Terima kasih telah bergabung dengan platform analitik canggih khusus UMKM.
        </p>
        <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
            Dengan simbisai, kini kamu bisa menganalisis ribuan data penjualanmu secara kilat menggunakan Machine Learning, tanpa takut lemot!
        </p>
        <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "6px" }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>Langkah Pertama:</h3>
            <ol style={{ margin: "0", paddingLeft: "20px", lineHeight: "1.6" }}>
                <li>Upload file Excel penjualanmu di menu "Upload"</li>
                <li>Tunggu AI (Groq/Gemini) memproses narasi analisamu</li>
                <li>Download laporan eksekutifmu sebagai PDF!</li>
            </ol>
        </div>
        <p style={{ marginTop: "24px", fontSize: "14px", color: "#64748b" }}>
            Salam Hangat, <br />
            Tim simbisai
        </p>
    </div>
);

export const InvoiceEmail: React.FC<Readonly<{ name: string, plan: string, orderId: string }>> = ({ name, plan, orderId }) => (
    <div style={{ fontFamily: "sans-serif", color: "#333", maxWidth: "600px", margin: "0 auto", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
        <h1 style={{ color: "#10b981", fontSize: "24px", marginBottom: "16px" }}>Pembayaran Berhasil! 🎉</h1>
        <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
            Halo {name}, pembayaranmu untuk paket <strong>{plan}</strong> telah berhasil kami terima.
        </p>
        <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "6px" }}>
            <p style={{ margin: "0 0 8px 0" }}><strong>Order ID:</strong> {orderId}</p>
            <p style={{ margin: "0" }}><strong>Status:</strong> LUNAS</p>
        </div>
        <p style={{ marginTop: "24px", fontSize: "16px", lineHeight: "1.5" }}>
            Fitur premium kamu sekarang sudah aktif. Silakan nikmati layanan analitik terbaik dari kami!
        </p>
    </div>
);
