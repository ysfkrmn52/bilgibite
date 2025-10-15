// Adaptive Difficulty Indicator Component
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Brain, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AdaptiveDifficultyProps {
  userId: string;
  className?: string;
}

interface DifficultyData {
  newDifficulty: 'beginner' | 'intermediate' | 'advanced';
  reasoning: string;
  adjustmentFactor: number;
  currentPerformance: {
    averageScore: number;
    quizCount: number;
    trend: number;
  };
}

export default function AdaptiveDifficultyIndicator({ userId, className = "" }: AdaptiveDifficultyProps) {
  const [difficultyData, setDifficultyData] = useState<DifficultyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchDifficultyAdjustment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ai/users/${userId}/difficulty`);
      const data = await response.json();
      
      if (data.success) {
        setDifficultyData({
          newDifficulty: data.adjustment.newDifficulty,
          reasoning: data.adjustment.reasoning,
          adjustmentFactor: data.adjustment.adjustmentFactor,
          currentPerformance: data.currentPerformance
        });
      }
    } catch (error) {
      console.error('Difficulty adjustment fetch error:', error);
      toast({
        title: "Hata",
        description: "Zorluk analizi yüklenirken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDifficultyAdjustment();
  }, [userId]);

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
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: number, average: number) => {
    if (trend > average) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (trend < average) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Target className="w-4 h-4 text-gray-600" />;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!difficultyData) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center h-32 text-center">
          <BarChart3 className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Daha fazla quiz yaparak zorluk analizi açın
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>Adaptif Zorluk</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Difficulty */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Önerilen Seviye:</span>
          <Badge className={getDifficultyColor(difficultyData.newDifficulty)}>
            {getDifficultyIcon(difficultyData.newDifficulty)}
            <span className="ml-1 capitalize">{difficultyData.newDifficulty}</span>
          </Badge>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Ortalama Puan:</span>
            <div className="flex items-center space-x-1">
              <span className="font-medium">
                {difficultyData.currentPerformance.averageScore.toFixed(1)}%
              </span>
              {getTrendIcon(
                difficultyData.currentPerformance.trend,
                difficultyData.currentPerformance.averageScore
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Quiz Sayısı:</span>
            <span className="font-medium">{difficultyData.currentPerformance.quizCount}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Son Trend:</span>
            <span className="font-medium">
              {difficultyData.currentPerformance.trend.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Adjustment Factor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Ayarlama Faktörü:</span>
            <span className="font-medium">
              {(difficultyData.adjustmentFactor * 100).toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={difficultyData.adjustmentFactor * 100} 
            className="h-2"
          />
        </div>

        {/* AI Reasoning */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            AI Analizi:
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {difficultyData.reasoning}
          </p>
        </div>

        {/* Refresh Button */}
        <Button 
          onClick={fetchDifficultyAdjustment}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Yeniden Analiz Et
        </Button>
      </CardContent>
    </Card>
  );
}