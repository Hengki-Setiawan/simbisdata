import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, subscriptions, paymentTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = parseInt(session.user.id);

        // Fetch User (for planId)
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch active sub
        const [activeSub] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId))
            .orderBy(desc(subscriptions.createdAt))
            .limit(1);

        // Fetch transactions
        const txs = await db
            .select()
            .from(paymentTransactions)
            .where(eq(paymentTransactions.userId, userId))
            .orderBy(desc(paymentTransactions.createdAt));

        return NextResponse.json({
            planId: user.planId,
            subscription: activeSub || null,
            transactions: txs
        });

    } catch (err: any) {
        console.error("Billing API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
