import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existing = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existing.length > 0) {
            return NextResponse.json(
                { error: "Email already registered" },
                { status: 409 }
            );
        }

        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (in production, hash password with bcrypt)
        const newUser = await db
            .insert(users)
            .values({
                name,
                email,
                password: hashedPassword, // Hash with bcrypt
                tier: "free",
            })
            .returning();

        return NextResponse.json(
            {
                id: newUser[0].id,
                name: newUser[0].name,
                email: newUser[0].email,
                tier: newUser[0].tier,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
