import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, subscriptions, apiLogs, demoTokens } from "@/db/schema";
import { count, sum, eq, and, ne } from "drizzle-orm";

export async function GET() {
    try {
        // Total users
        const totalUsersResult = await db.select({ count: count() }).from(users);
        const totalUsers = totalUsersResult[0]?.count || 0;

        // Active PRO users (not free tier)
        const proUsersResult = await db.select({ count: count() }).from(users).where(
            and(ne(users.planId, "free"), eq(users.isActive, true))
        );
        const activeProUsers = proUsersResult[0]?.count || 0;

        // Total AI tokens used
        const tokensResult = await db.select({ total: sum(apiLogs.tokensUsed) }).from(apiLogs);
        const totalTokensUsed = Number(tokensResult[0]?.total) || 0;

        // Total demo tokens
        const demosResult = await db.select({ count: count() }).from(demoTokens);
        const totalDemoTokens = demosResult[0]?.count || 0;

        return NextResponse.json({
            totalUsers,
            activeProUsers,
            totalTokensUsed,
            totalDemoTokens,
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ totalUsers: 0, activeProUsers: 0, totalTokensUsed: 0, totalDemoTokens: 0 });
    }
}
