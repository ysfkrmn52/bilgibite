import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy,
  Medal,
  Star,
  Target,
  Zap,
  Flame,
  Crown,
  Award,
  Gem,
  Calendar,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  Gift,
  Sparkles,
  Lock,
  Home
} from 'lucide-react';

// Badge kategorileri ve rozetler
const badgeCategories = {
  learning: {
    name: "Öğrenme",
    icon: BookOpen,
    color: "from-blue-500 to-indigo-600",
    badges: [
      { id: "first-quiz", name: "İlk Adım", description: "İlk quizi tamamla", icon: Star, earned: false, xp: 50 },
      { id: "streak-7", name: "Kararlı Öğrenci", description: "7 gün üst üste çalış", icon: Flame, earned: false, xp: 100 },
      { id: "streak-30", name: "Demir Disiplin", description: "30 gün üst üste çalış", icon: Medal, earned: false, xp: 500 },
      { id: "perfect-score", name: "Mükemmeliyetçi", description: "Quiz'de %100 al", icon: Trophy, earned: false, xp: 200 },
      { id: "night-owl", name: "Gece Kartalı", description: "Gece 00:00-06:00 arası çalış", icon: Crown, earned: false, xp: 150 }
    ]
  },
  achievement: {
    name: "Başarı",
    icon: Trophy,
    color: "from-yellow-500 to-orange-600",
    badges: [
      { id: "level-10", name: "Yükselen Yıldız", description: "Seviye 10'a ulaş", icon: Star, earned: false, xp: 300 },
      { id: "level-25", name: "Uzman", description: "Seviye 25'e ulaş", icon: Crown, earned: false, xp: 750 },
      { id: "top-10", name: "Lider", description: "Liderlik tablosunda top 10'a gir", icon: Medal, earned: false, xp: 400 },
      { id: "exam-master", name: "Sınav Uzmanı", description: "5 farklı sınavda başarılı ol", icon: Trophy, earned: false, xp: 600 },
      { id: "speed-demon", name: "Hız Canavarı", description: "Quiz'i 2 dakikada bitir", icon: Zap, earned: false, xp: 250 }
    ]
  },
  social: {
    name: "Sosyal",
    icon: Users,
    color: "from-green-500 to-teal-600",
    badges: [
      { id: "first-friend", name: "Sosyal Kelebek", description: "İlk arkadaşını ekle", icon: Users, earned: false, xp: 75 },
      { id: "challenge-winner", name: "Meydan Okuyan", description: "Arkadaş meydan okumasını kazan", icon: Target, earned: false, xp: 200 },
      { id: "group-study", name: "Takım Oyuncusu", description: "Grup çalışmasına katıl", icon: Users, earned: false, xp: 150 },
      { id: "mentor", name: "Rehber", description: "Bir arkadaşına yardım et", icon: Award, earned: false, xp: 300 },
      { id: "popular", name: "Popüler", description: "10 arkadaşa sahip ol", icon: Star, earned: false, xp: 400 }
    ]
  },
  special: {
    name: "Özel",
    icon: Gem,
    color: "from-purple-500 to-pink-600",
    badges: [
      { id: "early-bird", name: "Erken Kuş", description: "06:00'dan önce çalış", icon: Crown, earned: false, xp: 100 },
      { id: "weekend-warrior", name: "Hafta Sonu Savaşçısı", description: "Hafta sonu 5 saat çalış", icon: Medal, earned: false, xp: 300 },
      { id: "month-champion", name: "Aylık Şampiyon", description: "Ayın en çok puanını topla", icon: Trophy, earned: false, xp: 1000 },
      { id: "ai-explorer", name: "AI Kaşifi", description: "AI özelliklerini keşfet", icon: Sparkles, earned: false, xp: 200 },
      { id: "premium-member", name: "Premium Üye", description: "Premium aboneliğe sahip ol", icon: Crown, earned: false, xp: 500 }
    ]
  }
};

// userStats will be fetched from API

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
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function Rozetler() {
  const [selectedCategory, setSelectedCategory] = useState("learning");
  const currentCategory = badgeCategories[selectedCategory as keyof typeof badgeCategories];
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Get current user from localStorage (following app pattern)
  const getCurrentUser = () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        return JSON.parse(currentUser);
      } catch (error) {
        console.error('User data parse error:', error);
      }
    }
    return null;
  };

  const currentUser = getCurrentUser();
  const userId = currentUser?.uid || currentUser?.id || 'demo-user-123'; // fallback for demo

  // Fetch user stats from API with dynamic userId
  const { data: userStatsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/users', userId, 'stats'],
    enabled: !!userId
  });

  // Use fetched data or defaults for new users
  const userStats = userStatsData ? {
    totalBadges: (userStatsData as any).earnedAchievements || 0,
    totalXP: (userStatsData as any).totalXP || 0,
    level: (userStatsData as any).currentLevel || 1,
    nextLevelXP: (userStatsData as any).nextLevelXP || 100,
    rank: (userStatsData as any).rank || null,
    streakDays: (userStatsData as any).currentStreak || 0
  } : {
    totalBadges: 0,
    totalXP: 0,
    level: 1,
    nextLevelXP: 100,
    rank: null,
    streakDays: 0
  };

  // Create dynamic badge categories with earned status based on API data
  const totalEarned = userStats.totalBadges;
  let earnedCount = 0;
  
  const dynamicBadgeCategories = Object.fromEntries(
    Object.entries(badgeCategories).map(([categoryKey, category]) => [
      categoryKey,
      {
        ...category,
        badges: category.badges.map(badge => {
          // Mark first badges as earned based on totalEarned from API
          const shouldBeEarned = earnedCount < totalEarned;
          if (shouldBeEarned) earnedCount++;
          return { ...badge, earned: shouldBeEarned };
        })
      }
    ])
  );

  const earnedBadges = totalEarned;
  const totalBadges = Object.values(badgeCategories).reduce((acc, category) => {
    return acc + category.badges.length;
  }, 0);

  // Show loading state
  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-4 text-lg text-gray-600">İstatistikler yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="p-8 text-center">
              <CardContent>
                <h2 className="text-xl font-semibold text-red-600 mb-2">Veri Yükleme Hatası</h2>
                <p className="text-gray-600 mb-4">İstatistikler yüklenirken bir sorun oluştu.</p>
                <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Rozetler
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Öğrenme yolculuğunda başarılarını kutla ve yeni hedefler belirle.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Stats Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="w-6 h-6" />
                  Başarı Özeti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{earnedBadges}</div>
                    <div className="text-xs text-purple-100">Kazanılan</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalBadges}</div>
                    <div className="text-xs text-purple-100">Toplam</div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>İlerleme</span>
                    <span>{Math.round((earnedBadges / totalBadges) * 100)}%</span>
                  </div>
                  <Progress value={(earnedBadges / totalBadges) * 100} className="bg-purple-400/30" />
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-100">Toplam XP</span>
                    <span className="font-bold">{userStats.totalXP}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-100">Sıralama</span>
                    <span className="font-bold">{userStats.rank ? `#${userStats.rank}` : '---'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-100">Seri</span>
                    <span className="font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {userStats.streakDays}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-lg">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <CardHeader>
                <CardTitle className="text-sm text-black">Hızlı Erişim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/social">
                    <Users className="w-4 h-4 mr-2" />
                    Sosyal
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/analytics">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    İstatistikler
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Ana Sayfa
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
                {Object.entries(dynamicBadgeCategories).map(([key, category]) => {
                  const IconComponent = category.icon;
                  return (
                    <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{category.name}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {Object.entries(badgeCategories).map(([categoryKey, category]) => (
                <TabsContent key={categoryKey} value={categoryKey}>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                  >
                    {/* Category Header */}
                    <motion.div variants={itemVariants}>
                      <Card className={`bg-gradient-to-r ${category.color} text-white border-0`}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3 text-white">
                            <category.icon className="w-8 h-8" />
                            <div>
                              <h2 className="text-2xl font-bold">{category.name} Rozetleri</h2>
                              <p className="text-white/80 text-sm">
                                {category.badges.filter(b => b.earned).length} / {category.badges.length} Rozet
                              </p>
                            </div>
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </motion.div>

                    {/* Badges Grid */}
                    <motion.div
                      variants={containerVariants}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {category.badges.map((badge) => {
                        const IconComponent = badge.icon;
                        return (
                          <motion.div key={badge.id} variants={itemVariants}>
                            <Card className={`
                              h-48 relative transition-all duration-300 hover:shadow-lg cursor-pointer
                              ${badge.earned 
                                ? 'border-green-300 bg-gradient-to-br from-white via-green-50 to-blue-50 border border-green-100 shadow-lg' 
                                : 'border-gray-200 bg-gradient-to-br from-white via-gray-50 to-gray-100 opacity-75'
                              }
                            `}>
                              <CardContent className="p-6 h-full flex flex-col justify-between">
                                <div className="text-center">
                                  <div className={`
                                    w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4
                                    ${badge.earned 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-gray-300 text-gray-600'
                                    }
                                  `}>
                                    {badge.earned ? (
                                      <IconComponent className="w-8 h-8" />
                                    ) : (
                                      <Lock className="w-8 h-8" />
                                    )}
                                  </div>

                                  <h3 className={`
                                    text-lg font-bold mb-2
                                    ${badge.earned ? 'text-green-800' : 'text-gray-600'}
                                  `}>
                                    {badge.name}
                                  </h3>

                                  <p className={`
                                    text-sm leading-relaxed
                                    ${badge.earned ? 'text-green-700' : 'text-gray-500'}
                                  `}>
                                    {badge.description}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium">{badge.xp} XP</span>
                                  </div>
                                  
                                  {badge.earned ? (
                                    <Badge className="bg-green-500 text-white">
                                      <Trophy className="w-3 h-3 mr-1" />
                                      Kazanıldı
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Bekliyor
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Progress Motivation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                <CardContent className="p-8 text-center">
                  <Gift className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Devam Et!</h3>
                  <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                    Bir sonraki rozete sadece {Math.max(0, userStats.nextLevelXP - userStats.totalXP)} XP uzaklıktasın. 
                    Çalışmaya devam et ve yeni başarıları keşfet!
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      size="lg" 
                      className="bg-white text-indigo-600 hover:bg-gray-100"
                      onClick={() => {
                        toast({
                          title: "Quiz Zamanı!",
                          description: "Quiz sayfasına yönlendiriliyorsunuz..."
                        });
                        // Navigate to quiz page after a short delay
                        setTimeout(() => setLocation('/quiz'), 1000);
                      }}
                      data-testid="button-quiz-solve"
                    >
                      Quiz Çöz
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white text-white hover:bg-white/10"
                      onClick={() => {
                        toast({
                          title: "Arkadaş Davet Et",
                          description: "Sosyal sayfaya yönlendiriliyorsunuz. Orada arkadaşlarınızı bulabilir ve davet edebilirsiniz."
                        });
                        setTimeout(() => setLocation('/social'), 1000);
                      }}
                      data-testid="button-invite-friend"
                    >
                      Arkadaş Davet Et
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}