import { NextRequest, NextResponse } from "next/server";
import { getCached, setCache } from "@/lib/api-cache";

const SETTINGS_KEY = "admin:settings";

const defaultSettings = {
    siteName: "SimbisData",
    maintenanceMode: false,
    maxUploadSize: "10",
    groqEnabled: true,
    geminiEnabled: true,
    emailNotifications: true,
    maxFreeAnalyses: "3",
};

export async function GET() {
    const cached = getCached<typeof defaultSettings>(SETTINGS_KEY);
    if (cached) {
        return NextResponse.json(cached);
    }
    return NextResponse.json(defaultSettings);
}

export async function POST(req: NextRequest) {
    try {
        const config = await req.json();
        setCache(SETTINGS_KEY, config, "geocode");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Save settings error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
