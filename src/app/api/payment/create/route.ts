/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Duitku Payment Integration
 * Creates a transaction and returns checkout URL
 */
export async function POST(request: Request) {
    try {
        console.log("--- START DUITKU PAYMENT CREATION ---");
        const body = await request.json();
        console.log("Incoming request body:", body);
        const { planName, price, userId, userEmail, userName } = body;

        const merchantCode = process.env.DUITKU_MERCHANT_CODE;
        const apiKey = process.env.DUITKU_API_KEY;
        const baseUrl = process.env.DUITKU_PASSPORT_URL || "https://passport.duitku.com/api/merchant/v2/inquiry";
        const appUrl = (process.env.NEXTAUTH_URL || "https://simbisdata.vercel.app").replace(/\/+$/, "");

        console.log("Environment variables:", {
            hasMerchantCode: !!merchantCode,
            hasApiKey: !!apiKey,
            baseUrl,
            appUrl
        });

        if (!merchantCode || !apiKey) {
            console.error("Missing Duitku credentials in environment variables.");
            return NextResponse.json({ error: "Duitku gateway not configured" }, { status: 503 });
        }

        const merchantOrderId = `SIMB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const paymentAmount = Math.floor(price); // Duitku requires integer

        // Generate Signature: MD5 from (merchantCode + merchantOrderId + paymentAmount + apiKey)
        const signatureStr = merchantCode + merchantOrderId + paymentAmount + apiKey;
        const signature = crypto.createHash('md5').update(signatureStr).digest('hex');

        const payload = {
            merchantCode: merchantCode,
            paymentAmount: paymentAmount,
            merchantOrderId: merchantOrderId,
            productDetails: `SimbisData ${planName} Plan`,
            email: userEmail || "user@simbisdata.com",
            customerVaName: userName || "SimbisUser",
            phoneNumber: "081234567890",
            paymentMethod: "", // Empty string to let user choose on Duitku page
            itemDetails: [
                {
                    name: `SimbisData ${planName} Plan`,
                    price: paymentAmount,
                    quantity: 1
                }
            ],
            callbackUrl: `${appUrl}/api/payment/webhook`,
            returnUrl: `${appUrl}/dashboard/subscription?payment=success`,
            signature: signature,
            expiryPeriod: 1440 // 24 hours in minutes
        };

        console.log("Generated Duitku payload:", JSON.stringify(payload, null, 2));

        const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("Duitku API response status:", response.status);
        console.log("Duitku API response data:", JSON.stringify(data, null, 2));

        if (data.statusCode !== "00") {
            console.error("Duitku error API:", data);
            return NextResponse.json({
                error: "Duitku API Error",
                details: data.statusMessage || JSON.stringify(data),
                code: data.statusCode
            }, { status: 500 });
        }

        console.log("--- SUCCESS DUITKU PAYMENT CREATION ---");
        return NextResponse.json({
            checkoutUrl: data.paymentUrl,
            reference: data.reference,
            merchantRef: merchantOrderId,
        });
    } catch (error: any) {
        console.error("Payment error exception:", error);
        return NextResponse.json({
            error: "Internal Server Error during Payment",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
