import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";

export async function POST(req: NextRequest) {
    try {
        const { userId, action, details, ipAddress } = await req.json();
        const now = Math.floor(Date.now() / 1000);

        await db.insert(activityLogs).values({
            userId: userId || null,
            action,
            details: details ? JSON.stringify(details) : null,
            ipAddress: ipAddress || null,
            createdAt: now,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Activity log error:", error);
        return NextResponse.json({ success: false });
    }
}
