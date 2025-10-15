// Turkish Exam API Routes
import { Request, Response } from "express";
import { z } from "zod";
import { TurkishExamService } from "./turkish-exam-service";
import crypto from 'crypto';

// Validation schemas
const mockExamRequestSchema = z.object({
  categoryId: z.string(),
  sessionType: z.enum(['full_mock', 'subject_practice', 'timed_practice', 'adaptive_practice']),
  subjects: z.array(z.string()).optional(),
  questionCount: z.number().min(10).max(200).default(50),
  timeLimit: z.number().optional(), // seconds
  examEnvironment: z.object({
    strictTiming: z.boolean().default(true),
    noBacktrack: z.boolean().default(false),
    showTimer: z.boolean().default(true),
    fullScreen: z.boolean().default(false)
  }).optional()
});

const submitExamSchema = z.object({
  sessionId: z.string(),
  userAnswers: z.array(z.object({
    questionId: z.string(),
    selectedAnswer: z.string(),
    timeSpent: z.number()
  })),
  timeSpent: z.number(),
  examEnvironment: z.object({
    tabSwitches: z.number().default(0),
    violations: z.array(z.string()).default([])
  }).optional()
});

const examRegistrationSchema = z.object({
  categoryId: z.string(),
  examDate: z.string(),
  targetScore: z.number().min(0).max(500),
  preparationLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate')
});

// Get Turkish exam categories
export const getTurkishExamCategories = async (req: Request, res: Response) => {
  try {
    const categories = TurkishExamService.getExamCategories();
    
    res.json({
      success: true,
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        type: category.type,
        description: category.description,
        icon: category.icon,
        color: category.color,
        examDuration: category.examDuration,
        totalQuestions: category.totalQuestions,
        passingScore: category.passingScore,
        officialExamDates: category.officialExamDates,
        subjects: category.subjects,
        examFormat: category.examFormat
      })),
      totalCount: categories.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Sınav kategorileri alınamadı',
      details: error.message
    });
  }
};

// Get exam questions for practice
export const getExamQuestions = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { count, subject, difficulty } = req.query;
    
    const questionCount = parseInt(count as string) || 20;
    const questions = TurkishExamService.generateExamQuestions(categoryId, questionCount);
    
    // Filter by subject if specified
    const filteredQuestions = subject ? 
      questions.filter(q => q.subject === subject) : 
      questions;
    
    // Filter by difficulty if specified
    const finalQuestions = difficulty ?
      filteredQuestions.filter(q => q.difficulty === difficulty) :
      filteredQuestions;

    res.json({
      success: true,
      questions: finalQuestions.slice(0, questionCount),
      categoryId,
      totalQuestions: finalQuestions.length,
      metadata: {
        subjects: Array.from(new Set(finalQuestions.map(q => q.subject))),
        difficulties: Array.from(new Set(finalQuestions.map(q => q.difficulty))),
        avgTimeEstimate: Math.round(finalQuestions.reduce((sum, q) => sum + (q.timeEstimate || 60), 0) / finalQuestions.length)
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Sorular alınamadı',
      details: error.message
    });
  }
};

// Create mock exam session
export const createMockExamSession = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || 'mock-user-123';
    const examData = mockExamRequestSchema.parse(req.body);
    
    const category = TurkishExamService.getExamCategories().find(c => c.id === examData.categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Sınav kategorisi bulunamadı'
      });
    }

    const questions = TurkishExamService.generateExamQuestions(
      examData.categoryId, 
      examData.questionCount
    );

    const sessionId = crypto.randomUUID();
    const duration = examData.timeLimit || (category.examDuration || 60) * 60; // Convert to seconds

    const mockSession = {
      id: sessionId,
      userId,
      categoryId: examData.categoryId,
      sessionType: examData.sessionType,
      title: `${category.name} - ${examData.sessionType === 'full_mock' ? 'Tam Sınav' : 'Konu Çalışması'}`,
      totalQuestions: questions.length,
      duration,
      startedAt: new Date(),
      completedAt: null,
      score: null,
      correctAnswers: null,
      wrongAnswers: null,
      emptyAnswers: null,
      timeSpent: null,
      subjectBreakdown: null,
      questionIds: questions.map(q => q.id),
      userAnswers: null,
      isCompleted: false,
      examEnvironment: {
        strictTiming: examData.examEnvironment?.strictTiming || true,
        noBacktrack: examData.examEnvironment?.noBacktrack || false,
        showTimer: examData.examEnvironment?.showTimer || true,
        fullScreen: examData.examEnvironment?.fullScreen || false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json({
      success: true,
      session: mockSession,
      questions: questions.map(q => ({
        ...q,
        explanation: null // Hide explanations during exam
      })),
      examInfo: {
        categoryName: category.name,
        totalDuration: duration,
        questionCount: questions.length,
        scoringSystem: (category.examFormat as any)?.scoringSystem || 'percentage',
        negativeScoring: (category.examFormat as any)?.negativeScoring || false,
        instructions: [
          'Sınavı bitirmeden önce tüm sorularınızı kontrol edin',
          'Her soru için yeterli zaman ayırın',
          'Emin olmadığınız sorulara geri dönmeyi unutmayın',
          'Negatif puanlama varsa boş bırakabileceğiniz soruları değerlendirin'
        ]
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Sınav oturumu oluşturulamadı',
      details: error.message
    });
  }
};

// Submit exam answers and get results
export const submitExamSession = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || 'mock-user-123';
    const submissionData = submitExamSchema.parse(req.body);
    
    // Get session (mock data for now)
    const sessionId = submissionData.sessionId;
    
    // Calculate results
    const questions = TurkishExamService.generateExamQuestions('yks-tyt', 50); // Mock data
    const userAnswers = submissionData.userAnswers;
    
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let emptyAnswers = 0;
    
    const detailedResults = userAnswers.map(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      const isCorrect = question && question.correctAnswer === answer.selectedAnswer;
      
      if (answer.selectedAnswer === '') {
        emptyAnswers++;
      } else if (isCorrect) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
      
      return {
        questionId: answer.questionId,
        question: question?.questionText,
        userAnswer: answer.selectedAnswer,
        correctAnswer: question?.correctAnswer,
        isCorrect,
        explanation: question?.explanation,
        subject: question?.subject,
        timeSpent: answer.timeSpent
      };
    });

    // Calculate score based on Turkish exam systems
    const totalQuestions = userAnswers.length;
    const netScore = correctAnswers - (wrongAnswers * 0.25); // YKS style negative scoring
    const percentageScore = (correctAnswers / totalQuestions) * 100;
    
    // Subject breakdown
    const subjectBreakdown = detailedResults.reduce((acc, result) => {
      if (!result.subject) return acc;
      
      if (!acc[result.subject]) {
        acc[result.subject] = { correct: 0, total: 0, accuracy: 0 };
      }
      
      acc[result.subject].total++;
      if (result.isCorrect) {
        acc[result.subject].correct++;
      }
      acc[result.subject].accuracy = (acc[result.subject].correct / acc[result.subject].total) * 100;
      
      return acc;
    }, {} as Record<string, any>);

    const examResults = {
      sessionId,
      userId,
      completedAt: new Date(),
      score: netScore,
      percentageScore: percentageScore.toFixed(1),
      correctAnswers,
      wrongAnswers,
      emptyAnswers,
      totalQuestions,
      timeSpent: submissionData.timeSpent,
      subjectBreakdown,
      detailedResults,
      statistics: {
        averageTimePerQuestion: Math.round(submissionData.timeSpent / totalQuestions),
        accuracy: percentageScore.toFixed(1),
        efficiency: (correctAnswers / (submissionData.timeSpent / 60)).toFixed(2) // Questions per minute
      },
      recommendations: [
        'Zayıf olduğunuz konulara odaklanın',
        'Zaman yönetiminizi geliştirin',
        'Daha fazla deneme sınavı çözün'
      ],
      examEnvironment: submissionData.examEnvironment
    };

    res.json({
      success: true,
      results: examResults,
      message: 'Sınav başarıyla tamamlandı'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Sınav sonuçları hesaplanamadı',
      details: error.message
    });
  }
};

// Get exam statistics and performance data
export const getExamStatistics = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const userId = req.query.userId || 'mock-user-123';
    
    const stats = TurkishExamService.getExamStatistics(categoryId);
    
    // User-specific performance (mock data)
    const userPerformance = {
      attemptCount: 15,
      averageScore: 78.5,
      bestScore: 95.2,
      improvementRate: 12.3,
      weeklyProgress: [65, 70, 72, 75, 78],
      strongSubjects: ['Türkçe', 'Sosyal Bilimler'],
      weakSubjects: ['Matematik', 'Fen Bilimleri'],
      timeSpentTotal: 2840, // minutes
      lastExamDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      recommendedStudyHours: 25
    };

    res.json({
      success: true,
      statistics: {
        exam: stats,
        user: userPerformance,
        comparison: {
          aboveAverage: userPerformance.averageScore > stats.averageScore,
          percentile: Math.round((userPerformance.averageScore / stats.averageScore) * 100),
          competitivePosition: userPerformance.averageScore > stats.topUniversityThreshold ? 'excellent' : 
                              userPerformance.averageScore > stats.averageScore ? 'good' : 'needs_improvement'
        }
      },
      categoryId
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'İstatistikler alınamadı',
      details: error.message
    });
  }
};

// Register for exam and create study plan
export const registerForExam = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || 'mock-user-123';
    const registrationData = examRegistrationSchema.parse(req.body);
    
    const category = TurkishExamService.getExamCategories().find(c => c.id === registrationData.categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Sınav kategorisi bulunamadı'
      });
    }

    const examDate = new Date(registrationData.examDate);
    const today = new Date();
    const remainingDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (remainingDays < 0) {
      return res.status(400).json({
        success: false,
        error: 'Geçmiş bir tarih için kayıt oluşturamazsınız'
      });
    }

    // Generate study plan based on exam type and remaining time
    const studyPlan = generateStudyPlan(registrationData.categoryId, remainingDays, registrationData.preparationLevel);
    
    const registration = {
      id: crypto.randomUUID(),
      userId,
      categoryId: registrationData.categoryId,
      examDate,
      registrationDate: new Date(),
      targetScore: registrationData.targetScore,
      studyPlan,
      remainingDays,
      preparationLevel: registrationData.preparationLevel,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json({
      success: true,
      registration,
      studyPlan,
      message: `${category.name} sınavına başarıyla kayıt oldunuz`
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Sınav kaydı oluşturulamadı',
      details: error.message
    });
  }
};

// Get success prediction
export const getSuccessPrediction = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || 'mock-user-123';
    const { categoryId, currentScore, targetScore, studyHours, examDate } = req.query;
    
    if (!categoryId || !currentScore || !targetScore || !examDate) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli parametreler eksik'
      });
    }

    const examDateObj = new Date(examDate as string);
    const daysUntilExam = Math.ceil((examDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    const prediction = TurkishExamService.calculateSuccessProbability(
      categoryId as string,
      parseInt(currentScore as string),
      parseInt(targetScore as string),
      parseInt(studyHours as string) || 20,
      daysUntilExam
    );

    res.json({
      success: true,
      prediction,
      analysis: {
        daysRemaining: daysUntilExam,
        requiredDailyStudy: Math.ceil((prediction.requiredStudyHours || 0) / (daysUntilExam / 7)),
        difficultyLevel: daysUntilExam < 30 ? 'high' : daysUntilExam < 60 ? 'medium' : 'low',
        motivation: parseFloat(prediction.successProbability) > 70 ? 
          'Hedefine ulaşma ihtimalin yüksek!' : 
          'Daha çok çalışman gerekiyor.'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Başarı tahmini hesaplanamadı',
      details: error.message
    });
  }
};

// Helper function to generate study plans
function generateStudyPlan(categoryId: string, remainingDays: number, level: string) {
  const dailyHours = level === 'beginner' ? 2 : level === 'intermediate' ? 3 : 4;
  const weeksRemaining = Math.ceil(remainingDays / 7);
  
  const basePlans: { [key: string]: any } = {
    'yks-tyt': {
      subjects: ['Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilimler'],
      distribution: { 'Matematik': 0.35, 'Türkçe': 0.25, 'Fen Bilimleri': 0.25, 'Sosyal Bilimler': 0.15 },
      weeklyGoals: [
        'Temel konuları tamamla',
        'Konu testleri çöz',
        'Deneme sınavları yap',
        'Zayıf konuları tekrar et'
      ]
    },
    'kpss-genel': {
      subjects: ['Genel Yetenek', 'Genel Kültür'],
      distribution: { 'Genel Yetenek': 0.55, 'Genel Kültür': 0.45 },
      weeklyGoals: [
        'Sayısal yetenek çalış',
        'Güncel olayları takip et',
        'Test çöz',
        'Eksik konuları tamamla'
      ]
    },
    'ehliyet-teorik': {
      subjects: ['Trafik Kuralları', 'İlk Yardım', 'Motor ve Araç Tekniği'],
      distribution: { 'Trafik Kuralları': 0.6, 'İlk Yardım': 0.25, 'Motor ve Araç Tekniği': 0.15 },
      weeklyGoals: [
        'Trafik işaretlerini ezberle',
        'İlk yardım videolarını izle',
        'Deneme sınavları çöz'
      ]
    }
  };

  const plan = basePlans[categoryId] || basePlans['yks-tyt'];
  
  return {
    totalWeeks: weeksRemaining,
    dailyStudyHours: dailyHours,
    subjectDistribution: plan.distribution,
    weeklySchedule: plan.weeklyGoals,
    milestones: generateMilestones(remainingDays),
    resources: [
      'Resmi sınav soruları',
      'Deneme sınavları',
      'Konu anlatım videoları',
      'Test kitapları'
    ]
  };
}

function generateMilestones(remainingDays: number): Array<{day: number, title: string, description: string}> {
  const milestones: Array<{day: number, title: string, description: string}> = [];
  const intervals = [
    Math.floor(remainingDays * 0.25),
    Math.floor(remainingDays * 0.5),
    Math.floor(remainingDays * 0.75),
    remainingDays - 7
  ];

  intervals.forEach((day, index) => {
    if (day > 0) {
      milestones.push({
        day: remainingDays - day,
        title: ['Temel Konular', 'Orta Seviye', 'İleri Seviye', 'Son Tekrar'][index],
        description: ['Temel konuları bitir', 'Deneme sınavlarına başla', 'Zor soruları çöz', 'Son tekrarları yap'][index]
      });
    }
  });

  return milestones;
}