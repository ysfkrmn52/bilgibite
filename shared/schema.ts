import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firebaseUid: text("firebase_uid").unique(),
  level: integer("level").notNull().default(1),
  totalPoints: integer("total_points").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  lastActiveDate: timestamp("last_active_date"),
  gems: integer("gems").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  lives: integer("lives").notNull().default(5),
  maxLives: integer("max_lives").notNull().default(5),
  livesLastRefilled: timestamp("lives_last_refilled").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const examCategories = pgTable("exam_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examCategoryId: varchar("exam_category_id").notNull(),
  subject: text("subject").notNull(),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull(), // Array of option objects
  correctAnswer: integer("correct_answer").notNull(), // Index of correct option
  explanation: text("explanation"),
  points: integer("points").notNull().default(10),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  examCategoryId: varchar("exam_category_id").notNull(),
  questionsAnswered: integer("questions_answered").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  studyTimeMinutes: integer("study_time_minutes").notNull().default(0),
  lastStudyDate: timestamp("last_study_date"),
});

export const quizSessions = pgTable("quiz_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  examCategoryId: varchar("exam_category_id").notNull(),
  questionsAnswered: integer("questions_answered").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  totalQuestions: integer("total_questions").notNull(),
  pointsEarned: integer("points_earned").notNull().default(0),
  timeSpent: integer("time_spent").notNull().default(0), // in seconds
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Generated Questions - otomatik soru eklemek için
export const aiGeneratedQuestions = pgTable("ai_generated_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  examCategoryId: varchar("exam_category_id").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull(), // AI ürettiği seçenekler
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty").notNull().default('intermediate'),
  topic: text("topic"),
  isApproved: boolean("is_approved").notNull().default(false), // Manuel onay için
  isAddedToMainPool: boolean("is_added_to_main_pool").notNull().default(false),
  generatedAt: timestamp("generated_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"),
});

// AI Study Plans - çalışma planlarını saklama
export const aiStudyPlans = pgTable("ai_study_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  planData: jsonb("plan_data").notNull(), // Tüm plan detayları
  userGoals: jsonb("user_goals").notNull(),
  availableTime: integer("available_time").notNull(),
  currentLevel: integer("current_level").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastAccessed: timestamp("last_accessed").defaultNow(),
});

// AI Chat Sessions - sohbet geçmişini tutma
export const aiChatSessions = pgTable("ai_chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sessionData: jsonb("session_data").notNull(), // Mesajlar array
  currentTopic: text("current_topic"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  requirement: jsonb("requirement").notNull(), // Requirement criteria
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  achievementId: varchar("achievement_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Daily Challenges Table
export const dailyChallenges = pgTable("daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "quiz_questions", "streak_maintain", "category_master", etc.
  requirement: jsonb("requirement").notNull(), // Requirements to complete
  rewards: jsonb("rewards").notNull(), // XP, gems, lives rewards
  validDate: timestamp("valid_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// User Daily Challenge Progress
export const userDailyChallenges = pgTable("user_daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  challengeId: varchar("challenge_id").notNull(),
  progress: integer("progress").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  claimedAt: timestamp("claimed_at"),
});

// Store Items Table
export const storeItems = pgTable("store_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "life_refill", "streak_freeze", "xp_boost", "theme"
  cost: integer("cost").notNull(),
  icon: text("icon").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"), // Additional item properties
});

// User Store Purchases
export const userStorePurchases = pgTable("user_store_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  itemId: varchar("item_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  totalCost: integer("total_cost").notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

// User Inventory (for items that stack or have quantities)
export const userInventory = pgTable("user_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  itemId: varchar("item_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Leaderboard Entries
export const leaderboard = pgTable("leaderboard", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // "weekly", "monthly", "all_time"
  period: text("period").notNull(), // "2025-W05", "2025-01", "all_time"
  xp: integer("xp").notNull().default(0),
  rank: integer("rank").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({
  id: true,
});

export const insertStoreItemSchema = createInsertSchema(storeItems).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ExamCategory = typeof examCategories.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type QuizSession = typeof quizSessions.$inferSelect;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type Achievement = typeof achievements.$inferSelect;

// AI Tables Types
export type InsertAIGeneratedQuestion = typeof aiGeneratedQuestions.$inferInsert;
export type AIGeneratedQuestion = typeof aiGeneratedQuestions.$inferSelect;

export type InsertAIStudyPlan = typeof aiStudyPlans.$inferInsert;
export type AIStudyPlan = typeof aiStudyPlans.$inferSelect;

export type InsertAIChatSession = typeof aiChatSessions.$inferInsert;
export type AIChatSession = typeof aiChatSessions.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type UserDailyChallenge = typeof userDailyChallenges.$inferSelect;
export type StoreItem = typeof storeItems.$inferSelect;
export type UserStorePurchase = typeof userStorePurchases.$inferSelect;
export type UserInventory = typeof userInventory.$inferSelect;
export type Leaderboard = typeof leaderboard.$inferSelect;
