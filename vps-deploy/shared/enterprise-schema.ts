import { mysqlTable, varchar, text, int, timestamp, boolean, json, float } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Organizations for multi-tenant architecture
export const organizations = mysqlTable("organizations", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // school, university, corporate, government
  plan: varchar("plan", { length: 50 }).notNull(), // basic, professional, enterprise
  maxUsers: int("max_users").notNull().default(100),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

export const organizationMembers = mysqlTable("organization_members", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // admin, teacher, student, observer
  joinedAt: timestamp("joined_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean("is_active").notNull().default(true),
});

export const organizationSettings = mysqlTable("organization_settings", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id", { length: 36 }).notNull(),
  allowSelfRegistration: boolean("allow_self_registration").notNull().default(false),
  requireApproval: boolean("require_approval").notNull().default(true),
  customBranding: json("custom_branding"),
  ssoConfig: json("sso_config"),
  lmsIntegration: json("lms_integration"),
  features: json("features"),
  securitySettings: json("security_settings"),
});

export const organizationBilling = mysqlTable("organization_billing", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id", { length: 36 }).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(),
  billingCycle: varchar("billing_cycle", { length: 50 }).notNull(), // monthly, yearly
  amount: float("amount").notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("TRY"),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const organizationUsage = mysqlTable("organization_usage", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id", { length: 36 }).notNull(),
  date: timestamp("date").notNull(),
  metric: varchar("metric", { length: 100 }).notNull(), // users, quizzes, video_minutes, api_calls
  value: int("value").notNull(),
});

// Adaptive Learning Metrics
export const adaptiveLearningMetrics = mysqlTable("adaptive_learning_metrics", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  learningVelocity: float("learning_velocity").notNull(),
  optimalDifficulty: float("optimal_difficulty").notNull(),
  retentionRate: float("retention_rate").notNull(),
  strengths: json("strengths"),
  weaknesses: json("weaknesses"),
  preferredQuestionTypes: json("preferred_question_types"),
  motivationalFactors: json("motivational_factors"),
  lastAnalysisAt: timestamp("last_analysis_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Video Content System
export const videoLessons = mysqlTable("video_lessons", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  categoryId: varchar("category_id", { length: 36 }).notNull(),
  organizationId: varchar("organization_id", { length: 36 }),
  transcript: text("transcript"),
  topics: json("topics"),
  keyPoints: json("key_points"),
  difficulty: int("difficulty").notNull().default(5),
  duration: int("duration").notNull().default(0), // seconds
  interactiveElements: json("interactive_elements"),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean("is_active").notNull().default(true),
});

export const videoProgress = mysqlTable("video_progress", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  videoLessonId: varchar("video_lesson_id", { length: 36 }).notNull(),
  watchPercentage: float("watch_percentage").notNull().default(0),
  totalWatchTime: int("total_watch_time").notNull().default(0), // seconds
  engagementScore: float("engagement_score").notNull().default(0),
  interactionsCompleted: int("interactions_completed").notNull().default(0),
  quizScore: float("quiz_score"),
  lastWatchedAt: timestamp("last_watched_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  isCompleted: boolean("is_completed").notNull().default(false),
});

export const videoQuizzes = mysqlTable("video_quizzes", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  videoLessonId: varchar("video_lesson_id", { length: 36 }).notNull(),
  questionText: text("question_text").notNull(),
  questionType: varchar("question_type", { length: 50 }).notNull(),
  options: json("options"),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  timestamp: int("timestamp").notNull().default(0), // video timestamp in seconds
  points: int("points").notNull().default(10),
});

// Teacher Dashboard System
export const teacherClasses = mysqlTable("teacher_classes", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  teacherId: varchar("teacher_id", { length: 36 }).notNull(),
  organizationId: varchar("organization_id", { length: 36 }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  gradeLevel: text("grade_level").notNull(),
  maxStudents: int("max_students").notNull().default(30),
  currentStudents: int("current_students").notNull().default(0),
  classCode: varchar("class_code", { length: 50 }).unique(),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean("is_active").notNull().default(true),
});

export const assignments = mysqlTable("assignments", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  teacherId: varchar("teacher_id", { length: 36 }).notNull(),
  classId: varchar("class_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // quiz, video, practice, exam
  content: json("content").notNull(),
  dueDate: timestamp("due_date").notNull(),
  maxAttempts: int("max_attempts").notNull().default(1),
  passingScore: float("passing_score").notNull().default(70),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean("is_active").notNull().default(true),
});

export const studentAssignments = mysqlTable("student_assignments", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  assignmentId: varchar("assignment_id", { length: 36 }).notNull(),
  studentId: varchar("student_id", { length: 36 }).notNull(),
  attempts: int("attempts").notNull().default(0),
  bestScore: float("best_score"),
  lastAttemptAt: timestamp("last_attempt_at"),
  submittedAt: timestamp("submitted_at"),
  score: float("score"),
  feedback: json("feedback"),
  gradedAt: timestamp("graded_at"),
  isGraded: boolean("is_graded").notNull().default(false),
  isCompleted: boolean("is_completed").notNull().default(false),
});

// Advanced Analytics
export const analyticsEvents = mysqlTable("analytics_events", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }),
  organizationId: varchar("organization_id", { length: 36 }),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  eventCategory: varchar("event_category", { length: 100 }).notNull(),
  eventData: json("event_data"),
  sessionId: varchar("session_id", { length: 100 }),
  timestamp: timestamp("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 50 }),
});

export const performanceMetrics = mysqlTable("performance_metrics", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }),
  organizationId: varchar("organization_id", { length: 36 }),
  metricType: varchar("metric_type", { length: 100 }).notNull(), // learning_velocity, retention_rate, engagement_score
  value: float("value").notNull(),
  context: json("context"),
  measuredAt: timestamp("measured_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

// International Expansion
export const localizations = mysqlTable("localizations", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  language: varchar("language", { length: 10 }).notNull(),
  region: varchar("region", { length: 50 }),
  contentType: varchar("content_type", { length: 50 }).notNull(), // question, explanation, ui_text
  originalId: varchar("original_id", { length: 100 }).notNull(),
  translatedContent: json("translated_content").notNull(),
  translatorId: varchar("translator_id", { length: 36 }),
  reviewerId: varchar("reviewer_id", { length: 36 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const regionalExamSystems = mysqlTable("regional_exam_systems", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  country: varchar("country", { length: 50 }).notNull(),
  region: varchar("region", { length: 100 }),
  examType: varchar("exam_type", { length: 100 }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  structure: json("structure"),
  scoringSystem: json("scoring_system"),
  subjects: json("subjects"),
  isActive: boolean("is_active").notNull().default(true),
});

// Content Creation Tools
export const contentTemplates = mysqlTable("content_templates", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // quiz, lesson, assignment
  category: varchar("category", { length: 100 }).notNull(),
  template: json("template").notNull(),
  organizationId: varchar("organization_id", { length: 36 }),
  creatorId: varchar("creator_id", { length: 36 }).notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  usageCount: int("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const contentAssets = mysqlTable("content_assets", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: int("file_size").notNull(),
  storageUrl: text("storage_url").notNull(),
  organizationId: varchar("organization_id", { length: 36 }),
  uploadedBy: varchar("uploaded_by", { length: 36 }).notNull(),
  tags: json("tags"),
  metadata: json("metadata"),
  uploadedAt: timestamp("uploaded_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  isActive: boolean("is_active").notNull().default(true),
});

// Security and Compliance
export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id", { length: 36 }),
  userId: varchar("user_id", { length: 36 }),
  action: varchar("action", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  resourceId: varchar("resource_id", { length: 100 }),
  details: json("details"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").notNull().default(sql`CURRENT_TIMESTAMP`),
  severity: varchar("severity", { length: 50 }).notNull().default("info"), // info, warning, error, critical
});

export const complianceRecords = mysqlTable("compliance_records", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  organizationId: varchar("organization_id", { length: 36 }).notNull(),
  complianceType: varchar("compliance_type", { length: 50 }).notNull(), // gdpr, ccpa, ferpa
  dataSubject: varchar("data_subject", { length: 255 }),
  requestType: varchar("request_type", { length: 50 }), // access, deletion, portability
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, denied
  requestedAt: timestamp("requested_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp("completed_at"),
  details: json("details"),
});

// Create Zod schemas for validation
export const insertOrganizationSchema = createInsertSchema(organizations);
export const selectOrganizationSchema = createSelectSchema(organizations);
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = z.infer<typeof selectOrganizationSchema>;

export const insertVideoLessonSchema = createInsertSchema(videoLessons);
export const selectVideoLessonSchema = createSelectSchema(videoLessons);
export type InsertVideoLesson = z.infer<typeof insertVideoLessonSchema>;
export type VideoLesson = z.infer<typeof selectVideoLessonSchema>;

export const insertAssignmentSchema = createInsertSchema(assignments);
export const selectAssignmentSchema = createSelectSchema(assignments);
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = z.infer<typeof selectAssignmentSchema>;

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents);
export const selectAnalyticsEventSchema = createSelectSchema(analyticsEvents);
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = z.infer<typeof selectAnalyticsEventSchema>;
