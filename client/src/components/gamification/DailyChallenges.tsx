// Daily Challenges System with Visual Progress
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Clock, 
  Zap, 
  CheckCircle, 
  Star,
  Calendar,
  Trophy,
  TrendingUp,
  Flame,
  Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DailyChallenge, DailyChallengeManager, UserStats } from '@/lib/gamification';

interface DailyChallengesProps {
  userStats: UserStats;
  onChallengeComplete?: (challenge: DailyChallenge) => void;
}

export function DailyChallenges({ userStats, onChallengeComplete }: DailyChallengesProps) {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    // Generate daily challenges
    const dailyChallenges = DailyChallengeManager.generateDailyChallenges(userStats);
    setChallenges(dailyChallenges);

    // Update timer
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}s ${minutes}d`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [userStats]);

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'questions': return Target;
      case 'accuracy': return TrendingUp;
      case 'streak': return Flame;
      case 'speed': return Timer;
      case 'category': return Trophy;
      default: return Zap;
    }
  };

  const getChallengeColor = (type: string) => {
    switch (type) {
      case 'questions': return 'text-blue-500';
      case 'accuracy': return 'text-green-500';
      case 'streak': return 'text-orange-500';
      case 'speed': return 'text-purple-500';
      case 'category': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const handleChallengeProgress = (challengeId: string, progress: number) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId && !challenge.completed) {
        const newProgress = Math.min(challenge.progress + progress, challenge.target);
        const completed = newProgress >= challenge.target;
        
        if (completed && !completedToday.includes(challengeId)) {
          setCompletedToday(prev => [...prev, challengeId]);
          onChallengeComplete?.({ ...challenge, completed: true, progress: newProgress });
        }
        
        return { ...challenge, progress: newProgress, completed };
      }
      return challenge;
    }));
  };

  const completedChallenges = challenges.filter(c => c.completed).length;
  const totalRewards = challenges.reduce((acc, c) => ({
    xp: acc.xp + (c.completed ? c.xpReward : 0),
    gems: acc.gems + (c.completed ? c.gemReward : 0)
  }), { xp: 0, gems: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-500" />
              <span>Günlük Görevler</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {timeRemaining} kaldı
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {completedChallenges} / {challenges.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tamamlanan
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalRewards.xp}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Kazanılan XP
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {totalRewards.gems}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Kazanılan Gem
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenges List */}
      <div className="space-y-4">
        <AnimatePresence>
          {challenges.map((challenge, index) => {
            const IconComponent = getChallengeIcon(challenge.type);
            const progressPercent = (challenge.progress / challenge.target) * 100;
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`transition-all duration-300 ${
                  challenge.completed 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                    : 'hover:shadow-md'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Challenge Icon */}
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          challenge.completed 
                            ? 'bg-green-100 dark:bg-green-900' 
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                        animate={challenge.completed ? {
                          scale: [1, 1.1, 1],
                          rotate: [0, 360]
                        } : {}}
                        transition={{ duration: 1 }}
                      >
                        {challenge.completed ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <IconComponent className={`w-6 h-6 ${getChallengeColor(challenge.type)}`} />
                        )}
                      </motion.div>

                      {/* Challenge Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold ${
                            challenge.completed ? 'text-green-800 dark:text-green-200' : ''
                          }`}>
                            {challenge.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className="flex items-center gap-1"
                            >
                              <Zap className="w-3 h-3" />
                              {challenge.xpReward}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className="flex items-center gap-1"
                            >
                              <Star className="w-3 h-3" />
                              {challenge.gemReward}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {challenge.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                              İlerleme
                            </span>
                            <span className={`font-medium ${
                              challenge.completed ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {challenge.progress} / {challenge.target}
                            </span>
                          </div>
                          <Progress 
                            value={progressPercent} 
                            className={`h-2 ${
                              challenge.completed ? 'bg-green-200' : ''
                            }`}
                          />
                        </div>

                        {/* Completion Animation */}
                        <AnimatePresence>
                          {completedToday.includes(challenge.id) && (
                            <motion.div
                              className="text-center py-2"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <Badge className="bg-green-500 text-white">
                                ✨ Görev Tamamlandı! +{challenge.xpReward} XP +{challenge.gemReward} Gem
                              </Badge>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* All Challenges Completed */}
      <AnimatePresence>
        {completedChallenges === challenges.length && challenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center py-8"
          >
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-6">
                <motion.div
                  animate={{ 
                    rotate: [0, -5, 5, -5, 5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                  Tüm Görevler Tamamlandı!
                </h3>
                
                <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                  Bugünün tüm görevlerini başarıyla tamamladın!
                </p>
                
                <div className="flex justify-center gap-4">
                  <Badge className="bg-yellow-500 text-white px-4 py-2 text-lg">
                    +{totalRewards.xp} XP Kazandın
                  </Badge>
                  <Badge className="bg-orange-500 text-white px-4 py-2 text-lg">
                    +{totalRewards.gems} Gem Kazandın
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge Tips */}
      <Card className="bg-gray-50 dark:bg-gray-900">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            İpuçları
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Günlük görevler her gün gece yarısında yenilenir</li>
            <li>• Tüm görevleri tamamlayarak bonus ödüller kazan</li>
            <li>• Zorluk seviyen arttıkça görevler daha değerli olur</li>
            <li>• Seriyi koruyarak ek görevler aç</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Challenge Completion Modal
export function ChallengeCompleteModal({
  challenge,
  isOpen,
  onClose
}: {
  challenge: DailyChallenge | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!challenge || !isOpen) return null;

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
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-8 rounded-2xl text-center shadow-2xl max-w-md mx-4"
          initial={{ scale: 0, y: 100 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <CheckCircle className="w-20 h-20 mx-auto mb-4" />
          </motion.div>
          
          <motion.h2 
            className="text-3xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            GÖREV TAMAMLANDI!
          </motion.h2>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h3 className="text-xl font-semibold mb-2">
              {challenge.title}
            </h3>
            <p className="opacity-90">
              {challenge.description}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4 mb-6"
          >
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="font-semibold">+{challenge.xpReward} XP</span>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="font-semibold">+{challenge.gemReward} Gem</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onClose}
              variant="secondary"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              Devam Et
            </Button>
          </motion.div>

          {/* Celebration particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-yellow-300 rounded-full"
                style={{
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                }}
                animate={{
                  y: [0, -50],
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