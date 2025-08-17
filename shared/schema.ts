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
  questionType: text("question_type").notNull().default('multiple_choice'), // multiple_choice, fill_blank, visual, true_false
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull(), // Array of option objects
  correctAnswer: integer("correct_answer").notNull(), // Index of correct option
  explanation: text("explanation"),
  points: integer("points").notNull().default(10),
  topic: text("topic"),
  year: integer("year"),
  questionNumber: integer("question_number"),
  imageUrl: text("image_url"), // For visual questions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// SOCIAL LEARNING SYSTEM TABLES

// Friends System
export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").notNull(), // Who sent the friend request
  addresseeId: varchar("addressee_id").notNull(), // Who received the request
  status: text("status").notNull().default('pending'), // 'pending', 'accepted', 'blocked'
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

// Social Challenges (Friend vs Friend)
export const socialChallenges = pgTable("social_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengerId: varchar("challenger_id").notNull(),
  challengedId: varchar("challenged_id").notNull(),
  challengeType: text("challenge_type").notNull(), // 'quiz_duel', 'streak_battle', 'category_race'
  categoryId: varchar("category_id"),
  targetScore: integer("target_score"),
  duration: integer("duration").notNull().default(24), // hours
  status: text("status").notNull().default('pending'), // 'pending', 'active', 'completed', 'cancelled'
  challengerScore: integer("challenger_score").default(0),
  challengedScore: integer("challenged_score").default(0),
  winnerId: varchar("winner_id"),
  createdAt: timestamp("created_at").defaultNow(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  metadata: jsonb("metadata"), // Additional challenge data
});

// Study Groups/Clubs
export const studyGroups = pgTable("study_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").notNull(),
  categoryId: varchar("category_id"), // Main focus category
  type: text("type").notNull().default('public'), // 'public', 'private', 'school'
  maxMembers: integer("max_members").default(50),
  currentMembers: integer("current_members").default(1),
  weeklyGoal: integer("weekly_goal").default(500), // XP goal
  currentWeekXP: integer("current_week_xp").default(0),
  level: integer("level").default(1), // Group level based on collective achievement
  avatar: text("avatar"),
  banner: text("banner"),
  tags: jsonb("tags"), // Study topics, school name, etc.
  settings: jsonb("settings"), // Privacy, join requirements, etc.
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Study Group Memberships
export const studyGroupMembers = pgTable("study_group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull().default('member'), // 'owner', 'admin', 'member'
  weeklyXP: integer("weekly_xp").default(0),
  totalXP: integer("total_xp").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
});

// Weekly Leagues (Duolingo-style)
export const leagues = pgTable("leagues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // "Bronze", "Silver", "Gold", "Platinum", "Diamond"
  level: integer("level").notNull(), // 1-10 (Bronze=1, Diamond=10)
  minXP: integer("min_xp").notNull(), // Minimum XP to enter this league
  maxParticipants: integer("max_participants").default(30),
  weekPeriod: text("week_period").notNull(), // "2025-W05"
  promotionCount: integer("promotion_count").default(5), // Top 5 get promoted
  relegationCount: integer("relegation_count").default(5), // Bottom 5 get demoted
  isActive: boolean("is_active").notNull().default(true),
});

// League Participants
export const leagueParticipants = pgTable("league_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").notNull(),
  userId: varchar("user_id").notNull(),
  weekPeriod: text("week_period").notNull(),
  weeklyXP: integer("weekly_xp").default(0),
  currentRank: integer("current_rank").default(30),
  finalRank: integer("final_rank"), // Final position when week ends
  status: text("status").default('active'), // 'active', 'promoted', 'relegated', 'maintained'
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Community Forums
export const forumCategories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  examCategoryId: varchar("exam_category_id"), // Link to exam categories
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  order: integer("order").default(0),
  isActive: boolean("is_active").notNull().default(true),
  postCount: integer("post_count").default(0),
  lastPostAt: timestamp("last_post_at"),
});

// Forum Topics/Threads
export const forumTopics = pgTable("forum_topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  authorId: varchar("author_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").default('discussion'), // 'discussion', 'question', 'announcement', 'study_group'
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: integer("view_count").default(0),
  replyCount: integer("reply_count").default(0),
  likeCount: integer("like_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyById: varchar("last_reply_by_id"),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum Replies
export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").notNull(),
  authorId: varchar("author_id").notNull(),
  content: text("content").notNull(),
  parentReplyId: varchar("parent_reply_id"), // For nested replies
  likeCount: integer("like_count").default(0),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Social Activity Feed
export const socialActivities = pgTable("social_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  activityType: text("activity_type").notNull(), // 'achievement', 'quiz_complete', 'friend_challenge', 'group_join', 'streak_milestone'
  title: text("title").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"), // Additional activity data (scores, achievements, etc.)
  visibility: text("visibility").default('friends'), // 'public', 'friends', 'private'
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Social Activity Reactions
export const activityReactions = pgTable("activity_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  activityId: varchar("activity_id").notNull(),
  userId: varchar("user_id").notNull(),
  reactionType: text("reaction_type").notNull(), // 'like', 'celebrate', 'support', 'wow'
  createdAt: timestamp("created_at").defaultNow(),
});

// Direct Messages
export const directMessages = pgTable("direct_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(),
  receiverId: varchar("receiver_id").notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").default('text'), // 'text', 'image', 'challenge_invite', 'study_invite'
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  metadata: jsonb("metadata"), // For special message types
  createdAt: timestamp("created_at").defaultNow(),
});

// Study Sessions (for groups)
export const studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").notNull(),
  hostId: varchar("host_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").notNull(),
  sessionType: text("session_type").default('study'), // 'study', 'quiz_battle', 'discussion'
  maxParticipants: integer("max_participants").default(10),
  currentParticipants: integer("current_participants").default(0),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(60), // minutes
  status: text("status").default('scheduled'), // 'scheduled', 'active', 'completed', 'cancelled'
  meetingLink: text("meeting_link"), // For video calls
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Study Session Participants
export const studySessionParticipants = pgTable("study_session_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  userId: varchar("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
  participationScore: integer("participation_score").default(0),
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

// Education Tables
export const educationSubjects = pgTable("education_subjects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const educationCourses = pgTable("education_courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructor: text("instructor").notNull(),
  subjectId: text("subject_id").notNull().references(() => educationSubjects.id),
  duration: text("duration").notNull(),
  level: text("level").notNull(),
  rating: integer("rating").default(0), // Simplified to integer for compatibility
  totalStudents: integer("total_students").default(0),
  featured: boolean("featured").default(false),
  price: integer("price").default(0),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const educationMaterials = pgTable("education_materials", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  subjectId: text("subject_id").notNull().references(() => educationSubjects.id),
  fileUrl: text("file_url").notNull(),
  fileSize: text("file_size").notNull(),
  downloads: integer("downloads").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const educationLearningPaths = pgTable("education_learning_paths", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  totalCourses: integer("total_courses").notNull(),
  difficulty: text("difficulty").notNull(),
  completionRate: integer("completion_rate").default(0),
  subjects: jsonb("subjects").$type<string[]>().notNull(),
  courseIds: jsonb("course_ids").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const userCourseEnrollments = pgTable("user_course_enrollments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  courseId: text("course_id").notNull().references(() => educationCourses.id),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  progress: integer("progress").default(0),
  status: text("status").notNull().default('active'),
  lastAccessedAt: timestamp("last_accessed_at"),
  completedAt: timestamp("completed_at"),
  rating: integer("rating"),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const educationProgress = pgTable("education_progress", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  subjectId: text("subject_id").notNull().references(() => educationSubjects.id),
  totalLessonsCompleted: integer("total_lessons_completed").default(0),
  totalStudyTime: integer("total_study_time").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  masteryLevel: text("mastery_level").default('beginner'),
  lastStudyDate: timestamp("last_study_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Import and re-export subscription tables
import { subscriptionPlans, subscriptions, payments, referrals } from './subscription-tables';
export { subscriptionPlans, subscriptions, payments, referrals };

// Re-export subscription types and schemas
export * from './subscription-schema';

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

// Social Learning Types
export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;

export type SocialChallenge = typeof socialChallenges.$inferSelect;
export type InsertSocialChallenge = typeof socialChallenges.$inferInsert;

export type StudyGroup = typeof studyGroups.$inferSelect;
export type InsertStudyGroup = typeof studyGroups.$inferInsert;

export type StudyGroupMember = typeof studyGroupMembers.$inferSelect;
export type InsertStudyGroupMember = typeof studyGroupMembers.$inferInsert;

export type League = typeof leagues.$inferSelect;
export type InsertLeague = typeof leagues.$inferInsert;

export type LeagueParticipant = typeof leagueParticipants.$inferSelect;
export type InsertLeagueParticipant = typeof leagueParticipants.$inferInsert;

export type ForumCategory = typeof forumCategories.$inferSelect;
export type ForumTopic = typeof forumTopics.$inferSelect;
export type ForumReply = typeof forumReplies.$inferSelect;

export type SocialActivity = typeof socialActivities.$inferSelect;
export type ActivityReaction = typeof activityReactions.$inferSelect;

export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = typeof directMessages.$inferInsert;

export type StudySession = typeof studySessions.$inferSelect;
export type StudySessionParticipant = typeof studySessionParticipants.$inferSelect;
