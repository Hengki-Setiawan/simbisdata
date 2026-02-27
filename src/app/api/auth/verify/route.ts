import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        const user = result[0];
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }

        // Verify password using bcryptjs
        const bcrypt = await import("bcryptjs");
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            tier: user.tier,
        });
    } catch (error) {
        console.error("Auth verify error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
