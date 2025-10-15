// Learning Insights Dashboard Component
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Brain, Target, Clock, BookOpen, Award, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/LoadingSpinner';

interface LearningInsightsProps {
  userId: string;
  className?: string;
}

interface AnalysisData {
  strongAreas: string[];
  weakAreas: string[];
  difficultyRecommendation: 'beginner' | 'intermediate' | 'advanced';
  studyTimeRecommendation: number;
  nextTopics: string[];
  learningPattern: string;
  insights: string[];
}

interface PerformanceData {
  totalQuizzes: number;
  averageScore: number;
  currentLevel: number;
  currentXP: number;
}

export default function LearningInsights({ userId, className = "" }: LearningInsightsProps) {
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const {
    data: analysisData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/ai/users', userId, 'performance'],
    queryFn: async () => {
      const response = await fetch(`/api/ai/users/${userId}/performance`);
      if (!response.ok) {
        throw new Error('Analiz verisi alınamadı');
      }
      return response.json();
    },
    refetchOnWindowFocus: false
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Güncellendi",
        description: "Öğrenme analizi yenilendi."
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Analiz güncellenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="AI analiz yapıyor..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="w-12 h-12 text-orange-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Analiz verisi yüklenirken hata oluştu
          </p>
          <Button onClick={handleRefresh} variant="outline">
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    );
  }

  const analysis: AnalysisData = analysisData?.analysis;
  const performance: PerformanceData = analysisData?.performanceData;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return <TrendingUp className="w-4 h-4" />;
      case 'intermediate': return <Target className="w-4 h-4" />;
      case 'advanced': return <Brain className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Öğrenme Analizi
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kişiselleştirilmiş öğrenme insights'ları
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? 'Güncelleniyor...' : 'Yenile'}
        </Button>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {performance?.totalQuizzes || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Toplam Quiz
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {performance?.averageScore?.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Ortalama Puan
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {performance?.currentLevel || 1}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Seviye
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Brain className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {performance?.currentXP || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Deneyim Puanı
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths & Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Güçlü & Zayıf Alanlar</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Strong Areas */}
            <div>
              <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">
                Güçlü Alanlar
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis?.strongAreas?.map((area, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {area}
                  </Badge>
                )) || <span className="text-gray-500">Veri yok</span>}
              </div>
            </div>

            {/* Weak Areas */}
            <div>
              <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">
                Gelişim Alanları
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis?.weakAreas?.map((area, index) => (
                  <Badge key={index} className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    {area}
                  </Badge>
                )) || <span className="text-gray-500">Veri yok</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span>AI Önerileri</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Difficulty Recommendation */}
            <div>
              <h4 className="font-medium mb-2">Önerilen Zorluk Seviyesi</h4>
              <Badge className={getDifficultyColor(analysis?.difficultyRecommendation || 'intermediate')}>
                {getDifficultyIcon(analysis?.difficultyRecommendation || 'intermediate')}
                <span className="ml-1 capitalize">
                  {analysis?.difficultyRecommendation || 'Orta'}
                </span>
              </Badge>
            </div>

            {/* Study Time */}
            <div>
              <h4 className="font-medium mb-2">Günlük Çalışma Önerisi</h4>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>{analysis?.studyTimeRecommendation || 30} dakika</span>
              </div>
            </div>

            {/* Next Topics */}
            <div>
              <h4 className="font-medium mb-2">Sonraki Konular</h4>
              <div className="space-y-1">
                {analysis?.nextTopics?.map((topic, index) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    {index + 1}. {topic}
                  </div>
                )) || <span className="text-gray-500">Veri yok</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Pattern & Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Öğrenme Pattern'i & İçgörüler</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Learning Pattern */}
          <div>
            <h4 className="font-medium mb-2">Öğrenme Tarzı</h4>
            <p className="text-gray-700 dark:text-gray-300">
              {analysis?.learningPattern || 'Henüz yeterli veri yok'}
            </p>
          </div>

          {/* AI Insights */}
          <div>
            <h4 className="font-medium mb-2">AI İçgörüleri</h4>
            <div className="space-y-2">
              {analysis?.insights?.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                >
                  <Brain className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {insight}
                  </span>
                </motion.div>
              )) || (
                <div className="text-gray-500 text-center py-4">
                  Daha fazla quiz yaparak AI insights'ları açın
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}