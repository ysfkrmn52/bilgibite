// Enhanced Quiz Results with Duolingo-style animations and metrics
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Star, Flame, Clock, Target, TrendingUp, 
  Heart, Zap, Medal, RefreshCw, Home, Share2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface QuizResultsProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: {
    totalScore: number;
    xpGained: number;
    accuracy: number;
    bestStreak: number;
    totalTime: number;
    averageTimePerQuestion: number;
    livesRemaining: number;
    questionsCompleted: number;
    perfectQuestions: number;
  };
  onStartNewQuiz: () => void;
  onBackToDashboard: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const statCardVariants = {
  hidden: { opacity: 0, scale: 0.8, rotateX: -90 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay: 0.2
    }
  }
};

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getPerformanceMessage(accuracy: number): string {
  if (accuracy >= 90) return "Mükemmel performans! 🏆";
  if (accuracy >= 80) return "Harika çalışma! ⭐";
  if (accuracy >= 70) return "İyi gidiyorsun! 👍";
  if (accuracy >= 60) return "Devam et, başarıyorsun! 💪";
  return "Pratik yapmaya devam et! 📚";
}

function getGrade(accuracy: number): string {
  if (accuracy >= 95) return "A+";
  if (accuracy >= 90) return "A";
  if (accuracy >= 85) return "B+";
  if (accuracy >= 80) return "B";
  if (accuracy >= 75) return "C+";
  if (accuracy >= 70) return "C";
  if (accuracy >= 65) return "D+";
  if (accuracy >= 60) return "D";
  return "F";
}

export function QuizResults({ isOpen, onClose, metrics, onStartNewQuiz, onBackToDashboard }: QuizResultsProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedMetrics, setAnimatedMetrics] = useState({
    score: 0,
    xp: 0,
    accuracy: 0,
  });

  useEffect(() => {
    if (isOpen && metrics.accuracy >= 80) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    // Animate metrics
    if (isOpen) {
      const duration = 2000;
      const steps = 60;
      const scoreStep = metrics.totalScore / steps;
      const xpStep = metrics.xpGained / steps;
      const accuracyStep = metrics.accuracy / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setAnimatedMetrics({
          score: Math.min(Math.floor(scoreStep * currentStep), metrics.totalScore),
          xp: Math.min(Math.floor(xpStep * currentStep), metrics.xpGained),
          accuracy: Math.min(Math.floor(accuracyStep * currentStep), metrics.accuracy),
        });
        
        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, metrics]);

  if (!isOpen) return null;

  const grade = getGrade(metrics.accuracy);
  const performanceMessage = getPerformanceMessage(metrics.accuracy);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{
                    x: Math.random() * 100 + "%",
                    y: -10,
                    rotate: 0,
                  }}
                  animate={{
                    y: "110%",
                    rotate: 360,
                    x: Math.random() * 100 + "%",
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <motion.div
                className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Quiz Tamamlandı!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {performanceMessage}
              </p>
            </motion.div>

            {/* Grade Display */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <motion.div
                className={`inline-block px-6 py-3 rounded-2xl text-4xl font-bold ${
                  grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                  grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                  grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
              >
                {grade}
              </motion.div>
            </motion.div>

            {/* Main Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-8">
              <motion.div variants={statCardVariants}>
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700">
                  <CardContent className="p-6 text-center">
                    <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {animatedMetrics.score}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Puan</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={statCardVariants}>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-200 dark:border-yellow-700">
                  <CardContent className="p-6 text-center">
                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                      +{animatedMetrics.xp}
                    </div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">XP</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={statCardVariants}>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700">
                  <CardContent className="p-6 text-center">
                    <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {animatedMetrics.accuracy}%
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Doğruluk</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={statCardVariants}>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-700">
                  <CardContent className="p-6 text-center">
                    <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                      {metrics.livesRemaining}
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400">Kalan Kalp</div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Detailed Stats */}
            <motion.div variants={itemVariants} className="space-y-4 mb-8">
              <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        {metrics.bestStreak}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">En İyi Seri</div>
                    </div>
                    
                    <div>
                      <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        {formatTime(metrics.totalTime)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Süre</div>
                    </div>
                    
                    <div>
                      <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        {formatTime(metrics.averageTimePerQuestion)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Ortalama Süre</div>
                    </div>
                    
                    <div>
                      <Medal className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-gray-800 dark:text-white">
                        {metrics.perfectQuestions}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Mükemmel</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress Visualization */}
            <motion.div variants={itemVariants} className="mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Genel İlerleme
                    </span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {metrics.questionsCompleted} soru tamamlandı
                    </span>
                  </div>
                  <Progress value={metrics.accuracy} className="h-3 mb-4" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="text-green-600 dark:text-green-400 font-bold">
                        {Math.round(metrics.questionsCompleted * metrics.accuracy / 100)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">Doğru</div>
                    </div>
                    <div>
                      <div className="text-red-600 dark:text-red-400 font-bold">
                        {metrics.questionsCompleted - Math.round(metrics.questionsCompleted * metrics.accuracy / 100)}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">Yanlış</div>
                    </div>
                    <div>
                      <div className="text-purple-600 dark:text-purple-400 font-bold">
                        {metrics.perfectQuestions}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">Hızlı</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={onStartNewQuiz}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                size="lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Tekrar Dene
              </Button>
              
              <Button
                onClick={onBackToDashboard}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Ana Sayfa
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="px-6"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}