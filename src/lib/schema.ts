import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    tier: text("tier").default("free").notNull(), // free, starter, pro, enterprise
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const files = sqliteTable("files", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    fileUrl: text("file_url"),
    totalRows: integer("total_rows"),
    totalColumns: integer("total_columns"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const analysisResults = sqliteTable("analysis_results", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id),
    fileId: text("file_id").notNull().references(() => files.id),
    resultJson: text("result_json").notNull(), // JSON stringified AnalysisResult
    aiNarration: text("ai_narration"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const sessions = sqliteTable("sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const subscriptionPlans = sqliteTable("subscription_plans", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(), // free, starter, pro, enterprise
    priceMonthly: integer("price_monthly").notNull().default(0),
    priceYearly: integer("price_yearly").notNull().default(0),
    features: text("features").notNull().default("{}"), // JSON feature limits
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const subscriptions = sqliteTable("subscriptions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id),
    planId: text("plan_id").notNull().references(() => subscriptionPlans.id),
    status: text("status").notNull().default("active"), // active, expired, cancelled
    startDate: integer("start_date", { mode: "timestamp" }).$defaultFn(() => new Date()),
    endDate: integer("end_date", { mode: "timestamp" }),
    paymentMethod: text("payment_method"),
    paymentReference: text("payment_reference"),
});

export const demoTokens = sqliteTable("demo_tokens", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    createdBy: text("created_by").notNull(), // admin user id
    usedBy: text("used_by"), // target user id
    token: text("token").notNull().unique(),
    tier: text("tier").notNull().default("pro"),
    durationDays: integer("duration_days").notNull().default(7),
    isUsed: integer("is_used", { mode: "boolean" }).notNull().default(false),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const adminUsers = sqliteTable("admin_users", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    password: text("password").notNull(),
    role: text("role").notNull().default("admin"), // superadmin, admin, support
    permissions: text("permissions").default("{}"), // JSON
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const activityLogs = sqliteTable("activity_logs", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id"),
    action: text("action").notNull(),
    metadata: text("metadata").default("{}"), // JSON
    ipAddress: text("ip_address"),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

