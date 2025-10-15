import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  Play,
  Trophy,
  Zap,
  Flame,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Star,
  Award,
  ChevronRight,
  Calendar,
  Users,
  Globe
} from 'lucide-react';

// Simplified exam categories
const examCategories = [
  {
    id: "yks",
    title: "YKS",
    description: "Yükseköğretim Kurumları Sınavı",
    color: "from-blue-500 to-purple-600",
    icon: "🎓",
    questionsCount: 450
  },
  {
    id: "kpss",
    title: "KPSS",
    description: "Kamu Personeli Seçme Sınavı", 
    color: "from-green-500 to-teal-600",
    icon: "🏛️",
    questionsCount: 320
  },
  {
    id: "ehliyet",
    title: "Ehliyet",
    description: "Sürücü Kursu Sınavı",
    color: "from-orange-500 to-red-600", 
    icon: "🚗",
    questionsCount: 180
  },
  {
    id: "src",
    title: "SRC",
    description: "Kısa Mesafe Telsiz",
    color: "from-pink-500 to-rose-600",
    icon: "📡",
    questionsCount: 95
  }
];

const recentActivities = [
  { text: "Matematik quizini tamamladı", time: "2 saat önce", score: 85 },
  { text: "7 günlük seri kazandı", time: "1 gün önce", achievement: true },
  { text: "YKS Fizik kategorisinde yeni level", time: "2 gün önce", level: 8 },
];

export default function HomeSimple() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Mock user stats - in real app, fetch from API
  const userStats = {
    totalXP: 2450,
    currentLevel: 12,
    streak: 7,
    completedQuizzes: 45,
    weeklyGoal: 300,
    studyTime: 142
  };

  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi öğlenler";
    return "İyi akşamlar";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {getTimeGreeting()}!
          </h1>
          <p className="text-muted-foreground">
            BilgiBite ile hedeflerine ulaş ✨
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="mb-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="w-5 h-5" />
                  Seviye {userStats.currentLevel}
                </CardTitle>
                <p className="text-blue-100 text-sm">{userStats.totalXP} XP</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>İlerleme</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="bg-blue-400/30" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center">
                      <Flame className="w-5 h-5 mx-auto mb-1 text-orange-300" />
                      <div className="text-lg font-bold">{userStats.streak}</div>
                      <div className="text-xs text-blue-100">Gün Serisi</div>
                    </div>
                    <div className="text-center">
                      <BookOpen className="w-5 h-5 mx-auto mb-1 text-green-300" />
                      <div className="text-lg font-bold">{userStats.completedQuizzes}</div>
                      <div className="text-xs text-blue-100">Quiz</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goal */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4" />
                  Haftalık Hedef
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{userStats.studyTime} dk</span>
                    <span>{userStats.weeklyGoal} dk</span>
                  </div>
                  <Progress value={(userStats.studyTime / userStats.weeklyGoal) * 100} />
                  <p className="text-xs text-muted-foreground">
                    {userStats.weeklyGoal - userStats.studyTime} dakika kaldı
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Son Aktiviteler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      {activity.score && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.score}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-white/50 hover:bg-blue-50 border-blue-200"
                asChild
                data-testid="button-start-quiz"
              >
                <Link href="/quiz">
                  <Play className="w-6 h-6 text-blue-600" />
                  <span className="text-sm">Hızlı Quiz</span>
                </Link>
              </Button>

              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-white/50 hover:bg-green-50 border-green-200"
                asChild
                data-testid="button-analytics"
              >
                <Link href="/analytics">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <span className="text-sm">İstatistikler</span>
                </Link>
              </Button>

              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-white/50 hover:bg-purple-50 border-purple-200"
                asChild
                data-testid="button-achievements"
              >
                <Link href="/profile">
                  <Award className="w-6 h-6 text-purple-600" />
                  <span className="text-sm">Başarımlar</span>
                </Link>
              </Button>

              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-white/50 hover:bg-orange-50 border-orange-200"
                asChild
                data-testid="button-ai-learning"
              >
                <Link href="/ai-learning">
                  <Zap className="w-6 h-6 text-orange-600" />
                  <span className="text-sm">AI Öğretmen</span>
                </Link>
              </Button>
            </div>

            {/* Exam Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sınav Kategorileri</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard">
                      Tümü
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Hazırlanmak istediğin sınavı seç ve hemen başla
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {examCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group cursor-pointer"
                    >
                      <Card className={`bg-gradient-to-r ${category.color} text-white border-0 hover:shadow-lg transition-all`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-2xl">{category.icon}</div>
                            <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                              {category.questionsCount} soru
                            </Badge>
                          </div>
                          <h3 className="text-lg font-bold mb-1">{category.title}</h3>
                          <p className="text-sm text-white/80 mb-3">{category.description}</p>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                            asChild
                            data-testid={`button-start-${category.id}`}
                          >
                            <Link href={`/quiz?category=${category.id}`}>
                              Quiz Başlat
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Bugünün Özeti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">25</div>
                    <div className="text-sm text-muted-foreground">Dakika Çalıştın</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <Star className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">18</div>
                    <div className="text-sm text-muted-foreground">Doğru Cevap</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">85%</div>
                    <div className="text-sm text-muted-foreground">Başarı Oranı</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}