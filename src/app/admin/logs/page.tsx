"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, Zap, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Dummy data for API Token Usage representing Groq limits
const usageData = [
    { time: "00:00", tokens: 12000 },
    { time: "04:00", tokens: 8000 },
    { time: "08:00", tokens: 45000 },
    { time: "12:00", tokens: 89000 },
    { time: "16:00", tokens: 112000 },
    { time: "20:00", tokens: 76000 },
];

export default function ApiLogsPage() {
    const currentTokenUsage = 342000;
    const maxTokenLimit = 500000; // Free tier mock limit
    const usagePercentage = (currentTokenUsage / maxTokenLimit) * 100;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">API Usage Logs</h2>
                    <p className="text-muted-foreground text-sm">Monitor Groq AI generated tokens across all users.</p>
                </div>
            </div>

            {usagePercentage > 80 && (
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Warning: Approaching API Limits</AlertTitle>
                    <AlertDescription>
                        You have used {usagePercentage.toFixed(1)}% of your free tier Groq token limit for today. Consider upgrading your Groq plan or enabling the Gemini fallback.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Daily Tokens Processed</CardTitle>
                        <Zap className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentTokenUsage.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mb-4">/ {maxTokenLimit.toLocaleString()} Daily Limit</p>
                        <Progress value={usagePercentage} className="h-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Rate Limit Status (Groq)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Healthy</div>
                        <p className="text-xs text-muted-foreground mt-1">Average response time: 0.8s</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Token Usage (Last 24 Hours)</CardTitle>
                    <CardDescription>Estimated tokens used for data narration across all active users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: any) => [`${Number(value).toLocaleString()} tokens`, 'Usage']}
                                    cursor={{ fill: 'rgba(0,0,0,0.1)' }}
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
