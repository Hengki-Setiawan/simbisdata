import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const clientUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
const clientAuthToken = process.env.TURSO_AUTH_TOKEN || "";

export const client = createClient({
    url: clientUrl,
    authToken: clientAuthToken,
});

export const db = drizzle(client);
