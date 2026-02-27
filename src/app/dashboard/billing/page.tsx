"use client";

import { motion } from "framer-motion";
import { CreditCard, FileText, Download, Calendar } from "lucide-react";

const invoices = [
    { id: "INV-2026-001", date: "01 Feb 2026", plan: "Pro", amount: "Rp 79.000", status: "paid" },
    { id: "INV-2026-002", date: "01 Jan 2026", plan: "Pro", amount: "Rp 79.000", status: "paid" },
    { id: "INV-2025-012", date: "01 Dec 2025", plan: "Starter", amount: "Rp 29.000", status: "paid" },
    { id: "INV-2025-011", date: "01 Nov 2025", plan: "Starter", amount: "Rp 29.000", status: "paid" },
];

export default function BillingPage() {
    return (
        <div style={{ maxWidth: "800px" }}>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>Billing & Invoice</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Riwayat pembayaran dan invoice kamu.</p>
            </div>

            {/* Current Plan */}
            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "var(--radius)", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CreditCard size={24} style={{ color: "var(--primary)" }} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>Paket Pro</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Rp 79.000/bulan • Perpanjangan 01 Mar 2026</p>
                        </div>
                    </div>
                    <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                        Ubah Paket
                    </button>
                </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>Metode Pembayaran</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "var(--bg-surface)", borderRadius: "var(--radius)", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: 36, height: 24, borderRadius: "4px", background: "linear-gradient(135deg, #1a73e8, #4285f4)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.6rem", fontWeight: 800 }}>VISA</div>
                        <span style={{ fontSize: "0.9rem" }}>•••• •••• •••• 4242</span>
                    </div>
                    <button style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>Ubah</button>
                </div>
            </motion.div>

            {/* Invoices */}
            <motion.div className="glass-card" style={{ padding: "0", overflow: "hidden" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Riwayat Invoice</h3>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                            {["Invoice", "Tanggal", "Paket", "Jumlah", "Status", ""].map((h, i) => (
                                <th key={i} style={{ textAlign: "left", padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv) => (
                            <tr key={inv.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                <td style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <FileText size={14} style={{ color: "var(--text-muted)" }} /> {inv.id}
                                </td>
                                <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>
                                    <Calendar size={0} />{inv.date}
                                </td>
                                <td style={{ padding: "14px 16px", fontWeight: 600 }}>{inv.plan}</td>
                                <td style={{ padding: "14px 16px", fontWeight: 700 }}>{inv.amount}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    <span style={{ padding: "3px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 600, background: "rgba(16,185,129,0.15)", color: "#10b981" }}>Paid</span>
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    <button style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.82rem" }}>
                                        <Download size={14} /> PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
