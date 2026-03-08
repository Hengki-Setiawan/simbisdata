"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPIData {
  label: string;
  value: string | number;
  delta?: number;          // percentage change
  deltaLabel?: string;
  icon: React.ReactNode;
  iconColor?: string;
  sparkline?: number[];    // 7 points for mini chart
  prefix?: string;
}

export function ComparisonKPI({ data }: { data: KPIData }) {
  const { label, value, delta, deltaLabel, icon, iconColor = "var(--primary)", sparkline, prefix = "" } = data;
  const isPositive = (delta || 0) >= 0;
  const DeltaIcon = delta === 0 ? Minus : isPositive ? TrendingUp : TrendingDown;
  const deltaColor = delta === undefined ? "var(--text-muted)" : isPositive ? "var(--success)" : "var(--danger)";

  return (
    <div style={{
      background: "var(--bg-card)",
      borderRadius: "16px",
      padding: "20px 24px",
      border: "1px solid var(--border-color)",
      boxShadow: "var(--shadow-sm)",
      transition: "all 0.2s ease",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--text-muted)" }}>{label}</span>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: `${iconColor}12`, display: "flex", alignItems: "center", justifyContent: "center",
          color: iconColor,
        }}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "8px" }}>
        {prefix}{typeof value === "number" ? value.toLocaleString("id-ID") : value}
      </div>

      {/* Delta + Sparkline */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {delta !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", fontWeight: 600, color: deltaColor }}>
            <DeltaIcon size={14} />
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}%
            {deltaLabel && <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: "4px" }}>{deltaLabel}</span>}
          </div>
        )}
        {sparkline && sparkline.length > 0 && <MiniSparkline data={sparkline} color={deltaColor} />}
      </div>
    </div>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 60, h = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
