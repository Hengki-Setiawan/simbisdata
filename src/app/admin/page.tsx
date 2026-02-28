"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, CreditCard, Box } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Dummy data for platform growth
const growthData = [
    { name: 'Jan', users: 400, revenue: 2400 },
    { name: 'Feb', users: 600, revenue: 4398 },
    { name: 'Mar', users: 800, revenue: 6800 },
    { name: 'Apr', users: 1200, revenue: 8908 },
    { name: 'May', users: 1500, revenue: 11200 },
    { name: 'Jun', users: 2100, revenue: 16800 },
];

export default function AdminOverview() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight text-white pointer-events-none">Platform Overview</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Users */}
                <Card style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">2,100</div>
                        <p className="text-xs text-gray-400">+20.1% from last month</p>
                    </CardContent>
                </Card>

                {/* Active Subscriptions */}
                <Card style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Active PRO Users</CardTitle>
                        <CreditCard className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">482</div>
                        <p className="text-xs text-gray-400">+12% from last month</p>
                    </CardContent>
                </Card>

                {/* Estimated MRR */}
                <Card style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Estimated MRR</CardTitle>
                        <Activity className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">Rp 38.078.000</div>
                        <p className="text-xs text-gray-400">+18% from last month</p>
                    </CardContent>
                </Card>

                {/* Total API Tokens Processed */}
                <Card style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Groq Tokens Used</CardTitle>
                        <Box className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">1.2M</div>
                        <p className="text-xs text-gray-400">Within free tier limits</p>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Chart */}
            <Card className="col-span-4" style={{ background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
                <CardHeader>
                    <CardTitle className="text-white">Platform Growth</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={growthData}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" />
                                <YAxis yAxisId="left" stroke="var(--text-muted)" />
                                <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" />
                                <Tooltip contentStyle={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)", borderRadius: "8px" }} />
                                <Area yAxisId="left" type="monotone" dataKey="users" stroke="#6366f1" fill="url(#colorUsers)" strokeWidth={2} name="Total Users" />
                                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRevenue)" strokeWidth={2} name="Revenue (Rp x1000)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
