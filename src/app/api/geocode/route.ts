/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";

/**
 * Geocode API — Server-side proxy for geocoding requests
 * Uses OpenStreetMap Nominatim API (free, no key required)
 */
export async function POST(request: Request) {
    try {
        const { addresses } = await request.json();

        if (!addresses || !Array.isArray(addresses)) {
            return NextResponse.json({ error: "addresses array required" }, { status: 400 });
        }

        const results: Record<string, any> = {};
        const unique = [...new Set(addresses as string[])].slice(0, 30);

        for (const addr of unique) {
            // Check cache first
            const cacheKey = `geocode:${addr.toLowerCase()}`;
            const cached = getCached<any>(cacheKey);
            if (cached) {
                results[addr] = cached;
                continue;
            }

            try {
                const encoded = encodeURIComponent(addr + " Indonesia");
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
                    { headers: { "User-Agent": "SimbisData/1.0" } }
                );
                const data = await res.json();

                if (data.length > 0) {
                    const result = {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                        name: data[0].display_name,
                        confidence: parseFloat(data[0].importance || "0.5")
                    };
                    results[addr] = result;
                    setCache(cacheKey, result, "geocode");
                }

                // Rate limit: 1 req/sec for Nominatim
                await new Promise(r => setTimeout(r, 1100));
            } catch (e) {
                console.warn("Geocode failed for:", addr, e);
            }
        }

        return NextResponse.json({ results, count: Object.keys(results).length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
