import { History, FileSpreadsheet, Trash2, Eye, Clock } from "lucide-react";
import { getUserHistory, deleteUserHistory } from "@/actions/dashboard";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const userId = parseInt(session.user.id as string, 10);
    const history = await getUserHistory(userId);

    return (
        <div>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>Riwayat Analisis</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Daftar file yang pernah kamu upload dan analisis.</p>
            </div>

            {history.length === 0 ? (
                <div
                    className="glass-card"
                    style={{ padding: "60px 40px", textAlign: "center" }}
                >
                    <History size={48} style={{ color: "var(--text-muted)", marginBottom: "16px", margin: "0 auto" }} />
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>Belum Ada Riwayat</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "20px" }}>Upload file Excel untuk memulai analisis pertama kamu.</p>
                    <Link href="/dashboard/upload" className="btn-primary" style={{ display: "inline-flex" }}>Upload Sekarang</Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {history.map((item, i) => (
                        <div
                            key={item.id}
                            className="glass-card"
                            style={{
                                padding: "20px 24px", display: "flex", alignItems: "center",
                                justifyContent: "space-between", animation: `fadeIn 0.5s ease ${i * 0.1}s forwards`,
                                opacity: 0
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: "var(--radius)",
                                    background: "rgba(99, 102, 241, 0.15)", display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <FileSpreadsheet size={22} style={{ color: "var(--primary)" }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, marginBottom: "4px" }}>{item.filename}</p>
                                    <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                        <span>{(item.fileSize / 1024).toFixed(1)} KB</span>
                                        <span>{item.rowCount.toLocaleString()} baris</span>
                                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Clock size={12} /> {new Date(item.uploadedAt * 1000).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                                <Link
                                    href="/dashboard"
                                    style={{
                                        padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border-color)",
                                        background: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", textDecoration: "none"
                                    }}
                                >
                                    <Eye size={14} /> Lihat
                                </Link>
                                <form action={async () => {
                                    "use server";
                                    await deleteUserHistory(item.id, userId);
                                }}>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: "8px 12px", borderRadius: "var(--radius)", border: "1px solid rgba(239, 68, 68, 0.4)",
                                            background: "rgba(239, 68, 68, 0.1)", color: "var(--error)", cursor: "pointer",
                                            display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem"
                                        }}
                                    >
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                    <style>{`
                        @keyframes fadeIn {
                            to { opacity: 1; transform: translateY(0); }
                            from { opacity: 0; transform: translateY(10px); }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}
