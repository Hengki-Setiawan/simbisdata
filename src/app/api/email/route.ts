import { Resend } from "resend";
import { NextResponse } from "next/server";
import { WelcomeEmail } from "@/components/emails/Template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { email, firstName } = await req.json();

        if (!email || !firstName) {
            return NextResponse.json({ error: "Email and firstName are required" }, { status: 400 });
        }

        const data = await resend.emails.send({
            from: "simbisai <no-reply@simbisai.com>", // You must verify this domain in Resend
            to: [email],
            subject: "Selamat datang di simbisai! 🚀",
            react: WelcomeEmail({ firstName }) as React.ReactElement,
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
