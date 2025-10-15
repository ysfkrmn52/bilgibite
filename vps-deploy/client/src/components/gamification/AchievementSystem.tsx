// Achievement System with Badge Animations
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Calendar, Target, Users, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Achievement, ACHIEVEMENTS } from '@/lib/gamification';

interface AchievementSystemProps {
  userAchievements: Achievement[];
  totalXP: number;
  totalQuestions: number;
  currentStreak: number;
  level: number;
  onAchievementClick?: (achievement: Achievement) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'learning': return Target;
    case 'streak': return Calendar;
    case 'social': return Users;
    case 'challenge': return Zap;
    case 'milestone': return Trophy;
    default: return Award;
  }
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-100 border-gray-300 text-gray-800';
    case 'rare': return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'epic': return 'bg-purple-100 border-purple-300 text-purple-800';
    case 'legendary': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    default: return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};

const getRarityGlow = (rarity: string) => {
  switch (rarity) {
    case 'rare': return 'shadow-blue-500/25';
    case 'epic': return 'shadow-purple-500/25';
    case 'legendary': return 'shadow-yellow-500/50';
    default: return '';
  }
};

export function AchievementSystem({ 
  userAchievements, 
  totalXP,
  totalQuestions,
  currentStreak,
  level,
  onAchievementClick 
}: AchievementSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  // Calculate achievement progress
  const calculateProgress = (achievement: Achievement) => {
    switch (achievement.id) {
      case 'questions_10': return Math.min(totalQuestions, 10);
      case 'questions_50': return Math.min(totalQuestions, 50);
      case 'questions_100': return Math.min(totalQuestions, 100);
      case 'questions_500': return Math.min(totalQuestions, 500);
      case 'questions_1000': return Math.min(totalQuestions, 1000);
      case 'streak_3': return Math.min(currentStreak, 3);
      case 'streak_7': return Math.min(currentStreak, 7);
      case 'streak_30': return Math.min(currentStreak, 30);
      case 'streak_100': return Math.min(currentStreak, 100);
      case 'streak_365': return Math.min(currentStreak, 365);
      case 'level_5': return Math.min(level, 5);
      case 'level_10': return Math.min(level, 10);
      case 'level_25': return Math.min(level, 25);
      case 'level_50': return Math.min(level, 50);
      default: return 0;
    }
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(a => a.id === achievementId);
  };

  const filteredAchievements = ACHIEVEMENTS.filter(achievement => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false;
    }
    if (showUnlockedOnly && !isUnlocked(achievement.id)) {
      return false;
    }
    return true;
  });

  const categories = ['all', ...Array.from(new Set(ACHIEVEMENTS.map(a => a.category)))];
  const unlockedCount = userAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercent = (unlockedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Başarılar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {unlockedCount} / {totalCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Açılmış Başarı
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                %{Math.round(completionPercent)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tamamlanma
              </div>
            </div>
          </div>
          <Progress value={completionPercent} className="h-3" />
        </CardContent>
      </Card>

      {/* Achievement Grid */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full sm:w-auto">
            <TabsTrigger value="all" className="text-xs">Tümü</TabsTrigger>
            <TabsTrigger value="learning" className="text-xs">Öğrenme</TabsTrigger>
            <TabsTrigger value="streak" className="text-xs">Seri</TabsTrigger>
            <TabsTrigger value="milestone" className="text-xs">Kilometre Taşı</TabsTrigger>
            <TabsTrigger value="challenge" className="text-xs">Meydan Okuma</TabsTrigger>
            <TabsTrigger value="social" className="text-xs">Sosyal</TabsTrigger>
          </TabsList>

          <button
            onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showUnlockedOnly 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {showUnlockedOnly ? 'Tümünü Göster' : 'Sadece Açılanlar'}
          </button>
        </div>

        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="wait">
              {filteredAchievements.map((achievement) => {
                const IconComponent = getCategoryIcon(achievement.category);
                const unlocked = isUnlocked(achievement.id);
                const progress = calculateProgress(achievement);
                const progressPercent = achievement.maxProgress 
                  ? (progress / achievement.maxProgress) * 100 
                  : (unlocked ? 100 : 0);

                return (
                  <motion.div
                    key={achievement.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                        unlocked 
                          ? `${getRarityColor(achievement.rarity)} shadow-lg ${getRarityGlow(achievement.rarity)}`
                          : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-900 dark:border-gray-700'
                      }`}
                      onClick={() => onAchievementClick?.(achievement)}
                    >
                      <CardContent className="p-4">
                        {/* Achievement Icon */}
                        <div className="flex items-center justify-between mb-3">
                          <motion.div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                              unlocked 
                                ? 'bg-white bg-opacity-50' 
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                            animate={unlocked ? {
                              rotate: [0, -5, 5, -5, 5, 0],
                              scale: [1, 1.1, 1]
                            } : {}}
                            transition={{
                              duration: 2,
                              repeat: unlocked ? Infinity : 0,
                              repeatType: 'loop',
                              repeatDelay: 5
                            }}
                          >
                            {unlocked ? achievement.icon : '🔒'}
                          </motion.div>

                          {/* Rarity Badge */}
                          <Badge 
                            variant="secondary"
                            className={`text-xs ${
                              unlocked ? getRarityColor(achievement.rarity) : 'bg-gray-200'
                            }`}
                          >
                            {achievement.rarity === 'common' && 'Sıradan'}
                            {achievement.rarity === 'rare' && 'Nadir'}
                            {achievement.rarity === 'epic' && 'Destansı'}
                            {achievement.rarity === 'legendary' && 'Efsanevi'}
                          </Badge>
                        </div>

                        {/* Achievement Details */}
                        <div className="space-y-2">
                          <h3 className={`font-semibold ${
                            unlocked ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
                          }`}>
                            {achievement.title}
                          </h3>
                          <p className={`text-sm ${
                            unlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'
                          }`}>
                            {achievement.description}
                          </p>

                          {/* Progress Bar for Incomplete Achievements */}
                          {!unlocked && achievement.maxProgress && progress > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>İlerleme</span>
                                <span>{progress} / {achievement.maxProgress}</span>
                              </div>
                              <Progress value={progressPercent} className="h-2" />
                            </div>
                          )}

                          {/* Rewards */}
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-blue-500" />
                              <span>{achievement.xpReward} XP</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span>{achievement.gemReward} Gem</span>
                            </div>
                          </div>

                          {/* Unlock Date */}
                          {unlocked && achievement.unlockedAt && (
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(achievement.unlockedAt).toLocaleDateString('tr-TR')} tarihinde açıldı
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

// Achievement Unlock Animation Component
export function AchievementUnlockModal({ 
  achievement, 
  isOpen, 
  onClose 
}: { 
  achievement: Achievement | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  if (!achievement || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-2xl max-w-md mx-4 ${getRarityColor(achievement.rarity)}`}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Animated Achievement Icon */}
          <motion.div
            className="text-8xl mb-4"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -10, 10, -10, 10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop'
            }}
          >
            {achievement.icon}
          </motion.div>

          <motion.h2 
            className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            BAŞARI AÇILDI!
          </motion.h2>

          <motion.div
            className="mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {achievement.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {achievement.description}
            </p>
          </motion.div>

          {/* Rewards */}
          <motion.div
            className="flex justify-center gap-4 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <Zap className="w-4 h-4" />
                <span className="font-semibold">+{achievement.xpReward} XP</span>
              </div>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <Star className="w-4 h-4" />
                <span className="font-semibold">+{achievement.gemReward} Gem</span>
              </div>
            </div>
          </motion.div>

          {/* Particle Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: achievement.rarity === 'legendary' ? '#fbbf24' : 
                                 achievement.rarity === 'epic' ? '#a855f7' :
                                 achievement.rarity === 'rare' ? '#3b82f6' : '#6b7280',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                }}
                animate={{
                  y: [0, -100],
                  x: [0, Math.random() * 200 - 100],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}