"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { batchGeocode, type GeoResult } from "@/lib/external-apis";

// Fix React-Leaflet icon issues in Next.js
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});

interface RegionData { province: string; orders: number; revenue: number; }

interface Props {
    data: RegionData[];
}

// Auto-fit bounds component
function MapBounds({ locations }: { locations: GeoResult[] }) {
    const map = useMap();
    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [locations, map]);
    return null;
}

export default function InteractiveLeafletMap({ data }: Props) {
    const [locations, setLocations] = useState<Map<string, GeoResult>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (data.length === 0) return;

        const fetchGeo = async () => {
            setLoading(true);
            const provinces = data.map(d => d.province);
            const geoMap = await batchGeocode(provinces);
            setLocations(geoMap);
            setLoading(false);
        };
        fetchGeo();
    }, [data]);

    const maxOrders = Math.max(...data.map(d => d.orders), 1);

    if (loading) {
        return (
            <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)", borderRadius: "8px", border: "1px dashed var(--border-color)" }}>
                <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    <div className="spinner" style={{ margin: "0 auto 12px auto" }}></div>
                    <p>Geocoding locations via OpenStreetMap...</p>
                </div>
            </div>
        );
    }

    // Default to Indonesia center
    const center: [number, number] = [-0.7893, 113.9213];

    return (
        <div style={{ height: "400px", width: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)", zIndex: 0 }}>
            <MapContainer center={center} zoom={5} scrollWheelZoom={false} style={{ height: "100%", width: "100%", background: "#1a1a24" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {data.map((region) => {
                    const geo = locations.get(region.province);
                    if (!geo) return null;

                    const radius = Math.max(10, (region.orders / maxOrders) * 30);

                    return (
                        <CircleMarker
                            key={region.province}
                            center={[geo.lat, geo.lng]}
                            pathOptions={{
                                color: "var(--primary)",
                                fillColor: "var(--primary)",
                                fillOpacity: 0.6,
                                weight: 2
                            }}
                            radius={radius}
                        >
                            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                                <div style={{ fontSize: "0.85rem", color: "#1a1a24" }}>
                                    <strong>{region.province}</strong><br />
                                    Orders: {region.orders}<br />
                                    Revenue: Rp{(region.revenue / 1000000).toFixed(1)}M
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    );
                })}
                <MapBounds locations={Array.from(locations.values())} />
            </MapContainer>
        </div>
    );
}
