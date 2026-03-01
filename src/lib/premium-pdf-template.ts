import { AnalysisResult } from "@/lib/analysis";

export function generatePremiumPDFHTML(analysis: AnalysisResult, aiNarration?: string): string {
  const formatRp = (num: number) => `Rp ${num.toLocaleString("id-ID")}`;
  const o = analysis.overview;

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #0f0f23; color: #f1f5f9; padding: 40px; }
  .header { background: linear-gradient(135deg, #6366f1, #06b6d4); padding: 40px; border-radius: 16px; margin-bottom: 32px; }
  .header h1 { font-size: 28px; font-weight: 900; margin-bottom: 8px; }
  .header p { opacity: 0.8; font-size: 14px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .kpi-card { background: #1a1a3e; border: 1px solid #2d2d5e; border-radius: 12px; padding: 24px; }
  .kpi-label { font-size: 12px; color: #94a3b8; margin-bottom: 8px; }
  .kpi-value { font-size: 24px; font-weight: 800; }
  .kpi-sub { font-size: 11px; margin-top: 4px; }
  .section { background: #1a1a3e; border: 1px solid #2d2d5e; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
  .section h2 { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #818cf8; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 10px 12px; border-bottom: 1px solid #2d2d5e; color: #94a3b8; font-weight: 600; }
  td { padding: 10px 12px; border-bottom: 1px solid rgba(45,45,94,0.5); }
  .bar { height: 8px; border-radius: 4px; background: linear-gradient(90deg, #6366f1, #06b6d4); margin-top: 4px; }
  .ai-section { background: #141432; border: 1px solid #2d2d5e; border-radius: 12px; padding: 32px; margin-top: 24px; white-space: pre-wrap; line-height: 1.8; font-size: 13px; color: #94a3b8; }
  .ai-section h2 { color: #818cf8; margin-bottom: 16px; }
  .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #64748b; }
</style>
</head>
<body>
  <div class="header">
    <h1>📊 simbisai Report</h1>
    <p>Laporan Analisis Data Penjualan — ${o.dateRange.start} s/d ${o.dateRange.end}</p>
    <p>Dibuat: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
  </div>

  ${aiNarration ? `
  <div class="ai-section" style="margin-top: 0; margin-bottom: 32px; background: #1e1e4a; border-left: 4px solid #818cf8;">
    <h2>🤖 AI Executive Summary & Action Plan</h2>
    ${aiNarration.replace(/\n*\*\*ANALISIS PENJUALAN SHOPEE\*\*\n*/, '').replace(/\n/g, '<br>')}
  </div>
  ` : ''}

  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">💰 Total Revenue</div>
      <div class="kpi-value">${formatRp(o.totalRevenue)}</div>
      <div class="kpi-sub" style="color: ${o.growthRate >= 0 ? '#10b981' : '#ef4444'}">${o.growthRate >= 0 ? '↑' : '↓'} ${Math.abs(o.growthRate).toFixed(1)}%</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">📦 Total Pesanan</div>
      <div class="kpi-value">${o.totalOrders.toLocaleString()}</div>
      <div class="kpi-sub">${analysis.productPerformance.length} produk</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">📈 Rata-rata Order</div>
      <div class="kpi-value">${formatRp(o.avgOrderValue)}</div>
      <div class="kpi-sub">per pesanan</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">🔄 Return Rate</div>
      <div class="kpi-value">${o.returnRate.toFixed(1)}%</div>
      <div class="kpi-sub" style="color: ${o.returnRate < 2 ? '#10b981' : '#f59e0b'}">${o.returnRate < 2 ? '✅ Sangat baik' : '⚠️ Perhatian'}</div>
    </div>
  </div>

  <div class="section">
    <h2>🏆 Performa Produk</h2>
    <table>
      <thead><tr><th>Produk</th><th>Jumlah</th><th>Revenue</th><th>Share</th></tr></thead>
      <tbody>
        ${analysis.productPerformance.map(p => `
          <tr>
            <td>${p.name}</td>
            <td>${p.count}</td>
            <td>${formatRp(p.revenue)}</td>
            <td>${p.percentage.toFixed(1)}%<div class="bar" style="width: ${p.percentage}%"></div></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>🌍 Top 10 Wilayah</h2>
    <table>
      <thead><tr><th>Provinsi</th><th>Pesanan</th><th>Share</th></tr></thead>
      <tbody>
        ${analysis.regionalAnalysis.slice(0, 10).map(r => `
          <tr>
            <td>${r.province}</td>
            <td>${r.count}</td>
            <td>${r.percentage.toFixed(1)}%<div class="bar" style="width: ${r.percentage * 2}%"></div></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>💳 Metode Pembayaran</h2>
    <table>
      <thead><tr><th>Metode</th><th>Jumlah</th><th>Share</th></tr></thead>
      <tbody>
        ${analysis.paymentAnalysis.map(p => `
          <tr><td>${p.method}</td><td>${p.count}</td><td>${p.percentage.toFixed(1)}%</td></tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>📅 Tren Bulanan</h2>
    <table>
      <thead><tr><th>Bulan</th><th>Pesanan</th><th>Revenue</th></tr></thead>
      <tbody>
        ${analysis.timeAnalysis.monthly.map(m => `
          <tr><td>${m.month}</td><td>${m.orders}</td><td>${formatRp(m.revenue)}</td></tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    simbisai — Platform Analisis Data Penjualan UMKM dengan AI & ML<br>
    Laporan ini di-generate secara otomatis. © ${new Date().getFullYear()} simbisai
  </div>
</body>
</html>`;
}
