"use client";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// Leaflet icon fix for React
import L from "leaflet";
L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.9.4/dist/images/";

export default function GeographicMapClient({ locations }: { locations: { name: string, count: number, lat: number, lon: number }[] }) {
    if (!locations || locations.length === 0) {
        return <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontStyle: "italic", color: "var(--text-muted)" }}>Data peta tidak tersedia (Tidak ada koordinat yang berhasil dipetakan).</div>;
    }

    // Centered roughly on Indonesia
    return (
        <MapContainer center={[-2.5489, 118.0149]} zoom={4} style={{ height: "400px", width: "100%", borderRadius: "12px", zIndex: 0 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc, i) => (
                <CircleMarker 
                    key={i} 
                    center={[loc.lat, loc.lon]} 
                    radius={Math.max(8, Math.min(25, loc.count * 3))}
                    fillColor="var(--primary, #4f46e5)"
                    color="#ffffff"
                    weight={2}
                    fillOpacity={0.7}
                >
                    <Popup>
                        <strong style={{ fontSize: "14px" }}>{loc.name}</strong><br/>
                        <span style={{ fontSize: "12px", color: "#666" }}>{loc.count} Transaksi</span>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}
