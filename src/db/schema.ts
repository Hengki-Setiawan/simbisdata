import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// ============================================
// SimbisData Schema — 8 Core Tables
// ============================================

// Users Table
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    password: text("password"),
    name: text("name").notNull(),
    preferredName: text("preferred_name"),
    role: text("role").notNull().default("user"),
    planId: text("plan_id").notNull().default("free"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at").notNull(),
});

// Uploaded Files Table
export const uploadedFiles = sqliteTable("uploaded_files", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    filename: text("filename").notNull(),
    fileSize: integer("file_size").notNull().default(0),
    rowCount: integer("row_count").notNull().default(0),
    platform: text("platform").default("unknown"),
    qualityScore: integer("quality_score").default(0),
    uploadedAt: integer("uploaded_at").notNull(),
});

// Analysis Sessions Table
export const analysisSessions = sqliteTable("analysis_sessions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    fileId: integer("file_id").references(() => uploadedFiles.id),
    status: text("status").notNull().default("processing"),
    totalRevenue: integer("total_revenue").default(0),
    totalOrders: integer("total_orders").default(0),
    aiConsultResult: text("ai_consult_result"),
    completedAt: integer("completed_at"),
    createdAt: integer("created_at").notNull(),
});

// AI Insight Cache — stores full PipelineResult JSON
export const aiInsightCache = sqliteTable("ai_insight_cache", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    dataHash: text("data_hash").notNull(),
    pipelineResult: text("pipeline_result").notNull(), // Full PipelineResult JSON
    version: integer("version").notNull().default(1),
    createdAt: integer("created_at").notNull(),
    expiresAt: integer("expires_at").notNull(),
});

// Activity Logs Table (Audit Trail)
export const activityLogs = sqliteTable("activity_logs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id),
    action: text("action").notNull(),
    details: text("details"),
    ipAddress: text("ip_address"),
    createdAt: integer("created_at").notNull(),
});

// === PLATFORM CMS & LANDING PAGE ===

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
