/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * External APIs Hub — Centralized wrapper for all external API integrations
 * Includes: Geocoding, Currency Conversion, Sentiment Analysis, Holiday Detection
 */

// ═══════════════════════════════════════════════════════════
// GEOCODING — Convert location names to coordinates
// ═══════════════════════════════════════════════════════════

export interface GeoResult {
    query: string;
    lat: number;
    lng: number;
    formattedAddress: string;
    confidence: number;
}

export async function geocode(address: string): Promise<GeoResult | null> {
    try {
        // Use OpenStreetMap Nominatim (free, no API key needed)
        const encoded = encodeURIComponent(address + " Indonesia");
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
            { headers: { "User-Agent": "SimbisData/1.0" } }
        );
        const data = await res.json();
        if (data.length > 0) {
            return {
                query: address,
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                formattedAddress: data[0].display_name,
                confidence: parseFloat(data[0].importance || "0.5")
            };
        }
    } catch (e) {
        console.warn("Geocoding failed for:", address, e);
    }
    return null;
}

export async function batchGeocode(addresses: string[]): Promise<Map<string, GeoResult>> {
    const results = new Map<string, GeoResult>();
    const unique = [...new Set(addresses)];

    // Rate limit: 1 request per second (Nominatim policy)
    for (const addr of unique.slice(0, 50)) { // Max 50 locations
        const result = await geocode(addr);
        if (result) results.set(addr, result);
        await new Promise(r => setTimeout(r, 1100)); // Respect rate limit
    }

    return results;
}

// ═══════════════════════════════════════════════════════════
// CURRENCY CONVERSION
// ═══════════════════════════════════════════════════════════

const rateCache = new Map<string, { rate: number; timestamp: number }>();

export async function getExchangeRate(from: string, to: string = "IDR"): Promise<number> {
    const cacheKey = `${from}_${to}`;
    const cached = rateCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) return cached.rate; // 1hr cache

    try {
        const res = await fetch(`https://api.exchangerate.host/latest?base=${from}&symbols=${to}`);
        const data = await res.json();
        const rate = data?.rates?.[to] || 1;
        rateCache.set(cacheKey, { rate, timestamp: Date.now() });
        return rate;
    } catch {
        const fallbacks: Record<string, number> = { USD: 15800, EUR: 17200, SGD: 11800, MYR: 3500 };
        return fallbacks[from] || 1;
    }
}

export async function convertCurrency(amount: number, from: string, to: string = "IDR"): Promise<number> {
    const rate = await getExchangeRate(from, to);
    return Math.round(amount * rate);
}

// ═══════════════════════════════════════════════════════════
// SENTIMENT ANALYSIS (Basic — using keyword-based for free tier)
// ═══════════════════════════════════════════════════════════

export interface SentimentResult {
    score: number; // -1 to 1
    label: "Positive" | "Neutral" | "Negative";
}

export function analyzeBasicSentiment(text: string): SentimentResult {
    const t = text.toLowerCase();
    const posWords = ["bagus", "baik", "mantap", "keren", "puas", "cepat", "ramah", "suka", "good", "great"];
    const negWords = ["jelek", "buruk", "lama", "kecewa", "lambat", "rusak", "mahal", "bad", "terlambat"];

    let score = 0;
    posWords.forEach(w => { if (t.includes(w)) score += 0.2; });
    negWords.forEach(w => { if (t.includes(w)) score -= 0.2; });

    score = Math.max(-1, Math.min(1, score));
    return {
        score,
        label: score > 0.1 ? "Positive" : score < -0.1 ? "Negative" : "Neutral"
    };
}


// ═══════════════════════════════════════════════════════════
// MACRO APIs for MarketInsights.tsx (Phase 5)
// ═══════════════════════════════════════════════════════════

export interface MarketInsightsData {
    exchangeRate: { USD: number; EUR: number; SGD: number; lastUpdate: string };
    nextHoliday: { date: string; name: string } | null;
    newsHeadline: string;
}

export async function getMacroMarketInsights(): Promise<MarketInsightsData> {
    const [exchangeRate, nextHoliday, newsHeadline] = await Promise.all([
        fetchExchangeRates(),
        getIndonesiaHolidays(),
        getLatestNewsHeadline()
    ]);

    return { exchangeRate, nextHoliday, newsHeadline };
}

async function fetchExchangeRates() {
    try {
        const apiKey = process.env.NEXT_PUBLIC_EXCHANGERATE_API_KEY;
        if (!apiKey) throw new Error("No API Key");

        const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/IDR`);
        if (!res.ok) throw new Error("API Limit");
        const data = await res.json();

        return {
            USD: 1 / data.conversion_rates.USD,
            EUR: 1 / data.conversion_rates.EUR,
            SGD: 1 / data.conversion_rates.SGD,
            lastUpdate: new Date().toLocaleDateString('id-ID')
        };
    } catch {
        return { USD: 15600, EUR: 16800, SGD: 11600, lastUpdate: "Fallback Rate" };
    }
}

async function getIndonesiaHolidays() {
    try {
        const year = new Date().getFullYear();
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ID`);
        if (!res.ok) throw new Error("Failed");

        const holidays = await res.json();
        const today = new Date();
        const upcoming = holidays.find((h: any) => new Date(h.date) >= today);
        return upcoming ? { date: upcoming.date, name: upcoming.localName } : null;
    } catch {
        return null;
    }
}

async function getLatestNewsHeadline() {
    const mockNews = [
        "Suku bunga acuan BI dipertahankan, pasar ritel optimis.",
        "Tren e-commerce Indonesia diprediksi naik 15% kuartal ini.",
        "Pemerintah gencarkan subsidi logistik UMKM daerah.",
        "Inflasi terkendali, daya beli berangsur pulih."
    ];
    return mockNews[Math.floor(Math.random() * mockNews.length)];
}
