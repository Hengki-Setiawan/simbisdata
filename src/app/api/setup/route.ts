import { NextResponse } from "next/server";
import { setupDatabase } from "@/lib/setup-db";

export async function GET() {
    try {
        await setupDatabase();
        return NextResponse.json({ success: true, message: "Database tables created" });
    } catch (error) {
        console.error("Setup error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
