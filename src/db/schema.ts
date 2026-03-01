import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// Users Table
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    password: text("password"),
    name: text("name").notNull(),
    preferredName: text("preferred_name"), // sapaan AI: "Budi", "Kak Ani"
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
    aiConsultResult: text("ai_consult_result"), // JSON string ConsultantResult
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

// === PLATFORM CMS & LANDING PAGE TABLES ===

export const platformSettings = sqliteTable("platform_settings", {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
    description: text("description"),
    updatedAt: integer("updated_at").notNull(),
});

export const landingHero = sqliteTable("landing_hero", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    gradientText: text("gradient_text").notNull(),
    description: text("description").notNull(),
    primaryCtaText: text("primary_cta_text").notNull(),
    secondaryCtaText: text("secondary_cta_text").notNull(),
    updatedAt: integer("updated_at").notNull(),
});

export const landingFeatures = sqliteTable("landing_features", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    icon: text("icon").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const landingTestimonials = sqliteTable("landing_testimonials", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    role: text("role").notNull(),
    company: text("company").notNull(),
    content: text("content").notNull(),
    rating: integer("rating").notNull().default(5),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const landingFaqs = sqliteTable("landing_faqs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

// === SimbisData: AI Insight Cache ===
export const aiInsightCache = sqliteTable("ai_insight_cache", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    dataHash: text("data_hash").notNull(),
    consultResult: text("consult_result").notNull(), // JSON ConsultantResult
    createdAt: integer("created_at").notNull(),
    expiresAt: integer("expires_at").notNull(),
});
