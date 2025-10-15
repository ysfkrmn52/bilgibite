// Animated XP Progress Bar with Level System
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { XPCalculator, XPSystem } from '@/lib/gamification';

interface XPProgressBarProps {
  currentXP: number;
  newXP?: number;
  onAnimationComplete?: () => void;
  showLevelUp?: boolean;
}

export function XPProgressBar({ 
  currentXP, 
  newXP, 
  onAnimationComplete,
  showLevelUp = false 
}: XPProgressBarProps) {
  const [animatedXP, setAnimatedXP] = useState(currentXP);
  const [showXPGain, setShowXPGain] = useState(false);
  const [levelUp, setLevelUp] = useState(false);
  
  const currentLevel = XPCalculator.calculateLevel(animatedXP);
  const xpSystem = XPCalculator.getXPForLevel(currentLevel);
  const xpInCurrentLevel = animatedXP - xpSystem.totalXPForLevel;
  const progressPercent = (xpInCurrentLevel / xpSystem.xpToNextLevel) * 100;

  useEffect(() => {
    if (newXP && newXP > currentXP) {
      const xpGain = newXP - currentXP;
      setShowXPGain(true);
      
      // Check if level up occurs
      const oldLevel = XPCalculator.calculateLevel(currentXP);
      const newLevel = XPCalculator.calculateLevel(newXP);
      
      if (newLevel > oldLevel) {
        setLevelUp(true);
      }

      // Animate XP gain
      const duration = Math.min(2000, xpGain * 20); // Max 2 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentAnimatedXP = currentXP + (xpGain * easeOut);
        
        setAnimatedXP(Math.floor(currentAnimatedXP));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setShowXPGain(false);
          if (levelUp) {
            setTimeout(() => setLevelUp(false), 3000);
          }
          onAnimationComplete?.();
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [newXP, currentXP]);

  return (
    <div className="relative">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          {/* Level Display */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                {currentLevel}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  Seviye {currentLevel}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {animatedXP.toLocaleString()} XP
                </div>
              </div>
            </div>
            
            {/* Next Level Preview */}
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              <div>Seviye {currentLevel + 1}</div>
              <div className="font-medium">
                {(xpSystem.xpToNextLevel - xpInCurrentLevel).toLocaleString()} XP kaldı
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <Progress 
              value={progressPercent} 
              className="h-4 bg-gray-200 dark:bg-gray-700"
            />
            
            {/* Sparkle Effects */}
            <AnimatePresence>
              {showXPGain && (
                <motion.div
                  className="absolute -top-1 left-0 w-full h-6 pointer-events-none overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{ 
                        x: Math.random() * 100 + '%',
                        y: 0,
                        scale: 0,
                        rotate: 0
                      }}
                      animate={{ 
                        y: -20,
                        scale: [0, 1, 0],
                        rotate: 360
                      }}
                      transition={{ 
                        duration: 1.5,
                        delay: i * 0.1,
                        ease: 'easeOut'
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* XP Gain Animation */}
          <AnimatePresence>
            {showXPGain && newXP && (
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                initial={{ y: 0, opacity: 0, scale: 0.8 }}
                animate={{ y: -20, opacity: 1, scale: 1 }}
                exit={{ y: -40, opacity: 0, scale: 0.8 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <div className="bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  +{newXP - currentXP} XP
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Level Up Animation */}
      <AnimatePresence>
        {(levelUp || showLevelUp) && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-8 rounded-2xl text-center shadow-2xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                type: 'spring',
                stiffness: 200,
                damping: 15,
                duration: 0.8 
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'loop'
                }}
              >
                <Trophy className="w-16 h-16 mx-auto mb-4" />
              </motion.div>
              
              <motion.h2 
                className="text-4xl font-bold mb-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                SEVİYE ATLADIN!
              </motion.h2>
              
              <motion.div 
                className="text-6xl font-bold mb-4"
                animate={{ 
                  textShadow: [
                    '0 0 10px rgba(255,255,255,0.5)',
                    '0 0 20px rgba(255,255,255,0.8)',
                    '0 0 10px rgba(255,255,255,0.5)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {currentLevel}
              </motion.div>
              
              <motion.p 
                className="text-xl opacity-90"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Tebrikler! Yeni yetenekler açıldı!
              </motion.p>

              {/* Confetti Effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                    style={{
                      left: Math.random() * 100 + '%',
                      top: Math.random() * 100 + '%',
                    }}
                    animate={{
                      y: [0, -100, 100],
                      x: [0, Math.random() * 200 - 100],
                      rotate: [0, 360],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.02,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}