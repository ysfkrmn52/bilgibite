// AI-Powered Learning Dashboard Page
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, BarChart3, Calendar, BookOpen, Wand2, Home, Save, Database, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AITutorChat from '@/components/ai/AITutorChat';
import LearningInsights from '@/components/ai/LearningInsights';
import SmartStudyPlan from '@/components/ai/SmartStudyPlan';
import AdaptiveDifficultyIndicator from '@/components/ai/AdaptiveDifficultyIndicator';
import AIQuestionGenerator from '@/components/ai/AIQuestionGenerator';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'wouter';

const mockUserId = "mock-user-123";

export default function AILearningPage() {
  const [activeTab, setActiveTab] = useState('insights');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  
  // AI Persistence Data - Saklı verileri göstermek için
  const { data: storedQuestions = [] } = useQuery({
    queryKey: ['/api/ai/users', mockUserId, 'stored-questions'],
    queryFn: async () => {
      const response = await fetch(`/api/ai/users/${mockUserId}/stored-questions`);
      const data = await response.json();
      return data.questions || [];
    }
  });

  const { data: storedStudyPlan } = useQuery({
    queryKey: ['/api/ai/users', mockUserId, 'stored-study-plan'],
    queryFn: async () => {
      const response = await fetch(`/api/ai/users/${mockUserId}/stored-study-plan`);
      const data = await response.json();
      return data.studyPlan;
    }
  });

  const { data: chatHistory = [] } = useQuery({
    queryKey: ['/api/ai/users', mockUserId, 'chat-history'],
    queryFn: async () => {
      const response = await fetch(`/api/ai/users/${mockUserId}/chat-history`);
      const data = await response.json();
      return data.messages || [];
    }
  });

  const { data: storageStats } = useQuery({
    queryKey: ['/api/ai/storage-stats'],
    queryFn: async () => {
      const response = await fetch('/api/ai/storage-stats');
      const data = await response.json();
      return data.stats || {};
    }
  });

  // Fetch exam categories for AI question generator
  const { data: examCategories = [] } = useQuery({
    queryKey: ['/api/exam-categories'],
    queryFn: async () => {
      const response = await fetch('/api/exam-categories');
      return response.json();
    },
    select: (data) => data || []
  });

  const handleQuestionsGenerated = (questions: any[]) => {
    setGeneratedQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header with Navigation & Persistence Stats */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                AI Öğrenme Merkezi
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Yapay zeka destekli kişisel öğrenme deneyimi
              </p>
            </div>
            
            {/* AI Data Persistence Dashboard */}
            <TooltipProvider>
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4 text-green-600" />
                      <Badge variant="secondary" className="text-xs">
                        {storedQuestions.length} Soru
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Kaydedilmiş AI soruları</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <Badge variant="secondary" className="text-xs">
                        {storedStudyPlan ? "Aktif Plan" : "Plan Yok"}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Çalışma planı durumu</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                      <Badge variant="secondary" className="text-xs">
                        {chatHistory.length} Mesaj
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI tutor sohbet geçmişi</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-orange-600" />
                      <Badge variant="outline" className="text-xs">
                        Otomatik Kayıt
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tüm AI verileri otomatik kaydediliyor</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
          
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>Ana Sayfa</span>
              </Button>
            </Link>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Öğrenme Merkezi
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                Yapay zeka destekli kişiselleştirilmiş öğrenme deneyimi
              </p>
            </div>
            
            <div className="w-24"></div>
          </div>
        </motion.div>

        {/* AI Features Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="insights" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analiz</span>
              </TabsTrigger>
              <TabsTrigger value="tutor" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">AI Öğretmen</span>
              </TabsTrigger>
              <TabsTrigger value="plan" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Çalışma Planı</span>
              </TabsTrigger>
              <TabsTrigger value="generator" className="flex items-center space-x-2">
                <Wand2 className="w-4 h-4" />
                <span className="hidden sm:inline">Soru Üretici</span>
              </TabsTrigger>
              <TabsTrigger value="difficulty" className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Zorluk</span>
              </TabsTrigger>
            </TabsList>

            {/* Learning Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <LearningInsights userId={mockUserId} />
              </motion.div>
            </TabsContent>

            {/* AI Tutor Chat Tab */}
            <TabsContent value="tutor" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <div className="lg:col-span-2">
                  <AITutorChat 
                    userId={mockUserId}
                    currentTopic="Genel"
                    userLevel={1}
                    className="h-[600px]"
                  />
                </div>
                <div>
                  <AdaptiveDifficultyIndicator userId={mockUserId} />
                </div>
              </motion.div>
            </TabsContent>

            {/* Study Plan Tab */}
            <TabsContent value="plan" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SmartStudyPlan
                  userId={mockUserId}
                  userGoals={['YKS de yüksek puan alma', 'Matematik konularında güçlenme']}
                  availableTime={60}
                  currentLevel={1}
                />
              </motion.div>
            </TabsContent>

            {/* AI Question Generator Tab */}
            <TabsContent value="generator" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <AIQuestionGenerator
                  userId={mockUserId}
                  examCategories={examCategories}
                  userLevel={1}
                  onQuestionsGenerated={handleQuestionsGenerated}
                />

                {/* Generated Questions Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      <span>Üretilen Sorular</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedQuestions.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {generatedQuestions.length} soru üretildi
                          </span>
                          {generatedQuestions.length > 1 && (
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                disabled={currentQuestionIndex === 0}
                              >
                                ◀ Önceki
                              </Button>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {currentQuestionIndex + 1} / {generatedQuestions.length}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCurrentQuestionIndex(Math.min(generatedQuestions.length - 1, currentQuestionIndex + 1))}
                                disabled={currentQuestionIndex === generatedQuestions.length - 1}
                              >
                                Sonraki ▶
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Current Question Display */}
                        {generatedQuestions[currentQuestionIndex] && (
                          <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
                            <p className="font-medium mb-4 text-lg leading-relaxed">
                              {generatedQuestions[currentQuestionIndex].question}
                            </p>
                            
                            <div className="space-y-2">
                              {generatedQuestions[currentQuestionIndex].options?.map((option: string, optIndex: number) => (
                                <div
                                  key={optIndex}
                                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                    selectedAnswers[currentQuestionIndex] === option.charAt(0)
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }`}
                                  onClick={() => setSelectedAnswers(prev => ({
                                    ...prev,
                                    [currentQuestionIndex]: option.charAt(0)
                                  }))}
                                >
                                  <span className={`font-medium ${
                                    selectedAnswers[currentQuestionIndex] === option.charAt(0)
                                      ? 'text-blue-700 dark:text-blue-300'
                                      : ''
                                  }`}>
                                    {option}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Show answer after selection */}
                            {selectedAnswers[currentQuestionIndex] && (
                              <div className={`mt-4 p-3 rounded-lg ${
                                selectedAnswers[currentQuestionIndex] === generatedQuestions[currentQuestionIndex].correctAnswer
                                  ? 'bg-green-50 border border-green-200 dark:bg-green-900/20'
                                  : 'bg-red-50 border border-red-200 dark:bg-red-900/20'
                              }`}>
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`font-semibold ${
                                    selectedAnswers[currentQuestionIndex] === generatedQuestions[currentQuestionIndex].correctAnswer
                                      ? 'text-green-700 dark:text-green-300'
                                      : 'text-red-700 dark:text-red-300'
                                  }`}>
                                    {selectedAnswers[currentQuestionIndex] === generatedQuestions[currentQuestionIndex].correctAnswer
                                      ? '✅ Doğru!'
                                      : '❌ Yanlış!'}
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Doğru yanıt: {generatedQuestions[currentQuestionIndex].correctAnswer}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  <strong>Açıklama:</strong> {generatedQuestions[currentQuestionIndex].explanation}
                                </p>
                              </div>
                            )}

                            {/* Question Type Info */}
                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                {generatedQuestions[currentQuestionIndex].difficulty || 'Orta'}
                              </span>
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full">
                                {generatedQuestions[currentQuestionIndex].topic || 'Genel'}
                              </span>
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                                Çoktan Seçmeli
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="font-medium mb-2">Henüz soru üretilmedi</p>
                        <p className="text-sm">Sol panelden kategori seçip AI soru üretin</p>
                        <p className="text-xs text-gray-400 mt-2">
                          🎯 AI kişiselleştirilmiş sorular üretecek
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Adaptive Difficulty Tab */}
            <TabsContent value="difficulty" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <AdaptiveDifficultyIndicator userId={mockUserId} />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <span>Zorluk Ayarlama Hakkında</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                        Nasıl Çalışır?
                      </h4>
                      <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                        <li>• Son quiz performansınızı analiz eder</li>
                        <li>• Başarı trendlerinizi takip eder</li>
                        <li>• Optimal zorluk seviyesini önerir</li>
                        <li>• Öğrenme hızınıza göre ayarlar</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Zorluk Seviyeleri
                      </h4>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-green-700 dark:text-green-300">🟢 Başlangıç</span>
                          <span className="text-gray-600 dark:text-gray-400">60-70% başarı</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-700 dark:text-yellow-300">🟡 Orta</span>
                          <span className="text-gray-600 dark:text-gray-400">70-85% başarı</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-red-700 dark:text-red-300">🔴 İleri</span>
                          <span className="text-gray-600 dark:text-gray-400">85%+ başarı</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
}