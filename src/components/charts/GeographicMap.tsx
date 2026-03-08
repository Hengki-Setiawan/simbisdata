"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import Leaflet map, avoiding SSR window issues
const MapClient = dynamic(() => import("./GeographicMapClient"), { 
    ssr: false, 
    loading: () => <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-card)", borderRadius: "12px" }}><Loader2 className="animate-spin" /></div> 
});

export default function GeographicMap({ data }: { data: any[] }) {
    const [locations, setLocations] = useState<{name: string, count: number, lat: number, lon: number}[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const processData = async () => {
            try {
                if (!data || data.length === 0) {
                    if (isMounted) setLoading(false);
                    return;
                }

                const header = Object.keys(data[0]).map(h => h.toLowerCase());
                
                // Identify columns that might hold location info
                const kotaCol = Object.keys(data[0]).find(h => ["kota", "city", "kabupaten"].some(l => h.toLowerCase().includes(l)));
                const provCol = Object.keys(data[0]).find(h => ["provinsi", "province", "daerah", "region"].some(l => h.toLowerCase().includes(l)));
                const alamatCol = Object.keys(data[0]).find(h => ["alamat", "address"].some(l => h.toLowerCase().includes(l)));

                if (!kotaCol && !provCol && !alamatCol) {
                    if (isMounted) setLoading(false);
                    return;
                }

                // Count frequencies of the most precise location string we can build
                const counts: Record<string, number> = {};
                data.forEach(row => {
                   let locParts: string[] = [];
                   if (provCol && row[provCol]) {
                       // Using Province level gives a much wider distribution across Indonesia for the map
                       // instead of the top 15 being entirely cities in Java.
                       locParts.push(String(row[provCol]).replace(/PROVINSI/ig, '').trim());
                   } else if (kotaCol && row[kotaCol]) {
                       locParts.push(String(row[kotaCol]).replace(/KOTA|KAB\.|KABUPATEN/ig, '').trim());
                   } else if (alamatCol && row[alamatCol]) {
                       // Heuristic to get the province/city from a long address string
                       const parts = String(row[alamatCol]).split(',').map(p => p.trim());
                       
                       // Try finding provinces
                       const provinces = parts.filter(p => {
                           const upper = p.toUpperCase();
                           return upper.match(/JAWA|SUMATERA|KALIMANTAN|SULAWESI|PAPUA|BALI|NUSA|MALUKU|BANTEN|DKI|DIY|ACEH/) || 
                                  upper.match(/TENGAH|TIMUR|BARAT|SELATAN|UTARA/);
                       });
                       if (provinces.length > 0) {
                           locParts.push(provinces[0]);
                       } else {
                           locParts.push(parts.length >= 3 ? parts[parts.length - 2] : String(row[alamatCol]).trim());
                       }
                   }
                   
                   if (locParts.length > 0) {
                       const clean = locParts[0].toUpperCase();
                       if (clean.length > 3) counts[clean] = (counts[clean] || 0) + 1;
                   }
                });

                // Take top 15 locations max
                const top = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 15);
                
                if (top.length === 0) {
                    if (isMounted) setLoading(false);
                    return;
                }

                const results = [];
                for (const [name, count] of top) {
                    try {
                        // Crucial: 1-second delay to respect Nominatim TOS and prevent IP ban
                        await new Promise(r => setTimeout(r, 1100));
                        
                        // Clean 'name' from random prefixes to improve geocoding scores
                        const cleanQuery = name.replace(/KOTA |KABUPATEN |KAB\. |PROVINSI /g, "");
                        const query = encodeURIComponent(cleanQuery + ", Indonesia");
                        
                        const res = await fetch(`/api/geocode?q=${query}`);
                        
                        const geo = await res.json();
                        if (geo && geo.length > 0) {
                            results.push({
                                name: cleanQuery,
                                count,
                                lat: parseFloat(geo[0].lat),
                                lon: parseFloat(geo[0].lon)
                            });
                        }
                    } catch (e) {
                        console.warn("Geocoding failed for", name, e);
                    }
                }

                if (isMounted) {
                    setLocations(results);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Map processing error", err);
                if (isMounted) setLoading(false);
            }
        };

        processData();

        return () => { isMounted = false; };
    }, [data]);

    if (loading) return <div style={{ height: 400, display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", justifyContent: "center", background: "var(--bg-surface)", borderRadius: "12px", border: "1px solid var(--border-color)", color: "var(--text-muted)", fontSize: "0.85rem" }}><Loader2 className="animate-spin text-primary" size={24}/> Memetakan alamat ke GPS (Limit API Gratis)...</div>;
    
    if (locations.length === 0) return null; // Hide map completely if no geocoded locations rather than showing empty state

    return <MapClient locations={locations} />;
}
