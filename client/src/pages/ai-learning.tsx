// AI-Powered Learning Dashboard Page with Data Persistence
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, BarChart3, Calendar, BookOpen, Wand2, Home, Save, Database, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AITutorChat from '@/components/ai/AITutorChat';
import LearningInsights from '@/components/ai/LearningInsights';
import SmartStudyPlan from '@/components/ai/SmartStudyPlan';
import AdaptiveDifficultyIndicator from '@/components/ai/AdaptiveDifficultyIndicator';
import AIQuestionGenerator from '@/components/ai/AIQuestionGenerator';
import { useQuery } from '@tanstack/react-query';
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
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  AI Öğrenme Merkezi
                </h1>
              </div>
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
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
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

            {/* Learning Performance Analysis */}
            <TabsContent value="insights" className="space-y-6">
              <motion.div
                variants={itemVariants}
                className="space-y-6"
              >
                <LearningInsights userId={mockUserId} />
              </motion.div>
            </TabsContent>

            {/* AI Tutor */}
            <TabsContent value="tutor" className="space-y-6">
              <motion.div
                variants={itemVariants}
                className="space-y-6"
              >
                <AITutorChat 
                  userId={mockUserId}
                  existingHistory={chatHistory}
                />
              </motion.div>
            </TabsContent>

            {/* Smart Study Plan */}
            <TabsContent value="plan" className="space-y-6">
              <motion.div
                variants={itemVariants}
                className="space-y-6"
              >
                <SmartStudyPlan 
                  userId={mockUserId}
                  existingPlan={storedStudyPlan}
                />
              </motion.div>
            </TabsContent>

            {/* AI Question Generator */}
            <TabsContent value="generator" className="space-y-6">
              <motion.div
                variants={itemVariants}
                className="space-y-6"
              >
                <AIQuestionGenerator
                  userId={mockUserId}
                  examCategories={examCategories}
                  onQuestionsGenerated={handleQuestionsGenerated}
                  existingQuestions={storedQuestions}
                />
              </motion.div>
            </TabsContent>

            {/* Adaptive Difficulty */}
            <TabsContent value="difficulty" className="space-y-6">
              <motion.div
                variants={itemVariants}
                className="space-y-6"
              >
                <AdaptiveDifficultyIndicator userId={mockUserId} />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
}