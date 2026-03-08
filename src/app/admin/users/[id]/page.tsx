import { ArrowLeft, Mail, Calendar, Shield, BarChart3, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { users, uploadedFiles, activityLogs } from "@/db/schema";
import { eq, desc, sum } from "drizzle-orm";
import { redirect } from "next/navigation";
import AdminUserActions from "@/components/admin/AdminUserActions";

const tierColors: Record<string, string> = { free: "#64748b", starter: "#6366f1", pro: "#10b981", enterprise: "#f59e0b" };

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) redirect("/admin/users");

    // Fetch user details
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) redirect("/admin/users");

    // Fetch recent files
    const files = await db.select().from(uploadedFiles).where(eq(uploadedFiles.userId, userId)).orderBy(desc(uploadedFiles.uploadedAt)).limit(10);
    const totalUploads = await db.select().from(uploadedFiles).where(eq(uploadedFiles.userId, userId));

    // Fetch activities
    const activities = await db.select().from(activityLogs).where(eq(activityLogs.userId, userId)).orderBy(desc(activityLogs.createdAt)).limit(10);
    const allAnalyses = await db.select().from(activityLogs).where(eq(activityLogs.userId, userId));
    const analysisCount = allAnalyses.filter(a => a.action === "analysis_run").length;

    // Find last login
    const logins = allAnalyses.filter(a => a.action === "login");
    const lastLoginStr = logins.length > 0 ? new Date(logins[0].createdAt * 1000).toLocaleDateString("id-ID") : "Belum pernah login";

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (unix: number) => {
        return new Date(unix * 1000).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const tier = user.planId;
    const status = user.isActive ? "Active" : "Suspended";

    return (
        <div>
            <Link href="/admin/users" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: "20px" }}>
                <ArrowLeft size={16} /> Kembali ke Users
            </Link>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "4px" }}>{user.name}</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>ID: {user.id}</p>
                </div>
                <span style={{
                    padding: "4px 14px", borderRadius: "100px", fontSize: "0.78rem", fontWeight: 700,
                    background: `${tierColors[tier]}22`, color: tierColors[tier], textTransform: "uppercase",
                }}>{tier}</span>
            </div>

            {/* Info Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Email", value: user.email, icon: Mail },
                    { label: "Terdaftar", value: new Date(user.createdAt * 1000).toLocaleDateString("id-ID"), icon: Calendar },
                    { label: "Login Terakhir", value: lastLoginStr, icon: Activity },
                    { label: "Status", value: status, icon: Shield },
                ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={i} className="glass-card" style={{ padding: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                                <Icon size={14} /> {item.label}
                            </div>
                            <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{item.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Usage Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Uploads", value: totalUploads.length.toString(), icon: FileText },
                    { label: "Analyses", value: analysisCount.toString(), icon: BarChart3 },
                    { label: "AI Requests", value: allAnalyses.filter(a => a.action === "ai_request").length.toString(), icon: Activity },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className="glass-card" style={{ padding: "20px", background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.04))" }}>
                            <Icon size={16} style={{ color: "var(--primary)", marginBottom: "8px" }} />
                            <p style={{ fontSize: "1.3rem", fontWeight: 800 }}>{s.value}</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{s.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* Actions + Files + Activity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

                <AdminUserActions userId={user.id} initialTier={user.planId} initialActive={user.isActive} />

                {/* Recent Files */}
                <div className="glass-card" style={{ padding: "24px" }}>
                    <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>📁 Recent Files</h3>
                    {files.length === 0 ? (
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>User belum upload file.</p>
                    ) : files.map((f, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
                            <div><p style={{ fontWeight: 600 }}>{f.filename}</p><p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{f.rowCount.toLocaleString()} rows</p></div>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{formatDate(f.uploadedAt)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Log */}
            <div className="glass-card" style={{ padding: "24px", marginTop: "16px" }}>
                <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>📋 Activity Log (Top 10)</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead><tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "var(--text-muted)", fontWeight: 600 }}>Action</th>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "var(--text-muted)", fontWeight: 600 }}>Detail</th>
                        <th style={{ textAlign: "right", padding: "8px 0", color: "var(--text-muted)", fontWeight: 600 }}>When</th>
                    </tr></thead>
                    <tbody>
                        {activities.length === 0 ? (
                            <tr><td colSpan={3} style={{ padding: "10px 0", textAlign: "center", color: "var(--text-muted)" }}>No activity recorded.</td></tr>
                        ) : activities.map((a, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                <td style={{ padding: "10px 0", fontWeight: 600 }}>{a.action}</td>
                                <td style={{ padding: "10px 0", color: "var(--text-secondary)" }}>{a.details}</td>
                                <td style={{ padding: "10px 0", textAlign: "right", color: "var(--text-muted)", fontSize: "0.78rem" }}>{formatDate(a.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
