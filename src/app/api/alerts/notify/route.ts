import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { title, message, type, recipient } = await req.json();

        if (!title || !message) {
            return NextResponse.json({ error: "Missing title or message" }, { status: 400 });
        }

        // Mock implementation of External Webhook
        console.log("🔔 [WEBHOOK TRIGGERED]", { type, title, message, recipient });

        // Implementation Example for WhatsApp (e.g., Fonnte API)
        const waApiKey = process.env.FONNTE_API_KEY;
        if (type === "whatsapp" && waApiKey && recipient) {
            try {
                await fetch("https://api.fonnte.com/send", {
                    method: "POST",
                    headers: {
                        Authorization: waApiKey,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        target: recipient,
                        message: `*${title}*\n\n${message}`,
                        delay: "2"
                    })
                });
                console.log("✅ WhatsApp alert sent successfully!");
            } catch (err) {
                console.error("❌ Failed to send WhatsApp alert:", err);
            }
        }

        // Return success even if API keys aren't set (graceful fallback)
        return NextResponse.json({
            success: true,
            alert: { title, message, type },
            note: "Webhook received. Ensure FONNTE_API_KEY is set in .env to actually send WhatsApp."
        });

    } catch (error) {
        console.error("Alert Webhook Error:", error);
        return NextResponse.json({ error: "Failed to process alert webhook" }, { status: 500 });
    }
}
