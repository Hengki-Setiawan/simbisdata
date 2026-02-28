import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// Users Table
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    password: text("password"),
    name: text("name").notNull(),
    role: text("role").notNull().default("user"), // 'admin' | 'user'
    planId: text("plan_id").notNull().default("free"), // 'free' | 'starter' | 'pro' | 'enterprise'
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at").notNull(), // Unix timestamp
});

// Subscriptions Table
export const subscriptions = sqliteTable("subscriptions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    planId: text("plan_id").notNull(),
    status: text("status").notNull().default("active"), // 'active' | 'expired' | 'cancelled'
    endDate: integer("end_date").notNull(), // Unix timestamp
    createdAt: integer("created_at").notNull(),
});

// Demo Tokens Table
export const demoTokens = sqliteTable("demo_tokens", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at").notNull(), // Unix timestamp
    isUsed: integer("is_used", { mode: "boolean" }).notNull().default(false),
    usedByEmail: text("used_by_email"),
    createdAt: integer("created_at").notNull(),
});

// API Usage Logs Table
export const apiLogs = sqliteTable("api_logs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id),
    action: text("action").notNull(), // e.g. 'generate_narration'
    tokensUsed: integer("tokens_used").notNull(),
    provider: text("provider").notNull(), // 'groq' | 'gemini'
    timestamp: integer("timestamp").notNull(),
});
