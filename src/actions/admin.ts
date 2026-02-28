"use server";

import { db } from "@/db";
import { users, demoTokens, subscriptions, apiLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Users Management ---

export async function getAllUsers() {
    try {
        const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
        const allSubs = await db.select().from(subscriptions);

        // Merge users with subscriptions
        return allUsers.map(user => {
            const activeSub = allSubs.find(s => s.userId === user.id && s.status === "active");
            return { ...user, sub: activeSub };
        });
    } catch (err) {
        console.error("Failed fetching Turso users:", err);
        return [];
    }
}

export async function toggleUserStatus(userId: number, currentStatus: boolean) {
    try {
        await db.update(users).set({ isActive: !currentStatus }).where(eq(users.id, userId));
        revalidatePath("/admin/users");
        return { success: true };
    } catch (err) {
        console.error("Failed to toggle status:", err);
        return { success: false, error: "Failed to update user." };
    }
}

export async function upgradeUserToPro(userId: number) {
    try {
        // 1. Update user plan
        await db.update(users).set({ planId: "pro" }).where(eq(users.id, userId));

        // 2. Expire old subs
        await db.update(subscriptions)
            .set({ status: "expired" })
            .where(eq(subscriptions.userId, userId));

        // 3. Create new PRO sub
        await db.insert(subscriptions).values({
            userId,
            planId: "pro",
            status: "active",
            endDate: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days unix
            createdAt: Math.floor(Date.now() / 1000)
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (err) {
        console.error("Failed to upgrade pro:", err);
        return { success: false, error: "Failed to upgrade." };
    }
}

export async function changeUserTier(userId: number, planId: string) {
    try {
        await db.update(users).set({ planId }).where(eq(users.id, userId));

        await db.update(subscriptions)
            .set({ status: "expired" })
            .where(eq(subscriptions.userId, userId));

        if (planId !== "free") {
            await db.insert(subscriptions).values({
                userId,
                planId,
                status: "active",
                endDate: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30), // 30 days unix
                createdAt: Math.floor(Date.now() / 1000)
            });
        }

        revalidatePath("/admin/users");
        return { success: true };
    } catch (err) {
        console.error("Failed to change tier:", err);
        return { success: false, error: "Failed to update tier." };
    }
}

// --- Demo Tokens ---

export async function getAllDemoTokens() {
    try {
        return await db.select().from(demoTokens).orderBy(desc(demoTokens.createdAt));
    } catch (err) {
        console.error("Failed fetching tokens:", err);
        return [];
    }
}

export async function generateNewDemoToken() {
    try {
        const newToken = Math.random().toString(36).substring(2, 8).toUpperCase() + "-" +
            Math.random().toString(36).substring(2, 8).toUpperCase();

        await db.insert(demoTokens).values({
            token: newToken,
            expiresAt: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days unix
            createdAt: Math.floor(Date.now() / 1000)
        });

        revalidatePath("/admin/demo");
        return { success: true };
    } catch (err) {
        console.error("Failed generating token:", err);
        return { success: false };
    }
}
