/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * API Cache — Server-side caching layer for external API results
 * Uses in-memory cache with TTL (time-to-live) to minimize API calls
 */

interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number; // milliseconds
}

const cache = new Map<string, CacheEntry>();

const DEFAULT_TTL = {
    geocode: 7 * 24 * 60 * 60 * 1000,    // 7 days
    exchange: 60 * 60 * 1000,              // 1 hour
    sentiment: 24 * 60 * 60 * 1000,        // 1 day
    news: 30 * 60 * 1000,                  // 30 minutes
    holiday: 30 * 24 * 60 * 60 * 1000,     // 30 days
};

export function getCached<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
        cache.delete(key);
        return null;
    }
    return entry.data as T;
}

export function setCache(key: string, data: any, type: keyof typeof DEFAULT_TTL = "geocode"): void {
    cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl: DEFAULT_TTL[type] || DEFAULT_TTL.geocode,
    });
}

export function clearCache(prefix?: string): void {
    if (!prefix) {
        cache.clear();
    } else {
        for (const key of cache.keys()) {
            if (key.startsWith(prefix)) cache.delete(key);
        }
    }
}

export function getCacheStats(): { entries: number; types: Record<string, number> } {
    const types: Record<string, number> = {};
    for (const key of cache.keys()) {
        const type = key.split(":")[0] || "unknown";
        types[type] = (types[type] || 0) + 1;
    }
    return { entries: cache.size, types };
}
