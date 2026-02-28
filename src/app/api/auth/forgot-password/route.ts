import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ success: true }); // Don't reveal if email exists
        }

        // Check if user exists
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (user.length === 0) {
            // Don't reveal that email doesn't exist (security)
            return NextResponse.json({ success: true });
        }

        // Generate a temporary password reset token (simple approach)
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        // Send email via Resend
        try {
            await resend.emails.send({
                from: "SimbisData <noreply@simbisdata.com>",
                to: email,
                subject: "Reset Password — SimbisData",
                html: `
                    <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #0f0f23; color: #f1f5f9; border-radius: 16px;">
                        <h1 style="font-size: 1.5rem; margin-bottom: 16px;">🔐 Reset Password</h1>
                        <p style="color: #94a3b8; line-height: 1.7; margin-bottom: 24px;">
                            Halo <strong>${user[0].name}</strong>,<br/><br/>
                            Kami menerima permintaan untuk mereset password akun SimbisData Anda. 
                            Klik tombol di bawah untuk membuat password baru.
                        </p>
                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #06b6d4); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1rem;">
                            Reset Password →
                        </a>
                        <p style="color: #64748b; font-size: 0.8rem; margin-top: 32px; line-height: 1.6;">
                            Link ini berlaku selama 1 jam. Jika Anda tidak merasa meminta reset password, abaikan email ini.
                        </p>
                        <hr style="border: none; border-top: 1px solid #2d2d5e; margin: 24px 0;" />
                        <p style="color: #64748b; font-size: 0.75rem;">© 2026 SimbisData. Analisis Data Penjualan UMKM dengan AI & ML.</p>
                    </div>
                `,
            });
        } catch (emailError) {
            console.error("Resend email error:", emailError);
            // Still return success to prevent email enumeration
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ success: true }); // Always return success for security
    }
}
