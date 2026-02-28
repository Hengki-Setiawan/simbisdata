import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { count, ne, eq, and } from "drizzle-orm";

export async function GET() {
    try {
        // Count paid users per tier
        const starterCount = await db.select({ count: count() }).from(users).where(and(eq(users.planId, "starter"), eq(users.isActive, true)));
        const proCount = await db.select({ count: count() }).from(users).where(and(eq(users.planId, "pro"), eq(users.isActive, true)));
        const enterpriseCount = await db.select({ count: count() }).from(users).where(and(eq(users.planId, "enterprise"), eq(users.isActive, true)));

        const starter = starterCount[0]?.count || 0;
        const pro = proCount[0]?.count || 0;
        const enterprise = enterpriseCount[0]?.count || 0;
        const totalPaidUsers = starter + pro + enterprise;

        // Calculate MRR based on pricing tiers
        const mrr = (starter * 29000) + (pro * 79000) + (enterprise * 199000);

        return NextResponse.json({
            totalPaidUsers,
            mrr,
            tierBreakdown: [
                { name: "Starter", count: starter, color: "#f59e0b" },
                { name: "Pro", count: pro, color: "#6366f1" },
                { name: "Enterprise", count: enterprise, color: "#10b981" },
            ],
        });
    } catch (error) {
        console.error("Revenue stats error:", error);
        return NextResponse.json({ totalPaidUsers: 0, mrr: 0, tierBreakdown: [] });
    }
}
