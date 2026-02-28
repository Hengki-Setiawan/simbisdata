"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, FileText, Download, Calendar, Loader2 } from "lucide-react";

interface Transaction {
    id: number;
    orderId: string;
    planId: string;
    amount: number;
    status: string;
    paidAt: number | null;
    createdAt: number;
}

interface BillingData {
    planId: string;
    subscription: { endDate: number } | null;
    transactions: Transaction[];
}

export default function BillingPage() {
    const [data, setData] = useState<BillingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/user/billing")
            .then(res => res.json())
            .then(res => {
                if (!res.error) setData(res);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <Loader2 className="animate-spin text-gray-500" size={32} />
            </div>
        );
    }

    const planName = data?.planId ? data.planId.charAt(0).toUpperCase() + data.planId.slice(1) : "Free";
    const expiryDate = data?.subscription?.endDate ? new Date(data.subscription.endDate * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : "Selamanya";
    const bgClass = data?.planId === 'enterprise' ? 'rgba(16, 185, 129, 0.15)' : data?.planId === 'pro' ? 'rgba(99,102,241,0.15)' : 'rgba(245, 158, 11, 0.15)';
    const iconColor = data?.planId === 'enterprise' ? '#10b981' : data?.planId === 'pro' ? 'var(--primary)' : '#f59e0b';

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
                        <div style={{ width: 48, height: 48, borderRadius: "var(--radius)", background: bgClass, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <CreditCard size={24} style={{ color: iconColor }} />
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>Paket {planName}</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                {data?.planId === 'free' ? 'Gratis • Akses terbatas' : `Perpanjangan ${expiryDate}`}
                            </p>
                        </div>
                    </div>
                    <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }} onClick={() => window.location.href = '/dashboard/subscription'}>
                        Ubah Paket
                    </button>
                </div>
            </motion.div>

            {/* Payment Method - Placeholder since using Duitku/Midtrans gateway */}
            <motion.div className="glass-card" style={{ padding: "24px", marginBottom: "24px", opacity: 0.7 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "16px" }}>Metode Pembayaran (Payment Gateway)</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "var(--bg-surface)", borderRadius: "var(--radius)", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Transaksi diproses via secure payment gateway (QRIS, E-Wallet, VA, dll).</span>
                    </div>
                </div>
            </motion.div>

            {/* Invoices */}
            <motion.div className="glass-card" style={{ padding: "0", overflow: "hidden" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Riwayat Invoice</h3>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                                {["Invoice", "Tanggal", "Paket", "Jumlah", "Status", ""].map((h, i) => (
                                    <th key={i} style={{ textAlign: "left", padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(!data?.transactions || data.transactions.length === 0) ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                                        Belum ada riwayat transaksi.
                                    </td>
                                </tr>
                            ) : (
                                data.transactions.map((inv) => (
                                    <tr key={inv.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                        <td style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                                            <FileText size={14} style={{ color: "var(--text-muted)" }} /> {inv.orderId}
                                        </td>
                                        <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>
                                            <Calendar size={14} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
                                            {new Date(inv.createdAt * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontWeight: 600 }}>{inv.planId.toUpperCase()}</td>
                                        <td style={{ padding: "14px 16px", fontWeight: 700 }}>Rp {inv.amount.toLocaleString('id-ID')}</td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{
                                                padding: "3px 10px", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 600,
                                                background: inv.status === 'paid' ? "rgba(16,185,129,0.15)" : inv.status === 'failed' || inv.status === 'expired' ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                                color: inv.status === 'paid' ? "#10b981" : inv.status === 'failed' || inv.status === 'expired' ? "#ef4444" : "#f59e0b"
                                            }}>
                                                {inv.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            {inv.status === 'paid' && (
                                                <button style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.82rem" }}>
                                                    <Download size={14} /> PDF
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
