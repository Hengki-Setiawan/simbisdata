import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const SETTINGS_KEY = "admin:settings";

const defaultSettings = {
    siteName: "SimbisData",
    maintenanceMode: false,
    maxUploadSize: "10",
    groqEnabled: true,
    geminiEnabled: true,
    browserlessEnabled: true,
    emailNotifications: true,
    maxFreeAnalyses: "3",
    maxStarterAnalyses: "20",
    demoExpireDays: "7",
};

export async function GET() {
    try {
        const cached = await redis.get(SETTINGS_KEY);
        if (cached) {
            return NextResponse.json(typeof cached === "string" ? JSON.parse(cached) : cached);
        }
        return NextResponse.json(defaultSettings);
    } catch {
        return NextResponse.json(defaultSettings);
    }
}

export async function POST(req: NextRequest) {
    try {
        const config = await req.json();
        await redis.set(SETTINGS_KEY, JSON.stringify(config));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Save settings error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
