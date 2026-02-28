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

        // Calculate Monthly Growth Data
        const allUsers = await db.select({
            createdAt: users.createdAt,
            planId: users.planId,
            isActive: users.isActive,
        }).from(users);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentDate = new Date();
        const currentMonthIdx = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // We will generate data for the last 6 months up to current
        const growthData = [];
        let cumulativeUsers = 0;

        for (let i = 5; i >= 0; i--) {
            let mIdx = currentMonthIdx - i;
            let y = currentYear;
            if (mIdx < 0) {
                mIdx += 12;
                y -= 1;
            }
            const monthName = months[mIdx];

            // Count users created up to or during this month
            // We just do a simple cumulative logic for demo, calculating how many users exist by this month
            const endOfMonth = new Date(y, mIdx + 1, 0).getTime() / 1000; // end of month in seconds
            const usersByThisMonth = allUsers.filter(u => u.createdAt <= endOfMonth);

            cumulativeUsers = usersByThisMonth.length;
            const proUsersThisMonth = usersByThisMonth.filter(u => u.planId !== "free" && u.isActive).length;
            const revenue = proUsersThisMonth * 79; // simple estimation 

            growthData.push({
                name: monthName,
                users: cumulativeUsers,
                revenue: revenue,
            });
        }

        return NextResponse.json({
            totalUsers,
            activeProUsers,
            totalTokensUsed,
            totalDemoTokens,
            growthData,
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({
            totalUsers: 0,
            activeProUsers: 0,
            totalTokensUsed: 0,
            totalDemoTokens: 0,
            growthData: []
        });
    }
}
