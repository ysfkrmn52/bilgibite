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
  Globe,
  Newspaper,
  GraduationCap,
  Heart,
  Sparkles
} from 'lucide-react';

const mockUserId = "mock-user-123";

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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Mock user stats
  const userStats = {
    totalXP: 2450,
    currentLevel: 12,
    streak: 7,
    completedQuizzes: 45,
    weeklyGoal: 300,
    studyTime: 142,
    todayStudyTime: 25,
    correctAnswers: 18,
    successRate: 85
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

        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - User Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Level Card */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
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
            <Card>
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
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                data-testid="button-exams"
              >
                <Link href="/exams">
                  <GraduationCap className="w-6 h-6 text-green-600" />
                  <span className="text-sm">Sınavlar</span>
                </Link>
              </Button>

              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-white/50 hover:bg-indigo-50 border-indigo-200"
                asChild
                data-testid="button-education"
              >
                <Link href="/education">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                  <span className="text-sm">Eğitim</span>
                </Link>
              </Button>

              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-white/50 hover:bg-purple-50 border-purple-200"
                asChild
                data-testid="button-ai"
              >
                <Link href="/ai">
                  <Zap className="w-6 h-6 text-purple-600" />
                  <span className="text-sm">AI</span>
                </Link>
              </Button>

              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 bg-white/50 hover:bg-orange-50 border-orange-200"
                asChild
                data-testid="button-badges"
              >
                <Link href="/badges">
                  <Award className="w-6 h-6 text-orange-600" />
                  <span className="text-sm">Rozetler</span>
                </Link>
              </Button>
            </div>

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

            {/* Today's Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Bugünün Özeti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">{userStats.todayStudyTime}</div>
                    <div className="text-sm text-muted-foreground">Dakika Çalıştın</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Star className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">{userStats.correctAnswers}</div>
                    <div className="text-sm text-muted-foreground">Doğru Cevap</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">{userStats.successRate}%</div>
                    <div className="text-sm text-muted-foreground">Başarı Oranı</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access to Key Features */}
            <Card>
              <CardHeader>
                <CardTitle>Hızlı Erişim</CardTitle>
                <CardDescription>
                  En çok kullandığın özellikler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button 
                    variant="ghost" 
                    className="h-16 flex-col gap-2 hover:bg-blue-50"
                    asChild
                    data-testid="button-analytics"
                  >
                    <Link href="/analytics">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">İstatistikler</span>
                    </Link>
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="h-16 flex-col gap-2 hover:bg-green-50"
                    asChild
                    data-testid="button-social"
                  >
                    <Link href="/social">
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Sosyal</span>
                    </Link>
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="h-16 flex-col gap-2 hover:bg-orange-50"
                    asChild
                    data-testid="button-subscription"
                  >
                    <Link href="/subscription">
                      <Sparkles className="w-5 h-5 text-orange-600" />
                      <span className="text-sm">Abonelik</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}