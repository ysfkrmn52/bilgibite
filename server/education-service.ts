import { db } from "./db";
import { 
  educationCourses, 
  educationSubjects, 
  educationMaterials,
  educationLearningPaths,
  educationProgress,
  userCourseEnrollments
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Types for the service
type InsertEducationSubject = typeof educationSubjects.$inferInsert;
type InsertEducationCourse = typeof educationCourses.$inferInsert;
type InsertEducationMaterial = typeof educationMaterials.$inferInsert;
type InsertEducationLearningPath = typeof educationLearningPaths.$inferInsert;
type InsertEducationProgress = typeof educationProgress.$inferInsert;
type InsertUserCourseEnrollment = typeof userCourseEnrollments.$inferInsert;

type EducationSubject = typeof educationSubjects.$inferSelect;
type EducationCourse = typeof educationCourses.$inferSelect;
type EducationMaterial = typeof educationMaterials.$inferSelect;
type EducationLearningPath = typeof educationLearningPaths.$inferSelect;
type EducationProgress = typeof educationProgress.$inferSelect;
type UserCourseEnrollment = typeof userCourseEnrollments.$inferSelect;

export class EducationService {
  
  // Subject Management
  async getAllSubjects(): Promise<EducationSubject[]> {
    return await db.select().from(educationSubjects).orderBy(educationSubjects.name);
  }

  async getSubjectById(id: string): Promise<EducationSubject | null> {
    const subjects = await db.select().from(educationSubjects).where(eq(educationSubjects.id, id));
    return subjects[0] || null;
  }

  async createSubject(subject: InsertEducationSubject): Promise<EducationSubject> {
    const [created] = await db.insert(educationSubjects).values(subject).returning();
    return created;
  }

  // Course Management
  async getAllCourses(subjectId?: string): Promise<EducationCourse[]> {
    const query = db.select().from(educationCourses);
    
    if (subjectId) {
      return await query.where(eq(educationCourses.subjectId, subjectId)).orderBy(desc(educationCourses.createdAt));
    }
    
    return await query.orderBy(desc(educationCourses.createdAt));
  }

  async getCourseById(id: string): Promise<EducationCourse | null> {
    const courses = await db.select().from(educationCourses).where(eq(educationCourses.id, id));
    return courses[0] || null;
  }

  async createCourse(course: InsertEducationCourse): Promise<EducationCourse> {
    const [created] = await db.insert(educationCourses).values(course).returning();
    return created;
  }

  async updateCourse(id: string, updates: Partial<InsertEducationCourse>): Promise<EducationCourse | null> {
    const [updated] = await db
      .update(educationCourses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(educationCourses.id, id))
      .returning();
    return updated || null;
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await db.delete(educationCourses).where(eq(educationCourses.id, id));
    return result.rowCount! > 0;
  }

  // Featured courses with enrollment and rating info
  async getFeaturedCourses(limit: number = 6): Promise<EducationCourse[]> {
    return await db
      .select()
      .from(educationCourses)
      .where(eq(educationCourses.featured, true))
      .orderBy(desc(educationCourses.rating))
      .limit(limit);
  }

  // Course search functionality
  async searchCourses(query: string, subjectId?: string): Promise<EducationCourse[]> {
    let searchCondition = sql`${educationCourses.title} ILIKE ${'%' + query + '%'} OR ${educationCourses.description} ILIKE ${'%' + query + '%'} OR ${educationCourses.instructor} ILIKE ${'%' + query + '%'}`;

    if (subjectId) {
      searchCondition = sql`(${searchCondition}) AND ${educationCourses.subjectId} = ${subjectId}`;
    }

    return await db
      .select()
      .from(educationCourses)
      .where(searchCondition)
      .orderBy(desc(educationCourses.rating));
  }

  // Study Materials Management
  async getAllMaterials(subjectId?: string): Promise<EducationMaterial[]> {
    const query = db.select().from(educationMaterials);
    
    if (subjectId) {
      return await query.where(eq(educationMaterials.subjectId, subjectId)).orderBy(desc(educationMaterials.downloads));
    }
    
    return await query.orderBy(desc(educationMaterials.downloads));
  }

  async getMaterialById(id: string): Promise<EducationMaterial | null> {
    const materials = await db.select().from(educationMaterials).where(eq(educationMaterials.id, id));
    return materials[0] || null;
  }

  async createMaterial(material: InsertEducationMaterial): Promise<EducationMaterial> {
    const [created] = await db.insert(educationMaterials).values(material).returning();
    return created;
  }

  async incrementMaterialDownloads(id: string): Promise<boolean> {
    const result = await db
      .update(educationMaterials)
      .set({ 
        downloads: sql`${educationMaterials.downloads} + 1`,
        updatedAt: new Date()
      })
      .where(eq(educationMaterials.id, id));
    return result.rowCount! > 0;
  }

  // Learning Paths Management
  async getAllLearningPaths(): Promise<EducationLearningPath[]> {
    return await db
      .select()
      .from(educationLearningPaths)
      .orderBy(desc(educationLearningPaths.completionRate));
  }

  async getLearningPathById(id: string): Promise<EducationLearningPath | null> {
    const paths = await db.select().from(educationLearningPaths).where(eq(educationLearningPaths.id, id));
    return paths[0] || null;
  }

  async createLearningPath(path: InsertEducationLearningPath): Promise<EducationLearningPath> {
    const [created] = await db.insert(educationLearningPaths).values(path).returning();
    return created;
  }

  // User Progress and Enrollment Management
  async enrollUserInCourse(userId: string, courseId: string): Promise<UserCourseEnrollment> {
    const enrollment: InsertUserCourseEnrollment = {
      userId,
      courseId,
      enrolledAt: new Date(),
      progress: 0,
      status: 'active'
    };
    
    const [created] = await db.insert(userCourseEnrollments).values(enrollment).returning();
    return created;
  }

  async getUserEnrollments(userId: string): Promise<UserCourseEnrollment[]> {
    return await db
      .select()
      .from(userCourseEnrollments)
      .where(eq(userCourseEnrollments.userId, userId))
      .orderBy(desc(userCourseEnrollments.enrolledAt));
  }

  async updateCourseProgress(userId: string, courseId: string, progress: number): Promise<boolean> {
    const result = await db
      .update(userCourseEnrollments)
      .set({ 
        progress,
        updatedAt: new Date(),
        status: progress >= 100 ? 'completed' : 'active'
      })
      .where(
        and(
          eq(userCourseEnrollments.userId, userId),
          eq(userCourseEnrollments.courseId, courseId)
        )
      );
    return result.rowCount! > 0;
  }

  async getUserProgress(userId: string, courseId: string): Promise<UserCourseEnrollment | null> {
    const enrollments = await db
      .select()
      .from(userCourseEnrollments)
      .where(
        and(
          eq(userCourseEnrollments.userId, userId),
          eq(userCourseEnrollments.courseId, courseId)
        )
      );
    return enrollments[0] || null;
  }

  // Course Statistics
  async getCourseStats(courseId: string): Promise<{
    totalEnrollments: number;
    completionRate: number;
    averageRating: number;
  }> {
    const enrollmentCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(userCourseEnrollments)
      .where(eq(userCourseEnrollments.courseId, courseId));

    const completedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(userCourseEnrollments)
      .where(
        and(
          eq(userCourseEnrollments.courseId, courseId),
          eq(userCourseEnrollments.status, 'completed')
        )
      );

    const course = await this.getCourseById(courseId);

    return {
      totalEnrollments: enrollmentCount[0]?.count || 0,
      completionRate: enrollmentCount[0]?.count > 0 
        ? Math.round((completedCount[0]?.count / enrollmentCount[0].count) * 100) 
        : 0,
      averageRating: course?.rating || 0
    };
  }

  // Popular courses based on enrollments
  async getPopularCourses(limit: number = 10): Promise<EducationCourse[]> {
    // This is a complex query that joins courses with enrollment counts
    const popularCoursesQuery = await db
      .select({
        course: educationCourses,
        enrollmentCount: sql<number>`count(${userCourseEnrollments.id})`,
      })
      .from(educationCourses)
      .leftJoin(userCourseEnrollments, eq(educationCourses.id, userCourseEnrollments.courseId))
      .groupBy(educationCourses.id)
      .orderBy(sql`count(${userCourseEnrollments.id}) desc`)
      .limit(limit);

    return popularCoursesQuery.map(result => result.course);
  }

  // User learning analytics
  async getUserLearningAnalytics(userId: string): Promise<{
    totalCoursesEnrolled: number;
    totalCoursesCompleted: number;
    totalStudyTime: number;
    currentStreak: number;
    favoriteSubject: string | null;
  }> {
    const enrollments = await db
      .select()
      .from(userCourseEnrollments)
      .where(eq(userCourseEnrollments.userId, userId));

    const completed = enrollments.filter(e => e.status === 'completed');

    // Mock data for additional analytics (would need more complex tracking in real app)
    return {
      totalCoursesEnrolled: enrollments.length,
      totalCoursesCompleted: completed.length,
      totalStudyTime: completed.length * 120, // Mock: 2 hours per completed course
      currentStreak: 5, // Mock streak data
      favoriteSubject: enrollments.length > 0 ? 'matematik' : null // Mock favorite subject
    };
  }
}

// Initialize default education data
export async function seedEducationData(): Promise<void> {
  // Geçici: SSL sertifika sorunu nedeniyle seeding atlanıyor
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Education data seeding skipped in development (SSL issue)');
    return;
  }
  
  try {
    // Check if subjects already exist
    const existingSubjects = await db.select().from(educationSubjects).limit(1);
    if (existingSubjects.length > 0) {
      console.log('Education data already exists, skipping seed...');
      return;
    }

    console.log('Seeding education data...');

    // Create subjects
    const subjectData: InsertEducationSubject[] = [
      {
        id: 'matematik',
        name: 'Matematik',
        description: 'Temel matematikte ustalaş',
        icon: 'Calculator',
        color: 'blue'
      },
      {
        id: 'fen',
        name: 'Fen Bilimleri',
        description: 'Fizik, kimya ve biyoloji',
        icon: 'Atom',
        color: 'green'
      },
      {
        id: 'turkce',
        name: 'Türkçe',
        description: 'Dil ve edebiyat',
        icon: 'Languages',
        color: 'purple'
      },
      {
        id: 'tarih',
        name: 'Tarih',
        description: 'Dünya ve Türk tarihi',
        icon: 'History',
        color: 'orange'
      }
    ];

    await db.insert(educationSubjects).values(subjectData);

    // Create sample courses
    const courseData: InsertEducationCourse[] = [
      {
        id: 'matematik-ileri',
        title: 'İleri Matematik: Limit ve Türev',
        description: 'YKS matematik bölümünde en çok zorlanılan konulardan limit ve türev işlemlerini detaylıca öğrenin.',
        instructor: 'Prof. Dr. Mehmet Yılmaz',
        subjectId: 'matematik',
        duration: '8 saat',
        level: 'İleri',
        rating: 48, // Store as integer (4.8 * 10)
        featured: true,
        price: 0,
        thumbnailUrl: '/course-thumbnails/matematik-ileri.jpg'
      },
      {
        id: 'turkce-dil',
        title: 'Türkçe Dil Bilgisi Temelleri',
        description: 'Türkçe dil bilgisi kurallarını sıfırdan öğrenin ve yazım kurallarında ustalaşın.',
        instructor: 'Öğr. Gör. Zeynep Demir',
        subjectId: 'turkce',
        duration: '6 saat',
        level: 'Başlangıç',
        rating: 47, // Store as integer (4.7 * 10)
        featured: true,
        price: 0,
        thumbnailUrl: '/course-thumbnails/turkce-dil.jpg'
      }
    ];

    await db.insert(educationCourses).values(courseData);

    // Create sample materials
    const materialData: InsertEducationMaterial[] = [
      {
        id: 'matematik-formul-kartlari',
        title: 'YKS Matematik Formül Kartları',
        description: 'Tüm matematik formüllerini tek PDF\'de topladık.',
        type: 'PDF',
        subjectId: 'matematik',
        fileUrl: '/materials/matematik-formul-kartlari.pdf',
        fileSize: '2.5 MB',
        downloads: 15420
      },
      {
        id: 'turkce-yazim-kurallari',
        title: 'Türkçe Yazım Kuralları Rehberi',
        description: 'TDK kurallarına göre hazırlanmış kapsamlı yazım rehberi.',
        type: 'PDF',
        subjectId: 'turkce',
        fileUrl: '/materials/turkce-yazim-kurallari.pdf',
        fileSize: '1.8 MB',
        downloads: 8765
      }
    ];

    await db.insert(educationMaterials).values(materialData);

    // Create sample learning paths
    const learningPathData: InsertEducationLearningPath[] = [
      {
        id: 'yks-matematik',
        title: 'YKS Matematik Hazırlığı',
        description: 'YKS matematik bölümüne sistematik bir şekilde hazırlanın.',
        duration: '3 ay',
        totalCourses: 8,
        difficulty: 'Orta-İleri',
        completionRate: 78,
        subjects: ['Fonksiyonlar', 'Limit', 'Türev', 'İntegral', 'Analitik Geometri']
      },
      {
        id: 'lise-fen',
        title: 'Lise Fen Bilimleri',
        description: 'Lise fen bilimleri müfredatını tamamen kaplayın.',
        duration: '6 ay',
        totalCourses: 15,
        difficulty: 'Başlangıç-Orta',
        completionRate: 92,
        subjects: ['Fizik', 'Kimya', 'Biyoloji', 'Matematik']
      }
    ];

    await db.insert(educationLearningPaths).values(learningPathData);

    console.log('Education data seeded successfully!');
  } catch (error) {
    console.error('Error seeding education data:', error);
  }
}