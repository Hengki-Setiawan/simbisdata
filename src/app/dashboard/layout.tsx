"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    BarChart3,
    LayoutDashboard,
    Upload,
    History,
    Settings,
    CreditCard,
    Brain,
    GitCompareArrows,
    Bell,
    Receipt,
    LogOut,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Database,
    Lock,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Upload Data", href: "/dashboard/upload", icon: Upload },
    { label: "Data Studio", href: "/dashboard/data-studio", icon: Database },
    { label: "ML Analysis", href: "/dashboard/analysis", icon: Brain },
    { label: "Peta Regional", href: "/dashboard/regional", icon: MapPin },
    { label: "Compare", href: "/dashboard/compare", icon: GitCompareArrows },
    { label: "Smart Alerts", href: "/dashboard/alerts", icon: Bell },
    { label: "Riwayat", href: "/dashboard/history", icon: History },
    { label: "Langganan", href: "/dashboard/subscription", icon: CreditCard },
    { label: "Billing", href: "/dashboard/billing", icon: Receipt },
    { label: "Pengaturan", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [collapsed, setCollapsed] = useState(false);

    const isAdmin = (session?.user as any)?.role === "admin";
    const displayItems = isAdmin
        ? [...menuItems, { label: "Admin Panel", href: "/admin", icon: Lock }]
        : menuItems;

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: collapsed ? "72px" : "260px",
                    background: "var(--bg-card)",
                    borderRight: "1px solid var(--border-color)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "width 0.3s ease",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    zIndex: 50,
                    overflow: "hidden",
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        padding: collapsed ? "20px 16px" : "20px 24px",
                        borderBottom: "1px solid var(--border-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "space-between",
                    }}
                >
                    <Link
                        href="/dashboard"
                        style={{
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <BarChart3 size={24} style={{ color: "var(--primary)", flexShrink: 0 }} />
                        {!collapsed && (
                            <span className="gradient-text" style={{ fontSize: "1.2rem", fontWeight: 800, whiteSpace: "nowrap" }}>
                                SimbisData
                            </span>
                        )}
                    </Link>
                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                padding: "4px",
                            }}
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}
                </div>

                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            padding: "12px",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <ChevronRight size={18} />
                    </button>
                )}

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
                    {displayItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: collapsed ? "12px" : "12px 16px",
                                    borderRadius: "var(--radius)",
                                    textDecoration: "none",
                                    color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                                    background: isActive ? "rgba(99, 102, 241, 0.15)" : "transparent",
                                    marginBottom: "4px",
                                    transition: "all 0.2s ease",
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    fontSize: "0.9rem",
                                    fontWeight: isActive ? 600 : 400,
                                }}
                            >
                                <Icon size={20} style={{ flexShrink: 0, color: isActive ? "var(--primary)" : undefined }} />
                                {!collapsed && item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User */}
                <div
                    style={{
                        padding: collapsed ? "16px 12px" : "16px 20px",
                        borderTop: "1px solid var(--border-color)",
                    }}
                >
                    <Link
                        href="/"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            textDecoration: "none",
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                            justifyContent: collapsed ? "center" : "flex-start",
                        }}
                    >
                        <LogOut size={18} />
                        {!collapsed && "Keluar"}
                    </Link>
                </div>
            </aside>

            {/* Main content */}
            <main
                style={{
                    flex: 1,
                    minWidth: 0,
                    overflowX: "hidden",
                    marginLeft: collapsed ? "72px" : "260px",
                    transition: "margin-left 0.3s ease",
                    padding: "32px",
                    minHeight: "100vh",
                }}
            >
                {children}
            </main>
        </div>
    );
}
