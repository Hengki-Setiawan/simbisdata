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

export interface ExchangeRate {
    from: string;
    to: string;
    rate: number;
    date: string;
}

const rateCache = new Map<string, { rate: number; timestamp: number }>();

export async function getExchangeRate(from: string, to: string = "IDR"): Promise<number> {
    const cacheKey = `${from}_${to}`;
    const cached = rateCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 3600000) return cached.rate; // 1hr cache

    try {
        // Using free exchangerate.host API
        const res = await fetch(`https://api.exchangerate.host/latest?base=${from}&symbols=${to}`);
        const data = await res.json();
        const rate = data?.rates?.[to] || 1;
        rateCache.set(cacheKey, { rate, timestamp: Date.now() });
        return rate;
    } catch {
        console.warn(`Exchange rate fetch failed: ${from} → ${to}`);
        // Fallback rates
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
    text: string;
    score: number; // -1 to 1
    label: "positive" | "negative" | "neutral";
    confidence: number;
    keywords: string[];
}

const POSITIVE_WORDS = new Set([
    "bagus", "baik", "mantap", "luar biasa", "puas", "senang", "cepat", "ramah",
    "recommended", "suka", "love", "great", "good", "excellent", "amazing", "fast",
    "berkualitas", "keren", "oke", "ok", "terbaik", "best", "top", "sempurna",
    "memuaskan", "terima kasih", "thanks", "recommend", "worth", "murah", "hemat"
]);

const NEGATIVE_WORDS = new Set([
    "buruk", "jelek", "lambat", "rusak", "kecewa", "mahal", "lama", "parah",
    "bohong", "penipuan", "tipu", "scam", "bad", "terrible", "worst", "slow",
    "broken", "disappointed", "rubbish", "poor", "awful", "gagal", "cacat",
    "tidak puas", "komplain", "complaint", "refund", "retur", "return"
]);

export function analyzeSentiment(text: string): SentimentResult {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);

    let posCount = 0, negCount = 0;
    const keywords: string[] = [];

    for (const word of words) {
        if (POSITIVE_WORDS.has(word)) { posCount++; keywords.push(`+${word}`); }
        if (NEGATIVE_WORDS.has(word)) { negCount++; keywords.push(`-${word}`); }
    }

    // Check multi-word phrases
    for (const phrase of POSITIVE_WORDS) {
        if (phrase.includes(" ") && lower.includes(phrase)) { posCount++; keywords.push(`+${phrase}`); }
    }
    for (const phrase of NEGATIVE_WORDS) {
        if (phrase.includes(" ") && lower.includes(phrase)) { negCount++; keywords.push(`-${phrase}`); }
    }

    const total = posCount + negCount || 1;
    const score = (posCount - negCount) / total;
    const confidence = Math.min(1, total / 3);
    const label = score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral";

    return { text: text.slice(0, 100), score, label, confidence, keywords: keywords.slice(0, 5) };
}

export function batchSentiment(texts: string[]): {
    results: SentimentResult[];
    summary: { positive: number; negative: number; neutral: number; avgScore: number };
} {
    const results = texts.map(analyzeSentiment);
    const positive = results.filter(r => r.label === "positive").length;
    const negative = results.filter(r => r.label === "negative").length;
    const neutral = results.filter(r => r.label === "neutral").length;
    const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;
    return { results, summary: { positive, negative, neutral, avgScore } };
}

// ═══════════════════════════════════════════════════════════
// INDONESIAN HOLIDAYS
// ═══════════════════════════════════════════════════════════

export interface Holiday {
    date: string;
    name: string;
    type: "national" | "religious" | "commercial";
}

export function getIndonesianHolidays(year: number): Holiday[] {
    // Key holidays that significantly affect sales
    return [
        { date: `${year}-01-01`, name: "Tahun Baru", type: "national" },
        { date: `${year}-02-14`, name: "Valentine's Day", type: "commercial" },
        { date: `${year}-03-08`, name: "Hari Perempuan Internasional", type: "commercial" },
        { date: `${year}-05-01`, name: "Hari Buruh", type: "national" },
        { date: `${year}-06-01`, name: "Hari Lahir Pancasila", type: "national" },
        { date: `${year}-08-17`, name: "Hari Kemerdekaan RI", type: "national" },
        { date: `${year}-10-05`, name: "Hari Tentara Nasional", type: "national" },
        { date: `${year}-10-28`, name: "Hari Sumpah Pemuda", type: "national" },
        { date: `${year}-11-10`, name: "Hari Pahlawan", type: "national" },
        { date: `${year}-11-11`, name: "11.11 Sale", type: "commercial" },
        { date: `${year}-12-12`, name: "12.12 Harbolnas", type: "commercial" },
        { date: `${year}-12-25`, name: "Natal", type: "religious" },
        { date: `${year}-12-31`, name: "Malam Tahun Baru", type: "commercial" },
    ];
}

export function findNearestHoliday(dateStr: string): Holiday | null {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const holidays = [...getIndonesianHolidays(year), ...getIndonesianHolidays(year - 1)];

    let nearest: Holiday | null = null;
    let minDiff = Infinity;

    for (const h of holidays) {
        const diff = Math.abs(date.getTime() - new Date(h.date).getTime());
        if (diff < minDiff && diff < 7 * 24 * 60 * 60 * 1000) { // Within 7 days
            minDiff = diff;
            nearest = h;
        }
    }
    return nearest;
}

// ═══════════════════════════════════════════════════════════
// WORD FREQUENCY (for Word Cloud)
// ═══════════════════════════════════════════════════════════

export interface WordFreq {
    text: string;
    value: number;
}

const STOP_WORDS = new Set([
    "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "ini", "itu", "pada",
    "tidak", "ada", "juga", "akan", "sudah", "bisa", "lebih", "saya", "kami",
    "mereka", "dia", "kita", "very", "the", "and", "for", "is", "in", "to",
    "of", "a", "an", "it", "be", "was", "this", "that", "but", "or", "are"
]);

export function extractWordFrequencies(texts: string[], topN: number = 50): WordFreq[] {
    const freq = new Map<string, number>();

    for (const text of texts) {
        const words = String(text || "").toLowerCase()
            .replace(/[^a-zA-Z0-9\u00C0-\u024F\s]/g, " ")
            .split(/\s+/)
            .filter(w => w.length > 2 && !STOP_WORDS.has(w));

        for (const word of words) {
            freq.set(word, (freq.get(word) || 0) + 1);
        }
    }

    return Array.from(freq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([text, value]) => ({ text, value }));
}
