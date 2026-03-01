"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, Key, LineChart, DollarSign,
    Headphones, Megaphone, Settings, CreditCard, ArrowLeft, Globe
} from "lucide-react";

const menuItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Users & Plans", href: "/admin/users", icon: Users },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { label: "Revenue", href: "/admin/revenue", icon: DollarSign },
    { label: "Support Tickets", href: "/admin/support", icon: Headphones },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Demo Tokens", href: "/admin/demo", icon: Key },
    { label: "API Usage", href: "/admin/logs", icon: LineChart },
    { label: "Landing CMS", href: "/admin/landing", icon: Globe },
    { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-main)", color: "var(--text-primary)" }}>
            {/* Sidebar Admin */}
            <aside style={{
                width: "260px",
                background: "var(--bg-card)",
                borderRight: "1px solid var(--border-color)",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 50,
                overflow: "hidden",
            }}>
                {/* Logo */}
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)" }}>
                    <h2 className="gradient-text" style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                        simbisai Admin
                    </h2>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Platform Management</p>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto" }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "10px 14px",
                                    borderRadius: "var(--radius)",
                                    textDecoration: "none",
                                    color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                                    background: isActive ? "rgba(99, 102, 241, 0.15)" : "transparent",
                                    fontSize: "0.88rem",
                                    fontWeight: isActive ? 600 : 400,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <Icon size={18} style={{ flexShrink: 0, color: isActive ? "var(--primary-light)" : undefined }} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div style={{ borderTop: "1px solid var(--border-color)", padding: "12px" }}>
                    <Link
                        href="/dashboard"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 14px",
                            borderRadius: "var(--radius)",
                            textDecoration: "none",
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                            border: "1px solid var(--border-color)",
                            transition: "all 0.2s",
                        }}
                    >
                        <ArrowLeft size={16} />
                        Exit to App
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, minWidth: 0, overflowX: "hidden", marginLeft: "260px" }}>
                <header style={{
                    height: "64px",
                    borderBottom: "1px solid var(--border-color)",
                    background: "var(--bg-card)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 32px",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backdropFilter: "blur(12px)",
                }}>
                    <h1 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Administration Console</h1>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        background: "var(--bg-surface)",
                        padding: "4px 12px",
                        borderRadius: "100px",
                        border: "1px solid var(--border-color)",
                    }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)" }} />
                        Live System
                    </div>
                </header>
                <div style={{ padding: "32px", maxWidth: "100%", overflowX: "hidden" }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
