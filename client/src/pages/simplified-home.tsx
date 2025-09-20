import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  ScrollReveal, 
  HoverLift, 
  FloatingElement, 
  Pressable,
  containerVariants,
  itemVariants,
  hoverLiftVariants,
  floatVariants
} from '@/components/AnimationWrappers';
import { useParallax } from '@/hooks/useParallax';
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
  
  // Parallax effects for background elements
  const heroParallax = useParallax({ speed: 0.3, direction: 'up' });
  const backgroundParallax = useParallax({ speed: 0.1, direction: 'down' });

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

  const { data: examCategories = [] } = useQuery({
    queryKey: ['/api/exam-categories']
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Parallax Background Elements */}
      <motion.div 
        ref={backgroundParallax.ref}
        style={backgroundParallax.style}
        className="absolute inset-0 opacity-20"
      >
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-indigo-200 rounded-full blur-2xl"></div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        
        {/* Header with Enhanced Animation */}
        <ScrollReveal className="text-center mb-8" delay={0.2}>
          <FloatingElement duration={4} intensity={5}>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {getTimeGreeting()}!
            </h1>
          </FloatingElement>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-lg"
          >
            BilgiBite ile hedeflerine ulaş ✨
          </motion.p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - User Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Level Card */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FloatingElement duration={2} intensity={1}>
                      <Trophy className="w-5 h-5" />
                    </FloatingElement>
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
            <Card className="hover:scale-105 transition-all duration-300">
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

          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >

            {/* MEB News Feed */}
            <Card className="transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FloatingElement duration={4} intensity={2}>
                      <Newspaper className="w-5 h-5 text-red-600" />
                    </FloatingElement>
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


          </motion.div>
        </div>

        {/* Bottom Ad Banner for Free Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <AdBanner />
        </motion.div>
      </div>
    </div>
  );
}