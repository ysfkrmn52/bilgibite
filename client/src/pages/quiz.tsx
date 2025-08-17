import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DuolingoQuizInterface } from "@/components/quiz/DuolingoQuizInterface";
import { QuizResults } from "@/components/quiz/QuizResults";
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

  // Get category ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryId = urlParams.get('category');

  // Fetch questions for the category
  const { data: questions = [], isLoading, error } = useQuery<Question[]>({
    queryKey: ["/api/questions", categoryId],
    enabled: !!categoryId,
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

  const handleBackToDashboard = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-dark">Quiz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-dark mb-4">Quiz soruları yüklenemedi.</p>
          <button
            onClick={handleBackToDashboard}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Ana Sayfaya Dön
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
