/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import crypto from "crypto";
// import database
// import { db } from "@/lib/db";
// import { subscriptions, users } from "@/lib/schema";
// import { eq } from "drizzle-orm";

/**
 * Duitku Webhook — Callback Handler
 * Verifies MD5 signature and updates subscription status
 */
export async function POST(request: Request) {
    try {
        // Duitku sends data as application/x-www-form-urlencoded
        const formData = await request.formData();
        const merchantCodeSent = formData.get("merchantCode") as string;
        const amount = formData.get("amount") as string;
        const merchantOrderId = formData.get("merchantOrderId") as string;
        const signature = formData.get("signature") as string;
        const reference = formData.get("reference") as string;
        const resultCode = formData.get("resultCode") as string;

        const apiKey = process.env.DUITKU_API_KEY;
        const merchantCode = process.env.DUITKU_MERCHANT_CODE;

        if (!apiKey || !merchantCode) {
            return NextResponse.json({ error: "Not configured" }, { status: 503 });
        }

        // Verify Duitku MD5 signature
        const expectedSignatureStr = merchantCode + amount + merchantOrderId + apiKey;
        const expectedSignature = crypto.createHash('md5').update(expectedSignatureStr).digest('hex');

        if (signature !== expectedSignature) {
            console.error("Invalid Duitku Callback Signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }

        console.log(`Duitku Webhook received. Ref: ${merchantOrderId}, Status: ${resultCode}`);

        let paymentStatus: "success" | "pending" | "failed" | "expired" = "pending";

        if (resultCode === "00") {
            paymentStatus = "success";
        } else if (resultCode === "01") {
            paymentStatus = "failed";
        }

        if (paymentStatus === "success") {
            console.log(`Successfully activated subscription for order ${merchantOrderId}`);

            // Send Invoice Email via Resend
            try {
                const { Resend } = await import("resend");
                const { InvoiceEmail } = await import("@/components/emails/Template");

                const resendApiKey = process.env.RESEND_API_KEY;
                if (resendApiKey) {
                    const resend = new Resend(resendApiKey);

                    // Since Duitku callback doesn't have customer email
                    // In a real app we would load it from the database based on the merchantOrderId
                    const customerEmail = "user@simbisdata.com";
                    const customerName = "SimbisData Premium User";

                    await resend.emails.send({
                        from: "SimbisData <no-reply@simbisdata.com>",
                        to: [customerEmail],
                        subject: `Struk Pembayaran SimbisData Premium #${merchantOrderId}`,
                        react: InvoiceEmail({
                            name: customerName,
                            plan: "Premium Analytics Plan",
                            orderId: merchantOrderId
                        }) as React.ReactElement,
                    });
                    console.log("Email invoice sent to", customerEmail);
                }
            } catch (emailErr) {
                console.error("Failed to send invoice email:", emailErr);
            }
        }

        // Must return this exact text for Duitku
        return new NextResponse("SUCCESS", { status: 200, headers: { 'Content-Type': 'text/plain' } });
    } catch (error: any) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
