"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3, LayoutDashboard, Users, DollarSign,
    Activity, Settings, ChevronLeft, ChevronRight, ArrowLeft,
    Ticket, ScrollText, CreditCard, Megaphone, Headphones,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { label: "Revenue", href: "/admin/revenue", icon: DollarSign },
    { label: "API Usage", href: "/admin/api-usage", icon: Activity },
    { label: "Demo Tokens", href: "/admin/demo", icon: Ticket },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Support", href: "/admin/support", icon: Headphones },
    { label: "Logs", href: "/admin/logs", icon: ScrollText },
    { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <aside style={{
                width: collapsed ? "72px" : "260px",
                background: "var(--bg-card)", borderRight: "1px solid var(--border-color)",
                display: "flex", flexDirection: "column", transition: "width 0.3s ease",
                position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, overflow: "hidden",
            }}>
                <div style={{
                    padding: collapsed ? "20px 16px" : "20px 24px",
                    borderBottom: "1px solid var(--border-color)",
                    display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between",
                }}>
                    <Link href="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                        <BarChart3 size={24} style={{ color: "var(--danger)", flexShrink: 0 }} />
                        {!collapsed && <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--danger)" }}>Admin</span>}
                    </Link>
                    {!collapsed && (
                        <button onClick={() => setCollapsed(true)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                            <ChevronLeft size={18} />
                        </button>
                    )}
                </div>

                {collapsed && (
                    <button onClick={() => setCollapsed(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "12px", display: "flex", justifyContent: "center" }}>
                        <ChevronRight size={18} />
                    </button>
                )}

                <nav style={{ flex: 1, padding: "16px 12px" }}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href} style={{
                                display: "flex", alignItems: "center", gap: "12px",
                                padding: collapsed ? "12px" : "12px 16px", borderRadius: "var(--radius)",
                                textDecoration: "none", color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                                background: isActive ? "rgba(239, 68, 68, 0.12)" : "transparent",
                                marginBottom: "4px", transition: "all 0.2s ease",
                                justifyContent: collapsed ? "center" : "flex-start",
                                fontSize: "0.9rem", fontWeight: isActive ? 600 : 400,
                            }}>
                                <Icon size={20} style={{ flexShrink: 0, color: isActive ? "var(--danger)" : undefined }} />
                                {!collapsed && item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: collapsed ? "16px 12px" : "16px 20px", borderTop: "1px solid var(--border-color)" }}>
                    <Link href="/dashboard" style={{
                        display: "flex", alignItems: "center", gap: "10px", textDecoration: "none",
                        color: "var(--text-muted)", fontSize: "0.85rem", justifyContent: collapsed ? "center" : "flex-start",
                    }}>
                        <ArrowLeft size={18} />
                        {!collapsed && "User Dashboard"}
                    </Link>
                </div>
            </aside>

            <main style={{ flex: 1, marginLeft: collapsed ? "72px" : "260px", transition: "margin-left 0.3s ease", padding: "32px", minHeight: "100vh" }}>
                {children}
            </main>
        </div>
    );
}
