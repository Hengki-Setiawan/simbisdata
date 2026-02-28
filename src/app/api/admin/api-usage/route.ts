import { NextResponse } from "next/server";
import { db } from "@/db";
import { apiLogs } from "@/db/schema";
import { count, sum, sql } from "drizzle-orm";

export async function GET() {
    try {
        // Total tokens used
        const totalResult = await db.select({
            totalTokens: sum(apiLogs.tokensUsed),
            totalCalls: count(),
        }).from(apiLogs);

        const totalTokens = Number(totalResult[0]?.totalTokens) || 0;
        const totalCalls = totalResult[0]?.totalCalls || 0;

        // Group by provider
        const providerStats = await db.select({
            provider: apiLogs.provider,
            count: count(),
            tokens: sum(apiLogs.tokensUsed),
        }).from(apiLogs).groupBy(apiLogs.provider);

        const providers = providerStats.map((p) => ({
            provider: p.provider,
            count: p.count,
            tokens: Number(p.tokens) || 0,
        }));

        return NextResponse.json({
            totalTokens,
            totalCalls,
            providers,
        });
    } catch (error) {
        console.error("API usage stats error:", error);
        return NextResponse.json({ totalTokens: 0, totalCalls: 0, providers: [] });
    }
}
