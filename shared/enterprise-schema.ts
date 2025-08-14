import { pgTable, text, integer, timestamp, boolean, jsonb, uuid, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Organizations for multi-tenant architecture
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(), // school, university, corporate, government
  plan: text("plan").notNull(), // basic, professional, enterprise
  maxUsers: integer("max_users").notNull().default(100),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const organizationMembers = pgTable("organization_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  userId: text("user_id").notNull(),
  role: text("role").notNull(), // admin, teacher, student, observer
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const organizationSettings = pgTable("organization_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  allowSelfRegistration: boolean("allow_self_registration").notNull().default(false),
  requireApproval: boolean("require_approval").notNull().default(true),
  customBranding: jsonb("custom_branding"),
  ssoConfig: jsonb("sso_config"),
  lmsIntegration: jsonb("lms_integration"),
  features: jsonb("features"),
  securitySettings: jsonb("security_settings"),
});

export const organizationBilling = pgTable("organization_billing", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  plan: text("plan").notNull(),
  billingCycle: text("billing_cycle").notNull(), // monthly, yearly
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("TRY"),
  nextBillingDate: timestamp("next_billing_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const organizationUsage = pgTable("organization_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  date: timestamp("date").notNull(),
  metric: text("metric").notNull(), // users, quizzes, video_minutes, api_calls
  value: integer("value").notNull(),
});

// Adaptive Learning Metrics
export const adaptiveLearningMetrics = pgTable("adaptive_learning_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  learningVelocity: real("learning_velocity").notNull(),
  optimalDifficulty: real("optimal_difficulty").notNull(),
  retentionRate: real("retention_rate").notNull(),
  strengths: jsonb("strengths"),
  weaknesses: jsonb("weaknesses"),
  preferredQuestionTypes: jsonb("preferred_question_types"),
  motivationalFactors: jsonb("motivational_factors"),
  lastAnalysisAt: timestamp("last_analysis_at").notNull().defaultNow(),
});

// Video Content System
export const videoLessons = pgTable("video_lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  categoryId: text("category_id").notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  transcript: text("transcript"),
  topics: jsonb("topics"),
  keyPoints: jsonb("key_points"),
  difficulty: integer("difficulty").notNull().default(5),
  duration: integer("duration").notNull().default(0), // seconds
  interactiveElements: jsonb("interactive_elements"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const videoProgress = pgTable("video_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  videoLessonId: uuid("video_lesson_id").notNull().references(() => videoLessons.id),
  watchPercentage: real("watch_percentage").notNull().default(0),
  totalWatchTime: integer("total_watch_time").notNull().default(0), // seconds
  engagementScore: real("engagement_score").notNull().default(0),
  interactionsCompleted: integer("interactions_completed").notNull().default(0),
  quizScore: real("quiz_score"),
  lastWatchedAt: timestamp("last_watched_at").notNull().defaultNow(),
  isCompleted: boolean("is_completed").notNull().default(false),
});

export const videoQuizzes = pgTable("video_quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  videoLessonId: uuid("video_lesson_id").notNull().references(() => videoLessons.id),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull(),
  options: jsonb("options"),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  timestamp: integer("timestamp").notNull().default(0), // video timestamp in seconds
  points: integer("points").notNull().default(10),
});

// Teacher Dashboard System
export const teacherClasses = pgTable("teacher_classes", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: text("teacher_id").notNull(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  name: text("name").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  gradeLevel: text("grade_level").notNull(),
  maxStudents: integer("max_students").notNull().default(30),
  currentStudents: integer("current_students").notNull().default(0),
  classCode: text("class_code").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: text("teacher_id").notNull(),
  classId: uuid("class_id").notNull().references(() => teacherClasses.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // quiz, video, practice, exam
  content: jsonb("content").notNull(),
  dueDate: timestamp("due_date").notNull(),
  maxAttempts: integer("max_attempts").notNull().default(1),
  passingScore: real("passing_score").notNull().default(70),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const studentAssignments = pgTable("student_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id").notNull().references(() => assignments.id),
  studentId: text("student_id").notNull(),
  attempts: integer("attempts").notNull().default(0),
  bestScore: real("best_score"),
  lastAttemptAt: timestamp("last_attempt_at"),
  submittedAt: timestamp("submitted_at"),
  score: real("score"),
  feedback: jsonb("feedback"),
  gradedAt: timestamp("graded_at"),
  isGraded: boolean("is_graded").notNull().default(false),
  isCompleted: boolean("is_completed").notNull().default(false),
});

// Advanced Analytics
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  organizationId: uuid("organization_id").references(() => organizations.id),
  eventType: text("event_type").notNull(),
  eventCategory: text("event_category").notNull(),
  eventData: jsonb("event_data"),
  sessionId: text("session_id"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  organizationId: uuid("organization_id").references(() => organizations.id),
  metricType: text("metric_type").notNull(), // learning_velocity, retention_rate, engagement_score
  value: real("value").notNull(),
  context: jsonb("context"),
  measuredAt: timestamp("measured_at").notNull().defaultNow(),
});

// International Expansion
export const localizations = pgTable("localizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  language: text("language").notNull(),
  region: text("region"),
  contentType: text("content_type").notNull(), // question, explanation, ui_text
  originalId: text("original_id").notNull(),
  translatedContent: jsonb("translated_content").notNull(),
  translatorId: text("translator_id"),
  reviewerId: text("reviewer_id"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const regionalExamSystems = pgTable("regional_exam_systems", {
  id: uuid("id").primaryKey().defaultRandom(),
  country: text("country").notNull(),
  region: text("region"),
  examType: text("exam_type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  structure: jsonb("structure"),
  scoringSystem: jsonb("scoring_system"),
  subjects: jsonb("subjects"),
  isActive: boolean("is_active").notNull().default(true),
});

// Content Creation Tools
export const contentTemplates = pgTable("content_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(), // quiz, lesson, assignment
  category: text("category").notNull(),
  template: jsonb("template").notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  creatorId: text("creator_id").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contentAssets = pgTable("content_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  storageUrl: text("storage_url").notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  uploadedBy: text("uploaded_by").notNull(),
  tags: jsonb("tags"),
  metadata: jsonb("metadata"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

// Security and Compliance
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").references(() => organizations.id),
  userId: text("user_id"),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  severity: text("severity").notNull().default("info"), // info, warning, error, critical
});

export const complianceRecords = pgTable("compliance_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id),
  complianceType: text("compliance_type").notNull(), // gdpr, ccpa, ferpa
  dataSubject: text("data_subject"),
  requestType: text("request_type"), // access, deletion, portability
  status: text("status").notNull().default("pending"), // pending, processing, completed, denied
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  details: jsonb("details"),
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