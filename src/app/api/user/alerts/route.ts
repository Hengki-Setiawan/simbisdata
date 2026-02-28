import { NextResponse } from "next/server";
import { db } from "@/db";
import { analysisSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = parseInt(session.user.id);

        // Fetch user's recent analysis sessions
        const sessions = await db
            .select()
            .from(analysisSessions)
            .where(eq(analysisSessions.userId, userId))
            .orderBy(desc(analysisSessions.createdAt))
            .limit(10);

        const activeAlerts = [];

        for (const s of sessions) {
            if (s.status === 'completed' && s.totalRevenue && s.totalRevenue > 1000000) {
                activeAlerts.push({
                    id: `peak-${s.id}`,
                    type: "peak",
                    title: "Potensi Peak Season Terdeteksi",
                    desc: `Model ML kami mendeteksi revenue fantastis (Rp ${s.totalRevenue.toLocaleString('id-ID')}) pada dataset terakhir Anda. Waktu yang tepat untuk push campaign!`,
                    severity: "success",
                    time: new Date(s.createdAt * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                    read: false
                });
            } else if (s.status === 'completed' && s.totalOrders && s.totalOrders > 500) {
                activeAlerts.push({
                    id: `anomaly-${s.id}`,
                    type: "anomaly",
                    title: "Lonjakan Volume Pesanan",
                    desc: `Terdapat ${s.totalOrders} pesanan dalam analysis terakhir. Pastikan stok operasional Anda tercukupi.`,
                    severity: "warning",
                    time: new Date(s.createdAt * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                    read: false
                });
            } else if (s.status === 'failed') {
                activeAlerts.push({
                    id: `fail-${s.id}`,
                    type: "danger",
                    title: "Analisis Data Gagal",
                    desc: `Terjadi kesalahan saat memproses data Anda. Silakan coba unggah ualng.`,
                    severity: "danger",
                    time: new Date(s.createdAt * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                    read: false
                });
            }
        }

        return NextResponse.json({ alerts: activeAlerts });

    } catch (err: any) {
        console.error("Alerts API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
