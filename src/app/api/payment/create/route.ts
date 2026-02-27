/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Duitku Payment Integration
 * Creates a transaction and returns checkout URL
 */
export async function POST(request: Request) {
    try {
        const { planName, price, userId, userEmail, userName } = await request.json();

        const merchantCode = process.env.DUITKU_MERCHANT_CODE;
        const apiKey = process.env.DUITKU_API_KEY;
        const baseUrl = process.env.DUITKU_PASSPORT_URL || "https://passport.duitku.com/api/merchant/v2/inquiry";

        if (!merchantCode || !apiKey) {
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
            itemDetails: [
                {
                    name: `SimbisData ${planName} Plan`,
                    price: paymentAmount,
                    quantity: 1
                }
            ],
            callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/webhook`,
            returnUrl: `${process.env.NEXTAUTH_URL}/dashboard/subscription?payment=success`,
            signature: signature,
            expiryPeriod: 1440 // 24 hours in minutes
        };

        const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.statusCode !== "00") {
            console.error("Duitku error API:", data);
            return NextResponse.json({ error: data.statusMessage || "Failed to create payment" }, { status: 500 });
        }

        return NextResponse.json({
            checkoutUrl: data.paymentUrl,
            reference: data.reference,
            merchantRef: merchantOrderId,
        });
    } catch (error: any) {
        console.error("Payment error:", error);
        return NextResponse.json({ error: error.message || "Payment failed" }, { status: 500 });
    }
}
