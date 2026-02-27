"use client";

import ReactECharts from "echarts-for-react";
import type { ClusterResult } from "@/lib/ml-algorithms";
import "echarts-gl"; // Required for 3D charts

export default function Scatter3D({ data }: { data: ClusterResult }) {
    if (!data || data.assignments.length === 0) return null;

    const series = data.clusters.map((cluster) => {
        const clusterPoints = data.assignments.filter((a) => a.cluster === cluster.id);
        const seriesData = clusterPoints.map((p) => {
            const avgOrderValue = p.orders > 0 ? Math.round(p.spending / p.orders) : 0;
            return [
                Math.round(p.spending / 1000), // X: Total Spending (in K)
                p.orders,                      // Y: Total Orders
                Math.round(avgOrderValue / 1000), // Z: Avg Order Value (in K)
                p.customer                     // Custom info
            ];
        });

        return {
            name: cluster.label,
            type: "scatter3D",
            data: seriesData,
            symbolSize: 6,
            itemStyle: {
                color: cluster.color,
                opacity: 0.8,
            },
            emphasis: {
                itemStyle: {
                    color: "#ffffff" // Highlight on hover
                }
            }
        };
    });

    const option = {
        tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            borderColor: "rgba(99, 102, 241, 0.3)",
            textStyle: { color: "#f8fafc" },
            padding: 12,
            borderRadius: 8,
            formatter: function (params: any) {
                const spending = params.value[0];
                const orders = params.value[1];
                const aov = params.value[2];
                const cust = params.value[3];
                return `<b style="color:${params.color}">${params.seriesName}</b><br/>` +
                    `User: <b>${cust}</b><br/>` +
                    `Spend: Rp ${spending}K<br/>` +
                    `Orders: ${orders}x<br/>` +
                    `Avg/Order: Rp ${aov}K`;
            }
        },
        legend: {
            textStyle: { color: "#94a3b8" },
            data: data.clusters.map((c) => c.label)
        },
        grid3D: {
            viewControl: {
                autoRotate: true,
                autoRotateSpeed: 10,
                distance: 250,
                alpha: 20, // look down 20 degrees
                beta: 40   // rotate horizontally
            },
            light: {
                main: {
                    shadow: true,
                    quality: "high",
                    intensity: 1.2
                },
                ambient: {
                    intensity: 0.5
                }
            },
            axisPointer: {
                show: false
            },
            xAxis3D: {
                name: "Total Spend (K)",
                axisLine: { lineStyle: { color: "#475569" } },
                axisLabel: { color: "#64748b" }
            },
            yAxis3D: {
                name: "Orders",
                axisLine: { lineStyle: { color: "#475569" } },
                axisLabel: { color: "#64748b" }
            },
            zAxis3D: {
                name: "AOV (K)",
                axisLine: { lineStyle: { color: "#475569" } },
                axisLabel: { color: "#64748b" }
            }
        },
        series: series
    };

    return (
        <ReactECharts
            option={option}
            style={{ height: "450px", width: "100%", borderRadius: "12px", background: "linear-gradient(135deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.8) 100%)" }}
        />
    );
}
