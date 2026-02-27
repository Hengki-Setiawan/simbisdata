/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/files/[id] — Get file by ID
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const file = await db.select().from(files).where(eq(files.id, id)).get();
        if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });
        return NextResponse.json({ file });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/files/[id] — Delete file
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.delete(files).where(eq(files.id, id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
