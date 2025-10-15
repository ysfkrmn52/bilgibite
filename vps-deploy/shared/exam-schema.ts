// Turkish Exam-Specific Schema - MySQL Version
import { mysqlTable, varchar, text, int, timestamp, boolean, json, decimal } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Exam Categories with Turkish-specific structure
export const examCategories = mysqlTable('exam_categories', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull(), // 'yks', 'kpss', 'ehliyet', 'src'
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  examDuration: int('exam_duration'), // minutes
  totalQuestions: int('total_questions'),
  passingScore: decimal('passing_score', { precision: 5, scale: 2 }),
  officialExamDates: json('official_exam_dates'), // Array of exam dates
  subjects: json('subjects'), // Array of subject areas
  examFormat: json('exam_format'), // Specific format details
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow()
});

// Turkish Exam Questions
export const examQuestions = mysqlTable('exam_questions', {
  id: varchar('id', { length: 50 }).primaryKey(),
  categoryId: varchar('category_id', { length: 50 }),
  subject: text('subject').notNull(), // e.g., 'Matematik', 'Türkçe', 'Trafik Kuralları'
  topic: text('topic'), // Specific topic within subject
  questionText: text('question_text').notNull(),
  questionType: varchar('question_type', { length: 20 }).notNull(), // 'multiple_choice', 'true_false', 'video_based'
  options: json('options'), // Array of answer options
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation'),
  difficulty: varchar('difficulty', { length: 10 }).notNull(), // 'easy', 'medium', 'hard'
  examYear: int('exam_year'), // Year of actual exam question
  questionNumber: int('question_number'), // Original position in exam
  timeEstimate: int('time_estimate'), // Seconds to answer
  mediaUrl: text('media_url'), // For video/image questions
  tags: json('tags'), // Array of tags
  officialSource: text('official_source'), // OSYM, MEB etc.
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow()
});

// Mock Exam Sessions
export const mockExamSessions = mysqlTable('mock_exam_sessions', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull(),
  categoryId: varchar('category_id', { length: 50 }),
  sessionType: varchar('session_type', { length: 20 }).notNull(), // 'full_mock', 'subject_practice', 'timed_practice'
  title: text('title').notNull(),
  totalQuestions: int('total_questions').notNull(),
  duration: int('duration'), // seconds
  startedAt: timestamp('started_at').default(sql`CURRENT_TIMESTAMP`),
  completedAt: timestamp('completed_at'),
  score: decimal('score', { precision: 5, scale: 2 }),
  correctAnswers: int('correct_answers'),
  wrongAnswers: int('wrong_answers'),
  emptyAnswers: int('empty_answers'),
  timeSpent: int('time_spent'), // seconds
  subjectBreakdown: json('subject_breakdown'), // Performance by subject
  questionIds: json('question_ids'), // Array of question IDs
  userAnswers: json('user_answers'), // User's answers
  isCompleted: boolean('is_completed').default(false),
  examEnvironment: json('exam_environment'), // Settings like strict timing
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow()
});

// Exam Performance Analytics
export const examPerformance = mysqlTable('exam_performance', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull(),
  categoryId: varchar('category_id', { length: 50 }),
  subject: varchar('subject', { length: 100 }),
  totalAttempts: int('total_attempts').default(0),
  averageScore: decimal('average_score', { precision: 5, scale: 2 }),
  highestScore: decimal('highest_score', { precision: 5, scale: 2 }),
  lowestScore: decimal('lowest_score', { precision: 5, scale: 2 }),
  totalCorrect: int('total_correct').default(0),
  totalWrong: int('total_wrong').default(0),
  totalEmpty: int('total_empty').default(0),
  improvementRate: decimal('improvement_rate', { precision: 5, scale: 2 }), // Percentage
  weakTopics: json('weak_topics'), // Array of topics user struggles with
  strongTopics: json('strong_topics'), // Array of topics user excels at
  studyRecommendations: json('study_recommendations'),
  lastAttemptAt: timestamp('last_attempt_at'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow()
});

// YKS (University Entrance Exam) Specific
export const yksScores = mysqlTable('yks_scores', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull(),
  sessionId: varchar('session_id', { length: 50 }),
  tytScore: decimal('tyt_score', { precision: 6, scale: 3 }),
  aytScore: decimal('ayt_score', { precision: 6, scale: 3 }),
  tytNet: json('tyt_net'), // Net counts by subject
  aytNet: json('ayt_net'), // Net counts by subject
  estimatedRanking: int('estimated_ranking'),
  targetUniversities: json('target_universities'),
  eligiblePrograms: json('eligible_programs'),
  calculatedAt: timestamp('calculated_at').default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// KPSS (Public Personnel Selection Exam) Specific
export const kpssScores = mysqlTable('kpss_scores', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull(),
  sessionId: varchar('session_id', { length: 50 }),
  generalAbilityScore: decimal('general_ability_score', { precision: 6, scale: 3 }),
  generalCultureScore: decimal('general_culture_score', { precision: 6, scale: 3 }),
  educationalScienceScore: decimal('educational_science_score', { precision: 6, scale: 3 }),
  totalScore: decimal('total_score', { precision: 6, scale: 3 }),
  netCounts: json('net_counts'),
  estimatedRanking: int('estimated_ranking'),
  targetPositions: json('target_positions'),
  calculatedAt: timestamp('calculated_at').default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Ehliyet (Driver's License) Specific
export const ehliyetProgress = mysqlTable('ehliyet_progress', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull(),
  licenseType: varchar('license_type', { length: 10 }).notNull(), // 'B', 'A1', 'A2', etc.
  trafficRulesScore: int('traffic_rules_score'),
  motorVehicleScore: int('motor_vehicle_score'),
  firstAidScore: int('first_aid_score'),
  totalPracticeExams: int('total_practice_exams').default(0),
  passedExams: int('passed_exams').default(0),
  readyForExam: boolean('ready_for_exam').default(false),
  weakAreas: json('weak_areas'),
  lastPracticeAt: timestamp('last_practice_at'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow()
});

// SRC (Professional Competency Certificate) Specific
export const srcProgress = mysqlTable('src_progress', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull(),
  certificateType: varchar('certificate_type', { length: 10 }).notNull(), // 'SRC1', 'SRC2', 'SRC3', 'SRC4', 'SRC5'
  totalScore: decimal('total_score', { precision: 5, scale: 2 }),
  passedSections: json('passed_sections'),
  failedSections: json('failed_sections'),
  totalPracticeExams: int('total_practice_exams').default(0),
  readyForExam: boolean('ready_for_exam').default(false),
  studyPlan: json('study_plan'),
  lastPracticeAt: timestamp('last_practice_at'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).onUpdateNow()
});

// Zod Schemas
export const insertExamCategorySchema = createInsertSchema(examCategories);
export const insertExamQuestionSchema = createInsertSchema(examQuestions);
export const insertMockExamSessionSchema = createInsertSchema(mockExamSessions);
export const insertExamPerformanceSchema = createInsertSchema(examPerformance);
export const insertYksScoreSchema = createInsertSchema(yksScores);
export const insertKpssScoreSchema = createInsertSchema(kpssScores);
export const insertEhliyetProgressSchema = createInsertSchema(ehliyetProgress);
export const insertSrcProgressSchema = createInsertSchema(srcProgress);

// Types
export type ExamCategory = typeof examCategories.$inferSelect;
export type InsertExamCategory = z.infer<typeof insertExamCategorySchema>;

export type ExamQuestion = typeof examQuestions.$inferSelect;
export type InsertExamQuestion = z.infer<typeof insertExamQuestionSchema>;

export type MockExamSession = typeof mockExamSessions.$inferSelect;
export type InsertMockExamSession = z.infer<typeof insertMockExamSessionSchema>;

export type ExamPerformance = typeof examPerformance.$inferSelect;
export type InsertExamPerformance = z.infer<typeof insertExamPerformanceSchema>;

export type YksScore = typeof yksScores.$inferSelect;
export type InsertYksScore = z.infer<typeof insertYksScoreSchema>;

export type KpssScore = typeof kpssScores.$inferSelect;
export type InsertKpssScore = z.infer<typeof insertKpssScoreSchema>;

export type EhliyetProgress = typeof ehliyetProgress.$inferSelect;
export type InsertEhliyetProgress = z.infer<typeof insertEhliyetProgressSchema>;

export type SrcProgress = typeof srcProgress.$inferSelect;
export type InsertSrcProgress = z.infer<typeof insertSrcProgressSchema>;
