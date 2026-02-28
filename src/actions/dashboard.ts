"use server";

import { db } from "@/db";
import { uploadedFiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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
