import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "./schema";

// Initialize the Turso client using environment variables
const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Create the Drizzle instance with the defined schema
export const db = drizzle(client, { schema });
