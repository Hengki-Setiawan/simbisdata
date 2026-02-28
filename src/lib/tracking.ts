/**
 * Track file uploads to the database for analytics and history.
 * Call this after a successful file upload/parse.
 */
export async function trackUpload(data: {
    userId?: number;
    fileName: string;
    fileSize: number;
    rowCount: number;
    columnCount: number;
    platform?: string;
}) {
    try {
        await fetch("/api/activity-log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: data.userId,
                action: "file_upload",
                details: {
                    fileName: data.fileName,
                    fileSize: data.fileSize,
                    rowCount: data.rowCount,
                    columnCount: data.columnCount,
                    platform: data.platform || "unknown",
                },
            }),
        });
    } catch (e) {
        console.error("Failed to track upload:", e);
    }
}

/**
 * Track analysis sessions for usage metrics.
 */
export async function trackAnalysis(data: {
    userId?: number;
    algorithmCount: number;
    rowCount: number;
    duration: number;
}) {
    try {
        await fetch("/api/activity-log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: data.userId,
                action: "analysis_run",
                details: {
                    algorithmCount: data.algorithmCount,
                    rowCount: data.rowCount,
                    durationMs: data.duration,
                },
            }),
        });
    } catch (e) {
        console.error("Failed to track analysis:", e);
    }
}

/**
 * Track export actions.
 */
export async function trackExport(data: {
    userId?: number;
    format: string;
    rowCount: number;
}) {
    try {
        await fetch("/api/activity-log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: data.userId,
                action: "export",
                details: {
                    format: data.format,
                    rowCount: data.rowCount,
                },
            }),
        });
    } catch (e) {
        console.error("Failed to track export:", e);
    }
}
