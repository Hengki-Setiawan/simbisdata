import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        // Authenticate request (Optional if session is strictly enforced, but good practice)
        // const session = await getServerSession();
        // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { planId, amount, customerName, customerEmail } = body;

        if (!planId || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const merchantCode = process.env.DUITKU_MERCHANT_CODE;
        const merchantKey = process.env.DUITKU_API_KEY;
        const passportUrl = process.env.DUITKU_PASSPORT_URL || "https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry";

        if (!merchantCode || !merchantKey) {
            console.error("Duitku credentials missing in environment variables.");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        // Generate a unique order ID for this transaction
        const merchantOrderId = `SIMBIS-${planId.toUpperCase()}-${Date.now()}`;
        
        // Duitku signature formula for inquiry: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
        const signatureString = `${merchantCode}${merchantOrderId}${amount}${merchantKey}`;
        const signature = crypto.createHash('md5').update(signatureString).digest('hex');

        // Prepare the payload according to Duitku's Sandbox API documentation
        const payload = {
            merchantCode: merchantCode,
            paymentAmount: amount,
            merchantOrderId: merchantOrderId,
            productDetails: `Langganan Paket ${planId} (1 Bulan)`,
            email: customerEmail || "customer@simbisdata.com",
            customerVaName: customerName || "SimbisData User",
            callbackUrl: `${process.env.NEXTAUTH_URL}/api/duitku/callback`, // Where Duitku posts the success/fail result
            returnUrl: `${process.env.NEXTAUTH_URL}/dashboard/profile?payment=success`, // Where the user is redirected after paying
            signature: signature,
            // Include expiry period in minutes if desired (e.g., 60 = 1 hour)
            expiryPeriod: 60,
        };

        // Make the POST request to Duitku Sandbox Passport API
        const response = await fetch(passportUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.statusCode === "00") {
            // Success! Duitku returns a paymentUrl and reference string
            return NextResponse.json({ 
                success: true, 
                paymentUrl: data.paymentUrl,
                reference: data.reference 
            });
        } else {
            console.error("Duitku API Error:", data);
            return NextResponse.json({ 
                error: data.statusMessage || "Failed to initialize payment gateway",
                details: data
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Error connecting to Duitku API:", error);
        return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
    }
}
