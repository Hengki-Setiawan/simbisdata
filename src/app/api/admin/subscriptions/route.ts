import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const subs = await db.select({
            id: subscriptions.id,
            userId: subscriptions.userId,
            planId: subscriptions.planId,
            status: subscriptions.status,
            endDate: subscriptions.endDate,
            createdAt: subscriptions.createdAt,
            userName: users.name,
            userEmail: users.email,
        })
            .from(subscriptions)
            .leftJoin(users, eq(subscriptions.userId, users.id))
            .orderBy(desc(subscriptions.createdAt));

        return NextResponse.json(subs);
    } catch (error) {
        console.error("Subscriptions error:", error);
        return NextResponse.json([]);
    }
}
