// Streak Tracking System with Visual Feedback
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Calendar, 
  Shield, 
  Timer,
  Trophy,
  Zap,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  lastActiveDate: string;
  onUseStreakFreeze?: () => void;
  streakHistory?: Array<{ date: string; active: boolean }>;
}

export function StreakTracker({
  currentStreak,
  longestStreak,
  streakFreezes,
  lastActiveDate,
  onUseStreakFreeze,
  streakHistory = []
}: StreakTrackerProps) {
  const [showStreakFreeze, setShowStreakFreeze] = useState(false);
  
  const today = new Date().toDateString();
  const isStreakActive = lastActiveDate === today;
  const streakEndangered = !isStreakActive && currentStreak > 0;
  
  // Calculate streak milestones
  const getNextMilestone = (streak: number) => {
    const milestones = [3, 7, 14, 30, 50, 100, 200, 365];
    return milestones.find(m => m > streak) || 999;
  };
  
  const nextMilestone = getNextMilestone(currentStreak);
  const progressToMilestone = (currentStreak / nextMilestone) * 100;
  
  // Generate last 7 days for visual streak display
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dateStr = date.toDateString();
      const isToday = i === 0;
      const isActive = streakHistory.find(h => h.date === dateStr)?.active || 
                      (isToday && isStreakActive);
      
      days.push({
        date: dateStr,
        day: date.getDate(),
        isToday,
        isActive,
        dayName: date.toLocaleDateString('tr-TR', { weekday: 'short' })
      });
    }
    
    return days;
  };

  const last7Days = getLast7Days();

  return (
    <div className="space-y-4">
      {/* Main Streak Display */}
      <Card className={`transition-all duration-300 ${
        currentStreak > 0 
          ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800'
          : 'bg-gray-50 dark:bg-gray-900'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={currentStreak > 0 ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'loop'
                }}
              >
                <Flame className={`w-6 h-6 ${
                  currentStreak > 0 ? 'text-orange-500' : 'text-gray-400'
                }`} />
              </motion.div>
              <span className="text-lg font-bold">
                Günlük Seri
              </span>
            </div>
            
            {/* Streak Freeze Indicator */}
            {streakFreezes > 0 && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {streakFreezes} Korumalı
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Streak */}
          <div className="text-center">
            <motion.div
              className="text-6xl font-bold mb-2"
              animate={currentStreak > 0 ? {
                textShadow: [
                  '0 0 10px rgba(249, 115, 22, 0.5)',
                  '0 0 20px rgba(249, 115, 22, 0.8)',
                  '0 0 10px rgba(249, 115, 22, 0.5)'
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                color: currentStreak > 0 ? '#f97316' : '#9ca3af'
              }}
            >
              {currentStreak}
            </motion.div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {currentStreak === 0 ? 'Henüz seri yok' : 
               currentStreak === 1 ? 'Gün seri' : 'Gün seri'}
            </p>
          </div>

          {/* Streak Status */}
          <div className="flex justify-center">
            {streakEndangered ? (
              <Badge variant="destructive" className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Seri Tehlikede!
              </Badge>
            ) : isStreakActive ? (
              <Badge className="bg-green-100 text-green-800 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Bugün Aktif
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Bugün Henüz Çalışmadın
              </Badge>
            )}
          </div>

          {/* 7-Day Visual Streak */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              Son 7 Gün
            </h4>
            <div className="grid grid-cols-7 gap-2">
              {last7Days.map((day, index) => (
                <motion.div
                  key={day.date}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {day.dayName}
                  </div>
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      day.isActive 
                        ? 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200'
                        : 'bg-gray-100 border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700'
                    } ${day.isToday ? 'ring-2 ring-blue-300' : ''}`}
                    animate={day.isActive ? {
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity, repeatType: 'loop' }}
                  >
                    {day.isActive ? (
                      <Flame className="w-4 h-4" />
                    ) : (
                      day.day
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Progress to Next Milestone */}
          {nextMilestone < 999 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Sonraki Kilometre Taşı
                </span>
                <span className="font-medium">
                  {nextMilestone} Gün
                </span>
              </div>
              <Progress value={progressToMilestone} className="h-2" />
              <div className="text-xs text-center text-gray-500">
                {nextMilestone - currentStreak} gün daha
              </div>
            </div>
          )}

          {/* Streak Freeze Button */}
          {streakEndangered && streakFreezes > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Button
                onClick={() => {
                  onUseStreakFreeze?.();
                  setShowStreakFreeze(true);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Seri Dondurucu Kullan
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Serini korumak için kullan ({streakFreezes} adet var)
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {longestStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                En Uzun Seri
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {streakFreezes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Seri Dondurucu
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Freeze Success Animation */}
      <AnimatePresence>
        {showStreakFreeze && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStreakFreeze(false)}
          >
            <motion.div
              className="bg-blue-500 text-white p-8 rounded-2xl text-center shadow-2xl max-w-sm mx-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="w-16 h-16 mx-auto mb-4" />
              </motion.div>
              
              <h2 className="text-2xl font-bold mb-2">
                SERİ KORUNDU!
              </h2>
              
              <p className="opacity-90 mb-4">
                Serinin bir gün için korundu. Yarın çalışmayı unutma!
              </p>
              
              <Button
                variant="secondary"
                onClick={() => setShowStreakFreeze(false)}
                className="bg-white text-blue-500 hover:bg-gray-100"
              >
                Tamam
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Streak Milestone Celebration
export function StreakMilestoneModal({
  milestone,
  isOpen,
  onClose
}: {
  milestone: number | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!milestone || !isOpen) return null;

  const getMilestoneReward = (days: number) => {
    if (days >= 365) return { xp: 3650, gems: 500, title: 'Yıllık Efsane' };
    if (days >= 100) return { xp: 1500, gems: 200, title: 'Yüz Gün Ustası' };
    if (days >= 30) return { xp: 500, gems: 75, title: 'Aylık Seri' };
    if (days >= 7) return { xp: 150, gems: 20, title: 'Haftalık Seri' };
    return { xp: 75, gems: 10, title: 'İlk Seri' };
  };

  const reward = getMilestoneReward(milestone);

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
          className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white p-8 rounded-2xl text-center shadow-2xl max-w-md mx-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -10, 10, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="w-20 h-20 mx-auto mb-4" />
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            SERİ MİLADI!
          </motion.h2>
          
          <motion.div 
            className="text-5xl font-bold mb-4"
            animate={{
              textShadow: [
                '0 0 10px rgba(255,255,255,0.5)',
                '0 0 20px rgba(255,255,255,0.8)',
                '0 0 10px rgba(255,255,255,0.5)'
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {milestone} GÜN
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <p className="text-xl opacity-90">
              {reward.title}
            </p>
            
            <div className="flex justify-center gap-4">
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="font-semibold">+{reward.xp} XP</span>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span className="font-semibold">+{reward.gems} Gem</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Fire particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                style={{
                  left: Math.random() * 100 + '%',
                  top: '100%',
                }}
                animate={{
                  y: [0, -400],
                  x: [0, (Math.random() - 0.5) * 100],
                  opacity: [1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
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