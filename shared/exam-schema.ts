// Turkish Exam-Specific Schema
import { pgTable, text, integer, timestamp, boolean, jsonb, varchar, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Exam Categories with Turkish-specific structure
export const examCategories = pgTable('exam_categories', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  type: varchar('type', { length: 20 }).notNull(), // 'yks', 'kpss', 'ehliyet', 'src'
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  examDuration: integer('exam_duration'), // minutes
  totalQuestions: integer('total_questions'),
  passingScore: decimal('passing_score', { precision: 5, scale: 2 }),
  officialExamDates: jsonb('official_exam_dates'), // Array of exam dates
  subjects: jsonb('subjects'), // Array of subject areas
  examFormat: jsonb('exam_format'), // Specific format details
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Turkish Exam Questions
export const examQuestions = pgTable('exam_questions', {
  id: varchar('id', { length: 50 }).primaryKey(),
  categoryId: varchar('category_id', { length: 50 }).references(() => examCategories.id),
  subject: text('subject').notNull(), // e.g., 'Matematik', 'Türkçe', 'Trafik Kuralları'
  topic: text('topic'), // Specific topic within subject
  questionText: text('question_text').notNull(),
  questionType: varchar('question_type', { length: 20 }).notNull(), // 'multiple_choice', 'true_false', 'video_based'
  options: jsonb('options'), // Array of answer options
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation'),
  difficulty: varchar('difficulty', { length: 10 }).notNull(), // 'easy', 'medium', 'hard'
  examYear: integer('exam_year'), // Year of actual exam question
  questionNumber: integer('question_number'), // Original position in exam
  timeEstimate: integer('time_estimate'), // Seconds to answer
  mediaUrl: text('media_url'), // For video/image questions
  tags: jsonb('tags'), // Array of tags
  officialSource: text('official_source'), // OSYM, MEB etc.
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Mock Exam Sessions
export const mockExamSessions = pgTable('mock_exam_sessions', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull(),
  categoryId: varchar('category_id', { length: 50 }).references(() => examCategories.id),
  sessionType: varchar('session_type', { length: 20 }).notNull(), // 'full_mock', 'subject_practice', 'timed_practice'
  title: text('title').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  duration: integer('duration'), // seconds
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  score: decimal('score', { precision: 5, scale: 2 }),
  correctAnswers: integer('correct_answers'),
  wrongAnswers: integer('wrong_answers'),
  emptyAnswers: integer('empty_answers'),
  timeSpent: integer('time_spent'), // seconds
  subjectBreakdown: jsonb('subject_breakdown'), // Performance by subject
  questionIds: jsonb('question_ids'), // Array of question IDs
  userAnswers: jsonb('user_answers'), // User's answers
  isCompleted: boolean('is_completed').default(false),
  examEnvironment: jsonb('exam_environment'), // Settings like strict timing
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Exam Performance Analytics
export const examPerformance = pgTable('exam_performance', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull(),
  categoryId: varchar('category_id', { length: 50 }).references(() => examCategories.id),
  sessionId: varchar('session_id', { length: 50 }).references(() => mockExamSessions.id),
  subject: text('subject').notNull(),
  correctAnswers: integer('correct_answers').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  accuracy: decimal('accuracy', { precision: 5, scale: 2 }).notNull(),
  averageTime: integer('average_time'), // seconds per question
  strongTopics: jsonb('strong_topics'), // Array of strong topics
  weakTopics: jsonb('weak_topics'), // Array of weak topics
  improvementRate: decimal('improvement_rate', { precision: 5, scale: 2 }), // Weekly improvement
  examDate: timestamp('exam_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Exam Registration & Tracking
export const examRegistrations = pgTable('exam_registrations', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull(),
  categoryId: varchar('category_id', { length: 50 }).references(() => examCategories.id),
  examDate: timestamp('exam_date').notNull(),
  registrationDate: timestamp('registration_date').defaultNow(),
  targetScore: decimal('target_score', { precision: 5, scale: 2 }),
  studyPlan: jsonb('study_plan'), // Detailed study schedule
  remainingDays: integer('remaining_days'),
  preparationLevel: varchar('preparation_level', { length: 20 }), // 'beginner', 'intermediate', 'advanced'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Success Predictions
export const successPredictions = pgTable('success_predictions', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull(),
  categoryId: varchar('category_id', { length: 50 }).references(() => examCategories.id),
  currentScore: decimal('current_score', { precision: 5, scale: 2 }).notNull(),
  targetScore: decimal('target_score', { precision: 5, scale: 2 }).notNull(),
  successProbability: decimal('success_probability', { precision: 5, scale: 2 }).notNull(),
  requiredStudyHours: integer('required_study_hours'),
  weakAreas: jsonb('weak_areas'), // Priority areas to focus
  recommendations: jsonb('recommendations'), // AI-generated study recommendations
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

// Insert Schemas
export const insertExamCategory = createInsertSchema(examCategories);
export const insertExamQuestion = createInsertSchema(examQuestions);
export const insertMockExamSession = createInsertSchema(mockExamSessions);
export const insertExamPerformance = createInsertSchema(examPerformance);
export const insertExamRegistration = createInsertSchema(examRegistrations);
export const insertSuccessPrediction = createInsertSchema(successPredictions);

// Select Types
export type ExamCategory = typeof examCategories.$inferSelect;
export type ExamQuestion = typeof examQuestions.$inferSelect;
export type MockExamSession = typeof mockExamSessions.$inferSelect;
export type ExamPerformance = typeof examPerformance.$inferSelect;
export type ExamRegistration = typeof examRegistrations.$inferSelect;
export type SuccessPrediction = typeof successPredictions.$inferSelect;

// Insert Types
export type InsertExamCategory = z.infer<typeof insertExamCategory>;
export type InsertExamQuestion = z.infer<typeof insertExamQuestion>;
export type InsertMockExamSession = z.infer<typeof insertMockExamSession>;
export type InsertExamPerformance = z.infer<typeof insertExamPerformance>;
export type InsertExamRegistration = z.infer<typeof insertExamRegistration>;
export type InsertSuccessPrediction = z.infer<typeof insertSuccessPrediction>;

// Turkish Exam Types
export const TurkishExamTypes = {
  YKS: 'yks',
  KPSS: 'kpss',
  EHLIYET: 'ehliyet',
  SRC: 'src'
} as const;

export const ExamSubjects = {
  YKS: {
    TYT: ['Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilimler'],
    AYT: ['Türk Dili ve Edebiyatı', 'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'Felsefe']
  },
  KPSS: {
    GENEL_YETENEK: ['Sözel Yetenek', 'Sayısal Yetenek'],
    GENEL_KULTUR: ['Tarih', 'Coğrafya', 'Vatandaşlık', 'Hukuk', 'İktisat'],
    EGITIM_BILIMLERI: ['Eğitim Psikolojisi', 'Öğretim Yöntemleri', 'Ölçme ve Değerlendirme']
  },
  EHLIYET: {
    TEORIK: ['Trafik Kuralları', 'İlk Yardım', 'Motor ve Araç Tekniği', 'Çevre Bilgisi'],
    PRATIK: ['Park Etme', 'Yol Kuralları', 'Kavşak Geçişi']
  },
  SRC: {
    TEORIK: ['Denizcilik Bilgisi', 'Navigasyon', 'Meteoroloji', 'İletişim', 'Güvenlik'],
    PRATIK: ['Tekne Kullanımı', 'Bağlama Teknikleri', 'Acil Durumlar']
  }
} as const;