"use client";

import type { ClusterResult } from "@/lib/ml-algorithms";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#6366f1", "#ef4444", "#10b981", "#f59e0b", "#a78bfa", "#f472b6"];

/**
 * Scatter3D replacement — uses Recharts 2D scatter (ECharts removed)
 * Plots customer spending vs orders, colored by cluster assignment
 */
export default function Scatter3D({ data }: { data: ClusterResult }) {
    if (!data || data.assignments.length === 0) return null;

    const scatterData = data.assignments.map((a) => ({
        x: a.spending,
        y: a.orders,
        cluster: a.cluster,
        customer: a.customer,
    }));

    return (
        <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <XAxis type="number" dataKey="x" name="Spending" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis type="number" dataKey="y" name="Orders" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.8rem" }}
                    formatter={(value: any) => [typeof value === 'number' ? value.toLocaleString() : value]}
                />
                <Scatter data={scatterData} fill="#6366f1">
                    {scatterData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[entry.cluster % COLORS.length]} />
                    ))}
                </Scatter>
            </ScatterChart>
        </ResponsiveContainer>
    );
}
