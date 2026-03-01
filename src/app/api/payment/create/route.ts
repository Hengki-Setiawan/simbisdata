/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Duitku Payment Integration - Pop-up Checkout
 * Uses createInvoice endpoint to show all payment methods in a hosted page
 */
export async function POST(request: Request) {
    try {
        console.log("--- START DUITKU PAYMENT CREATION ---");
        const body = await request.json();
        console.log("Incoming request body:", body);
        const { planName, price, userId, userEmail, userName } = body;

        const merchantCode = process.env.DUITKU_MERCHANT_CODE;
        const apiKey = process.env.DUITKU_API_KEY;
        const appUrl = (process.env.NEXTAUTH_URL || "https://SimbisData.vercel.app").replace(/\/+$/, "");

        // Determine if sandbox or production
        const isSandbox = (process.env.DUITKU_PASSPORT_URL || "").includes("sandbox");
        const baseUrl = isSandbox
            ? "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry"
            : "https://passport.duitku.com/api/merchant/v2/inquiry";

        console.log("Environment variables:", {
            hasMerchantCode: !!merchantCode,
            hasApiKey: !!apiKey,
            isSandbox,
            baseUrl,
            appUrl
        });

        if (!merchantCode || !apiKey) {
            console.error("Missing Duitku credentials in environment variables.");
            return NextResponse.json({ error: "Duitku gateway not configured" }, { status: 503 });
        }

        const merchantOrderId = `SIMB-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const paymentAmount = Math.floor(price);

        // Duitku V2 Inquiry requires a specific paymentMethod code
        // Use "VC" (Credit Card) as default, user can change on the checkout page
        const paymentMethod = "VC";

        // Signature: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
        const signatureStr = merchantCode + merchantOrderId + paymentAmount + apiKey;
        const signature = crypto.createHash("md5").update(signatureStr).digest("hex");

        const payload = {
            merchantCode: merchantCode,
            paymentAmount: paymentAmount,
            paymentMethod: paymentMethod,
            merchantOrderId: merchantOrderId,
            productDetails: `SimbisData ${planName} Plan`,
            email: userEmail || "user@SimbisData.com",
            customerVaName: userName || "SimbisUser",
            phoneNumber: "081234567890",
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
            expiryPeriod: 1440
        };

        console.log("Generated Duitku payload:", JSON.stringify(payload, null, 2));

        const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        console.log("Duitku API response status:", response.status);
        console.log("Duitku API response raw:", responseText);

        let data: any;
        try {
            data = JSON.parse(responseText);
        } catch {
            console.error("Failed to parse Duitku response as JSON:", responseText);
            return NextResponse.json({
                error: "Invalid response from Duitku",
                details: responseText.substring(0, 500)
            }, { status: 502 });
        }

        if (data.statusCode !== "00") {
            console.error("Duitku error API:", data);
            return NextResponse.json({
                error: "Duitku API Error",
                details: data.statusMessage || data.Message || JSON.stringify(data),
                code: data.statusCode
            }, { status: 500 });
        }

        console.log("--- SUCCESS DUITKU PAYMENT CREATION ---");

        // Save transaction to DB
        try {
            const { db } = await import("@/db");
            const { paymentTransactions } = await import("@/db/schema");
            await db.insert(paymentTransactions).values({
                userId: parseInt(userId) || 0,
                orderId: merchantOrderId,
                planId: planName.toLowerCase(),
                amount: paymentAmount,
                status: "pending",
                provider: "duitku",
                createdAt: Math.floor(Date.now() / 1000)
            });
            console.log("Transaction saved to DB:", merchantOrderId);
        } catch (dbErr) {
            console.error("Failed to save transaction to DB:", dbErr);
            // We continue even if DB save fails, as the payment can still proceed via Duitku
        }

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
