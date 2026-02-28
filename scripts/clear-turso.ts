import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function clearOldTables() {
    try {
        const tables = [
            "users",
            "demo_tokens",
            "subscriptions",
            "__drizzle_migrations"
        ];

        for (const table of tables) {
            console.log(`Dropping table ${table}...`);
            await client.execute(`DROP TABLE IF EXISTS ${table}`);
        }
        console.log("Cleanup complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

clearOldTables();
