import Link from 'next/link';
import { Home, Users, Key, LineChart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-main)", color: "var(--text-primary)" }}>
            {/* Sidebar Admin */}
            <aside style={{ width: "260px", background: "var(--bg-surface)", borderRight: "1px solid var(--border-color)", padding: "24px 16px", display: "flex", flexDirection: "column" }} className="hidden md:flex">
                <div style={{ marginBottom: "32px", padding: "0 8px" }}>
                    <h2 className="gradient-text" style={{ fontSize: "1.25rem", fontWeight: 800, pointerEvents: "none" }}>
                        SimbisData Admin
                    </h2>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", pointerEvents: "none" }}>Platform Management</p>
                </div>

                <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-[#1a1a3e]">
                            <Home className="mr-3 h-4 w-4" />
                            Overview
                        </Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#1a1a3e]">
                            <Users className="mr-3 h-4 w-4" />
                            Users & Plans
                        </Button>
                    </Link>
                    <Link href="/admin/demo">
                        <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#1a1a3e]">
                            <Key className="mr-3 h-4 w-4" />
                            Demo Tokens
                        </Button>
                    </Link>
                    <Link href="/admin/logs">
                        <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#1a1a3e]">
                            <LineChart className="mr-3 h-4 w-4" />
                            API Usage
                        </Button>
                    </Link>
                </nav>

                <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
                    <Link href="/dashboard">
                        <Button variant="outline" className="w-full justify-start text-gray-400 border-gray-700 bg-transparent hover:bg-[#1a1a3e] hover:text-white">
                            <Settings className="mr-3 h-4 w-4" />
                            Exit to App
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, overflow: "auto" }}>
                <header style={{ height: "64px", borderBottom: "1px solid var(--border-color)", background: "var(--bg-surface)", display: "flex", alignItems: "center", padding: "0 24px", position: "sticky", top: 0, zIndex: 10 }}>
                    <h1 style={{ fontSize: "1.125rem", fontWeight: 600, pointerEvents: "none" }}>Administration Console</h1>
                </header>
                <div style={{ padding: "24px" }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
