/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Feature Gating — Simplified (All Features Unlocked)
 * 
 * Payment system removed, so all features are now free.
 * Kept the type system for forward compatibility.
 */

export type Tier = "free" | "starter" | "pro";

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

// All tiers now get full access (no paywall)
const unlocked: TierLimits = {
    uploadsPerMonth: Infinity,
    maxRowsPerFile: 100000,
    mlAlgorithms: Infinity,
    aiNarrationsPerMonth: Infinity,
    forecastDays: 365,
    exportFormats: ["csv", "pdf", "excel", "pptx"],
    compareMode: true,
    premiumPdf: true,
    customerSegmentation: true,
    smartAlerts: true,
    apiAccess: true,
    historyDays: Infinity,
};

export function getTierLimits(_tier: Tier): TierLimits {
    // All features unlocked regardless of tier
    return unlocked;
}

export function canAccess(_tier: Tier, _feature: keyof TierLimits): boolean {
    return true; // Everything is accessible
}

export function canExport(_tier: Tier, _format: string): boolean {
    return true; // All exports allowed
}

export function getUpgradeMessage(_feature: string, _requiredTier: Tier): string {
    return "Semua fitur sudah tersedia gratis!";
}
