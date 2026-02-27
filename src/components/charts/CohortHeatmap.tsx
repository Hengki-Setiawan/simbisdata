"use client";

import ReactECharts from "echarts-for-react";
import type { CohortResult } from "@/lib/ml-algorithms";

export default function CohortHeatmap({ data }: { data: CohortResult }) {
    if (!data || data.cohorts.length === 0) return null;

    const yAxisData = data.cohorts.map((c) => c.month).reverse(); // Reverse so earliest is at top

    // Find maximum months elapsed
    const maxMonths = Math.max(...data.cohorts.map(c => c.retention.length));
    const xAxisData = Array.from({ length: maxMonths }, (_, i) => `Month ${i}`);

    const heatmapData = [];

    for (let y = 0; y < data.cohorts.length; y++) {
        // Since we reversed yAxis, actual index is data.cohorts.length - 1 - y
        const cohortIndex = data.cohorts.length - 1 - y;
        const cohort = data.cohorts[cohortIndex];

        for (let x = 0; x < cohort.retention.length; x++) {
            const value = Math.round(cohort.retention[x] * 10) / 10; // 1 decimal place
            heatmapData.push([x, y, value]);
        }
    }

    const option = {
        tooltip: {
            position: "top",
            formatter: function (params: any) {
                const xIndex = params.value[0];
                const yIndex = params.value[1];
                const value = params.value[2];
                const cohort = yAxisData[yIndex];
                return `${cohort} - Month ${xIndex}<br/>Retention: <b>${value}%</b>`;
            },
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            borderColor: "rgba(99, 102, 241, 0.3)",
            textStyle: { color: "#f8fafc" },
            padding: 12,
            borderRadius: 8,
        },
        grid: {
            top: 20,
            bottom: 20,
            left: 80,
            right: 20,
        },
        xAxis: {
            type: "category",
            data: xAxisData,
            splitArea: { show: true },
            axisLabel: { color: "#94a3b8" },
            axisLine: { lineStyle: { color: "#334155" } }
        },
        yAxis: {
            type: "category",
            data: yAxisData,
            splitArea: { show: true },
            axisLabel: { color: "#94a3b8" },
            axisLine: { show: false },
            axisTick: { show: false }
        },
        visualMap: {
            min: 0,
            max: 100,
            calculable: true,
            orient: "horizontal",
            left: "center",
            bottom: "-100%", // Hide the visual map bar
            inRange: {
                color: ["rgba(99, 102, 241, 0.05)", "rgba(99, 102, 241, 0.4)", "rgba(99, 102, 241, 0.8)", "rgba(99, 102, 241, 1)"]
            }
        },
        series: [
            {
                name: "Retention Heatmap",
                type: "heatmap",
                data: heatmapData,
                label: {
                    show: true,
                    formatter: function (params: any) {
                        return params.value[2] + "%";
                    },
                    color: "#ffffff"
                },
                itemStyle: {
                    borderColor: "#1e293b",
                    borderWidth: 2,
                    borderRadius: 4
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                        borderColor: "#818cf8",
                        borderWidth: 2
                    }
                }
            }
        ]
    };

    return (
        <ReactECharts
            option={option}
            style={{ height: Math.max(300, data.cohorts.length * 40) + "px", width: "100%" }}
            opts={{ renderer: "canvas" }}
        />
    );
}
