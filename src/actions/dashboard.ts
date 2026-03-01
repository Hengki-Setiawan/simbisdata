"use server";

import { db } from "@/db";
import { uploadedFiles } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function saveDocumentHistory(data: {
    filename: string;
    fileSize: number;
    rowCount: number;
    platform: string;
    qualityScore: number;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };
        const userId = parseInt(session.user.id as string, 10);

        await db.insert(uploadedFiles).values({
            userId,
            filename: data.filename,
            fileSize: data.fileSize,
            rowCount: data.rowCount,
            platform: data.platform,
            qualityScore: data.qualityScore,
            uploadedAt: Math.floor(Date.now() / 1000)
        });
        revalidatePath("/dashboard/history");
        return { success: true };
    } catch (err) {
        console.error("Failed to save doc history:", err);
        return { success: false };
    }
}

export async function getUserHistory(userId: number) {
    try {
        const history = await db.select()
            .from(uploadedFiles)
            .where(eq(uploadedFiles.userId, userId))
            .orderBy(desc(uploadedFiles.uploadedAt));
        return history;
    } catch (err) {
        console.error("Failed to fetch user history:", err);
        return [];
    }
}

export async function deleteUserHistory(docId: number, userId: number) {
    try {
        await db.delete(uploadedFiles)
            .where(and(
                eq(uploadedFiles.id, docId),
                eq(uploadedFiles.userId, userId)
            ));
        revalidatePath("/dashboard/history");
        revalidatePath("/dashboard/upload");
        return { success: true };
    } catch (err) {
        console.error("Failed to delete user history:", err);
        return { success: false };
    }
}

export async function getMonthlyUploadCount(userId: number) {
    try {
        const now = new Date();
        const startOfMonth = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);

        const uploads = await db.select()
            .from(uploadedFiles)
            .where(and(
                eq(uploadedFiles.userId, userId),
                eq(uploadedFiles.uploadedAt, startOfMonth) // This is wrong, should be >=
            ));
        // Using gte in drizzle:
        const { gte } = await import("drizzle-orm");
        const results = await db.select()
            .from(uploadedFiles)
            .where(and(
                eq(uploadedFiles.userId, userId),
                gte(uploadedFiles.uploadedAt, startOfMonth)
            ));

        return results.length;
    } catch (err) {
        console.error("Failed to fetch monthly upload count:", err);
        return 0;
    }
}
