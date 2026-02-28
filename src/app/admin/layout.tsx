import Link from 'next/link';
import { Home, Users, Key, LineChart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
            {/* Sidebar Admin */}
            <aside className="w-64 border-r bg-white dark:bg-gray-950 px-4 py-6 flex flex-col hidden md:flex">
                <div className="mb-8 px-2">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 pointer-events-none">
                        SimbisData Admin
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 pointer-events-none">Platform Management</p>
                </div>

                <nav className="space-y-1 flex-1">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start">
                            <Home className="mr-2 h-4 w-4" />
                            Overview
                        </Button>
                    </Link>
                    <Link href="/admin/users">
                        <Button variant="ghost" className="w-full justify-start">
                            <Users className="mr-2 h-4 w-4" />
                            Users & Plans
                        </Button>
                    </Link>
                    <Link href="/admin/demo">
                        <Button variant="ghost" className="w-full justify-start">
                            <Key className="mr-2 h-4 w-4" />
                            Demo Tokens
                        </Button>
                    </Link>
                    <Link href="/admin/logs">
                        <Button variant="ghost" className="w-full justify-start">
                            <LineChart className="mr-2 h-4 w-4" />
                            API Usage
                        </Button>
                    </Link>
                </nav>

                <div className="mt-auto border-t pt-4">
                    <Link href="/dashboard">
                        <Button variant="outline" className="w-full justify-start text-muted-foreground">
                            <Settings className="mr-2 h-4 w-4" />
                            Exit to App
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto">
                <header className="h-16 border-b bg-white dark:bg-gray-950 flex items-center px-6 sticky top-0 z-10">
                    <h1 className="text-lg font-semibold pointer-events-none">Administration Console</h1>
                </header>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
