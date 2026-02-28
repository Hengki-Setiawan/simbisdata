"use server";

import { db } from "@/db";
import { landingHero, landingFeatures, landingTestimonials, landingFaqs } from "@/db/schema";
import { desc, asc, eq } from "drizzle-orm";

const fallbackHero = {
    title: "Ubah Data Penjualan Jadi",
    gradientText: "Insight Bisnis",
    description: "Upload file Excel penjualan dari marketplace manapun atau data UMKM sendiri. 15+ algoritma ML dan narasi AI — tanpa perlu keahlian data science.",
    primaryCtaText: "Mulai Gratis",
    secondaryCtaText: "Lihat Fitur",
};

export async function getLandingHero() {
    try {
        const hero = await db.select().from(landingHero).limit(1);
        if (hero.length > 0) return hero[0];

        // Return default if empty
        return {
            id: 0,
            ...fallbackHero,
            updatedAt: Date.now()
        };
    } catch (e) {
        console.error("Failed to get hero:", e);
        return { id: 0, ...fallbackHero, updatedAt: Date.now() };
    }
}

export async function getLandingFeatures() {
    try {
        const features = await db.select()
            .from(landingFeatures)
            .where(eq(landingFeatures.isActive, true))
            .orderBy(asc(landingFeatures.displayOrder));

        if (features.length > 0) return features;

        // Fallback features
        return [
            { id: 1, icon: "upload", title: "Upload Singkat", description: "Format dari Shopee, Tokopedia, TikTok, atau Excel kasir offline — semua didukung.", displayOrder: 1, isActive: true },
            { id: 2, icon: "cpu", title: "ML Processing", description: "Sistem otomatis membersihkan data, mengelompokkan variasi, dan menghitung anomali.", displayOrder: 2, isActive: true },
            { id: 3, icon: "file-text", title: "Report & AI Narration", description: "Export ke PDF berdesain premium atau biarkan AI menulis rangkuman analitik bahasa Indonesia.", displayOrder: 3, isActive: true },
        ];
    } catch (e) {
        return [];
    }
}

export async function getLandingTestimonials() {
    try {
        const testimonials = await db.select()
            .from(landingTestimonials)
            .where(eq(landingTestimonials.isActive, true))
            .orderBy(asc(landingTestimonials.displayOrder));

        if (testimonials.length > 0) return testimonials;

        // Fallback testimonials
        return [
            { id: 1, name: "Budi Santoso", role: "Owner", company: "Toko Harapan Kita", content: "Sangat membantu merekap penjualan harian dari berbagai cabang toko.", rating: 5, displayOrder: 1, isActive: true },
            { id: 2, name: "Siti Aminah", role: "Marketing", company: "Fashion Hijabku", content: "Laporan PDF-nya bagus banget untuk meeting bulanan. Insight AI-nya juga akurat.", rating: 5, displayOrder: 2, isActive: true },
            { id: 3, name: "Reza Mahendra", role: "Founder", company: "Kopi Kenangan Senja", content: "Tinggal upload CSV dari sistem kasir Moka, langsung jadi dashboard yang keren.", rating: 4, displayOrder: 3, isActive: true },
        ];
    } catch (e) {
        return [];
    }
}

export async function getLandingFaqs() {
    try {
        const faqs = await db.select()
            .from(landingFaqs)
            .where(eq(landingFaqs.isActive, true))
            .orderBy(asc(landingFaqs.displayOrder));

        if (faqs.length > 0) return faqs;

        // Fallback FAQs
        return [
            { id: 1, question: "Apakah data saya aman?", answer: "Sangat aman. Data dienkripsi dan kami tidak akan pernah menjual atau membagikan data UMKM Anda ke pihak ketiga.", displayOrder: 1, isActive: true },
            { id: 2, question: "Apakah gratis selamanya?", answer: "Paket Free kami bisa digunakan selamanya gratis, namun dengan batasan jumlah upload dan fitur terbatas.", displayOrder: 2, isActive: true },
            { id: 3, question: "Bagaimana sistem pembayaran paket Pro?", answer: "Kami menggunakan payment gateway Duitku yang mendukung dompet digital, transfer bank, dan QRIS.", displayOrder: 3, isActive: true },
            { id: 4, question: "Marketplace apa saja yang didukung?", answer: "Saat ini kami secara native mendukung Shopee dan Tokopedia. Namun Anda bisa upload data custom dalam format CSV/Excel.", displayOrder: 4, isActive: true },
        ];
    } catch (e) {
        return [];
    }
}
