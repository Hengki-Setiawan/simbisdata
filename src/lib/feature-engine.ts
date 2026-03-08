/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Feature Engine — Stage 3 of SimbisData Pipeline
 * Derives new features from cleaned data for richer ML analysis
 */

import { getFieldNum, getFieldStr, getFieldValue } from "./data-accessor";

// ==================== INTERFACES ====================

export interface CustomerProfile {
  customerId: string;
  name: string;
  totalOrders: number;
  totalSpend: number;
  avgOrderValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
  daysSinceLastOrder: number;
  avgDaysBetweenOrders: number;
  isRepeatBuyer: boolean;
  favoriteProducts: string[];
}

export interface ProductProfile {
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  revenueShare: number;
  avgPrice: number;
  velocity: number;
  rank: number;
  category: string;
}

export interface TemporalProfile {
  peakDayOfWeek: string;
  peakHourOfDay: number;
  peakMonth: string;
  trendDirection: 'up' | 'down' | 'stable';
  trendSlope: number;
  seasonalityStrength: number;
  weekdayVsWeekend: { weekday: number; weekend: number };
}

export interface FeatureResult {
  enrichedRows: Record<string, unknown>[];
  derivedFeatures: string[];
  customerProfiles: CustomerProfile[];
  productProfiles: ProductProfile[];
  temporalProfile: TemporalProfile;
}

// ==================== MAIN FUNCTION ====================

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export function engineerFeatures(rows: Record<string, unknown>[]): FeatureResult {
  if (!rows || rows.length === 0) {
    return {
      enrichedRows: [],
      derivedFeatures: [],
      customerProfiles: [],
      productProfiles: [],
      temporalProfile: defaultTemporalProfile(),
    };
  }

  // Derive time-based features
  const enriched = rows.map(row => {
    const dateVal = getFieldValue(row, "date");
    const d = dateVal ? new Date(String(dateVal)) : null;
    const isValidDate = d && !isNaN(d.getTime());

    return {
      ...row,
      _day_of_week: isValidDate ? DAYS[d.getDay()] : null,
      _is_weekend: isValidDate ? (d.getDay() === 0 || d.getDay() === 6) : null,
      _month: isValidDate ? d.getMonth() + 1 : null,
      _quarter: isValidDate ? `Q${Math.ceil((d.getMonth() + 1) / 3)}` : null,
    };
  });

  const derivedFeatures = ['_day_of_week', '_is_weekend', '_month', '_quarter'];

  // Build customer profiles
  const customerMap = new Map<string, { orders: number; spend: number; dates: Date[]; products: string[] }>();
  rows.forEach(row => {
    const cust = getFieldStr(row, "customer") || "Unknown";
    const spend = getFieldNum(row, "total") || getFieldNum(row, "revenue") || 0;
    const product = getFieldStr(row, "product") || "";
    const dateStr = String(getFieldValue(row, "date") || "");
    const d = new Date(dateStr);

    if (!customerMap.has(cust)) customerMap.set(cust, { orders: 0, spend: 0, dates: [], products: [] });
    const entry = customerMap.get(cust)!;
    entry.orders++;
    entry.spend += spend;
    if (!isNaN(d.getTime())) entry.dates.push(d);
    if (product && !entry.products.includes(product)) entry.products.push(product);
  });

  const now = Date.now();
  const customerProfiles: CustomerProfile[] = Array.from(customerMap.entries()).map(([id, data]) => {
    const sortedDates = data.dates.sort((a, b) => a.getTime() - b.getTime());
    const gaps = sortedDates.length > 1
      ? sortedDates.slice(1).map((d, i) => (d.getTime() - sortedDates[i].getTime()) / 86400000)
      : [];

    return {
      customerId: id,
      name: id,
      totalOrders: data.orders,
      totalSpend: data.spend,
      avgOrderValue: data.orders > 0 ? data.spend / data.orders : 0,
      firstOrderDate: sortedDates[0]?.toISOString().split('T')[0] || "",
      lastOrderDate: sortedDates[sortedDates.length - 1]?.toISOString().split('T')[0] || "",
      daysSinceLastOrder: sortedDates.length > 0

        ? Math.floor((now - sortedDates[sortedDates.length - 1].getTime()) / 86400000)
        : 999,
      avgDaysBetweenOrders: gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0,
      isRepeatBuyer: data.orders > 1,
      favoriteProducts: data.products.slice(0, 3),
    };
  });

  // Build product profiles
  const productMap = new Map<string, { qty: number; revenue: number; prices: number[] }>();
  rows.forEach(row => {
    const prod = getFieldStr(row, "product") || "Unknown Product";
    const qty = getFieldNum(row, "quantity") || 1;
    const rev = getFieldNum(row, "total") || getFieldNum(row, "revenue") || 0;
    const price = getFieldNum(row, "price") || (qty > 0 ? rev / qty : 0);

    if (!productMap.has(prod)) productMap.set(prod, { qty: 0, revenue: 0, prices: [] });
    const entry = productMap.get(prod)!;
    entry.qty += qty;
    entry.revenue += rev;
    if (price > 0) entry.prices.push(price);
  });

  const totalRevenue = Array.from(productMap.values()).reduce((s, p) => s + p.revenue, 0) || 1;
  const dateRange = getDateRange(rows);
  const daySpan = dateRange > 0 ? dateRange : 1;

  const productProfiles: ProductProfile[] = Array.from(productMap.entries())
    .map(([name, data]) => ({
      productName: name,
      totalQuantitySold: data.qty,
      totalRevenue: data.revenue,
      revenueShare: (data.revenue / totalRevenue) * 100,
      avgPrice: data.prices.length > 0 ? data.prices.reduce((a, b) => a + b, 0) / data.prices.length : 0,
      velocity: data.qty / daySpan,
      rank: 0,
      category: "",
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  productProfiles.forEach((p, i) => { p.rank = i + 1; });

  // ABC categorization
  let cumShare = 0;
  productProfiles.forEach(p => {
    cumShare += p.revenueShare;
    p.category = cumShare <= 80 ? "A" : cumShare <= 95 ? "B" : "C";
  });

  // Build temporal profile
  const temporalProfile = buildTemporalProfile(rows);

  return { enrichedRows: enriched, derivedFeatures, customerProfiles, productProfiles, temporalProfile };
}

// ==================== HELPERS ====================

function getDateRange(rows: any[]): number {
  const dates = rows
    .map(r => new Date(String(getFieldValue(r, "date") || "")))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  if (dates.length < 2) return 1;
  return (dates[dates.length - 1].getTime() - dates[0].getTime()) / 86400000;
}

function buildTemporalProfile(rows: any[]): TemporalProfile {
  const dayRevenue: Record<number, number[]> = {};
  const monthRevenue: Record<number, number> = {};
  let weekdayTotal = 0, weekdayCount = 0, weekendTotal = 0, weekendCount = 0;

  rows.forEach(row => {
    const dateStr = String(getFieldValue(row, "date") || "");
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return;

    const rev = getFieldNum(row, "total") || getFieldNum(row, "revenue") || 0;
    const day = d.getDay();
    const month = d.getMonth();

    if (!dayRevenue[day]) dayRevenue[day] = [];
    dayRevenue[day].push(rev);
    monthRevenue[month] = (monthRevenue[month] || 0) + rev;

    if (day === 0 || day === 6) { weekendTotal += rev; weekendCount++; }
    else { weekdayTotal += rev; weekdayCount++; }
  });

  // Peak day
  let peakDay = 0, peakDayRev = 0;
  Object.entries(dayRevenue).forEach(([d, revs]) => {
    const avg = revs.reduce((a, b) => a + b, 0) / revs.length;
    if (avg > peakDayRev) { peakDayRev = avg; peakDay = parseInt(d); }
  });

  // Peak month
  let peakMonth = 0, peakMonthRev = 0;
  Object.entries(monthRevenue).forEach(([m, rev]) => {
    if (rev > peakMonthRev) { peakMonthRev = rev; peakMonth = parseInt(m); }
  });

  // Trend: simple linear regression on monthly revenue
  const monthlyEntries = Object.entries(monthRevenue).map(([m, r]) => ({ x: parseInt(m), y: r }));
  const slope = monthlyEntries.length > 1 ? linearSlope(monthlyEntries) : 0;

  // Seasonality strength
  const monthVals = Object.values(monthRevenue);
  const seasonality = monthVals.length > 1 ? coefficientOfVariation(monthVals) : 0;

  return {
    peakDayOfWeek: DAYS[peakDay] || "Senin",
    peakHourOfDay: 14,
    peakMonth: MONTHS[peakMonth] || "Januari",
    trendDirection: slope > 0.05 ? 'up' : slope < -0.05 ? 'down' : 'stable',
    trendSlope: slope,
    seasonalityStrength: Math.min(seasonality, 1),
    weekdayVsWeekend: {
      weekday: weekdayCount > 0 ? weekdayTotal / weekdayCount : 0,
      weekend: weekendCount > 0 ? weekendTotal / weekendCount : 0,
    },
  };
}

function linearSlope(points: { x: number; y: number }[]): number {
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  return denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
}

function coefficientOfVariation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

function defaultTemporalProfile(): TemporalProfile {
  return {
    peakDayOfWeek: "Senin", peakHourOfDay: 14, peakMonth: "Januari",
    trendDirection: 'stable', trendSlope: 0, seasonalityStrength: 0,
    weekdayVsWeekend: { weekday: 0, weekend: 0 },
  };
}
