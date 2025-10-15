// Comprehensive Gamification Dashboard
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy,
  Star,
  Flame,
  Target,
  Users,
  ShoppingCart,
  TrendingUp,
  Award,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { XPProgressBar } from './XPProgressBar';
import { AchievementSystem } from './AchievementSystem';
import { StreakTracker } from './StreakTracker';
import { DailyChallenges } from './DailyChallenges';
import { GemStore } from './GemStore';
import { Leaderboard } from './Leaderboard';
import { 
  Achievement, 
  UserStats, 
  XPCalculator,
  DailyChallenge,
  ACHIEVEMENTS 
} from '@/lib/gamification';

interface GamificationDashboardProps {
  userId: string;
  initialStats?: Partial<UserStats>;
}

// Mock user stats - replace with real data
const MOCK_USER_STATS: UserStats = {
  totalXP: 5420,
  currentStreak: 12,
  longestStreak: 28,
  totalQuestions: 247,
  correctAnswers: 198,
  averageAccuracy: 80.2,
  totalTimeSpent: 1240, // minutes
  level: 18,
  gems: 150,
  streakFreezes: 3,
  perfectLessons: 8,
  lastActiveDate: new Date().toDateString(),
  joinedDate: '2024-01-15'
};

// Mock achievements - some unlocked
const MOCK_USER_ACHIEVEMENTS: Achievement[] = [
  { ...ACHIEVEMENTS[0], unlockedAt: new Date('2024-01-16') }, // first_quiz
  { ...ACHIEVEMENTS[1], unlockedAt: new Date('2024-01-20') }, // questions_10
  { ...ACHIEVEMENTS[6], unlockedAt: new Date('2024-02-01') }, // streak_3
  { ...ACHIEVEMENTS[7], unlockedAt: new Date('2024-02-08') }, // streak_7
  { ...ACHIEVEMENTS[11], unlockedAt: new Date('2024-01-25') }, // perfect_quiz
];

export function GamificationDashboard({ userId, initialStats }: GamificationDashboardProps) {
  const [userStats, setUserStats] = useState<UserStats>({
    ...MOCK_USER_STATS,
    ...initialStats
  });
  const [userAchievements, setUserAchievements] = useState<Achievement[]>(MOCK_USER_ACHIEVEMENTS);
  const [userItems, setUserItems] = useState<string[]>(['streak_freeze', 'hint_power']);
  const [showXPGain, setShowXPGain] = useState(false);
  const [newXP, setNewXP] = useState(0);

  // Calculate XP system
  const xpSystem = XPCalculator.getXPForLevel(userStats.level);
  const currentXPInLevel = userStats.totalXP - xpSystem.totalXPForLevel;

  // Mock leaderboard data
  const currentUser = {
    userId,
    username: 'BilgiBiteKullanıcısı',
    totalXP: userStats.totalXP,
    level: userStats.level,
    currentStreak: userStats.currentStreak,
    weeklyXP: 1250,
    monthlyXP: 4800,
    rank: 15
  };

  const leaderboardData = {
    weekly: [],
    monthly: [],
    allTime: []
  };

  // Handle XP gain simulation
  const handleXPGain = (gainedXP: number) => {
    const newTotalXP = userStats.totalXP + gainedXP;
    setNewXP(newTotalXP);
    setShowXPGain(true);
    
    setUserStats(prev => ({
      ...prev,
      totalXP: newTotalXP,
      level: XPCalculator.calculateLevel(newTotalXP)
    }));
  };

  // Handle gem spending
  const handlePurchase = (item: any) => {
    if (userStats.gems >= item.cost) {
      setUserStats(prev => ({
        ...prev,
        gems: prev.gems - item.cost
      }));
      setUserItems(prev => [...prev, item.id]);
    }
  };

  // Handle item usage
  const handleUseItem = (itemId: string) => {
    setUserItems(prev => prev.filter(id => id !== itemId));
    
    // Apply item effects
    switch (itemId) {
      case 'streak_freeze':
        setUserStats(prev => ({
          ...prev,
          streakFreezes: prev.streakFreezes + 1
        }));
        break;
      // Add other item effects
    }
  };

  // Handle streak freeze usage
  const handleUseStreakFreeze = () => {
    if (userStats.streakFreezes > 0) {
      setUserStats(prev => ({
        ...prev,
        streakFreezes: prev.streakFreezes - 1
      }));
    }
  };

  // Handle challenge completion
  const handleChallengeComplete = (challenge: DailyChallenge) => {
    handleXPGain(challenge.xpReward);
    setUserStats(prev => ({
      ...prev,
      gems: prev.gems + challenge.gemReward
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Gamification Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            İlerlemeni takip et, ödüller kazan ve liderlik yarışında öne çık!
          </p>
        </motion.div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8" />
                  <div>
                    <div className="text-2xl font-bold">{userStats.level}</div>
                    <div className="text-sm opacity-90">Seviye</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Flame className="w-8 h-8" />
                  <div>
                    <div className="text-2xl font-bold">{userStats.currentStreak}</div>
                    <div className="text-sm opacity-90">Günlük Seri</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8" />
                  <div>
                    <div className="text-2xl font-bold">{userStats.gems}</div>
                    <div className="text-sm opacity-90">Gem</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8" />
                  <div>
                    <div className="text-2xl font-bold">{userAchievements.length}</div>
                    <div className="text-sm opacity-90">Başarı</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* XP Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <XPProgressBar
            currentXP={showXPGain ? userStats.totalXP - (newXP - userStats.totalXP) : userStats.totalXP}
            newXP={showXPGain ? newXP : undefined}
            onAnimationComplete={() => setShowXPGain(false)}
          />
        </motion.div>

        {/* Main Gamification Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Genel</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Başarılar</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Görevler</span>
              </TabsTrigger>
              <TabsTrigger value="streak" className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <span className="hidden sm:inline">Seri</span>
              </TabsTrigger>
              <TabsTrigger value="store" className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Mağaza</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Liderlik</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Son Başarılar
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {userAchievements.slice(-3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium">{achievement.title}</div>
                          <div className="text-sm text-gray-500">{achievement.description}</div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          +{achievement.xpReward} XP
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>İstatistikler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Toplam Sorular</span>
                        <span className="font-semibold">{userStats.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Doğru Cevaplar</span>
                        <span className="font-semibold">{userStats.correctAnswers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Doğruluk Oranı</span>
                        <span className="font-semibold">%{userStats.averageAccuracy.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Toplam Süre</span>
                        <span className="font-semibold">{Math.floor(userStats.totalTimeSpent / 60)}s {userStats.totalTimeSpent % 60}d</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Mükemmel Dersler</span>
                        <span className="font-semibold">{userStats.perfectLessons}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Test XP Gain Button */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
                <CardContent className="p-4 text-center">
                  <button
                    onClick={() => handleXPGain(150)}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Test XP Gain (+150 XP)
                  </button>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Animasyonları test etmek için
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <AchievementSystem
                userAchievements={userAchievements}
                totalXP={userStats.totalXP}
                totalQuestions={userStats.totalQuestions}
                currentStreak={userStats.currentStreak}
                level={userStats.level}
              />
            </TabsContent>

            <TabsContent value="challenges">
              <DailyChallenges
                userStats={userStats}
                onChallengeComplete={handleChallengeComplete}
              />
            </TabsContent>

            <TabsContent value="streak">
              <StreakTracker
                currentStreak={userStats.currentStreak}
                longestStreak={userStats.longestStreak}
                streakFreezes={userStats.streakFreezes}
                lastActiveDate={userStats.lastActiveDate}
                onUseStreakFreeze={handleUseStreakFreeze}
              />
            </TabsContent>

            <TabsContent value="store">
              <GemStore
                userGems={userStats.gems}
                userItems={userItems}
                onPurchase={handlePurchase}
                onUseItem={handleUseItem}
              />
            </TabsContent>

            <TabsContent value="leaderboard">
              <Leaderboard
                currentUser={currentUser}
                leaderboardData={leaderboardData}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}