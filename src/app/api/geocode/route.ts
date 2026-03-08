import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) {
        return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    try {
        // q is already encoded by the client, but let's be safe and only encode if it's not
        const query = q.includes('%') ? q : encodeURIComponent(q);
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}&countrycodes=id`;
        
        const res = await fetch(url, {
            headers: { 
                "User-Agent": "SimbisDA/1.1 (Academic Project)",
                "Accept-Language": "id"
            },
            cache: "force-cache" // Cache on server to avoid rate limits
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Nominatim API failed" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
