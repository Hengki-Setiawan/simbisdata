"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Users Management ---

export async function getAllUsers() {
    try {
        return await db.select().from(users).orderBy(desc(users.createdAt));
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

export async function changeUserTier(userId: number, planId: string) {
    try {
        await db.update(users).set({ planId }).where(eq(users.id, userId));
        revalidatePath("/admin/users");
        return { success: true };
    } catch (err) {
        console.error("Failed to change tier:", err);
        return { success: false, error: "Failed to update tier." };
    }
}
