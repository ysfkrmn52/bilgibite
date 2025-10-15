import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DuolingoQuizInterface } from "@/components/quiz/DuolingoQuizInterface";
import { QuizResults } from "@/components/quiz/QuizResults";
import QuizLanding from "@/components/quiz/QuizLanding";
import { Question, QuizSession } from "@shared/schema";
import { MOCK_USER_ID } from "@/lib/quiz-data";
import { convertToQuizEngineQuestion } from "@/lib/quiz-engine";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QuizParams {
  categoryId: string;
}

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showResults, setShowResults] = useState(false);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [quizMetrics, setQuizMetrics] = useState<any>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizMode, setQuizMode] = useState<'quick' | 'exam'>('quick');

  // Get category ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('category');

  // Fetch questions for the category with different limits based on mode
  const getQuestionLimit = (mode: 'quick' | 'exam', category: string) => {
    if (mode === 'quick') return 10;
    
    // Real exam question counts
    switch (category) {
      case 'yks': return 120; // TYT: 120 soru
      case 'kpss': return 120; // Genel: 120 soru  
      case 'ehliyet': return 50; // Ehliyet: 50 soru
      default: return 40;
    }
  };
  
  const questionLimit = getQuestionLimit(quizMode, categoryId || '');
  const { data: questions = [], isLoading, error } = useQuery<Question[]>({
    queryKey: ["/api/questions", categoryId, quizMode],
    queryFn: async () => {
      const response = await fetch(`/api/questions?category=${categoryId}&limit=${questionLimit}`);
      return response.json();
    },
    enabled: !!categoryId && quizStarted,
  });

  // Create quiz session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest("POST", "/api/quiz-sessions", sessionData);
      return response.json();
    },
    onSuccess: (session) => {
      setQuizSession(session);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Quiz oturumu oluşturulamadı",
        variant: "destructive",
      });
    },
  });

  // Update quiz session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, updates }: { sessionId: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/quiz-sessions/${sessionId}`, updates);
      return response.json();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Quiz sonucu kaydedilemedi",
        variant: "destructive",
      });
    },
  });

  // Update user progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (progressData: any) => {
      const response = await apiRequest("POST", `/api/users/${MOCK_USER_ID}/progress`, progressData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate progress queries
      queryClient.invalidateQueries({ queryKey: ["/api/users", MOCK_USER_ID, "progress"] });
    },
  });

  // Create quiz session when component mounts
  useEffect(() => {
    if (questions.length > 0 && !quizSession) {
      createSessionMutation.mutate({
        userId: MOCK_USER_ID,
        examCategoryId: categoryId,
        totalQuestions: questions.length,
        questionsAnswered: 0,
        correctAnswers: 0,
        pointsEarned: 0,
        timeSpent: 0,
        isCompleted: false,
      });
    }
  }, [questions, categoryId]);

  const handleQuizExit = () => {
    setLocation("/");
  };

  const handleQuizComplete = (metrics: any) => {
    setQuizMetrics(metrics);
    setShowResults(true);

    // Update quiz session
    if (quizSession) {
      updateSessionMutation.mutate({
        sessionId: quizSession.id,
        updates: {
          questionsAnswered: metrics.questionsCompleted,
          correctAnswers: Math.round(metrics.questionsCompleted * metrics.accuracy / 100),
          pointsEarned: metrics.totalScore,
          timeSpent: Math.floor(metrics.totalTime),
          isCompleted: true,
        },
      });
    }

    // Update user progress
    updateProgressMutation.mutate({
      examCategoryId: categoryId,
      questionsAnswered: metrics.questionsCompleted,
      correctAnswers: Math.round(metrics.questionsCompleted * metrics.accuracy / 100),
      totalPoints: metrics.totalScore,
      studyTimeMinutes: Math.floor(metrics.totalTime / 60),
    });
  };

  const handleStartNewQuiz = () => {
    setShowResults(false);
    setQuizSession(null);
    // Reset and start new quiz
    if (questions.length > 0) {
      createSessionMutation.mutate({
        userId: MOCK_USER_ID,
        examCategoryId: categoryId,
        totalQuestions: questions.length,
        questionsAnswered: 0,
        correctAnswers: 0,
        pointsEarned: 0,
        timeSpent: 0,
        isCompleted: false,
      });
    }
  };

  // Handle quiz start
  const handleStartQuiz = (mode: 'quick' | 'exam' = 'quick') => {
    setQuizMode(mode);
    setQuizStarted(true);
  };

  const handleBackToDashboard = () => {
    setLocation("/exams");
  };

  // Show landing page if quiz hasn't started
  if (!quizStarted) {
    if (!categoryId) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Kategori seçilmedi</p>
            <button 
              onClick={() => setLocation("/exams")}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
            >
              Sınavlara Dön
            </button>
          </div>
        </div>
      );
    }

    return <QuizLanding categoryId={categoryId} onStartQuiz={handleStartQuiz} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Quiz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Quiz yüklenirken hata oluştu</p>
          <button 
            onClick={() => setLocation("/exams")}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
          >
            Sınavlara Dön
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Bu kategori için soru bulunamadı</p>
          <button 
            onClick={() => setLocation("/exams")}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
          >
            Sınavlara Dön
          </button>
        </div>
      </div>
    );
  }

  // Convert questions to quiz engine format
  const quizEngineQuestions = questions.map(convertToQuizEngineQuestion);

  return (
    <>
      <DuolingoQuizInterface
        questions={quizEngineQuestions}
        onExit={handleQuizExit}
        onComplete={handleQuizComplete}
      />
      
      {quizMetrics && (
        <QuizResults
          isOpen={showResults}
          onClose={() => setShowResults(false)}
          metrics={quizMetrics}
          onStartNewQuiz={handleStartNewQuiz}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </>
  );
}
