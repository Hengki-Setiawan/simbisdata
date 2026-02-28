import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// Users Table
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    password: text("password"),
    name: text("name").notNull(),
    role: text("role").notNull().default("user"),
    planId: text("plan_id").notNull().default("free"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at").notNull(),
});

// Subscriptions Table
export const subscriptions = sqliteTable("subscriptions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    planId: text("plan_id").notNull(),
    status: text("status").notNull().default("active"),
    endDate: integer("end_date").notNull(),
    createdAt: integer("created_at").notNull(),
});

// Demo Tokens Table
export const demoTokens = sqliteTable("demo_tokens", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at").notNull(),
    isUsed: integer("is_used", { mode: "boolean" }).notNull().default(false),
    usedByEmail: text("used_by_email"),
    createdAt: integer("created_at").notNull(),
});

// API Usage Logs Table
export const apiLogs = sqliteTable("api_logs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id),
    action: text("action").notNull(),
    tokensUsed: integer("tokens_used").notNull(),
    provider: text("provider").notNull(),
    timestamp: integer("timestamp").notNull(),
});

// === NEW TABLES ===

// Uploaded Files Table
export const uploadedFiles = sqliteTable("uploaded_files", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    filename: text("filename").notNull(),
    fileSize: integer("file_size").notNull().default(0),
    rowCount: integer("row_count").notNull().default(0),
    platform: text("platform").default("unknown"), // shopee, tokopedia, etc
    qualityScore: integer("quality_score").default(0),
    uploadedAt: integer("uploaded_at").notNull(),
});

// Analysis Sessions Table
export const analysisSessions = sqliteTable("analysis_sessions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    fileId: integer("file_id").references(() => uploadedFiles.id),
    status: text("status").notNull().default("processing"), // processing, completed, failed
    totalRevenue: integer("total_revenue").default(0),
    totalOrders: integer("total_orders").default(0),
    completedAt: integer("completed_at"),
    createdAt: integer("created_at").notNull(),
});

// Announcements Table (Admin)
export const announcements = sqliteTable("announcements", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    type: text("type").notNull().default("info"), // info, warning, promo
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    startDate: integer("start_date"),
    endDate: integer("end_date"),
    createdAt: integer("created_at").notNull(),
});

// Support Tickets Table
export const supportTickets = sqliteTable("support_tickets", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("open"), // open, in_progress, resolved
    priority: text("priority").notNull().default("medium"), // low, medium, high
    adminReply: text("admin_reply"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at"),
});

// Activity Logs Table (Audit Trail)
export const activityLogs = sqliteTable("activity_logs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id),
    action: text("action").notNull(), // login, upload, analyze, export, etc
    details: text("details"), // JSON string with extra info
    ipAddress: text("ip_address"),
    createdAt: integer("created_at").notNull(),
});

// Payment Transactions Table
export const paymentTransactions = sqliteTable("payment_transactions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    orderId: text("order_id").notNull().unique(),
    planId: text("plan_id").notNull(),
    amount: integer("amount").notNull(),
    status: text("status").notNull().default("pending"), // pending, paid, failed, expired
    provider: text("provider").notNull().default("duitku"), // duitku, midtrans
    paidAt: integer("paid_at"),
    createdAt: integer("created_at").notNull(),
});
