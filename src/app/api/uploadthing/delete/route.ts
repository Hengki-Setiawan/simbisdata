import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        
        if (!url) {
            return NextResponse.json({ error: "Missing file URL" }, { status: 400 });
        }

        // Extract key from URL
        // UploadThing URLs look like: https://utfs.io/f/xyz123.jpg
        const fileKey = url.split("/f/")[1];
        
        if (!fileKey) {
            return NextResponse.json({ error: "Invalid UploadThing URL format" }, { status: 400 });
        }

        // Delete from UploadThing
        const result = await utapi.deleteFiles(fileKey);

        if (!result.success) {
            throw new Error("UploadThing deletion failed");
        }

        return NextResponse.json({ success: true, message: "File deleted from cloud" });
    } catch (err: any) {
         console.error("UTApi delete error:", err);
         return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
