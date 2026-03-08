"use server";

import { db } from "@/db";
import { landingHero, landingFeatures } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

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
        return { id: 0, ...fallbackHero, updatedAt: Date.now() };
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

// Testimonials are now static (table removed)
export async function getLandingTestimonials() {
    return [
        { id: 1, name: "Budi Santoso", role: "Owner", company: "Toko Harapan Kita", content: "Sangat membantu merekap penjualan harian dari berbagai cabang toko.", rating: 5, displayOrder: 1, isActive: true },
        { id: 2, name: "Siti Aminah", role: "Marketing", company: "Fashion Hijabku", content: "Laporan PDF-nya bagus banget untuk meeting bulanan. Insight AI-nya juga akurat.", rating: 5, displayOrder: 2, isActive: true },
        { id: 3, name: "Reza Mahendra", role: "Founder", company: "Kopi Kenangan Senja", content: "Tinggal upload CSV dari sistem kasir Moka, langsung jadi dashboard yang keren.", rating: 4, displayOrder: 3, isActive: true },
    ];
}

// FAQs are now static (table removed)
export async function getLandingFaqs() {
    return [
        { id: 1, question: "Apakah data saya aman?", answer: "Sangat aman. Data dienkripsi dan kami tidak akan pernah menjual atau membagikan data UMKM Anda ke pihak ketiga.", displayOrder: 1, isActive: true },
        { id: 2, question: "Apakah gratis selamanya?", answer: "Ya! Semua fitur SimbisData tersedia secara gratis untuk UMKM Indonesia.", displayOrder: 2, isActive: true },
        { id: 3, question: "Marketplace apa saja yang didukung?", answer: "Saat ini kami secara native mendukung Shopee, Tokopedia, dan TikTok Shop. Anda juga bisa upload data custom dalam format CSV/Excel.", displayOrder: 3, isActive: true },
    ];
}
