import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const items = await db.select().from(announcements).orderBy(desc(announcements.createdAt));
        return NextResponse.json(items);
    } catch (error) {
        console.error("Announcements error:", error);
        return NextResponse.json([]);
    }
}

export async function POST(req: NextRequest) {
    try {
        const { title, content, type } = await req.json();
        const now = Math.floor(Date.now() / 1000);
        const result = await db.insert(announcements).values({
            title, content, type: type || "info",
            isActive: false, createdAt: now,
        }).returning();
        return NextResponse.json(result[0]);
    } catch (error) {
        console.error("Create announcement error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { id, isActive } = await req.json();
        await db.update(announcements).set({ isActive }).where(eq(announcements.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update announcement error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        await db.delete(announcements).where(eq(announcements.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete announcement error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
