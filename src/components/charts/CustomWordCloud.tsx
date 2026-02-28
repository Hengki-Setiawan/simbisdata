"use client";

import { useEffect, useState, useMemo } from "react";
import { Tooltip } from "recharts";

interface Word {
    text: string;
    value: number;
    x?: number;
    y?: number;
    size?: number;
    color?: string;
    rotation?: number;
}

interface Props {
    data: any[];
    textKey: string;
    width?: number;
    height?: number;
}

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#a78bfa", "#f472b6", "#34d399"];

function stopWords() {
    return new Set(["dan", "ke", "dari", "di", "yang", "untuk", "pada", "dengan", "ini", "itu", "ada", "sebut", "bisa", "tidak", "akan", "dalam", "atas", null, undefined, ""]);
}

export function CustomWordCloud({ data, textKey, width = 600, height = 300 }: Props) {
    const [words, setWords] = useState<Word[]>([]);

    useEffect(() => {
        if (!data || data.length === 0) return;

        // 1. Calculate word frequencies
        const freqMap = new Map<string, number>();
        const stops = stopWords();

        data.forEach(item => {
            const text = String(item[textKey] || "").toLowerCase();
            const tokens = text.match(/\b\w{3,}\b/g) || [];
            tokens.forEach(t => {
                if (!stops.has(t) && !/^\d+$/.test(t)) {
                    freqMap.set(t, (freqMap.get(t) || 0) + 1);
                }
            });
        });

        // 2. Sort by frequency and take top N
        const sorted = Array.from(freqMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .map(([text, value]) => ({ text, value }));

        if (sorted.length === 0) return;

        const maxVal = sorted[0].value;
        const minVal = sorted[sorted.length - 1].value;
        const sizeRatio = 60 / (maxVal - minVal || 1);

        // 3. Simple Archimedean spiral layout simulation
        const placedWords: Word[] = [];
        const cx = width / 2;
        const cy = height / 2;

        sorted.forEach((w, i) => {
            const size = Math.max(12, 12 + (w.value - minVal) * sizeRatio);
            let angle = i * 2;
            let radius = 0;
            let px = cx;
            let py = cy;

            // Very naive positioning based on spiral (not true collision detection for performance)
            if (i > 0) {
                radius = Math.sqrt(i) * 20;
                py = cy + Math.sin(angle) * radius * 0.6; // squash vertically
                px = cx + Math.cos(angle) * radius;
            }

            placedWords.push({
                ...w,
                size,
                x: px,
                y: py,
                color: COLORS[i % COLORS.length],
                // Randomly rotate some words
                rotation: i % 3 === 0 && size < 30 ? -90 : 0
            });
        });

        setWords(placedWords);
    }, [data, textKey, width, height]);

    if (words.length === 0) return <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>Tidak cukup variasi teks untuk Word Cloud.</div>;

    return (
        <div style={{ position: "relative", width: "100%", height, background: "rgba(0,0,0,0.1)", borderRadius: "8px", overflow: "hidden" }}>
            {words.map((w, i) => (
                <div
                    key={i}
                    title={`${w.text} (${w.value})`}
                    style={{
                        position: "absolute",
                        left: w.x,
                        top: w.y,
                        transform: `translate(-50%, -50%) rotate(${w.rotation}deg)`,
                        fontSize: `${w.size}px`,
                        fontWeight: w.size! > 24 ? 800 : 600,
                        color: w.color,
                        whiteSpace: "nowrap",
                        cursor: "default",
                        transition: "all 0.3s ease",
                        textShadow: "0px 2px 4px rgba(0,0,0,0.5)"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = `translate(-50%, -50%) rotate(${w.rotation}deg) scale(1.2)`;
                        e.currentTarget.style.zIndex = "10";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = `translate(-50%, -50%) rotate(${w.rotation}deg) scale(1)`;
                        e.currentTarget.style.zIndex = "1";
                    }}
                >
                    {w.text}
                </div>
            ))}
        </div>
    );
}
