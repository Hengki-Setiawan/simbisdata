"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, Zap, ShieldAlert, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ApiStats {
    totalTokens: number;
    totalCalls: number;
    providers: { provider: string; count: number; tokens: number }[];
}

const cardStyle = { background: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" };

export default function ApiLogsPage() {
    const [stats, setStats] = useState<ApiStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("/api/admin/api-usage");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error("Failed to fetch API usage:", err);
        } finally {
            setLoading(false);
        }
    };

    const maxTokenLimit = 500000;
    const currentTokenUsage = stats?.totalTokens || 0;
    const usagePercentage = (currentTokenUsage / maxTokenLimit) * 100;

    // Build chart data from provider stats
    const usageData = stats?.providers?.map((p) => ({
        name: p.provider,
        tokens: p.tokens,
        calls: p.count,
    })) || [{ name: "No data", tokens: 0, calls: 0 }];

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">API Usage Logs</h2>
                    <p className="text-gray-400 text-sm">Monitor Groq & Gemini AI token usage across all users.</p>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-surface)", padding: "4px 12px", borderRadius: "100px", border: "1px solid var(--border-color)" }}>
                    Live Data
                </span>
            </div>

            {usagePercentage > 80 && (
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Warning: Approaching API Limits</AlertTitle>
                    <AlertDescription>
                        You have used {usagePercentage.toFixed(1)}% of your estimated daily Groq token limit.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <Card style={cardStyle}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Total Tokens Processed</CardTitle>
                        <Zap className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{currentTokenUsage.toLocaleString()}</div>
                        <p className="text-xs text-gray-400 mb-4">/ {maxTokenLimit.toLocaleString()} Daily Limit (est.)</p>
                        <Progress value={Math.min(usagePercentage, 100)} className="h-2" />
                    </CardContent>
                </Card>

                <Card style={cardStyle}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-300">Total API Calls</CardTitle>
                        <AlertCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">{stats?.totalCalls?.toLocaleString() || 0}</div>
                        <p className="text-xs text-gray-400 mt-1">From apiLogs table</p>
                    </CardContent>
                </Card>
            </div>

            <Card style={cardStyle}>
                <CardHeader>
                    <CardTitle className="text-white">Token Usage by Provider</CardTitle>
                    <CardDescription className="text-gray-400">Breakdown of token usage across AI providers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" />
                                <YAxis stroke="var(--text-muted)" />
                                <Tooltip
                                    contentStyle={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", color: "var(--text-primary)", borderRadius: "8px" }}
                                    formatter={(value: any) => [`${Number(value).toLocaleString()} tokens`, 'Usage']}
                                    cursor={{ fill: 'rgba(99,102,241,0.1)' }}
                                />
                                <Bar dataKey="tokens" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
