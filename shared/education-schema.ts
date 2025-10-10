import { mysqlTable, varchar, text, int, decimal, boolean, timestamp, json } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Education Subjects Table
export const educationSubjects = mysqlTable("education_subjects", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

// Education Courses Table
export const educationCourses = mysqlTable("education_courses", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructor: text("instructor").notNull(),
  subjectId: varchar("subject_id", { length: 36 }).notNull(),
  duration: text("duration").notNull(),
  level: varchar("level", { length: 50 }).notNull(), // Başlangıç, Orta, İleri
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0'),
  totalStudents: int("total_students").default(0),
  featured: boolean("featured").default(false),
  price: int("price").default(0), // 0 for free courses
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

// Education Study Materials Table
export const educationMaterials = mysqlTable("education_materials", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // PDF, Video, Image, etc.
  subjectId: varchar("subject_id", { length: 36 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: text("file_size").notNull(),
  downloads: int("downloads").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

// Education Learning Paths Table
export const educationLearningPaths = mysqlTable("education_learning_paths", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  totalCourses: int("total_courses").notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  completionRate: int("completion_rate").default(0), // Percentage
  subjects: json("subjects").$type<string[]>().notNull(),
  courseIds: json("course_ids").$type<string[]>().default([]),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

// User Course Enrollments Table
export const userCourseEnrollments = mysqlTable("user_course_enrollments", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  courseId: varchar("course_id", { length: 36 }).notNull(),
  enrolledAt: timestamp("enrolled_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  progress: int("progress").default(0), // Percentage
  status: varchar("status", { length: 50 }).notNull().default('active'), // active, completed, paused
  lastAccessedAt: timestamp("last_accessed_at"),
  completedAt: timestamp("completed_at"),
  rating: int("rating"), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

// User Education Progress Table
export const educationProgress = mysqlTable("education_progress", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  subjectId: varchar("subject_id", { length: 36 }).notNull(),
  totalLessonsCompleted: int("total_lessons_completed").default(0),
  totalStudyTime: int("total_study_time").default(0), // in minutes
  currentStreak: int("current_streak").default(0),
  longestStreak: int("longest_streak").default(0),
  masteryLevel: varchar("mastery_level", { length: 50 }).default('beginner'), // beginner, intermediate, advanced, expert
  lastStudyDate: timestamp("last_study_date"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

// Course Lessons Table
export const courseLessons = mysqlTable("course_lessons", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: varchar("course_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: int("order_index").notNull(),
  duration: text("duration"),
  videoUrl: text("video_url"),
  content: json("content"), // Rich content including text, images, interactive elements
  type: varchar("type", { length: 50 }).default('video'), // video, text, quiz, interactive
  isRequired: boolean("is_required").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

// User Lesson Progress Table
export const userLessonProgress = mysqlTable("user_lesson_progress", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull(),
  lessonId: varchar("lesson_id", { length: 36 }).notNull(),
  completed: boolean("completed").default(false),
  timeSpent: int("time_spent").default(0), // in seconds
  lastWatchedPosition: int("last_watched_position").default(0), // for video lessons
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull()
});

// Zod Schemas for validation
export const insertEducationSubjectSchema = createInsertSchema(educationSubjects);
export const insertEducationCourseSchema = createInsertSchema(educationCourses);
export const insertEducationMaterialSchema = createInsertSchema(educationMaterials);
export const insertEducationLearningPathSchema = createInsertSchema(educationLearningPaths);
export const insertEducationProgressSchema = createInsertSchema(educationProgress);
export const insertUserCourseEnrollmentSchema = createInsertSchema(userCourseEnrollments);
export const insertCourseLessonSchema = createInsertSchema(courseLessons);
export const insertUserLessonProgressSchema = createInsertSchema(userLessonProgress);

// TypeScript Types
export type EducationSubject = typeof educationSubjects.$inferSelect;
export type InsertEducationSubject = z.infer<typeof insertEducationSubjectSchema>;

export type EducationCourse = typeof educationCourses.$inferSelect;
export type InsertEducationCourse = z.infer<typeof insertEducationCourseSchema>;

export type EducationMaterial = typeof educationMaterials.$inferSelect;
export type InsertEducationMaterial = z.infer<typeof insertEducationMaterialSchema>;

export type EducationLearningPath = typeof educationLearningPaths.$inferSelect;
export type InsertEducationLearningPath = z.infer<typeof insertEducationLearningPathSchema>;

export type EducationProgress = typeof educationProgress.$inferSelect;
export type InsertEducationProgress = z.infer<typeof insertEducationProgressSchema>;

export type UserCourseEnrollment = typeof userCourseEnrollments.$inferSelect;
export type InsertUserCourseEnrollment = z.infer<typeof insertUserCourseEnrollmentSchema>;

export type CourseLesson = typeof courseLessons.$inferSelect;
export type InsertCourseLesson = z.infer<typeof insertCourseLessonSchema>;

export type UserLessonProgress = typeof userLessonProgress.$inferSelect;
export type InsertUserLessonProgress = z.infer<typeof insertUserLessonProgressSchema>;
