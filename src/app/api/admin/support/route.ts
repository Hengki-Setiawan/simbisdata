import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const tickets = await db.select({
            id: supportTickets.id,
            userId: supportTickets.userId,
            subject: supportTickets.subject,
            message: supportTickets.message,
            status: supportTickets.status,
            priority: supportTickets.priority,
            adminReply: supportTickets.adminReply,
            createdAt: supportTickets.createdAt,
            userName: users.name,
            userEmail: users.email,
        })
            .from(supportTickets)
            .leftJoin(users, eq(supportTickets.userId, users.id))
            .orderBy(desc(supportTickets.createdAt));

        return NextResponse.json(tickets);
    } catch (error) {
        console.error("Support tickets error:", error);
        return NextResponse.json([]);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, status, adminReply } = body;

        const updates: any = { updatedAt: Math.floor(Date.now() / 1000) };
        if (status) updates.status = status;
        if (adminReply) updates.adminReply = adminReply;

        await db.update(supportTickets).set(updates).where(eq(supportTickets.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update ticket error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
