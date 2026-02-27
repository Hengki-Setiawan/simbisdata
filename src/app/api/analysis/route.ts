/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analysisResults } from "@/lib/schema";
import { eq } from "drizzle-orm";

// POST /api/analysis/run — Create analysis session
export async function POST(request: Request) {
    try {
        const { userId, fileId, resultJson, aiNarration } = await request.json();
        if (!userId || !fileId) return NextResponse.json({ error: "userId and fileId required" }, { status: 400 });

        const result = await db.insert(analysisResults).values({
            userId, fileId,
            resultJson: typeof resultJson === "string" ? resultJson : JSON.stringify(resultJson),
            aiNarration: aiNarration || null,
        }).returning();

        return NextResponse.json({ analysis: result[0] }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET /api/analysis — List analysis history
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

        const results = await db.select().from(analysisResults).where(eq(analysisResults.userId, userId)).all();
        return NextResponse.json({ analyses: results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
