// Smart AI-Generated Study Plan Component
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Target, BookOpen, Trophy, CheckCircle, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface StudyPlanProps {
  userId: string;
  userGoals: string[];
  availableTime: number;
  currentLevel: number;
  examDate?: string;
  className?: string;
}

interface StudyPlan {
  weeklyGoal: string;
  dailyTasks: Array<{
    day: string;
    tasks: string[];
    estimatedTime: number;
  }>;
  priorityTopics: string[];
  reviewSchedule: string[];
  milestones: Array<{
    week: number;
    goal: string;
    metrics: string[];
  }>;
}

export default function SmartStudyPlan({
  userId,
  userGoals,
  availableTime,
  currentLevel,
  examDate,
  className = ""
}: StudyPlanProps) {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const generateStudyPlan = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/ai/users/${userId}/study-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userGoals,
          availableTime,
          currentLevel,
          examDate
        })
      });

      const data = await response.json();
      setStudyPlan(data.studyPlan);
      toast({
        title: "Çalışma planı oluşturuldu!",
        description: "AI tarafından kişiselleştirilmiş çalışma planınız hazır."
      });
    } catch (error) {
      console.error('Study Plan Generation Error:', error);
      toast({
        title: "Hata",
        description: "Çalışma planı oluşturulurken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const getCompletionPercentage = () => {
    if (!studyPlan) return 0;
    const totalTasks = studyPlan.dailyTasks.reduce((sum, day) => sum + day.tasks.length, 0);
    return totalTasks > 0 ? (completedTasks.size / totalTasks) * 100 : 0;
  };

  const getCurrentWeekMilestone = () => {
    const currentWeek = Math.ceil(new Date().getDate() / 7);
    return studyPlan?.milestones?.find(m => m.week === currentWeek);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI Çalışma Planı
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Kişiselleştirilmiş öğrenme rotası
          </p>
        </div>
        <Button 
          onClick={generateStudyPlan}
          disabled={isGenerating}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {isGenerating ? 'Oluşturuluyor...' : 'AI Plan Oluştur'}
        </Button>
      </div>

      {/* Study Plan Content */}
      {studyPlan ? (
        <>
          {/* Weekly Goal & Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span>Haftalık Hedef</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium mb-4">{studyPlan.weeklyGoal}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tamamlanan Görevler</span>
                  <span>{completedTasks.size} / {studyPlan.dailyTasks.reduce((sum, day) => sum + day.tasks.length, 0)}</span>
                </div>
                <Progress value={getCompletionPercentage()} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Priority Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Öncelikli Konular</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {studyPlan.priorityTopics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Günlük Görevler</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyPlan.dailyTasks.map((day, dayIndex) => (
                  <motion.div
                    key={dayIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: dayIndex * 0.1 }}
                    className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{day.day}</h4>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{day.estimatedTime}dk</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {day.tasks.map((task, taskIndex) => {
                        const taskId = `${dayIndex}-${taskIndex}`;
                        const isCompleted = completedTasks.has(taskId);
                        
                        return (
                          <div
                            key={taskIndex}
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                              isCompleted 
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => toggleTaskCompletion(taskId)}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isCompleted 
                                ? 'bg-green-600 border-green-600'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}>
                              {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm ${isCompleted ? 'line-through' : ''}`}>
                              {task}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Milestone */}
          {getCurrentWeekMilestone() && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span>Bu Haftanın Milestone'u</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium text-lg">{getCurrentWeekMilestone()?.goal}</h4>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Başarı Metrikleri:</p>
                    <div className="space-y-1">
                      {getCurrentWeekMilestone()?.metrics.map((metric, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                          <span>{metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span>Tekrar Programı</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {studyPlan.reviewSchedule.map((review, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-orange-600">{index + 1}</span>
                    </div>
                    <span className="text-sm">{review}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Kişiselleştirilmiş Çalışma Planı
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              AI tarafından hedeflerinize ve seviyenize özel olarak oluşturulacak çalışma planınızı almak için butona tıklayın.
            </p>
            <Button 
              onClick={generateStudyPlan}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isGenerating ? 'Oluşturuluyor...' : 'AI Çalışma Planı Oluştur'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}