import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Trophy, 
  Zap, 
  TrendingUp, 
  Calendar,
  Clock,
  Star,
  Users,
  Brain,
  Target,
  Flame,
  Award,
  ChevronRight,
  ExternalLink,
  Bell
} from "lucide-react";
import { motion } from "framer-motion";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  isImportant: boolean;
  source: string;
}

// MEB haber akışı için mock data
const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "2025 YKS Sınav Tarihleri Açıklandı",
    summary: "ÖSYM tarafından 2025 yılı Yükseköğretim Kurumları Sınavı tarihleri belli oldu. TYT 14-15 Haziran, AYT 21-22 Haziran tarihlerinde yapılacak.",
    category: "YKS",
    publishedAt: "2025-01-15T10:30:00Z",
    isImportant: true,
    source: "MEB"
  },
  {
    id: "2", 
    title: "KPSS Başvuru Süreci Başladı",
    summary: "2025/1 KPSS Genel Yetenek Genel Kültür sınavı için başvurular 20 Ocak'ta başlayacak. Son başvuru tarihi 3 Şubat.",
    category: "KPSS",
    publishedAt: "2025-01-14T14:20:00Z",
    isImportant: true,
    source: "ÖSYM"
  },
  {
    id: "3",
    title: "Yeni Ehliyet Sınav Sistemi Hakkında Duyuru",
    summary: "Motorlu Taşıtlar Kurumu, ehliyet sınavlarında yeni soru tipleri ve değerlendirme kriterlerini açıkladı.",
    category: "Ehliyet",
    publishedAt: "2025-01-13T09:15:00Z",
    isImportant: false,
    source: "MTK"
  },
  {
    id: "4",
    title: "Öğretmenlik Atama Sonuçları Açıklandı",
    summary: "2024 KPSS ile öğretmenlik atama sonuçları e-Devlet üzerinden sorgulanabilir. Atanan öğretmenlerin listesi yayımlandı.",
    category: "Atama",
    publishedAt: "2025-01-12T16:45:00Z",
    isImportant: false,
    source: "MEB"
  }
];

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: examCategories } = useQuery({
    queryKey: ["/api/exam-categories"],
    queryFn: async () => {
      const response = await fetch("/api/exam-categories");
      return response.json();
    },
  });

  const { data: userProgress } = useQuery({
    queryKey: ["/api/users/mock-user-123/progress"],
    queryFn: async () => {
      const response = await fetch("/api/users/mock-user-123/progress");
      return response.json();
    },
  });

  // Stats için mock data
  const userStats = {
    totalXP: 2450,
    currentLevel: 12,
    streak: 7,
    completedQuizzes: 45,
    correctAnswers: 387,
    studyTime: 142, // dakika
    weeklyGoal: 300, // dakika
    achievements: 8
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi öğlenler";
    return "İyi akşamlar";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Hoşgeldin Bölümü */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {getTimeBasedGreeting()}, Kullanıcı!
          </h1>
          <p className="text-lg text-muted-foreground">
            {formatDate(currentTime)} • {formatTime(currentTime)}
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            BilgiBite ile öğrenme yolculuğuna devam et. AI destekli kişisel öğretmenin ve gamification özellikleriyle başarıya ulaş!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Sol Panel - İstatistikler */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            
            {/* Hızlı İstatistikler */}
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Seviye {userStats.currentLevel}
                </CardTitle>
                <CardDescription className="text-blue-100">
                  {userStats.totalXP} XP Kazandın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Seviye İlerlemesi</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <Progress value={75} className="bg-blue-400/30" />
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userStats.streak}</div>
                    <div className="text-xs text-blue-100">Gün Serisi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userStats.achievements}</div>
                    <div className="text-xs text-blue-100">Rozet</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Haftalık Hedef */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
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
                    Hedefine {userStats.weeklyGoal - userStats.studyTime} dakika kaldı!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Hızlı Erişim */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Hızlı Erişim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/ai-learning">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Öğretmen
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    İstatistiklerim
                  </Button>
                </Link>
                <Link href="/social">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Arkadaşlarım
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Orta Panel - Sınav Kategorileri */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            
            {/* Sınav Kategorileri */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Sınav Kategorileri
                </CardTitle>
                <CardDescription>
                  Hangi sınava hazırlanmak istiyorsun?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {examCategories?.map((category: any) => (
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href={`/quiz/${category.id}`}>
                        <Card className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-200 dark:hover:border-blue-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full bg-${category.color}-500`}></div>
                                  <h3 className="font-semibold text-lg">{category.name}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {category.description}
                                </p>
                                <div className="flex items-center gap-4 pt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    150+ Soru
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    AI Destekli
                                  </Badge>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Öne Çıkan Özellikler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Öne Çıkan Özellikler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Link href="/ai-learning">
                    <Card className="cursor-pointer hover:shadow-md transition-all bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4 text-center">
                        <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <h4 className="font-medium text-sm">AI Öğretmen</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Kişisel AI asistanın
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/gamification">
                    <Card className="cursor-pointer hover:shadow-md transition-all bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                      <CardContent className="p-4 text-center">
                        <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <h4 className="font-medium text-sm">Rozetler</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Başarılarını kutla
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  <Link href="/social">
                    <Card className="cursor-pointer hover:shadow-md transition-all bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <h4 className="font-medium text-sm">Sosyal</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Arkadaşlarınla yarış
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sağ Panel - Haberler */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4" />
                  MEB Haber Akışı
                  <Badge variant="destructive" className="text-xs ml-auto">CANLI</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {mockNews.map((news, index) => (
                      <motion.div
                        key={news.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                          news.isImportant 
                            ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800" 
                            : "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge 
                            variant={news.isImportant ? "destructive" : "secondary"} 
                            className="text-xs"
                          >
                            {news.category}
                          </Badge>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                        
                        <h4 className="font-medium text-sm mb-2 leading-tight">
                          {news.title}
                        </h4>
                        
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
                          {news.summary}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{news.source}</span>
                          <span>
                            {new Date(news.publishedAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}