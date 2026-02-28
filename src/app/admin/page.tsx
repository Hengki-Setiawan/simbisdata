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
                <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Users */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2,100</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>

                {/* Active Subscriptions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active PRO Users</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">482</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>

                {/* Estimated MRR */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estimated MRR</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp 38.078.000</div>
                        <p className="text-xs text-muted-foreground">+18% from last month</p>
                    </CardContent>
                </Card>

                {/* Total API Tokens Processed */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Groq Tokens Used</CardTitle>
                        <Box className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1.2M</div>
                        <p className="text-xs text-muted-foreground">Within free tier limits</p>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Chart */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Platform Growth</CardTitle>
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
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Area yAxisId="left" type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Total Users" />
                                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Revenue (Rp x1000)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
