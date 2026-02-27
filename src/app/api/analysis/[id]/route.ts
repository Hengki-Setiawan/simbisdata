/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analysisResults } from "@/lib/schema";
import { eq } from "drizzle-orm";

// GET /api/analysis/[id] — Get single analysis result
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await db.select().from(analysisResults).where(eq(analysisResults.id, id)).get();
        if (!result) return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
        return NextResponse.json({ analysis: result });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/analysis/[id] — Delete analysis
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await db.delete(analysisResults).where(eq(analysisResults.id, id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
