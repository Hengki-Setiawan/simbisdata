"use server";

import { db } from "@/db";
import { landingHero, landingFeatures, landingTestimonials, landingFaqs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateLandingHero(data: any) {
    try {
        await db.delete(landingHero); // clear
        await db.insert(landingHero).values({
            title: data.title,
            gradientText: data.gradientText,
            description: data.description,
            primaryCtaText: data.primaryCtaText,
            secondaryCtaText: data.secondaryCtaText,
            updatedAt: Date.now()
        });
        revalidatePath("/");
        revalidatePath("/admin/landing");
        return { success: true };
    } catch (err) {
        console.error("updateLandingHero err", err);
        return { success: false };
    }
}

export async function updateFeature(id: number, data: any) {
    try {
        await db.update(landingFeatures).set(data).where(eq(landingFeatures.id, id));
        revalidatePath("/");
        revalidatePath("/admin/landing");
        return { success: true };
    } catch (err) {
        return { success: false };
    }
}

export async function createFeature(data: any) {
    try {
        await db.insert(landingFeatures).values(data);
        revalidatePath("/");
        revalidatePath("/admin/landing");
        return { success: true };
    } catch (err) {
        return { success: false };
    }
}

export async function deleteFeature(id: number) {
    try {
        await db.delete(landingFeatures).where(eq(landingFeatures.id, id));
        revalidatePath("/");
        revalidatePath("/admin/landing");
        return { success: true };
    } catch (err) {
        return { success: false };
    }
}

export async function updateTestimonial(id: number, data: any) {
    try {
        await db.update(landingTestimonials).set(data).where(eq(landingTestimonials.id, id));
        revalidatePath("/");
        revalidatePath("/admin/landing");
        return { success: true };
    } catch (err) {
        return { success: false };
    }
}

export async function createTestimonial(data: any) {
    try {
        await db.insert(landingTestimonials).values(data);
        revalidatePath("/");
        revalidatePath("/admin/landing");
        return { success: true };
    } catch (err) {
        return { success: false };
    }
}

export async function deleteTestimonial(id: number) {
    try {
        await db.delete(landingTestimonials).where(eq(landingTestimonials.id, id));
        revalidatePath("/");
        revalidatePath("/admin/landing");
        return { success: true };
    } catch (err) {
        return { success: false };
    }
}
