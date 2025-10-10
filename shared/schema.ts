import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, int, boolean, timestamp, json, decimal, index } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  firebaseUid: text("firebase_uid").unique(),
  role: text("role").notNull().default('user'), // 'user', 'admin', 'super_admin'
  subscriptionType: text("subscription_type").notNull().default('free'), // 'free', 'premium', 'enterprise'
  hasAiPackage: boolean("has_ai_package").notNull().default(false),
  level: int("level").notNull().default(1),
  totalPoints: int("total_points").notNull().default(0),
  streakDays: int("streak_days").notNull().default(0),
  lastActiveDate: timestamp("last_active_date"),
  gems: int("gems").notNull().default(0),
  xp: int("xp").notNull().default(0),
  lives: int("lives").notNull().default(5),
  maxLives: int("max_lives").notNull().default(5),
  livesLastRefilled: timestamp("lives_last_refilled").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const examCategories = mysqlTable("exam_categories", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const questions = mysqlTable("questions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  examCategoryId: varchar("exam_category_id", { length: 36 }).notNull(),
  subject: text("subject").notNull(),
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  questionType: text("question_type").notNull().default('multiple_choice'), // multiple_choice, fill_blank, visual, true_false
  questionText: text("question_text").notNull(),
  options: json("options").notNull(), // Array of option objects
  correctAnswer: int("correct_answer").notNull(), // Index of correct option
  explanation: text("explanation"),
  points: int("points").notNull().default(10),
  topic: text("topic"),
  year: int("year"),
  questionNumber: int("question_number"),
  imageUrl: text("image_url"), // For visual questions
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

export const userProgress = mysqlTable("user_progress", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  examCategoryId: varchar("exam_category_id", { length: 36 }).notNull(),
  questionsAnswered: int("questions_answered").notNull().default(0),
  correctAnswers: int("correct_answers").notNull().default(0),
  totalPoints: int("total_points").notNull().default(0),
  studyTimeMinutes: int("study_time_minutes").notNull().default(0),
  lastStudyDate: timestamp("last_study_date"),
});

export const quizSessions = mysqlTable("quiz_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  examCategoryId: varchar("exam_category_id", { length: 36 }).notNull(),
  questionsAnswered: int("questions_answered").notNull().default(0),
  correctAnswers: int("correct_answers").notNull().default(0),
  totalQuestions: int("total_questions").notNull(),
  pointsEarned: int("points_earned").notNull().default(0),
  timeSpent: int("time_spent").notNull().default(0), // in seconds
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// AI Generated Questions - otomatik soru eklemek için
export const aiGeneratedQuestions = mysqlTable("ai_generated_questions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  examCategoryId: varchar("exam_category_id", { length: 36 }).notNull(),
  questionText: text("question_text").notNull(),
  options: json("options").notNull(), // AI ürettiği seçenekler
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty").notNull().default('intermediate'),
  topic: text("topic"),
  isApproved: boolean("is_approved").notNull().default(false), // Manuel onay için
  isAddedToMainPool: boolean("is_added_to_main_pool").notNull().default(false),
  generatedAt: timestamp("generated_at").default(sql`CURRENT_TIMESTAMP`),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by", { length: 36 }),
});

// AI Study Plans - çalışma planlarını saklama
export const aiStudyPlans = mysqlTable("ai_study_plans", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  planData: json("plan_data").notNull(), // Tüm plan detayları
  userGoals: json("user_goals").notNull(),
  availableTime: int("available_time").notNull(),
  currentLevel: int("current_level").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  lastAccessed: timestamp("last_accessed").default(sql`CURRENT_TIMESTAMP`),
});

// AI Chat Sessions - sohbet geçmişini tutma
export const aiChatSessions = mysqlTable("ai_chat_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  sessionData: json("session_data").notNull(), // Mesajlar array
  currentTopic: text("current_topic"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  lastMessageAt: timestamp("last_message_at").default(sql`CURRENT_TIMESTAMP`),
});

export const achievements = mysqlTable("achievements", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  requirement: json("requirement").notNull(), // Requirement criteria
});

export const userAchievements = mysqlTable("user_achievements", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  achievementId: varchar("achievement_id", { length: 36 }).notNull(),
  earnedAt: timestamp("earned_at").default(sql`CURRENT_TIMESTAMP`),
});

// PDF Eğitim Materyalleri
export const pdfMaterials = mysqlTable("pdf_materials", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // TYT, AYT, KPSS, vs.
  subject: text("subject").notNull(), // Matematik, Türkçe, vs.
  difficulty: text("difficulty").notNull().default('medium'), // easy, medium, hard
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: int("file_size").notNull(), // bytes
  uploadedBy: varchar("uploaded_by", { length: 36 }).notNull(),
  tags: json("tags").default([]), // Array of tags
  isActive: boolean("is_active").notNull().default(true),
  downloadCount: int("download_count").notNull().default(0),
  viewCount: int("view_count").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

// PDF Konuları - Her PDF'deki konuları kaydetmek için
export const pdfTopics = mysqlTable("pdf_topics", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  pdfId: varchar("pdf_id", { length: 36 }).notNull(),
  topicTitle: text("topic_title").notNull(),
  topicNumber: int("topic_number").notNull(), // Konu sırası
  startPage: int("start_page").notNull(),
  endPage: int("end_page").notNull(),
  description: text("description"),
  keywords: json("keywords").default([]), // Anahtar kelimeler
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// PDF Klasör Sistemi
export const pdfFolders = mysqlTable("pdf_folders", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  parentId: varchar("parent_id", { length: 36 }), // Self-referencing for nested folders
  category: text("category").notNull(), // TYT, AYT, KPSS
  subject: text("subject"), // Matematik, Türkçe, vs.
  icon: text("icon").default('folder'),
  color: text("color").default('#3B82F6'),
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Daily Challenges Table
export const dailyChallenges = mysqlTable("daily_challenges", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "quiz_questions", "streak_maintain", "category_master", etc.
  requirement: json("requirement").notNull(), // Requirements to complete
  rewards: json("rewards").notNull(), // XP, gems, lives rewards
  validDate: timestamp("valid_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// User Daily Challenge Progress
export const userDailyChallenges = mysqlTable("user_daily_challenges", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  challengeId: varchar("challenge_id", { length: 36 }).notNull(),
  progress: int("progress").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  claimedAt: timestamp("claimed_at"),
});

// Store Items Table
export const storeItems = mysqlTable("store_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "life_refill", "streak_freeze", "xp_boost", "theme", "ai_credits"
  cost: int("cost").notNull(),
  icon: text("icon").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  metadata: json("metadata"), // Additional item properties
});

// User Store Purchases
export const userStorePurchases = mysqlTable("user_store_purchases", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  itemId: varchar("item_id", { length: 36 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  totalCost: int("total_cost").notNull(),
  purchasedAt: timestamp("purchased_at").default(sql`CURRENT_TIMESTAMP`),
});

// User Inventory (for items that stack or have quantities)
export const userInventory = mysqlTable("user_inventory", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  itemId: varchar("item_id", { length: 36 }).notNull(),
  quantity: int("quantity").notNull().default(0),
  lastUpdated: timestamp("last_updated").default(sql`CURRENT_TIMESTAMP`),
});

// Leaderboard Entries
export const leaderboard = mysqlTable("leaderboard", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  type: text("type").notNull(), // "weekly", "monthly", "all_time"
  period: text("period").notNull(), // "2025-W05", "2025-01", "all_time"
  xp: int("xp").notNull().default(0),
  rank: int("rank").notNull().default(0),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

// SOCIAL LEARNING SYSTEM TABLES

// Friends System
export const friendships = mysqlTable("friendships", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  requesterId: varchar("requester_id", { length: 36 }).notNull(), // Who sent the friend request
  addresseeId: varchar("addressee_id", { length: 36 }).notNull(), // Who received the request
  status: text("status").notNull().default('pending'), // 'pending', 'accepted', 'blocked'
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  acceptedAt: timestamp("accepted_at"),
});

// Social Challenges (Friend vs Friend)
export const socialChallenges = mysqlTable("social_challenges", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  challengerId: varchar("challenger_id", { length: 36 }).notNull(),
  challengedId: varchar("challenged_id", { length: 36 }).notNull(),
  challengeType: text("challenge_type").notNull(), // 'quiz_duel', 'streak_battle', 'category_race'
  categoryId: varchar("category_id", { length: 36 }),
  targetScore: int("target_score"),
  duration: int("duration").notNull().default(24), // hours
  status: text("status").notNull().default('pending'), // 'pending', 'active', 'completed', 'cancelled'
  challengerScore: int("challenger_score").default(0),
  challengedScore: int("challenged_score").default(0),
  winnerId: varchar("winner_id", { length: 36 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  metadata: json("metadata"), // Additional challenge data
});

// Study Groups/Clubs
export const studyGroups = mysqlTable("study_groups", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id", { length: 36 }).notNull(),
  categoryId: varchar("category_id", { length: 36 }), // Main focus category
  type: text("type").notNull().default('public'), // 'public', 'private', 'school'
  maxMembers: int("max_members").default(50),
  currentMembers: int("current_members").default(1),
  weeklyGoal: int("weekly_goal").default(500), // XP goal
  currentWeekXP: int("current_week_xp").default(0),
  level: int("level").default(1), // Group level based on collective achievement
  avatar: text("avatar"),
  banner: text("banner"),
  tags: json("tags"), // Study topics, school name, etc.
  settings: json("settings"), // Privacy, join requirements, etc.
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Study Group Memberships
export const studyGroupMembers = mysqlTable("study_group_members", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId: varchar("group_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  role: text("role").notNull().default('member'), // 'owner', 'admin', 'member'
  weeklyXP: int("weekly_xp").default(0),
  totalXP: int("total_xp").default(0),
  joinedAt: timestamp("joined_at").default(sql`CURRENT_TIMESTAMP`),
  lastActive: timestamp("last_active").default(sql`CURRENT_TIMESTAMP`),
});

// Weekly Leagues (Duolingo-style)
export const leagues = mysqlTable("leagues", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(), // "Bronze", "Silver", "Gold", "Platinum", "Diamond"
  level: int("level").notNull(), // 1-10 (Bronze=1, Diamond=10)
  minXP: int("min_xp").notNull(), // Minimum XP to enter this league
  maxParticipants: int("max_participants").default(30),
  weekPeriod: text("week_period").notNull(), // "2025-W05"
  promotionCount: int("promotion_count").default(5), // Top 5 get promoted
  relegationCount: int("relegation_count").default(5), // Bottom 5 get demoted
  isActive: boolean("is_active").notNull().default(true),
});

// League Participants
export const leagueParticipants = mysqlTable("league_participants", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  leagueId: varchar("league_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  weekPeriod: text("week_period").notNull(),
  weeklyXP: int("weekly_xp").default(0),
  currentRank: int("current_rank").default(30),
  finalRank: int("final_rank"), // Final position when week ends
  status: text("status").default('active'), // 'active', 'promoted', 'relegated', 'maintained'
  joinedAt: timestamp("joined_at").default(sql`CURRENT_TIMESTAMP`),
});

// Community Forums
export const forumCategories = mysqlTable("forum_categories", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  examCategoryId: varchar("exam_category_id", { length: 36 }), // Link to exam categories
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  order: int("order").default(0),
  isActive: boolean("is_active").notNull().default(true),
  postCount: int("post_count").default(0),
  lastPostAt: timestamp("last_post_at"),
});

// Forum Topics/Threads
export const forumTopics = mysqlTable("forum_topics", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: varchar("category_id", { length: 36 }).notNull(),
  authorId: varchar("author_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").default('discussion'), // 'discussion', 'question', 'announcement', 'study_group'
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: int("view_count").default(0),
  replyCount: int("reply_count").default(0),
  likeCount: int("like_count").default(0),
  lastReplyAt: timestamp("last_reply_at"),
  lastReplyById: varchar("last_reply_by_id", { length: 36 }),
  tags: json("tags"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

// Forum Replies
export const forumReplies = mysqlTable("forum_replies", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  topicId: varchar("topic_id", { length: 36 }).notNull(),
  authorId: varchar("author_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  parentReplyId: varchar("parent_reply_id", { length: 36 }), // For nested replies
  likeCount: int("like_count").default(0),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Social Activity Feed
export const socialActivities = mysqlTable("social_activities", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  activityType: text("activity_type").notNull(), // 'achievement', 'quiz_complete', 'friend_challenge', 'group_join', 'streak_milestone'
  title: text("title").notNull(),
  description: text("description"),
  metadata: json("metadata"), // Additional activity data (scores, achievements, etc.)
  visibility: text("visibility").default('friends'), // 'public', 'friends', 'private'
  likeCount: int("like_count").default(0),
  commentCount: int("comment_count").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Social Activity Reactions
export const activityReactions = mysqlTable("activity_reactions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  activityId: varchar("activity_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  reactionType: text("reaction_type").notNull(), // 'like', 'celebrate', 'support', 'wow'
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Direct Messages
export const directMessages = mysqlTable("direct_messages", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  senderId: varchar("sender_id", { length: 36 }).notNull(),
  receiverId: varchar("receiver_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").default('text'), // 'text', 'image', 'challenge_invite', 'study_invite'
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  metadata: json("metadata"), // For special message types
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Group Conversations
export const groupConversations = mysqlTable("group_conversations", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  conversationType: text("conversation_type").default('group'), // 'group', 'study_group', 'challenge_group'
  isActive: boolean("is_active").default(true),
  lastMessageAt: timestamp("last_message_at"),
  participantCount: int("participant_count").default(0),
  metadata: json("metadata"), // Additional group data
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Group Messages
export const groupMessages = mysqlTable("group_messages", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: varchar("conversation_id", { length: 36 }).notNull(),
  senderId: varchar("sender_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").default('text'), // 'text', 'image', 'file', 'system'
  metadata: json("metadata"), // For special message types or file info
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Group Conversation Participants
export const groupParticipants = mysqlTable("group_participants", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: varchar("conversation_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  role: text("role").default('member'), // 'admin', 'member'
  joinedAt: timestamp("joined_at").default(sql`CURRENT_TIMESTAMP`),
  lastReadAt: timestamp("last_read_at"),
  isActive: boolean("is_active").default(true),
  leftAt: timestamp("left_at"),
});

// Study Sessions (for groups)
export const studySessions = mysqlTable("study_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId: varchar("group_id", { length: 36 }).notNull(),
  hostId: varchar("host_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: varchar("category_id", { length: 36 }).notNull(),
  sessionType: text("session_type").default('study'), // 'study', 'quiz_battle', 'discussion'
  maxParticipants: int("max_participants").default(10),
  currentParticipants: int("current_participants").default(0),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: int("duration").default(60), // minutes
  status: text("status").default('scheduled'), // 'scheduled', 'active', 'completed', 'cancelled'
  meetingLink: text("meeting_link"), // For video calls
  metadata: json("metadata"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Study Session Participants
export const studySessionParticipants = mysqlTable("study_session_participants", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: varchar("session_id", { length: 36 }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  joinedAt: timestamp("joined_at").default(sql`CURRENT_TIMESTAMP`),
  leftAt: timestamp("left_at"),
  participationScore: int("participation_score").default(0),
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

export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({
  id: true,
  createdAt: true,
});

export const insertGroupConversationSchema = createInsertSchema(groupConversations).omit({
  id: true,
  createdAt: true,
});

export const insertGroupMessageSchema = createInsertSchema(groupMessages).omit({
  id: true,
  createdAt: true,
});

export const insertGroupParticipantSchema = createInsertSchema(groupParticipants).omit({
  id: true,
  joinedAt: true,
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
export const educationSubjects = mysqlTable("education_subjects", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

export const educationCourses = mysqlTable("education_courses", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructor: text("instructor").notNull(),
  subjectId: varchar("subject_id", { length: 36 }).notNull(),
  duration: text("duration").notNull(),
  level: text("level").notNull(),
  rating: int("rating").default(0), // Simplified to integer for compatibility
  totalStudents: int("total_students").default(0),
  featured: boolean("featured").default(false),
  price: int("price").default(0),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

// Course Chapters/Lessons Table
export const courseChapters = mysqlTable("course_chapters", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: varchar("course_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: int("order_index").notNull(),
  duration: text("duration").notNull(),
  videoUrl: text("video_url"),
  content: text("content").notNull(), // Rich text content or markdown
  exercises: json("exercises").$type<any[]>().default([]),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

export const educationMaterials = mysqlTable("education_materials", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  subjectId: varchar("subject_id", { length: 36 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: text("file_size").notNull(),
  downloads: int("downloads").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

export const educationLearningPaths = mysqlTable("education_learning_paths", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  totalCourses: int("total_courses").notNull(),
  difficulty: text("difficulty").notNull(),
  completionRate: int("completion_rate").default(0),
  subjects: json("subjects").$type<string[]>().notNull(),
  courseIds: json("course_ids").$type<string[]>().default([]),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

export const userCourseEnrollments = mysqlTable("user_course_enrollments", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  courseId: varchar("course_id", { length: 36 }).notNull(),
  enrolledAt: timestamp("enrolled_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  progress: int("progress").default(0),
  status: text("status").notNull().default('active'),
  lastAccessedAt: timestamp("last_accessed_at"),
  completedAt: timestamp("completed_at"),
  rating: int("rating"),
  review: text("review"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

export const educationProgress = mysqlTable("education_progress", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  subjectId: varchar("subject_id", { length: 36 }).notNull(),
  totalLessonsCompleted: int("total_lessons_completed").default(0),
  totalStudyTime: int("total_study_time").default(0),
  currentStreak: int("current_streak").default(0),
  longestStreak: int("longest_streak").default(0),
  masteryLevel: text("mastery_level").default('beginner'),
  lastStudyDate: timestamp("last_study_date"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

// Import and re-export subscription tables
import { subscriptionPlans, subscriptions, payments, referrals, subscriptionUsage, studentVerifications, familyMembers } from './subscription-tables';
export { subscriptionPlans, subscriptions, payments, referrals, subscriptionUsage, studentVerifications, familyMembers };

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
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;

export type GroupConversation = typeof groupConversations.$inferSelect;
export type InsertGroupConversation = z.infer<typeof insertGroupConversationSchema>;

export type GroupMessage = typeof groupMessages.$inferSelect;
export type InsertGroupMessage = z.infer<typeof insertGroupMessageSchema>;

export type GroupParticipant = typeof groupParticipants.$inferSelect;
export type InsertGroupParticipant = z.infer<typeof insertGroupParticipantSchema>;

export type StudySession = typeof studySessions.$inferSelect;
export type StudySessionParticipant = typeof studySessionParticipants.$inferSelect;


// PDF Material Types
export type PdfMaterial = typeof pdfMaterials.$inferSelect;
export type InsertPdfMaterial = typeof pdfMaterials.$inferInsert;

export type PdfTopic = typeof pdfTopics.$inferSelect;
export type InsertPdfTopic = typeof pdfTopics.$inferInsert;

export type PdfFolder = typeof pdfFolders.$inferSelect;
export type InsertPdfFolder = typeof pdfFolders.$inferInsert;

// AI Scheduler State - Production monitoring sistemi için
export const schedulerState = mysqlTable("scheduler_state", {
  id: varchar("id", { length: 50 }).primaryKey().default("scheduler-singleton"), // Single row table
  enabled: boolean("enabled").notNull().default(false),
  nextRunAt: timestamp("next_run_at"),
  lastRunAt: timestamp("last_run_at"),
  currentCategory: text("current_category"),
  totalRuns: int("total_runs").notNull().default(0),
  totalQuestionsGenerated: int("total_questions_generated").notNull().default(0),
  lastError: text("last_error"),
  lastErrorAt: timestamp("last_error_at"),
  generationHistory: json("generation_history").default([]), // Son 10 generation kaydı
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

// PDF Schema Exports
export const insertPdfMaterialSchema = createInsertSchema(pdfMaterials).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPdfTopicSchema = createInsertSchema(pdfTopics).omit({ id: true, createdAt: true });
export const insertPdfFolderSchema = createInsertSchema(pdfFolders).omit({ id: true, createdAt: true });

// Scheduler State Types
export type SchedulerState = typeof schedulerState.$inferSelect;
export type InsertSchedulerState = typeof schedulerState.$inferInsert;
export const insertSchedulerStateSchema = createInsertSchema(schedulerState).omit({ id: true, createdAt: true, updatedAt: true });
