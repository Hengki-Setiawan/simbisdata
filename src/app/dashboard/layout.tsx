"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    Home,
    Upload,
    Brain,
    FileText,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Lock,
    Bell,
    MessageSquare,
    Menu,
    User,
    HardDrive,
    DatabaseZap,
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-provider";
import { AIChatSidebar } from "@/components/dashboard/AIChatSidebar";
import OnboardingWizard from "@/components/dashboard/OnboardingWizard";

const MENU_SECTIONS = [
    {
        label: "UTAMA",
        items: [
            { label: "Beranda", href: "/dashboard", icon: Home },
            { label: "Upload Data", href: "/dashboard/upload", icon: Upload },
        ],
    },
    {
        label: "ANALISIS",
        items: [
            { label: "ML Insights", href: "/dashboard/analysis", icon: Brain },
            { label: "Laporan", href: "/dashboard/report", icon: FileText },
            { label: "Riwayat", href: "/dashboard/history", icon: HardDrive },
        ],
    },
    {
        label: "LAINNYA",
        items: [
            { label: "Profil", href: "/dashboard/profile", icon: User },
            { label: "Notifikasi", href: "/dashboard/alerts", icon: Bell },
            { label: "Pengaturan", href: "/dashboard/settings", icon: Settings },
        ],
    },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    const isAdmin = (session?.user as any)?.role === "admin";

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)", overflowX: "hidden" }}>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div 
                    onClick={() => setMobileOpen(false)}
                    style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(2px)",
                        zIndex: 40, display: "block"
                    }}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`dashboard-sidebar ${mobileOpen ? 'open' : ''}`}
                style={{
                    width: collapsed ? "72px" : "260px",
                    background: "var(--bg-sidebar, var(--bg-card))",
                    borderRight: "1px solid var(--border-color)",
                    display: "flex", flexDirection: "column",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "fixed", top: 0, bottom: 0, zIndex: 50,
                    overflow: "hidden",
                    // Mobile specific styles handled via CSS classes
                }}>
                {/* Logo */}
                <div style={{
                    padding: collapsed ? "20px 16px" : "20px 24px",
                    borderBottom: "1px solid var(--border-color)",
                    display: "flex", alignItems: "center",
                    justifyContent: collapsed ? "center" : "space-between",
                }}>
                    <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src="/logo-icon.svg" alt="SimbisData" width={24} height={24} style={{ flexShrink: 0 }} />
                        {!collapsed && (
                            <span style={{
                                fontSize: "1.15rem", fontWeight: 800, whiteSpace: "nowrap",
                                background: "var(--gradient-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            }}>
                                SimbisData
                            </span>
                        )}
                    </Link>
                    {!collapsed && (
                        <button className="desktop-only-btn" onClick={() => setCollapsed(true)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                            <ChevronLeft size={18} />
                        </button>
                    )}
                </div>

                {collapsed && (
                    <button className="desktop-only-btn" onClick={() => setCollapsed(false)} style={{
                        background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                        padding: "12px", display: "flex", justifyContent: "center",
                    }}>
                        <ChevronRight size={18} />
                    </button>
                )}

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
                    {MENU_SECTIONS.map((section) => (
                        <div key={section.label} style={{ marginBottom: "16px" }}>
                            {!collapsed && (
                                <div style={{
                                    fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)",
                                    letterSpacing: "0.08em", padding: "4px 16px 8px", textTransform: "uppercase",
                                }}>
                                    {section.label}
                                </div>
                            )}
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;
                                return (
                                    <Link key={item.href} href={item.href} 
                                        onClick={() => setMobileOpen(false)}
                                        style={{
                                        display: "flex", alignItems: "center", gap: "12px",
                                        padding: collapsed ? "12px" : "10px 16px",
                                        borderRadius: "10px", textDecoration: "none",
                                        color: isActive ? "var(--primary)" : "var(--text-secondary)",
                                        background: isActive ? "var(--primary-surface, rgba(79, 70, 229, 0.08))" : "transparent",
                                        marginBottom: "2px", transition: "all 0.15s ease",
                                        justifyContent: collapsed ? "center" : "flex-start",
                                        fontSize: "0.88rem", fontWeight: isActive ? 600 : 450,
                                        position: "relative",
                                    }}>
                                        {isActive && !collapsed && (
                                            <div style={{
                                                position: "absolute", left: 0, top: "6px", bottom: "6px",
                                                width: "3px", borderRadius: "0 3px 3px 0",
                                                background: "var(--primary)",
                                            }} />
                                        )}
                                        <Icon size={20} style={{ flexShrink: 0 }} />
                                        {!collapsed && item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}

                    {/* Admin link */}
                    {isAdmin && (
                        <Link href="/admin" 
                            onClick={() => setMobileOpen(false)}
                            style={{
                            display: "flex", alignItems: "center", gap: "12px",
                            padding: collapsed ? "12px" : "10px 16px",
                            borderRadius: "10px", textDecoration: "none",
                            color: pathname.startsWith("/admin") ? "var(--primary)" : "var(--text-muted)",
                            background: pathname.startsWith("/admin") ? "var(--primary-surface, rgba(79, 70, 229, 0.08))" : "transparent",
                            fontSize: "0.88rem", fontWeight: 450,
                            justifyContent: collapsed ? "center" : "flex-start",
                        }}>
                            <Lock size={20} style={{ flexShrink: 0 }} />
                            {!collapsed && "Admin Panel"}
                        </Link>
                    )}
                </nav>

                {/* User section */}
                <div style={{ padding: collapsed ? "16px 12px" : "16px 20px", borderTop: "1px solid var(--border-color)" }}>
                    {!collapsed && session?.user && (
                        <div style={{ marginBottom: "12px" }}>
                            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                                {session.user.name || "User"}
                            </p>
                            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", wordBreak: "break-all" }}>
                                {session.user.email}
                            </p>
                        </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: collapsed ? "center" : "space-between" }}>
                        <button onClick={() => signOut({ callbackUrl: '/login' })} style={{
                            background: "none", border: "none", display: "flex", alignItems: "center", gap: "10px",
                            color: "var(--text-muted)", fontSize: "0.82rem", cursor: "pointer", padding: 0,
                        }}>
                            <LogOut size={18} />
                            {!collapsed && "Keluar"}
                        </button>
                    </div>
                    {/* Database Reset Button */}
                    <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px dashed var(--border-color)", display: "flex", justifyContent: collapsed ? "center" : "space-between", alignItems: "center" }}>
                        <button 
                            onClick={async () => {
                                if (confirm("Yakin ingin menghapus seluruh data dan cache lokal? (Tindakan ini tidak dapat dibatalkan)")) {
                                    const { db } = await import("@/lib/local-db");
                                    await db.clearAll();
                                    window.location.href = "/dashboard/upload";
                                }
                            }}
                            style={{
                                background: "var(--danger-light, rgba(239, 68, 68, 0.1))", border: "1px solid var(--danger)", display: "flex", alignItems: "center", gap: "8px",
                                color: "var(--danger)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", padding: "6px 10px", borderRadius: "8px", width: collapsed ? "auto" : "100%", justifyContent: "center"
                            }}>
                            <DatabaseZap size={16} />
                            {!collapsed && "Reset DB"}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main 
                className={`dashboard-main ${collapsed ? 'sidebar-collapsed' : ''}`}
                style={{
                marginLeft: collapsed ? "72px" : "260px",
                flex: 1, minWidth: 0, overflowX: "hidden",
                transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                padding: "32px 32px",
                minHeight: "100vh",
                display: "flex", flexDirection: "column"
            }}>
                {/* Mobile Header Toggle */}
                <div className="mobile-header" style={{
                    display: "none", alignItems: "center", justifyContent: "space-between",
                    paddingBottom: "16px", marginBottom: "16px", borderBottom: "1px solid var(--border-color)"
                }}>
                    <button onClick={() => setMobileOpen(true)} style={{
                        background: "none", border: "none", color: "var(--text-primary)", padding: "4px"
                    }}>
                        <Menu size={24} />
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img src="/logo-icon.svg" alt="SimbisData" width={20} height={20} />
                        <span style={{ fontWeight: 700, fontSize: "1rem" }}>SimbisData</span>
                    </div>
                    <ThemeToggle />
                </div>

                {children}
            </main>

            {/* AI Chat FAB */}
            <button onClick={() => setChatOpen(true)} style={{
                position: "fixed", bottom: "24px", right: "24px", zIndex: 90,
                width: "52px", height: "52px", borderRadius: "16px",
                background: "var(--gradient-primary)", border: "none",
                boxShadow: "var(--shadow-md)", cursor: "pointer",
                display: chatOpen ? "none" : "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", transition: "transform 0.2s ease",
            }}>
                <MessageSquare size={22} />
            </button>

            {/* AI Chat Sidebar */}
            <AIChatSidebar isOpen={chatOpen} onClose={() => setChatOpen(false)} />

            {/* Onboarding Wizard (First time only) */}
            <OnboardingWizard />
        </div>
    );
}
