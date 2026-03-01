/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Universal Analysis Engine — works with any sales data
 * Expects data with universal field keys from column-mapper.ts
 * Falls back to original column names if universal mapping wasn't applied
 */

export interface AnalysisResult {
    overview: {
        totalOrders: number;
        totalRevenue: number;
        avgOrderValue: number;
        returnRate: number;
        dateRange: { start: string; end: string };
        growthRate: number;
    };
    productPerformance: {
        name: string;
        count: number;
        revenue: number;
        percentage: number;
    }[];
    variantAnalysis: {
        name: string;
        count: number;
        percentage: number;
    }[];
    regionalAnalysis: {
        province: string;
        count: number;
        percentage: number;
    }[];
    cityAnalysis: {
        city: string;
        count: number;
    }[];
    paymentAnalysis: {
        method: string;
        count: number;
        percentage: number;
    }[];
    shippingAnalysis: {
        carrier: string;
        count: number;
        percentage: number;
        avgCost: number;
    }[];
    timeAnalysis: {
        daily: { date: string; orders: number; revenue: number }[];
        monthly: { month: string; orders: number; revenue: number }[];
        dayOfWeek: { day: string; count: number }[];
        hourly: { hour: number; count: number }[];
    };
    financialAnalysis: {
        totalDiscount: number;
        sellerDiscount: number;
        platformDiscount: number;
        avgShippingCost: number;
        totalShippingRevenue: number;
        shippingSubsidy: number;
    };
}

import { getFieldValue, getFieldNum as getNum, getFieldStr as getStr, getFieldDate as getDate } from "./data-accessor";

export function analyzeData(rows: any[]): AnalysisResult {
    const totalOrders = rows.length;

    // Revenue — try multiple possible fields
    const totalRevenue = rows.reduce((sum: number, r: any) =>
        sum + (getNum(r, "total_payment", ["Total Pembayaran", "Total Penjualan (IDR)", "Grand Total", "Total", "total"]) ||
            getNum(r, "subtotal", ["Total Harga Produk", "Subtotal", "subtotal"])), 0);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Return/cancel rate
    const returns = rows.filter((r: any) => {
        const status = getStr(r, "order_status", ["Status Pesanan", "Status", "Status Terakhir"]);
        const lower = status.toLowerCase();
        return lower.includes("batal") || lower.includes("cancel") || lower.includes("return")
            || lower.includes("refund") || lower.includes("pengembalian");
    }).length;
    const returnRate = totalOrders > 0 ? (returns / totalOrders) * 100 : 0;

    // Date range
    const dates = rows.map((r: any) => getDate(r, "order_date", ["Waktu Pesanan Dibuat", "Tanggal", "Date", "Created at", "Tanggal Transaksi"]))
        .filter((d): d is Date => d !== null)
        .sort((a, b) => a.getTime() - b.getTime());

    const dateRange = {
        start: dates.length > 0 ? dates[0].toISOString().split("T")[0] : "",
        end: dates.length > 0 ? dates[dates.length - 1].toISOString().split("T")[0] : "",
    };

    // Growth rate
    const midIndex = Math.floor(rows.length / 2);
    const firstHalfRevenue = rows.slice(0, midIndex).reduce((s: number, r: any) =>
        s + (getNum(r, "total_payment", ["Total Pembayaran", "Total", "total"]) || getNum(r, "subtotal", ["Total Harga Produk", "Subtotal", "subtotal"])), 0);
    const secondHalfRevenue = rows.slice(midIndex).reduce((s: number, r: any) =>
        s + (getNum(r, "total_payment", ["Total Pembayaran", "Total", "total"]) || getNum(r, "subtotal", ["Total Harga Produk", "Subtotal", "subtotal"])), 0);
    const growthRate = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;

    // Product performance
    const productMap = new Map<string, { count: number; revenue: number }>();
    let totalProducts = 0;
    rows.forEach((r: any) => {
        const name = getStr(r, "product_name", ["Nama Produk", "Item Name", "Nama Barang", "Product", "Item"]) || "Unknown";
        const qty = getNum(r, "quantity", ["Jumlah", "Qty", "Quantity", "Jumlah Barang"]) || 1;
        const rev = getNum(r, "total_payment", ["Total Pembayaran", "Total", "total"]) || getNum(r, "subtotal", ["Total Harga Produk", "Subtotal", "subtotal"]);

        totalProducts += qty;

        const existing = productMap.get(name) || { count: 0, revenue: 0 };
        existing.count += qty;
        existing.revenue += rev;
        productMap.set(name, existing);
    });
    const productPerformance = Array.from(productMap.entries())
        .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue, percentage: totalProducts > 0 ? (data.count / totalProducts) * 100 : 0 }))
        .sort((a, b) => b.count - a.count);

    // Variant analysis
    const variantMap = new Map<string, number>();
    rows.forEach((r: any) => {
        const variant = getStr(r, "variant", ["Nama Variasi", "Variant", "Variation", "Size", "Ukuran"]) || "—";
        variantMap.set(variant, (variantMap.get(variant) || 0) + 1);
    });
    const variantAnalysis = Array.from(variantMap.entries())
        .map(([name, count]) => ({ name, count, percentage: (count / totalOrders) * 100 }))
        .sort((a, b) => b.count - a.count);

    // Regional
    const provinceMap = new Map<string, number>();
    rows.forEach((r: any) => {
        const prov = getStr(r, "province", ["Provinsi", "Province", "Region", "Wilayah"]) || "Unknown";
        provinceMap.set(prov, (provinceMap.get(prov) || 0) + 1);
    });
    const regionalAnalysis = Array.from(provinceMap.entries())
        .map(([province, count]) => ({ province, count, percentage: (count / totalOrders) * 100 }))
        .sort((a, b) => b.count - a.count);

    // City
    const cityMap = new Map<string, number>();
    rows.forEach((r: any) => {
        const city = getStr(r, "city", ["Kota/Kabupaten", "Kota", "City", "District"]) || "Unknown";
        cityMap.set(city, (cityMap.get(city) || 0) + 1);
    });
    const cityAnalysis = Array.from(cityMap.entries()).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 10);

    // Payment
    const paymentMap = new Map<string, number>();
    rows.forEach((r: any) => {
        const method = getStr(r, "payment_method", ["Metode Pembayaran", "Payment Method", "Metode Bayar"]) || "Unknown";
        paymentMap.set(method, (paymentMap.get(method) || 0) + 1);
    });
    const paymentAnalysis = Array.from(paymentMap.entries())
        .map(([method, count]) => ({ method, count, percentage: (count / totalOrders) * 100 }))
        .sort((a, b) => b.count - a.count);

    // Shipping
    const shippingMap = new Map<string, { count: number; totalCost: number }>();
    rows.forEach((r: any) => {
        const carrier = getStr(r, "courier", ["Opsi Pengiriman", "Kurir", "Courier", "Shipping Method"]) || "Unknown";
        const cost = getNum(r, "shipping_cost", ["Ongkos Kirim Dibayar oleh Pembeli", "Ongkir", "Shipping Fee", "Biaya Kirim"]);
        const existing = shippingMap.get(carrier) || { count: 0, totalCost: 0 };
        existing.count += 1;
        existing.totalCost += cost;
        shippingMap.set(carrier, existing);
    });
    const shippingAnalysis = Array.from(shippingMap.entries())
        .map(([carrier, data]) => ({ carrier, count: data.count, percentage: (data.count / totalOrders) * 100, avgCost: data.count > 0 ? data.totalCost / data.count : 0 }))
        .sort((a, b) => b.count - a.count);

    // Time analysis
    const dailyMap = new Map<string, { orders: number; revenue: number }>();
    const monthlyMap = new Map<string, { orders: number; revenue: number }>();
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const dowMap = new Map<string, number>();
    dayNames.forEach((d) => dowMap.set(d, 0));
    const hourMap = new Map<number, number>();
    for (let i = 0; i < 24; i++) hourMap.set(i, 0);

    rows.forEach((r: any) => {
        const d = getDate(r, "order_date", ["Waktu Pesanan Dibuat", "Tanggal", "Date", "Created at", "Tanggal Transaksi"]);
        if (d) {
            const dayKey = d.toISOString().split("T")[0];
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            const rev = getNum(r, "total_payment", ["Total Pembayaran", "Total", "total"]);

            const dEx = dailyMap.get(dayKey) || { orders: 0, revenue: 0 };
            dEx.orders += 1; dEx.revenue += rev; dailyMap.set(dayKey, dEx);

            const mEx = monthlyMap.get(monthKey) || { orders: 0, revenue: 0 };
            mEx.orders += 1; mEx.revenue += rev; monthlyMap.set(monthKey, mEx);

            dowMap.set(dayNames[d.getDay()], (dowMap.get(dayNames[d.getDay()]) || 0) + 1);
            hourMap.set(d.getHours(), (hourMap.get(d.getHours()) || 0) + 1);
        }
    });

    const daily = Array.from(dailyMap.entries()).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date));
    const monthly = Array.from(monthlyMap.entries()).map(([month, data]) => ({ month, ...data })).sort((a, b) => a.month.localeCompare(b.month));
    const dayOfWeek = dayNames.map((day) => ({ day, count: dowMap.get(day) || 0 }));
    const hourly = Array.from(hourMap.entries()).map(([hour, count]) => ({ hour, count })).sort((a, b) => a.hour - b.hour);

    // Financial
    const totalDiscount = rows.reduce((s: number, r: any) => s + getNum(r, "discount", ["Total Diskon", "Discount", "Diskon"]), 0);
    const sellerDiscount = rows.reduce((s: number, r: any) => s + getNum(r, "seller_discount", ["Diskon Dari Penjual", "Seller Discount"]), 0);
    const platformDiscount = rows.reduce((s: number, r: any) => s + getNum(r, "platform_discount", ["Diskon Dari Shopee", "Platform Discount", "Marketplace Discount"]), 0);
    const avgShippingCost = rows.reduce((s: number, r: any) => s + getNum(r, "shipping_cost", ["Perkiraan Ongkos Kirim", "Shipping Fee", "Ongkir"]), 0) / Math.max(totalOrders, 1);
    const totalShippingRevenue = rows.reduce((s: number, r: any) => s + getNum(r, "shipping_cost", ["Ongkos Kirim Dibayar oleh Pembeli", "Shipping Fee"]), 0);
    const shippingSubsidy = rows.reduce((s: number, r: any) => s + getNum(r, "platform_discount", ["Estimasi Potongan Biaya Pengiriman"]), 0);

    return {
        overview: { totalOrders, totalRevenue, avgOrderValue, returnRate, dateRange, growthRate },
        productPerformance, variantAnalysis, regionalAnalysis, cityAnalysis, paymentAnalysis, shippingAnalysis,
        timeAnalysis: { daily, monthly, dayOfWeek, hourly },
        financialAnalysis: { totalDiscount, sellerDiscount, platformDiscount, avgShippingCost, totalShippingRevenue, shippingSubsidy },
    };
}

// Backwards compat alias
export const analyzeShopeeData = analyzeData;
