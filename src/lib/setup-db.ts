import { db, client } from "@/lib/db";

export async function setupDatabase() {
    await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'free',
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

    await client.execute(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_url TEXT,
      total_rows INTEGER,
      total_columns INTEGER,
      created_at INTEGER
    )
  `);

    await client.execute(`
    CREATE TABLE IF NOT EXISTS analysis_results (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      file_id TEXT NOT NULL REFERENCES files(id),
      result_json TEXT NOT NULL,
      ai_narration TEXT,
      created_at INTEGER
    )
  `);

    await client.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      expires_at INTEGER NOT NULL
    )
  `);

    console.log("✅ Database tables created successfully");
}
