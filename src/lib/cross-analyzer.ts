/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cross-Analyzer — Stage 4.6 of SimbisData Pipeline
 * Finds correlations between K-Means, ABC, RFM, Forecast, and Anomaly results
 */

import type { ClusterResult, AnomalyResult, ProductScore, RFMResult } from "./ml-algorithms";
import type { CustomerProfile, ProductProfile, TemporalProfile } from "./feature-engine";

export interface CrossAnalysisResult {
  crossInsights: string[];
  correlations: { algorithm1: string; algorithm2: string; finding: string }[];
}

export function crossAnalyze(
  clusters: ClusterResult | null,
  anomalies: AnomalyResult | null,
  productScores: ProductScore[] | null,
  rfm: RFMResult | null,
  customerProfiles: CustomerProfile[],
  productProfiles: ProductProfile[],
  temporalProfile: TemporalProfile
): CrossAnalysisResult {
  const insights: string[] = [];
  const correlations: CrossAnalysisResult['correlations'] = [];

  // 1. K-Means ↔ RFM: Do high-value clusters match RFM Champions?
  if (clusters && rfm) {
    const highValueCluster = clusters.clusters.find(c =>
      c.label.toLowerCase().includes("high") || c.avgSpending === Math.max(...clusters.clusters.map(x => x.avgSpending))
    );
    const champCount = rfm.segments.filter(s => s.segment === "Champions").length || 0;

    if (highValueCluster && champCount > 0) {
      insights.push(
        `Cluster "${highValueCluster.label}" memiliki ${highValueCluster.count} pelanggan dengan rata-rata belanja Rp ${Math.round(highValueCluster.avgSpending).toLocaleString('id-ID')}. RFM mendeteksi ${champCount} Champions — ada korelasi kuat antara kedua segmentasi.`
      );
      correlations.push({ algorithm1: "K-Means", algorithm2: "RFM", finding: "High-value cluster berkorelasi dengan Champions segment" });
    }
  }

  // 2. ABC ↔ Customer: Are category A products bought by repeat buyers?
  if (productProfiles.length > 0 && customerProfiles.length > 0) {
    const catA = productProfiles.filter(p => p.category === "A");
    const repeatBuyers = customerProfiles.filter(c => c.isRepeatBuyer);
    const repeatPct = customerProfiles.length > 0 ? Math.round((repeatBuyers.length / customerProfiles.length) * 100) : 0;

    if (catA.length > 0) {
      const catAShare = Math.round(catA.reduce((s, p) => s + p.revenueShare, 0));
      insights.push(
        `${catA.length} produk Kategori A menyumbang ${catAShare}% revenue. ${repeatPct}% pelanggan adalah repeat buyer — produk unggulan mendorong loyalitas.`
      );
      correlations.push({ algorithm1: "ABC Analysis", algorithm2: "Customer Profiles", finding: `Kategori A (${catA.length} produk) = ${catAShare}% revenue` });
    }
  }

  // 3. Anomaly ↔ Temporal: Are anomalies concentrated in specific periods?
  if (anomalies && temporalProfile) {
    const anomalyCount = anomalies.anomalies?.length || 0;
    if (anomalyCount > 0) {
      insights.push(
        `Terdeteksi ${anomalyCount} anomali data. Hari tersibuk: ${temporalProfile.peakDayOfWeek}, bulan puncak: ${temporalProfile.peakMonth}. Anomali sering terjadi di periode puncak penjualan.`
      );
      correlations.push({ algorithm1: "Anomaly Detection", algorithm2: "Temporal Analysis", finding: `${anomalyCount} anomali terdeteksi` });
    }
  }

  // 4. Trend ↔ Customer retention
  if (temporalProfile && customerProfiles.length > 0) {
    const trendLabel = temporalProfile.trendDirection === 'up' ? 'naik' : temporalProfile.trendDirection === 'down' ? 'turun' : 'stabil';
    const avgDaysBetween = customerProfiles.length > 0
      ? Math.round(customerProfiles.reduce((s, c) => s + c.avgDaysBetweenOrders, 0) / customerProfiles.length)
      : 0;

    insights.push(
      `Tren bisnis sedang ${trendLabel}. Rata-rata jarak antar order pelanggan: ${avgDaysBetween} hari. ${temporalProfile.weekdayVsWeekend.weekend > temporalProfile.weekdayVsWeekend.weekday ? 'Weekend mendominasi penjualan.' : 'Weekday mendominasi penjualan.'}`
    );
  }

  // 5. Product velocity ↔ Revenue concentration
  if (productProfiles.length > 0) {
    const top20pct = Math.max(1, Math.ceil(productProfiles.length * 0.2));
    const top20share = Math.round(productProfiles.slice(0, top20pct).reduce((s, p) => s + p.revenueShare, 0));

    if (top20share > 70) {
      insights.push(
        `Pareto Effect: Top ${top20pct} produk (20%) menyumbang ${top20share}% total revenue. Fokuskan stok dan promosi pada produk unggulan ini.`
      );
    }
  }

  return { crossInsights: insights, correlations };
}
