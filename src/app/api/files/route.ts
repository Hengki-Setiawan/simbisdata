/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/files — List user's uploaded files
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

        const userFiles = await db.select().from(files).where(eq(files.userId, userId)).all();
        return NextResponse.json({ files: userFiles });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/files/upload — Save uploaded file metadata
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, fileName, fileSize, totalRows, totalColumns } = body;
        if (!userId || !fileName) return NextResponse.json({ error: "userId and fileName required" }, { status: 400 });

        const newFile = await db.insert(files).values({
            userId, fileName, fileSize: fileSize || 0,
            totalRows: totalRows || 0, totalColumns: totalColumns || 0,
        }).returning();

        return NextResponse.json({ file: newFile[0] }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
