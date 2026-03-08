import {
    LineChart, Line, AreaChart, Area,
    BarChart, Bar, PieChart, Pie, Cell,
    ScatterChart, Scatter, Treemap, ZAxis,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    FunnelChart, Funnel, LabelList,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import type { ChartRecommendation } from "@/lib/ai-viz-recommender";
import { AnimatedBarRace } from "./AnimatedBarRace";
import { CustomWordCloud } from "./CustomWordCloud";

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#a78bfa", "#f472b6", "#34d399"];

const tooltipStyle = {
    backgroundColor: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "0.8rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

interface Props {
    rec: ChartRecommendation;
    data: any[];
}

export function DynamicChartRenderer({ rec, data }: Props) {
    const { type } = rec;

    // Default formatting for tooltips/axes
    const formatNumber = (num: any) => {
        if (typeof num !== "number") return num;
        if (num >= 1000000) return `Rp${(num / 1000000).toFixed(1)}jt`;
        if (num >= 1000) return `Rp${(num / 1000).toFixed(0)}K`;
        return num.toLocaleString();
    };

    if (!data || data.length === 0) return <div>No data available</div>;

    // Process data using flat fields from ChartRecommendation
    const processedData = generateChartData(data, rec);

    switch (type) {
        case "area":
        case "stacked_area":
        case "line":
            return (
                <ResponsiveContainer width="100%" height="80%">
                    {type === "area" || type === "stacked_area" ? (
                        <AreaChart data={processedData}>
                            <defs>
                                <linearGradient id={`color-${rec.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                            <XAxis dataKey={rec.xField || "name"} stroke="var(--text-muted)" fontSize={11} tickMargin={8} />
                            <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={formatNumber} />
                            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatNumber(v)} />
                            {(rec.fields || [rec.yField]).slice(1).map((key: any, i: number) => (
                                <Area key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} fill={`url(#color-${rec.id})`} strokeWidth={2} />
                            ))}
                        </AreaChart>
                    ) : (
                        <LineChart data={processedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                            <XAxis dataKey={rec.xField || "name"} stroke="var(--text-muted)" fontSize={11} tickMargin={8} />
                            <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={formatNumber} />
                            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatNumber(v)} />
                            <Legend wrapperStyle={{ fontSize: "0.8rem", paddingTop: "10px" }} />
                            {(rec.fields || [rec.yField]).slice(1).map((key: any, i: number) => (
                                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3, fill: COLORS[i % COLORS.length] }} activeDot={{ r: 5 }} />
                            ))}
                        </LineChart>
                    )}
                </ResponsiveContainer>
            );

        case "bar":
        case "horizontal_bar":
        case "grouped_bar":
        case "stacked_bar":
            const isHorizontal = type === "horizontal_bar";
            return (
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={processedData} layout={isHorizontal ? "vertical" : "horizontal"}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={!isHorizontal} vertical={isHorizontal} />
                        {isHorizontal ? (
                            <>
                                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickFormatter={formatNumber} />
                                <YAxis type="category" dataKey={rec.yField || rec.categoryField} stroke="var(--text-muted)" fontSize={10} width={80} tickMargin={5} />
                            </>
                        ) : (
                            <>
                                <XAxis dataKey={rec.xField || rec.categoryField} stroke="var(--text-muted)" fontSize={11} tickMargin={8} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={formatNumber} />
                            </>
                        )}
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatNumber(v)} cursor={{ fill: "rgba(99,102,241,0.05)" }} />
                        <Bar dataKey={isHorizontal ? rec.xField : rec.yField} name={String(isHorizontal ? rec.xField : rec.yField).replace(/_/g, " ")} radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}>
                            {processedData.map((_, idx) => (
                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            );

        case "pie":
        case "donut":
            return (
                <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                        <Pie
                            data={processedData}
                            dataKey={rec.yField || "value"}
                            nameKey={rec.categoryField || "name"}
                            cx="50%" cy="50%"
                            innerRadius={type === "donut" ? 40 : 0}
                            outerRadius={70}
                            paddingAngle={type === "donut" ? 3 : 0}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                if ((percent || 0) < 0.05) return null;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-(midAngle || 0) * Math.PI / 180);
                                const y = cy + radius * Math.sin(-(midAngle || 0) * Math.PI / 180);
                                return (
                                    <text x={x} y={y} fill="white" fontSize={10} fontWeight={600} textAnchor="middle" dominantBaseline="central">
                                        {`${((percent || 0) * 100).toFixed(0)}%`}
                                    </text>
                                );
                            }}
                        >
                            {processedData.map((_, i) => (
                                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatNumber(v)} />
                        <Legend wrapperStyle={{ fontSize: "0.75rem", overflowY: "auto", maxHeight: "40px" }} />
                    </PieChart>
                </ResponsiveContainer>
            );

        case "scatter":
        case "bubble":
            return (
                <ResponsiveContainer width="100%" height="80%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                        <XAxis type="number" dataKey={rec.xField} name={rec.xField} stroke="var(--text-muted)" fontSize={11} tickFormatter={formatNumber} />
                        <YAxis type="number" dataKey={rec.yField} name={rec.yField} stroke="var(--text-muted)" fontSize={11} tickFormatter={formatNumber} />
                        {type === "bubble" && rec.fields?.[2] && (
                            <ZAxis type="number" dataKey={rec.fields[2]} range={[20, 200]} name={rec.fields[2]} />
                        )}
                        <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name={rec.title} data={processedData} fill={COLORS[0]}>
                            {processedData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            );

        case "radar":
            return (
                <ResponsiveContainer width="100%" height="80%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={processedData}>
                        <PolarGrid stroke="var(--border-color)" />
                        <PolarAngleAxis dataKey={rec.categoryField || rec.xField} stroke="var(--text-muted)" fontSize={11} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tickFormatter={formatNumber} fontSize={10} />
                        {(rec.fields || [rec.yField]).filter(f => f !== rec.categoryField && f !== rec.xField).map((key: any, i: number) => (
                            <Radar key={key} name={key} dataKey={key} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.5} />
                        ))}
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatNumber(v)} />
                        <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                    </RadarChart>
                </ResponsiveContainer>
            );

        case "funnel":
            return (
                <ResponsiveContainer width="100%" height="80%">
                    <FunnelChart>
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatNumber(v)} />
                        <Funnel dataKey={rec.yField || "value"} data={processedData} isAnimationActive>
                            <LabelList position="right" fill="var(--text-primary)" stroke="none" dataKey={rec.categoryField || "name"} fontSize={11} />
                            {processedData.map((_, idx) => (
                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                            ))}
                        </Funnel>
                    </FunnelChart>
                </ResponsiveContainer>
            );

        case "treemap":
            return (
                <ResponsiveContainer width="100%" height="80%">
                    <Treemap
                        data={processedData}
                        dataKey={rec.yField || "value"}
                        nameKey={rec.categoryField || "name"}
                        stroke="#fff"
                        fill={COLORS[0]}
                        content={<CustomTreemapContent colors={COLORS} />}
                    >
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatNumber(v)} />
                    </Treemap>
                </ResponsiveContainer>
            );

        case "waterfall":
            // Create waterfall data structure: [start, end] arrays for Recharts
            let cumulative = 0;
            const waterfallData = processedData.map((d, i) => {
                const val = parseFloat(d[rec.yField || "value"]) || 0;
                const isTotal = i === processedData.length - 1 || String(d[rec.categoryField || "name"]).toLowerCase().includes("total");

                const start = isTotal ? 0 : cumulative;
                const end = isTotal ? val : cumulative + val;
                cumulative = end;

                return {
                    name: d[rec.categoryField || "name"],
                    range: [start, end],
                    val: val,
                    isTotal,
                    isPositive: val >= 0
                };
            });

            return (
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={waterfallData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickMargin={8} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={formatNumber} />
                        <Tooltip
                            contentStyle={tooltipStyle}
                            formatter={(v: any, name: any, props: any) => [formatNumber(props.payload.val), name]}
                        />
                        <Bar dataKey="range" radius={[4, 4, 0, 0]}>
                            {waterfallData.map((d, i) => (
                                <Cell key={`cell-${i}`} fill={d.isTotal ? "var(--primary)" : d.isPositive ? "var(--success)" : "var(--danger)"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            );

        case "gauge":
            // Take the first metric from data for the gauge needle
            const gaugeValue = parseFloat(processedData[0]?.[rec.yField || "value"]) || 0;
            const gaugeMax = 100; // Assume percentage for default gauge
            const gaugeRatio = Math.min(Math.max(gaugeValue / gaugeMax, 0), 1);

            // Recharts pie chart trick for a half-donut gauge
            const gaugeData = [
                { name: "Achieved", value: gaugeRatio, fill: "var(--primary)" },
                { name: "Remaining", value: 1 - gaugeRatio, fill: "var(--border-color)" }
            ];

            return (
                <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={gaugeData}
                                cx="50%" cy="75%"
                                startAngle={180} endAngle={0}
                                innerRadius="60%" outerRadius="80%"
                                dataKey="value" stroke="none"
                            >
                                {gaugeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${(v * 100).toFixed(1)}%`} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: "absolute", bottom: "10%", textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                            {gaugeValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}%
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                            {rec.yField || "Completion Rate"}
                        </div>
                    </div>
                </div>
            );

        case "map":
            return (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "20px" }}>
                    <p>Visualisasi <b>peta regional</b> sedang dalam pengembangan.<br /><br />Data tersedia di tabel.</p>
                </div>
            );

        case "box_plot":
        case "sankey":
            // Fallback for complex D3 charts not yet fully native to Recharts
            return (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "20px" }}>
                    <p>Visualisasi <b>{type}</b> sedang dalam tahap rendering khusus / kalkulasi D3.js.<br /><br /> Menampilkan data tabular di layar.</p>
                </div>
            );

        case "wordcloud":
            return (
                <div style={{ width: "100%", height: "100%", minHeight: "250px" }}>
                    <CustomWordCloud
                        data={processedData}
                        textKey={rec.categoryField || rec.fields?.[0] || "name"}
                    />
                </div>
            );

        case "bar_race":
            return (
                <div style={{ width: "100%", height: "80%", position: "relative" }}>
                    <AnimatedBarRace data={data} rec={rec} />
                </div>
            );

        default:
            return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px" }}>Visualisasi tipe <b>{type}</b> belum didukung 😅</div>;
    }
}

// Helper: Custom Treemap Label
function CustomTreemapContent(props: any) {
    const { root, depth, x, y, width, height, index, colors, name } = props;
    return (
        <g>
            <rect
                x={x} y={y} width={width} height={height}
                style={{ fill: depth < 2 ? colors[Math.floor(index / root.children.length * 6)] : '#ffffff00', stroke: '#fff', strokeWidth: 2 / (depth + 1e-10), strokeOpacity: 1 / (depth + 1e-10) }}
            />
            {width > 30 && height > 20 ? (
                <text x={x + width / 2} y={y + height / 2 + 3} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={600} style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.5)" }}>
                    {name}
                </text>
            ) : null}
        </g>
    );
}

import { getFieldValue, getFieldNum, getFieldStr } from "@/lib/data-accessor";

// Helper: Aggregation logic for raw data based on chart recommendation
function generateChartData(data: any[], rec: ChartRecommendation): any[] {
    const { xField, yField, categoryField } = rec;

    // Time-series aggregation (Line/Area)
    if (xField && yField && !categoryField && (rec.type === "line" || rec.type === "area" || rec.type === "stacked_area")) {
        const map = new Map();
        data.forEach(row => {
            let key = getFieldValue(row, xField);
            if (key instanceof Date) key = key.toISOString().split('T')[0];
            const val = getFieldNum(row, yField) || 0;
            if (key) map.set(key, (map.get(key) || 0) + val);
        });
        const result = Array.from(map.entries()).map(([k, v]) => ({ [xField]: k, [yField]: v }));
        return result.sort((a, b) => String(a[xField]).localeCompare(String(b[xField]))); // Sort by date/key
    }

    // Categorical aggregation (Bar/Pie/Donut/Treemap)
    if (categoryField && yField) {
        const map = new Map();
        data.forEach(row => {
            const cat = getFieldStr(row, categoryField) || "Unknown";
            const val = getFieldNum(row, yField) || 1; // if value key not numeric, count it
            map.set(cat, (map.get(cat) || 0) + val);
        });
        const result = Array.from(map.entries())
            .map(([k, v]) => ({ [categoryField]: k, [yField]: v }))
            .sort((a, b) => b[yField] - a[yField]); // Sort descending
        return result.slice(0, 15); // Top N
    }

    // WordCloud aggregation
    if (rec.type === "wordcloud" && rec.fields && rec.fields.length > 0) {
        const textCol = rec.fields[0];
        const wordCount = new Map();

        data.forEach(row => {
            const text = getFieldStr(row, textCol).toLowerCase();
            // Split by words, remove short words and basic punctuation
            const words = text.split(/[\s,.-]+/).filter(w => w.length > 3);
            words.forEach(w => {
                wordCount.set(w, (wordCount.get(w) || 0) + 1);
            });
        });

        return Array.from(wordCount.entries())
            .map(([text, value]) => ({ text, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 50); // Top 50 words
    }

    // Scatter plot (no aggregation)
    if (xField && yField && (rec.type === "scatter" || rec.type === "bubble")) {
        return data.filter(d => getFieldValue(d, xField) != null && getFieldValue(d, yField) != null).slice(0, 500);
    }

    // Fallback: assume data is already formatted or we just take top N rows
    return data.slice(0, 15);
}
