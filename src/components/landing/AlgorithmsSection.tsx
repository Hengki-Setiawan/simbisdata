"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlayCircle, BarChart2, Star, Lock } from "lucide-react";

type Tier = "Semua Tier" | "Starter" | "Pro & Enterprise" | "Enterprise";

const pipelineStages = [
    { name: "Data Ingestion", desc: "Menerima dan membaca file sumber", category: "Upload", tier: "Semua Tier" as Tier, details: "Sistem mengenali format file (Excel, CSV, JSON) secara otomatis. Data dari berbagai marketplace (Shopee, Tokopedia, TikTok Shop) dideteksi dan dinormalisasi formatnya tanpa perlu template manual.", demoHint: "Cukup drag-and-drop file raw dari Seller Center, sistem langsung memetakan kolom yang relevan." },
    { name: "Smart Cleaning", desc: "Membersihkan data kotor secara otomatis", category: "Cleaning", tier: "Semua Tier" as Tier, details: "Menghapus duplikasi, mengisi baris kosong dengan mean/median, memperbaiki format tanggal yang salah, dan menstandarisasi nama kota/provinsi dengan algoritma fuzzy matching.", demoHint: "Data harga dengan format 'Rp 10.000' dikonversi menjadi integer '10000' siap komputasi." },
    { name: "Feature Engineering", desc: "Membentuk fitur profil dan temporal", category: "Processing", tier: "Semua Tier" as Tier, details: "Dari data mentah, sistem menurunkan wawasan tingkat tinggi: Profil Pelanggan (seberapa sering beli), Profil Produk (laku keras/retur), dan Profil Temporal (jam sibuk toko).", demoHint: "Sistem otomatis menambahkan kolom 'Hari' dan mencatat apakah transaksi terjadi di 'Weekend' atau 'Weekday'." },
    { name: "ML Analytics", desc: "K-Means, RFM, dan Anomaly Detection", category: "Machine Learning", tier: "Pro & Enterprise" as Tier, details: "Data bersih disuapkan ke 5 model Machine Learning inti yang berjalan paralel di browser menggunakan Web Workers, menghasilkan segmentasi, skor, dan proyeksi.", demoHint: "Algoritma K-Means membagi pelanggan menjadi grup VIP, Reguler, dan Risiko Churn berdasarkan total belanja." },
    { name: "Cross Optimization", desc: "Mengkorelasikan hasil multi-algoritma", category: "Korelasi AI", tier: "Enterprise" as Tier, details: "Algoritma saling berbicara. Misalnya, mencari irisan antara 'Pelanggan VIP' (dari RFM) dengan 'Waktu Beli' (dari Heatmap) untuk mencari jam optimal menyebar promo.", demoHint: "Sistem menemukan fakta: Pelanggan VIP dominan berbelanja di hari Selasa jam 19:00." },
    { name: "AI Synthesis", desc: "Narasi bahasa manusia & Export", category: "Reporting", tier: "Starter" as Tier, details: "Menggunakan Large Language Model (seperti Gemini/Groq), semua angka rumit diterjemahkan menjadi narasi bisnis berbahasa Indonesia yang siap dipresentasikan.", demoHint: "Generate laporan menjadi file PDF yang cantik seketika, lengkap dengan insight tulisan AI." },
];

const categoryColors: Record<string, string> = {
    Upload: "var(--primary)",
    Cleaning: "var(--warning)",
    Processing: "var(--accent-dark)",
    "Machine Learning": "var(--danger)",
    "Korelasi AI": "#a78bfa",
    Reporting: "var(--success)",
};

const tierColors: Record<string, string> = {
    "Semua Tier": "linear-gradient(135deg, #10b981, #059669)",     // Emerald
    "Starter": "linear-gradient(135deg, #3b82f6, #2563eb)",  // Blue
    "Pro & Enterprise": "linear-gradient(135deg, #a855f7, #7e22ce)",      // Purple
    "Enterprise": "linear-gradient(135deg, #eab308, #ca8a04)",// Gold
};

export default function AlgorithmsSection() {
    const [selectedStage, setSelectedStage] = useState<(typeof pipelineStages)[0] | null>(null);

    return (
        <section id="algorithms" className="section" style={{ background: "var(--bg-surface)", position: "relative" }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: "center", marginBottom: "40px" }}
                >
                    <h2 className="section-title">
                        <span className="gradient-text">6 Tahapan</span> Pipeline SimbisData
                    </h2>
                    <p className="section-subtitle" style={{ maxWidth: "700px", margin: "0 auto" }}>
                        Bukan sekadar grafik biasa. Saat kamu klik proses, sistem akan memuat Web Workers untuk mengkalkulasi Machine Learning kelas analitik pro di background secara mulus dari tahap awal hingga terbentuk narasi AI.
                    </p>
                </motion.div>

                <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto", paddingLeft: "16px" }}>
                    {/* Vertical Timeline Line */}
                    <div style={{
                        position: "absolute",
                        left: "35px",
                        top: "30px",
                        bottom: "40px",
                        width: "3px",
                        background: "linear-gradient(to bottom, var(--primary) 0%, var(--accent) 50%, var(--success) 100%)",
                        borderRadius: "10px",
                        opacity: 0.3,
                        zIndex: 0
                    }} />

                    <div style={{ display: "flex", flexDirection: "column", gap: "28px", zIndex: 1, position: "relative" }}>
                        {pipelineStages.map((stage, i) => (
                            <motion.div
                                key={i}
                                style={{ display: "flex", alignItems: "center", gap: "24px", position: "relative" }}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                            >
                                {/* Fixed Timeline Circle Node */}
                                <div style={{
                                    width: "42px",
                                    height: "42px",
                                    borderRadius: "50%",
                                    background: categoryColors[stage.category] || "var(--primary)",
                                    color: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: 800, fontSize: "1.1rem",
                                    flexShrink: 0,
                                    boxShadow: `0 0 0 4px var(--bg-surface), 0 5px 15px rgba(0,0,0,0.3)`,
                                    zIndex: 2,
                                    transition: "all 0.3s"
                                }}>
                                    {i + 1}
                                </div>

                                {/* Roadmap Card */}
                                <motion.div
                                    className="glass-card"
                                    style={{
                                        padding: "24px 28px",
                                        cursor: "pointer",
                                        position: "relative",
                                        overflow: "hidden",
                                        flexGrow: 1,
                                        borderLeft: `4px solid ${categoryColors[stage.category] || "var(--accent)"}`,
                                    }}
                                    whileHover={{ scale: 1.02, y: -2, boxShadow: "0px 10px 30px rgba(0,0,0,0.15)" }}
                                    onClick={() => setSelectedStage(stage)}
                                >
                                    {/* Tier Badge */}
                                    <div style={{
                                        position: "absolute", top: "20px", right: "24px",
                                        background: tierColors[stage.tier], color: "#fff",
                                        padding: "4px 10px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 800,
                                        display: "flex", alignItems: "center", gap: "4px",
                                        boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
                                    }}>
                                        {stage.tier === "Semua Tier" ? <Star size={10} fill="#fff" /> : <Lock size={10} />}
                                        {stage.tier}
                                    </div>

                                    <span style={{
                                        fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase",
                                        letterSpacing: "1px", color: categoryColors[stage.category] || "var(--text-muted)",
                                        display: "inline-block", marginBottom: "8px"
                                    }}>
                                        Tahap {i + 1} • {stage.category}
                                    </span>
                                    
                                    <h4 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 8px 0", lineHeight: 1.3, paddingRight: "70px", color: "var(--text-primary)" }}>
                                        {stage.name}
                                    </h4>
                                    
                                    <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0, maxWidth: "90%" }}>
                                        {stage.desc}
                                    </p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Interactive Algorithm Modal Popup */}
            <AnimatePresence>
                {selectedStage && (
                    <div style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 9999,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "20px"
                    }}>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedStage(null)}
                            style={{
                                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                                background: "rgba(0,0,0,0.7)", backdropFilter: "blur(5px)"
                            }}
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            style={{
                                background: "var(--bg-glass)", border: "1px solid var(--border-color)",
                                padding: "32px", borderRadius: "24px", maxWidth: "500px", width: "100%",
                                position: "relative", zIndex: 10,
                                margin: "auto",
                                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                                overflow: "hidden" // Contains children
                            }}
                        >
                            {/* Accent Glow */}
                            <div style={{
                                position: "absolute", top: "-50px", left: "-50px", width: "200px", height: "200px",
                                background: categoryColors[selectedStage.category] || "var(--primary)",
                                filter: "blur(100px)", opacity: 0.15, borderRadius: "50%", zIndex: 0, pointerEvents: "none"
                            }} />

                            <div style={{ position: "relative", zIndex: 1 }}>
                                <button
                                    onClick={() => setSelectedStage(null)}
                                    style={{
                                        position: "absolute", top: "-10px", right: "-10px",
                                        background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", color: "white",
                                        width: "36px", height: "36px", borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer", transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "scale(1)"; }}
                                >
                                    <X size={18} />
                                </button>

                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                    <span style={{
                                        color: categoryColors[selectedStage.category] || "white",
                                        fontWeight: 800, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "1px"
                                    }}>
                                        {selectedStage.category}
                                    </span>
                                    <span style={{
                                        background: tierColors[selectedStage.tier], padding: "4px 10px", borderRadius: "100px", fontSize: "0.7rem", fontWeight: 800, color: "white",
                                        display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
                                    }}>
                                        {selectedStage.tier === "Semua Tier" ? <Star size={10} fill="#fff" /> : <Lock size={10} />}
                                        {selectedStage.tier} TIER
                                    </span>
                                </div>

                                <h3 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px", lineHeight: 1.2 }}>
                                    {selectedStage.name}
                                </h3>
                                <p style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: "1rem", marginBottom: "24px", lineHeight: 1.5 }}>
                                    {selectedStage.desc}
                                </p>

                                <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", marginBottom: "24px" }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "16px" }}>
                                        <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                            <BarChart2 size={24} color={categoryColors[selectedStage.category] || "var(--accent)"} />
                                        </div>
                                        <div>
                                            <h5 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "6px", color: "white" }}>Cara Kerja Sains</h5>
                                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{selectedStage.details}</p>
                                        </div>
                                    </div>
                                    <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "16px 0" }} />
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                                        <div style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                            <PlayCircle size={24} color="var(--success)" />
                                        </div>
                                        <div>
                                            <h5 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "6px", color: "white" }}>Contoh Eksekusi di Dashboard</h5>
                                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{selectedStage.demoHint}</p>
                                        </div>
                                    </div>
                                </div>

                                <button style={{
                                    width: "100%", padding: "16px", background: "white",
                                    border: "none", color: "black", fontWeight: 800, fontSize: "1rem", borderRadius: "14px",
                                    cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                                }}
                                    onClick={() => window.location.href = '/demo'}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(255,255,255,0.3)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                                >
                                    Coba Simulasi di Live Demo
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
