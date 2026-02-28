import { NextResponse } from "next/server";
import { db } from "@/db";
import { uploadedFiles, users } from "@/db/schema";
import { count, sum } from "drizzle-orm";

export const revalidate = 3600; // Cache this route for 1 hour to prevent DB spam

export async function GET() {
    try {
        const [
            userCountResult,
            rowCountResult,
            fileCountResult
        ] = await Promise.all([
            db.select({ value: count() }).from(users),
            db.select({ value: sum(uploadedFiles.rowCount) }).from(uploadedFiles),
            db.select({ value: count() }).from(uploadedFiles),
        ]);

        const totalUsers = userCountResult[0]?.value || 0;
        const totalRows = Number(rowCountResult[0]?.value) || 0;
        const totalFiles = fileCountResult[0]?.value || 0;

        return NextResponse.json({
            success: true,
            totalUsers,
            totalRows,
            totalFiles
        });
    } catch (error: any) {
        console.error("Public Stats API Error:", error);
        return NextResponse.json(
            { success: false, error: "Gagal mengambil statistik platform" },
            { status: 500 }
        );
    }
}
