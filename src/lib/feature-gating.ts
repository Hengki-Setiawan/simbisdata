/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Feature Gating — Controls access to features based on user tier
 */

export type Tier = "free" | "starter" | "pro" | "enterprise";

export interface TierLimits {
    uploadsPerMonth: number;
    maxRowsPerFile: number;
    mlAlgorithms: number;
    aiNarrationsPerMonth: number;
    forecastDays: number;
    exportFormats: string[];
    compareMode: boolean;
    premiumPdf: boolean;
    customerSegmentation: boolean;
    smartAlerts: boolean;
    apiAccess: boolean;
    historyDays: number;
}

const tierConfig: Record<Tier, TierLimits> = {
    free: {
        uploadsPerMonth: 2, maxRowsPerFile: 500, mlAlgorithms: 0,
        aiNarrationsPerMonth: 0, forecastDays: 0,
        exportFormats: ["csv"],
        compareMode: false, premiumPdf: false, customerSegmentation: false,
        smartAlerts: false, apiAccess: false, historyDays: 7,
    },
    starter: {
        uploadsPerMonth: 10, maxRowsPerFile: 5000, mlAlgorithms: 3,
        aiNarrationsPerMonth: 10, forecastDays: 30,
        exportFormats: ["csv", "pdf", "excel"],
        compareMode: true, premiumPdf: false, customerSegmentation: false,
        smartAlerts: false, apiAccess: false, historyDays: 30,
    },
    pro: {
        uploadsPerMonth: Infinity, maxRowsPerFile: 50000, mlAlgorithms: 10,
        aiNarrationsPerMonth: 100, forecastDays: 90,
        exportFormats: ["csv", "pdf", "excel", "premium-pdf"],
        compareMode: true, premiumPdf: true, customerSegmentation: true,
        smartAlerts: true, apiAccess: false, historyDays: 365,
    },
    enterprise: {
        uploadsPerMonth: Infinity, maxRowsPerFile: 100000, mlAlgorithms: 10,
        aiNarrationsPerMonth: Infinity, forecastDays: 180,
        exportFormats: ["csv", "pdf", "excel", "premium-pdf"],
        compareMode: true, premiumPdf: true, customerSegmentation: true,
        smartAlerts: true, apiAccess: true, historyDays: Infinity,
    },
};

export function getTierLimits(tier: Tier): TierLimits {
    return tierConfig[tier] || tierConfig.free;
}

export function canAccess(tier: Tier, feature: keyof TierLimits): boolean {
    const limits = getTierLimits(tier);
    const val = limits[feature];
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val > 0;
    if (Array.isArray(val)) return val.length > 0;
    return false;
}

export function canExport(tier: Tier, format: string): boolean {
    return getTierLimits(tier).exportFormats.includes(format);
}

export function getUpgradeMessage(feature: string, requiredTier: Tier): string {
    const tierNames: Record<Tier, string> = { free: "Free", starter: "Starter", pro: "Pro", enterprise: "Enterprise" };
    return `Fitur "${feature}" membutuhkan paket ${tierNames[requiredTier]} atau lebih tinggi. Upgrade sekarang untuk akses penuh.`;
}
