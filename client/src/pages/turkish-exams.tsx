// Turkish Exam Preparation Page
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BookOpen, Clock, Target, TrendingUp, Award, Brain, Users, 
  Calendar, Play, Pause, RotateCcw, CheckCircle, AlertCircle,
  Timer, Zap, Star, Trophy, ChevronRight, BarChart3, FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Types
interface TurkishExamCategory {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  icon: string;
  color: string;
  examDuration: number;
  totalQuestions: number;
  passingScore: string;
  officialExamDates: string[] | null;
  subjects: string[];
  examFormat: any;
  isActive: boolean;
}

interface ExamQuestion {
  id: string;
  categoryId: string;
  subject: string;
  topic: string;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: number;
  mediaUrl?: string;
  tags: string[];
  officialSource: string;
}

interface MockExamSession {
  id: string;
  categoryId: string;
  title: string;
  totalQuestions: number;
  duration: number;
  questions?: ExamQuestion[];
  examInfo: {
    categoryName: string;
    totalDuration: number;
    questionCount: number;
    scoringSystem: string;
    negativeScoring: boolean;
    instructions: string[];
  };
}

const TurkishExams: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeExam, setActiveExam] = useState<MockExamSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [examStartTime, setExamStartTime] = useState<number>(0);
  const [isExamActive, setIsExamActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [examResults, setExamResults] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Turkish exam categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/turkish-exams/categories'],
    queryFn: async () => {
      const response = await fetch('/api/turkish-exams/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return data.categories as TurkishExamCategory[];
    }
  });

  // Create mock exam session
  const createExamMutation = useMutation({
    mutationFn: async (examData: any) => {
      const response = await fetch('/api/users/mock-user-123/turkish-exams/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData)
      });
      if (!response.ok) throw new Error('Failed to create exam session');
      return response.json();
    },
    onSuccess: (data) => {
      setActiveExam(data);
      setTimeRemaining(data.session.duration);
      setExamStartTime(Date.now());
      setIsExamActive(true);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      toast({
        title: "Sınav Başladı",
        description: `${data.examInfo.categoryName} sınavına başladınız. Başarılar!`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: "Sınav oturumu oluşturulamadı",
        variant: "destructive"
      });
    }
  });

  // Submit exam answers
  const submitExamMutation = useMutation({
    mutationFn: async (submissionData: any) => {
      const response = await fetch('/api/users/mock-user-123/turkish-exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      if (!response.ok) throw new Error('Failed to submit exam');
      return response.json();
    },
    onSuccess: (data) => {
      setExamResults(data.results);
      setShowResults(true);
      setIsExamActive(false);
      toast({
        title: "Sınav Tamamlandı",
        description: `Skorunuz: ${data.results.percentageScore}%`
      });
    }
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isExamActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isExamActive, isPaused, timeRemaining]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 ? 
      `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` :
      `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Start exam
  const handleStartExam = (categoryId: string, sessionType: string = 'full_mock') => {
    const category = categories?.find(c => c.id === categoryId);
    if (!category) return;

    createExamMutation.mutate({
      categoryId,
      sessionType,
      questionCount: category.totalQuestions,
      timeLimit: category.examDuration * 60,
      examEnvironment: {
        strictTiming: true,
        noBacktrack: false,
        showTimer: true,
        fullScreen: false
      }
    });
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navigate questions
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < (activeExam?.questions?.length || 0)) {
      setCurrentQuestionIndex(index);
    }
  };

  // Submit exam
  const handleSubmitExam = () => {
    if (!activeExam) return;
    
    const timeSpent = Math.round((Date.now() - examStartTime) / 1000);
    const answerArray = (activeExam.questions || []).map((q, index) => ({
      questionId: q.id,
      selectedAnswer: userAnswers[q.id] || '',
      timeSpent: Math.round(timeSpent / (activeExam.questions?.length || 1))
    }));

    submitExamMutation.mutate({
      sessionId: activeExam.id,
      userAnswers: answerArray,
      timeSpent,
      examEnvironment: {
        tabSwitches: 0,
        violations: []
      }
    });
  };

  // Get current question
  const currentQuestion = activeExam?.questions?.[currentQuestionIndex];
  const totalQuestions = activeExam?.questions?.length || 0;
  const answeredCount = Object.keys(userAnswers).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🇹🇷 Turkish Exam Preparation
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              YKS, KPSS, Ehliyet ve SRC sınavlarına hazırlan
            </p>
          </div>
          
          {isExamActive && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Kalan Süre</p>
                <p className={`text-xl font-mono font-bold ${timeRemaining < 300 ? 'text-red-500' : 'text-blue-600'}`}>
                  {formatTime(timeRemaining)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center gap-2"
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? 'Devam' : 'Duraklat'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {!isExamActive ? (
          // Exam Selection View
          <div className="space-y-6">
            {/* Exam Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-400"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            {category.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {category.type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {category.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Soru Sayısı</p>
                          <p className="font-semibold">{category.totalQuestions}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Süre</p>
                          <p className="font-semibold">{category.examDuration} dk</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Geçme Notu</p>
                          <p className="font-semibold">{category.passingScore}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Konu Sayısı</p>
                          <p className="font-semibold">{category.subjects.length}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Button 
                          className="w-full"
                          style={{ backgroundColor: category.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartExam(category.id, 'full_mock');
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Tam Sınav Başla
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartExam(category.id, 'subject_practice');
                          }}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Konu Çalışması
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Official Exam Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  2025 Resmi Sınav Tarihleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200">YKS TYT</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">14-15 Haziran 2025</p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <h3 className="font-semibold text-red-800 dark:text-red-200">YKS AYT</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">21-22 Haziran 2025</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h3 className="font-semibold text-green-800 dark:text-green-200">KPSS</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">13 Temmuz 2025</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-200">SRC</h3>
                    <p className="text-sm text-purple-600 dark:text-purple-400">15 Mart, Haziran, Eylül</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Active Exam View
          <div className="space-y-6">
            {/* Exam Progress Header */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {activeExam?.examInfo.categoryName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Soru {currentQuestionIndex + 1} / {totalQuestions}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Cevaplanan</p>
                      <p className="text-lg font-bold text-green-600">{answeredCount}/{totalQuestions}</p>
                    </div>
                    <Progress 
                      value={(currentQuestionIndex + 1) / totalQuestions * 100} 
                      className="w-32" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {currentQuestion && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Content */}
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{currentQuestion.subject}</Badge>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Timer className="w-4 h-4" />
                          ~{Math.round(currentQuestion.timeEstimate / 60)} dk
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Question Text */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                          {currentQuestion.questionText}
                        </h3>
                        
                        {currentQuestion.mediaUrl && (
                          <div className="mb-4">
                            <img 
                              src={currentQuestion.mediaUrl} 
                              alt="Soru görseli" 
                              className="max-w-full h-auto rounded-lg"
                            />
                          </div>
                        )}
                      </div>

                      {/* Answer Options */}
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                          const optionLetter = String.fromCharCode(65 + index); // A, B, C, D, E
                          const isSelected = userAnswers[currentQuestion.id] === option;
                          
                          return (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <button
                                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                }`}
                                onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                    isSelected 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                  }`}>
                                    {optionLetter}
                                  </div>
                                  <span className="text-gray-900 dark:text-white">{option}</span>
                                </div>
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex justify-between pt-4">
                        <Button
                          variant="outline"
                          onClick={() => goToQuestion(currentQuestionIndex - 1)}
                          disabled={currentQuestionIndex === 0}
                        >
                          Önceki Soru
                        </Button>
                        
                        <div className="flex gap-2">
                          {currentQuestionIndex === totalQuestions - 1 ? (
                            <Button
                              onClick={handleSubmitExam}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={submitExamMutation.isPending}
                            >
                              {submitExamMutation.isPending ? 'Gönderiliyor...' : 'Sınavı Bitir'}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => goToQuestion(currentQuestionIndex + 1)}
                              disabled={currentQuestionIndex === totalQuestions - 1}
                            >
                              Sonraki Soru
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Question Navigation Sidebar */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle className="text-base">Soru Navigasyonu</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: totalQuestions }, (_, index) => {
                          const isAnswered = activeExam?.questions?.[index] && userAnswers[activeExam.questions[index].id];
                          const isCurrent = index === currentQuestionIndex;
                          
                          return (
                            <button
                              key={index}
                              onClick={() => goToQuestion(index)}
                              className={`w-8 h-8 rounded text-sm font-medium transition-all ${
                                isCurrent 
                                  ? 'bg-blue-500 text-white' 
                                  : isAnswered
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {index + 1}
                            </button>
                          );
                        })}
                      </div>
                      
                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded"></div>
                          <span>Cevaplanmış</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
                          <span>Cevaplanmamış</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span>Mevcut Soru</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Dialog */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Sınav Sonuçları</DialogTitle>
              <DialogDescription>
                Performansınızı detaylı olarak inceleyin
              </DialogDescription>
            </DialogHeader>
            
            {examResults && (
              <div className="space-y-6">
                {/* Score Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{examResults.percentageScore}%</p>
                    <p className="text-sm text-blue-500">Genel Başarı</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{examResults.correctAnswers}</p>
                    <p className="text-sm text-green-500">Doğru</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{examResults.wrongAnswers}</p>
                    <p className="text-sm text-red-500">Yanlış</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">{examResults.emptyAnswers}</p>
                    <p className="text-sm text-gray-500">Boş</p>
                  </div>
                </div>

                {/* Subject Breakdown */}
                {examResults.subjectBreakdown && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Konu Bazında Performans</h3>
                    <div className="space-y-3">
                      {Object.entries(examResults.subjectBreakdown).map(([subject, data]: [string, any]) => (
                        <div key={subject} className="flex items-center justify-between">
                          <span className="font-medium">{subject}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm">{data.correct}/{data.total}</span>
                            <Progress value={data.accuracy} className="w-24" />
                            <span className="text-sm font-medium w-12">{data.accuracy.toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button onClick={() => setShowResults(false)}>
                    Sonuçları Kapat
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowResults(false);
                      setActiveExam(null);
                      setUserAnswers({});
                      setCurrentQuestionIndex(0);
                    }}
                  >
                    Yeni Sınav Başla
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TurkishExams;