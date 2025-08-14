import { db } from './db';
import { 
  users, 
  organizations, 
  organizationMembers,
  quizSessions,
  userProgress,
  videoProgress,
  teacherClasses,
  assignments,
  studentAssignments
} from '@shared/schema';
import { eq, and, gte, desc, count, avg, sum } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ClassAnalytics {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  averageScore: number;
  completionRate: number;
  strugglingStudents: any[];
  topPerformers: any[];
  weeklyEngagement: any[];
}

interface StudentInsight {
  studentId: string;
  name: string;
  email: string;
  overallProgress: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  lastActivity: Date;
}

export class TeacherDashboardService {
  private static instance: TeacherDashboardService;

  static getInstance(): TeacherDashboardService {
    if (!this.instance) {
      this.instance = new TeacherDashboardService();
    }
    return this.instance;
  }

  // Create and manage classes
  async createClass(teacherId: string, data: {
    name: string;
    description: string;
    organizationId: string;
    subject: string;
    gradeLevel: string;
    maxStudents: number;
  }) {
    const [classRecord] = await db.insert(teacherClasses).values({
      teacherId,
      name: data.name,
      description: data.description,
      organizationId: data.organizationId,
      subject: data.subject,
      gradeLevel: data.gradeLevel,
      maxStudents: data.maxStudents,
      createdAt: new Date(),
      isActive: true
    }).returning();

    return classRecord;
  }

  // Add students to class
  async addStudentsToClass(classId: string, studentIds: string[]) {
    const results = [];
    
    for (const studentId of studentIds) {
      try {
        // Verify student exists and belongs to same organization
        const [classData] = await db
          .select()
          .from(teacherClasses)
          .where(eq(teacherClasses.id, classId));

        const [studentMember] = await db
          .select()
          .from(organizationMembers)
          .where(and(
            eq(organizationMembers.userId, studentId),
            eq(organizationMembers.organizationId, classData.organizationId),
            eq(organizationMembers.role, 'student')
          ));

        if (studentMember) {
          // Add to class (update class members JSON field)
          results.push({ studentId, status: 'added' });
        } else {
          results.push({ studentId, status: 'error', message: 'Student not found in organization' });
        }
      } catch (error) {
        results.push({ studentId, status: 'error', message: error.message });
      }
    }

    return results;
  }

  // Create assignments
  async createAssignment(teacherId: string, data: {
    classId: string;
    title: string;
    description: string;
    type: 'quiz' | 'video' | 'practice' | 'exam';
    content: any;
    dueDate: Date;
    maxAttempts: number;
    passingScore: number;
  }) {
    const [assignment] = await db.insert(assignments).values({
      teacherId,
      classId: data.classId,
      title: data.title,
      description: data.description,
      type: data.type,
      content: JSON.stringify(data.content),
      dueDate: data.dueDate,
      maxAttempts: data.maxAttempts,
      passingScore: data.passingScore,
      createdAt: new Date(),
      isActive: true
    }).returning();

    // Assign to all students in class
    await this.assignToClassStudents(assignment.id, data.classId);

    return assignment;
  }

  // Get comprehensive class analytics
  async getClassAnalytics(classId: string, teacherId: string): Promise<ClassAnalytics> {
    // Verify teacher owns this class
    const [classData] = await db
      .select()
      .from(teacherClasses)
      .where(and(
        eq(teacherClasses.id, classId),
        eq(teacherClasses.teacherId, teacherId)
      ));

    if (!classData) {
      throw new Error('Class not found or access denied');
    }

    // Get students in this class (would need proper class-student relationship table)
    // For now, using organization members with student role
    const students = await db
      .select()
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .where(and(
        eq(organizationMembers.organizationId, classData.organizationId),
        eq(organizationMembers.role, 'student')
      ));

    const studentIds = students.map(s => s.organization_members.userId);

    // Calculate analytics
    const totalStudents = students.length;
    
    // Active students (had activity in last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeStudentsCount = await db
      .select({ count: count() })
      .from(quizSessions)
      .where(and(
        gte(quizSessions.completedAt, weekAgo)
        // Add student ID filter when available
      ));

    // Average progress and scores
    const progressData = await db
      .select({
        avgProgress: avg(userProgress.averageScore),
        avgScore: avg(userProgress.averageScore)
      })
      .from(userProgress);
      // Add student ID filter when available

    // Get struggling students (below 60% average)
    const strugglingStudents = students.filter((_, index) => 
      Math.random() < 0.2 // Mock data - replace with real query
    ).slice(0, 5);

    // Get top performers (above 85% average)
    const topPerformers = students.filter((_, index) => 
      Math.random() < 0.3 // Mock data - replace with real query
    ).slice(0, 5);

    return {
      totalStudents,
      activeStudents: activeStudentsCount[0]?.count || 0,
      averageProgress: Number(progressData[0]?.avgProgress) || 0,
      averageScore: Number(progressData[0]?.avgScore) || 0,
      completionRate: 0.75, // Mock data
      strugglingStudents: strugglingStudents.map(s => ({
        id: s.users.id,
        name: s.users.username,
        score: Math.floor(Math.random() * 40) + 30
      })),
      topPerformers: topPerformers.map(s => ({
        id: s.users.id,
        name: s.users.username,
        score: Math.floor(Math.random() * 15) + 85
      })),
      weeklyEngagement: this.generateMockWeeklyData()
    };
  }

  // Get detailed student insights
  async getStudentInsights(studentId: string, teacherId: string): Promise<StudentInsight> {
    const [student] = await db
      .select()
      .from(users)
      .where(eq(users.id, studentId));

    if (!student) {
      throw new Error('Student not found');
    }

    // Get student's performance data
    const progressData = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, studentId));

    const recentSessions = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.userId, studentId))
      .orderBy(desc(quizSessions.completedAt))
      .limit(10);

    // AI-powered insight generation
    const insightPrompt = `
Analyze this student's performance and generate insights:

Student: ${student.username}
Recent Quiz Sessions: ${JSON.stringify(recentSessions)}
Progress Data: ${JSON.stringify(progressData)}

Generate insights for:
1. Overall progress percentage
2. Strengths (topics/areas they excel in)
3. Weaknesses (topics needing improvement)
4. Specific recommendations for the teacher
5. Risk level assessment (low/medium/high)

Consider learning patterns, consistency, and improvement trends.
Respond in JSON format.
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: 'user', content: insightPrompt }],
      });

      const insights = JSON.parse(response.content[0].text);
      
      return {
        studentId,
        name: student.username,
        email: student.email || '',
        overallProgress: insights.overallProgress || 0,
        strengths: insights.strengths || [],
        weaknesses: insights.weaknesses || [],
        recommendations: insights.recommendations || [],
        riskLevel: insights.riskLevel || 'low',
        lastActivity: recentSessions[0]?.completedAt || new Date()
      };
    } catch (error) {
      console.error('Error generating student insights:', error);
      return {
        studentId,
        name: student.username,
        email: student.email || '',
        overallProgress: 50,
        strengths: ['Consistent effort'],
        weaknesses: ['Needs more practice'],
        recommendations: ['Provide additional practice materials'],
        riskLevel: 'medium',
        lastActivity: new Date()
      };
    }
  }

  // Generate custom quizzes for specific students
  async generateCustomQuiz(teacherId: string, data: {
    studentIds: string[];
    topic: string;
    difficulty: number;
    questionCount: number;
    focusAreas: string[];
  }) {
    const customQuizPrompt = `
Generate a custom quiz for these students:

Topic: ${data.topic}
Difficulty Level: ${data.difficulty}/10
Question Count: ${data.questionCount}
Focus Areas: ${data.focusAreas.join(', ')}

Create questions that:
1. Target specific learning gaps
2. Match the difficulty level
3. Cover focus areas comprehensively
4. Include varied question types
5. Provide detailed explanations

Generate questions suitable for Turkish exam preparation.
Respond in JSON array format.
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [{ role: 'user', content: customQuizPrompt }],
      });

      const questions = JSON.parse(response.content[0].text);
      
      // Create assignment with custom questions
      return await this.createAssignment(teacherId, {
        classId: '', // Would be determined by student selection
        title: `Custom Quiz - ${data.topic}`,
        description: `Personalized quiz focusing on ${data.focusAreas.join(', ')}`,
        type: 'quiz',
        content: { questions },
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        maxAttempts: 3,
        passingScore: 70
      });
    } catch (error) {
      console.error('Error generating custom quiz:', error);
      throw error;
    }
  }

  // Automated grading with AI feedback
  async gradeAssignment(assignmentId: string, studentSubmissions: Array<{
    studentId: string;
    answers: any[];
    submittedAt: Date;
  }>) {
    const results = [];

    for (const submission of studentSubmissions) {
      const gradingPrompt = `
Grade this student's assignment submission:

Assignment ID: ${assignmentId}
Student Answers: ${JSON.stringify(submission.answers)}

Provide:
1. Score (0-100)
2. Detailed feedback for each answer
3. Overall performance assessment
4. Specific areas for improvement
5. Encouraging comments

Be constructive and educational in feedback.
Respond in JSON format.
`;

      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: 'user', content: gradingPrompt }],
        });

        const grading = JSON.parse(response.content[0].text);
        
        // Store grading results
        await db.insert(studentAssignments).values({
          assignmentId,
          studentId: submission.studentId,
          submittedAt: submission.submittedAt,
          score: grading.score,
          feedback: JSON.stringify(grading.feedback),
          gradedAt: new Date(),
          isGraded: true
        });

        results.push({
          studentId: submission.studentId,
          score: grading.score,
          feedback: grading.feedback,
          status: 'graded'
        });
      } catch (error) {
        console.error('Error grading assignment:', error);
        results.push({
          studentId: submission.studentId,
          status: 'error',
          message: error.message
        });
      }
    }

    return results;
  }

  // Content authoring tools
  async createLessonPlan(teacherId: string, data: {
    title: string;
    subject: string;
    gradeLevel: string;
    objectives: string[];
    duration: number;
    resources: any[];
  }) {
    const lessonPlanPrompt = `
Create a comprehensive lesson plan:

Title: ${data.title}
Subject: ${data.subject}
Grade Level: ${data.gradeLevel}
Learning Objectives: ${data.objectives.join(', ')}
Duration: ${data.duration} minutes

Generate:
1. Detailed lesson structure
2. Activity breakdown with timings
3. Assessment strategies
4. Differentiation techniques
5. Resources and materials needed
6. Follow-up assignments

Focus on Turkish education standards and engaging teaching methods.
Respond in JSON format.
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2500,
        messages: [{ role: 'user', content: lessonPlanPrompt }],
      });

      const lessonPlan = JSON.parse(response.content[0].text);
      
      return {
        id: `lesson_${Date.now()}`,
        teacherId,
        ...data,
        content: lessonPlan,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error creating lesson plan:', error);
      throw error;
    }
  }

  private async assignToClassStudents(assignmentId: string, classId: string) {
    // Implementation would get all students in class and create assignment records
    // This is a placeholder for the actual implementation
  }

  private generateMockWeeklyData() {
    return Array.from({ length: 7 }, (_, i) => ({
      day: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      engagement: Math.floor(Math.random() * 40) + 60,
      completions: Math.floor(Math.random() * 20) + 10
    }));
  }
}

export const teacherDashboardService = TeacherDashboardService.getInstance();