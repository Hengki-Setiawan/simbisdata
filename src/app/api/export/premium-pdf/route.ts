import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { html } = await req.json();

        if (!html) {
            return NextResponse.json({ error: "HTML content required" }, { status: 400 });
        }

        const apiKey = process.env.BROWSERLESS_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Browserless API Key not found" }, { status: 503 });
        }

        const response = await fetch(`https://chrome.browserless.io/pdf?token=${apiKey}`, {
            method: "POST",
            headers: {
                "Cache-Control": "no-cache",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                html: html,
                options: {
                    format: "A4",
                    printBackground: true,
                    margin: {
                        top: "20px",
                        bottom: "20px",
                        left: "20px",
                        right: "20px"
                    }
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Browserless error: ${response.status} ${errText}`);
        }

        const pdfBuffer = await response.arrayBuffer();

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=\"report.pdf\"",
            },
        });
    } catch (error: any) {
        console.error("PDF Export error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
