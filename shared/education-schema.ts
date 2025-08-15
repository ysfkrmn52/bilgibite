import { pgTable, text, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Education Subjects Table
export const educationSubjects = pgTable("education_subjects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Education Courses Table
export const educationCourses = pgTable("education_courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructor: text("instructor").notNull(),
  subjectId: text("subject_id").notNull().references(() => educationSubjects.id),
  duration: text("duration").notNull(),
  level: text("level").notNull(), // Başlangıç, Orta, İleri
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0'),
  totalStudents: integer("total_students").default(0),
  featured: boolean("featured").default(false),
  price: integer("price").default(0), // 0 for free courses
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Education Study Materials Table
export const educationMaterials = pgTable("education_materials", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // PDF, Video, Image, etc.
  subjectId: text("subject_id").notNull().references(() => educationSubjects.id),
  fileUrl: text("file_url").notNull(),
  fileSize: text("file_size").notNull(),
  downloads: integer("downloads").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Education Learning Paths Table
export const educationLearningPaths = pgTable("education_learning_paths", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  totalCourses: integer("total_courses").notNull(),
  difficulty: text("difficulty").notNull(),
  completionRate: integer("completion_rate").default(0), // Percentage
  subjects: jsonb("subjects").$type<string[]>().notNull(),
  courseIds: jsonb("course_ids").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// User Course Enrollments Table
export const userCourseEnrollments = pgTable("user_course_enrollments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  courseId: text("course_id").notNull().references(() => educationCourses.id),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  progress: integer("progress").default(0), // Percentage
  status: text("status").notNull().default('active'), // active, completed, paused
  lastAccessedAt: timestamp("last_accessed_at"),
  completedAt: timestamp("completed_at"),
  rating: integer("rating"), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// User Education Progress Table
export const educationProgress = pgTable("education_progress", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  subjectId: text("subject_id").notNull().references(() => educationSubjects.id),
  totalLessonsCompleted: integer("total_lessons_completed").default(0),
  totalStudyTime: integer("total_study_time").default(0), // in minutes
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  masteryLevel: text("mastery_level").default('beginner'), // beginner, intermediate, advanced, expert
  lastStudyDate: timestamp("last_study_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// Course Lessons Table
export const courseLessons = pgTable("course_lessons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").notNull().references(() => educationCourses.id),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  duration: text("duration"),
  videoUrl: text("video_url"),
  content: jsonb("content"), // Rich content including text, images, interactive elements
  type: text("type").default('video'), // video, text, quiz, interactive
  isRequired: boolean("is_required").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

// User Lesson Progress Table
export const userLessonProgress = pgTable("user_lesson_progress", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  lessonId: text("lesson_id").notNull().references(() => courseLessons.id),
  completed: boolean("completed").default(false),
  timeSpent: integer("time_spent").default(0), // in seconds
  lastWatchedPosition: integer("last_watched_position").default(0), // for video lessons
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
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