"use client";

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { ChartRecommendation } from '@/lib/ai-viz-recommender';
import { Loader2 } from 'lucide-react';

interface Props {
    rec: ChartRecommendation;
    data: any[];
}

interface GeoData {
    name: string;
    value: number;
    lat: number;
    lng: number;
}

export default function RegionalMapClient({ rec, data }: Props) {
    const [geoData, setGeoData] = useState<GeoData[]>([]);
    const [loading, setLoading] = useState(true);

    const aggregated = useMemo(() => {
        const { categoryField, yField } = rec;
        if (!categoryField || !yField) return [];

        const map = new Map<string, number>();
        data.forEach(row => {
            const loc = String(row[categoryField] || "Unknown").trim();
            const val = Number(row[yField]) || 1;
            if (loc && loc !== "Unknown") {
                map.set(loc, (map.get(loc) || 0) + val);
            }
        });

        return Array.from(map.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [data, rec]);

    useEffect(() => {
        const fetchCoords = async () => {
            if (aggregated.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Get top 30 locations to avoid hitting rate limits too hard
                const topLocs = aggregated.slice(0, 30);
                const addresses = topLocs.map(l => l.name);

                const res = await fetch("/api/geocode", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ addresses })
                });

                if (res.ok) {
                    const { results } = await res.json();

                    const finalData: GeoData[] = topLocs.map(loc => {
                        const coords = results[loc.name];
                        if (coords && coords.lat != null && coords.lng != null) {
                            return { ...loc, lat: coords.lat, lng: coords.lng };
                        }
                        return null;
                    }).filter(Boolean) as GeoData[];

                    setGeoData(finalData);
                }
            } catch (err) {
                console.error("Geocoding failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCoords();
    }, [aggregated]);

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", gap: "12px" }}>
                <Loader2 size={32} className="spin" style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "0.85rem" }}>Memetakan lokasi geografis...</span>
            </div>
        );
    }

    if (geoData.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                Data geocoding tidak ditemukan.
            </div>
        );
    }

    // Calculate max value for sizing circles
    const maxVal = Math.max(...geoData.map(d => d.value));

    // Default center to Indonesia
    const centerLat = geoData.length > 0 ? geoData[0].lat : -0.7893;
    const centerLng = geoData.length > 0 ? geoData[0].lng : 113.9213;

    return (
        <div style={{ width: "100%", height: "100%", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
            <MapContainer
                center={[centerLat, centerLng]}
                zoom={5}
                scrollWheelZoom={false}
                style={{ width: "100%", height: "100%", zIndex: 0 }}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {geoData.map((loc, i) => {
                    // Radius between 5 and 25 based on value relative to max
                    const radius = 5 + (loc.value / maxVal) * 20;

                    return (
                        <CircleMarker
                            key={i}
                            center={[loc.lat, loc.lng]}
                            radius={radius}
                            pathOptions={{
                                color: "var(--primary)",
                                fillColor: "var(--primary)",
                                fillOpacity: 0.6,
                                weight: 2
                            }}
                        >
                            <Popup>
                                <div style={{ padding: "4px" }}>
                                    <strong style={{ display: "block", marginBottom: "4px" }}>{loc.name}</strong>
                                    <span style={{ color: "var(--text-secondary)" }}>
                                        {rec.yField}: <b>{loc.value >= 1000 ? `Rp${(loc.value / 1000).toLocaleString()}` : loc.value.toLocaleString()}</b>
                                    </span>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>

            {/* Overlay hint */}
            <div style={{
                position: "absolute", bottom: "10px", right: "10px",
                background: "var(--bg-surface)", padding: "4px 8px",
                borderRadius: "4px", fontSize: "0.7rem", color: "var(--text-muted)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 1000,
                border: "1px solid var(--border-color)", pointerEvents: "none"
            }}>
                Ukuran lingkaran berdasarkan {rec.yField}
            </div>
        </div>
    );
}
