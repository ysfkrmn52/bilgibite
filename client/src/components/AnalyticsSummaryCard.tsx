// Analytics Summary Card Component
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Target, Clock, Zap, Award, 
  BarChart3, Calendar, Brain, Star
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AnalyticsSummary {
  totalXP: number;
  averageAccuracy: number;
  totalStudyTime: number;
  currentStreak: number;
  weeklyGrowth: {
    xp: number;
    accuracy: number;
    studyTime: number;
  };
  topPerformingCategory: {
    name: string;
    accuracy: number;
  };
  weakestArea: {
    name: string;
    accuracy: number;
    priority: 'high' | 'medium' | 'low';
  };
  goalsProgress: {
    completed: number;
    total: number;
  };
}

interface AnalyticsSummaryCardProps {
  userId?: string;
}

export const AnalyticsSummaryCard: React.FC<AnalyticsSummaryCardProps> = ({ 
  userId = 'mock-user-123' 
}) => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['/api/users/', userId, '/analytics/summary'],
    queryFn: async () => {
      // Mock analytics summary data
      return {
        totalXP: 15420,
        averageAccuracy: 86,
        totalStudyTime: 2520, // minutes
        currentStreak: 11,
        weeklyGrowth: {
          xp: 320,
          accuracy: 4,
          studyTime: 180
        },
        topPerformingCategory: {
          name: 'Matematik',
          accuracy: 92
        },
        weakestArea: {
          name: 'Fen Bilgisi',
          accuracy: 65,
          priority: 'high' as const
        },
        goalsProgress: {
          completed: 2,
          total: 3
        }
      } as AnalyticsSummary;
    }
  });

  if (isLoading || !summary) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-2 border-blue-100 dark:border-blue-900 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <BarChart3 className="w-5 h-5" />
            Analytics Özeti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Toplam XP</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.totalXP.toLocaleString()}
                </span>
                {summary.weeklyGrowth.xp > 0 && (
                  <div className="flex items-center gap-1 text-green-500">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs">+{summary.weeklyGrowth.xp}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Ortalama Başarı</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.averageAccuracy}%
                </span>
                {summary.weeklyGrowth.accuracy > 0 && (
                  <div className="flex items-center gap-1 text-green-500">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs">+{summary.weeklyGrowth.accuracy}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Çalışma Süresi</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(summary.totalStudyTime / 60)}h
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">bu ay</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Güncel Seri</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary.currentStreak}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">gün</span>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  En Güçlü Alan
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {summary.topPerformingCategory.name}
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {summary.topPerformingCategory.accuracy}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gelişim Alanı
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {summary.weakestArea.name}
                </span>
                <Badge className={getPriorityColor(summary.weakestArea.priority)}>
                  {summary.weakestArea.accuracy}%
                </Badge>
              </div>
            </div>
          </div>

          {/* Goals Progress */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hedef İlerlemesi
              </span>
            </div>
            <div className="space-y-2">
              <Progress 
                value={(summary.goalsProgress.completed / summary.goalsProgress.total) * 100} 
                className="h-2" 
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {summary.goalsProgress.completed}/{summary.goalsProgress.total} hedef tamamlandı
                </span>
                <span>
                  %{Math.round((summary.goalsProgress.completed / summary.goalsProgress.total) * 100)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Detaylı analiz için Analytics sayfasını ziyaret edin
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};