import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
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
  Globe,
  Newspaper,
  GraduationCap,
  Heart,
  Sparkles
} from 'lucide-react';


// MEB News Mock Data
const mebNews = [
  {
    id: "1",
    title: "2025 YKS Takvimi Açıklandı",
    summary: "Üniversite sınavının tarihleri ve yeni değişiklikler duyuruldu.",
    date: "2025-08-15",
    category: "YKS",
    url: "#"
  },
  {
    id: "2", 
    title: "KPSS Müfredat Güncellemesi",
    summary: "Kamu personel seçme sınavında yeni konular eklendi.",
    date: "2025-08-14",
    category: "KPSS",
    url: "#"
  },
  {
    id: "3",
    title: "Dijital Eğitim Platformları Desteklenecek",
    summary: "MEB'den online öğrenme platformları için yeni destekler.",
    date: "2025-08-13", 
    category: "Eğitim",
    url: "#"
  }
];

export default function SimplifiedHome() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { currentUser } = useAuth();
  const [weeklyGoal, setWeeklyGoal] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get real user data
  const userId = currentUser?.uid || 'demo-user-123';
  
  const { data: userProgress = [] } = useQuery({
    queryKey: ['/api/users', userId, 'progress'],
    enabled: !!userId
  });

  const { data: userStats = null } = useQuery({
    queryKey: ['/api/users', userId, 'stats'],
    enabled: !!userId
  });

  // Calculate real user statistics or use defaults for new users
  const currentStats = {
    totalXP: (userStats as any)?.totalXP || 0,
    currentLevel: (userStats as any)?.currentLevel || 1,
    streak: (userStats as any)?.streak || 0,
    completedQuizzes: Array.isArray(userProgress) ? userProgress.length : 0,
    weeklyGoal: weeklyGoal,
    studyTime: (userStats as any)?.studyTime || 0,
    todayStudyTime: (userStats as any)?.todayStudyTime || 0,
    correctAnswers: (userStats as any)?.correctAnswers || 0,
    successRate: (userStats as any)?.successRate || 0,
    levelProgress: (userStats as any)?.levelProgress || 0
  };

  // Free user ad component
  const AdBanner = () => {
    if ((currentUser as any)?.subscription_type === 'premium') return null;
    
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📚</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Premium'a geç, reklamları kaldır!</p>
              <p className="text-xs text-gray-600">Sınırsız quiz, AI öğretmen ve daha fazlası</p>
            </div>
            <Button size="sm" variant="outline">Yükselt</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi öğlenler";
    return "İyi akşamlar";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
          <p className="text-muted-foreground text-lg">
            BilgiBite ile hedeflerine ulaş ✨
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          
          {/* Left Sidebar - User Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Level Card */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="w-5 h-5" />
                  Seviye {currentStats.currentLevel}
                </CardTitle>
                <p className="text-blue-100 text-sm">{currentStats.totalXP} XP</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>İlerleme</span>
                      <span>{currentStats.levelProgress}%</span>
                    </div>
                    <Progress value={currentStats.levelProgress} className="bg-blue-400/30" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center">
                      <Flame className="w-5 h-5 mx-auto mb-1 text-orange-300" />
                      <div className="text-lg font-bold">{currentStats.streak}</div>
                      <div className="text-xs text-blue-100">Gün Serisi</div>
                    </div>
                    <div className="text-center">
                      <BookOpen className="w-5 h-5 mx-auto mb-1 text-green-300" />
                      <div className="text-lg font-bold">{currentStats.completedQuizzes}</div>
                      <div className="text-xs text-blue-100">Quiz</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goal - Editable */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Haftalık Hedef
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      const newGoal = prompt('Yeni haftalık hedef (dakika):', weeklyGoal.toString());
                      if (newGoal && !isNaN(parseInt(newGoal))) {
                        setWeeklyGoal(parseInt(newGoal));
                      }
                    }}
                    data-testid="button-edit-weekly-goal"
                  >
                    ✏️
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentStats.studyTime} dk</span>
                    <span>{weeklyGoal} dk</span>
                  </div>
                  <Progress value={(currentStats.studyTime / weeklyGoal) * 100} />
                  <p className="text-xs text-muted-foreground">
                    {Math.max(0, weeklyGoal - currentStats.studyTime)} dakika kaldı
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ad Banner for Free Users */}
            <AdBanner />
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >

            {/* MEB News Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-red-600" />
                  MEB Güncel Haberler
                </CardTitle>
                <CardDescription>
                  Millî Eğitim Bakanlığı'ndan son haberler ve duyurular
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mebNews.map((news) => (
                    <motion.div
                      key={news.id}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100 cursor-pointer hover:shadow-md transition-all"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 text-gray-900">
                          {news.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {news.summary}
                        </p>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">
                            {news.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(news.date).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://www.meb.gov.tr" target="_blank" rel="noopener noreferrer">
                      Tüm Haberleri Gör
                      <Globe className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </motion.div>

          {/* Right Sidebar - Today's Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Today's Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  Bugünün Özeti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="text-xl font-bold text-blue-600">{currentStats.todayStudyTime}</div>
                    <div className="text-xs text-muted-foreground">Dakika Çalıştın</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Star className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="text-xl font-bold text-green-600">{currentStats.correctAnswers}</div>
                    <div className="text-xs text-muted-foreground">Doğru Cevap</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-xl font-bold text-purple-600">{currentStats.successRate}%</div>
                    <div className="text-xs text-muted-foreground">Başarı Oranı</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Hızlı Eylemler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button size="sm" className="w-full justify-start" data-testid="button-start-quiz">
                    <Play className="w-4 h-4 mr-2" />
                    Quiz Başlat
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start" data-testid="button-view-progress">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    İlerlemeni Gör
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start" data-testid="button-set-goals">
                    <Target className="w-4 h-4 mr-2" />
                    Hedef Belirle
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ad Banner */}
            <AdBanner />
          </motion.div>
        </div>
      </div>
    </div>
  );
}