// Duolingo-style Feedback and Celebration Components
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Star, Flame, Trophy, Zap } from 'lucide-react';
import { QuizFeedback as QuizFeedbackType } from '@/lib/quiz-engine';

interface QuizFeedbackProps {
  feedback: QuizFeedbackType | null;
  isVisible: boolean;
}

const celebrationVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 200,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { scale: 0, opacity: 0 }
};

const sparkleVariants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: { 
    scale: [0, 1.2, 1], 
    rotate: [0, 180, 360], 
    opacity: [0, 1, 0.8],
    transition: { duration: 1.5, ease: "easeOut" }
  }
};

const textVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", damping: 15, stiffness: 200 }
  }
};

export function QuizFeedback({ feedback, isVisible }: QuizFeedbackProps) {
  if (!feedback || !isVisible) return null;

  const isCorrect = feedback.isCorrect;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          variants={celebrationVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`relative p-8 rounded-3xl max-w-md w-full text-center ${
            isCorrect 
              ? 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 text-white' 
              : 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 text-white'
          }`}
        >
          {/* Background decorations */}
          {isCorrect && (
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  variants={sparkleVariants}
                  className="absolute text-yellow-300"
                  style={{
                    left: `${Math.random() * 80 + 10}%`,
                    top: `${Math.random() * 80 + 10}%`,
                  }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              ))}
            </div>
          )}

          {/* Main icon */}
          <motion.div
            variants={textVariants}
            className="mb-4"
          >
            {isCorrect ? (
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-12 h-12 text-yellow-300" />
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-12 h-12 text-white opacity-75" />
              </div>
            )}
          </motion.div>

          {/* Success/Failure message */}
          <motion.h2
            variants={textVariants}
            className="text-3xl font-bold mb-2"
          >
            {feedback.message}
          </motion.h2>

          {/* XP gain */}
          {feedback.xpGained > 0 && (
            <motion.div
              variants={textVariants}
              className="flex items-center justify-center space-x-2 mb-4"
            >
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-lg font-semibold">+{feedback.xpGained} XP</span>
            </motion.div>
          )}

          {/* Streak display */}
          {feedback.streakCount > 1 && (
            <motion.div
              variants={textVariants}
              className="flex items-center justify-center space-x-2 mb-4"
            >
              <Flame className="w-5 h-5 text-orange-300" />
              <span className="text-lg font-semibold">{feedback.streakCount} Seri!</span>
            </motion.div>
          )}

          {/* Hearts lost */}
          {feedback.heartsLost && (
            <motion.div
              variants={textVariants}
              className="flex items-center justify-center space-x-2 mb-4"
            >
              <Heart className="w-5 h-5 text-red-200" />
              <span className="text-lg">-{feedback.heartsLost} Kalp</span>
            </motion.div>
          )}

          {/* Explanation */}
          {feedback.explanation && (
            <motion.div
              variants={textVariants}
              className="mt-6 p-4 bg-white/10 rounded-xl backdrop-blur-sm"
            >
              <p className="text-sm text-white/90 leading-relaxed">
                {feedback.explanation}
              </p>
            </motion.div>
          )}

          {/* Encouraging message for wrong answers */}
          {!isCorrect && (
            <motion.p
              variants={textVariants}
              className="mt-4 text-white/80"
            >
              Pes etme! Bir sonraki soruda başarırsın! 💪
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// XP Gain Animation Component
interface XPGainProps {
  xpGain: number;
  isVisible: boolean;
  onComplete: () => void;
}

export function XPGainAnimation({ xpGain, isVisible, onComplete }: XPGainProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className="fixed top-20 right-8 z-40 pointer-events-none"
          initial={{ opacity: 0, scale: 0, x: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            x: 0,
            y: [0, -20, 0]
          }}
          exit={{ 
            opacity: 0, 
            scale: 0, 
            y: -50,
            transition: { duration: 0.3 }
          }}
          transition={{ 
            duration: 1.5,
            y: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }
          }}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span className="font-bold">+{xpGain} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Streak Display Component
interface StreakDisplayProps {
  streak: number;
  className?: string;
}

export function StreakDisplay({ streak, className = '' }: StreakDisplayProps) {
  if (streak === 0) return null;

  return (
    <motion.div
      className={`flex items-center space-x-1 ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      key={streak} // Re-animate when streak changes
    >
      <motion.div
        animate={{ 
          rotate: [0, -10, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 0.5,
          repeat: streak > 5 ? Infinity : 0,
          repeatDelay: 2
        }}
      >
        <Flame className="w-5 h-5 text-orange-500" />
      </motion.div>
      <span className="font-bold text-orange-600 dark:text-orange-400">
        {streak}
      </span>
      {streak >= 5 && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs text-orange-500 font-semibold"
        >
          Ateş!
        </motion.span>
      )}
    </motion.div>
  );
}

// Lives Display Component
interface LivesDisplayProps {
  lives: number;
  maxLives: number;
  className?: string;
}

export function LivesDisplay({ lives, maxLives, className = '' }: LivesDisplayProps) {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[...Array(maxLives)].map((_, index) => (
        <motion.div
          key={index}
          animate={
            index < lives 
              ? { scale: [1, 1.2, 1], opacity: 1 }
              : { scale: 1, opacity: 0.3 }
          }
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Heart 
            className={`w-5 h-5 ${
              index < lives 
                ? 'text-red-500 fill-current' 
                : 'text-gray-300 dark:text-gray-600'
            }`} 
          />
        </motion.div>
      ))}
      {lives <= 1 && lives > 0 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-red-500 font-semibold ml-2"
        >
          Son şans!
        </motion.span>
      )}
    </div>
  );
}