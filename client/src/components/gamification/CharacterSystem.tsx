// Animated Character System - BilgiBite Mascot
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CharacterSystemProps {
  mood: 'happy' | 'excited' | 'sad' | 'thinking' | 'celebrating' | 'encouraging';
  level: number;
  streak: number;
  onCharacterClick?: () => void;
}

export function CharacterSystem({ mood, level, streak, onCharacterClick }: CharacterSystemProps) {
  const [currentMood, setCurrentMood] = useState(mood);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogText, setDialogText] = useState('');

  useEffect(() => {
    setCurrentMood(mood);
    
    // Set dialog text based on mood
    switch (mood) {
      case 'happy':
        setDialogText('Harika gidiyorsun! 😊');
        break;
      case 'excited':
        setDialogText('Muhteşem! Devam et! 🎉');
        break;
      case 'sad':
        setDialogText('Pes etme, bir dahakine! 💪');
        break;
      case 'thinking':
        setDialogText('Düşünüyorum... 🤔');
        break;
      case 'celebrating':
        setDialogText('Tebrikler! Harika başarı! 🏆');
        break;
      case 'encouraging':
        setDialogText('Sen yapabilirsin! 🌟');
        break;
      default:
        setDialogText('Merhaba! 👋');
    }

    // Show dialog briefly when mood changes
    setShowDialog(true);
    const timer = setTimeout(() => setShowDialog(false), 3000);
    return () => clearTimeout(timer);
  }, [mood]);

  const getCharacterEmoji = () => {
    switch (currentMood) {
      case 'happy': return '😊';
      case 'excited': return '🤩';
      case 'sad': return '😔';
      case 'thinking': return '🤔';
      case 'celebrating': return '🥳';
      case 'encouraging': return '💪';
      default: return '😊';
    }
  };

  const getCharacterColor = () => {
    switch (currentMood) {
      case 'happy': return 'from-green-400 to-blue-400';
      case 'excited': return 'from-yellow-400 to-orange-400';
      case 'sad': return 'from-gray-400 to-blue-400';
      case 'thinking': return 'from-purple-400 to-indigo-400';
      case 'celebrating': return 'from-yellow-400 to-pink-400';
      case 'encouraging': return 'from-orange-400 to-red-400';
      default: return 'from-blue-400 to-purple-400';
    }
  };

  const getAnimationVariants = () => {
    switch (currentMood) {
      case 'excited':
        return {
          animate: { 
            scale: [1, 1.1, 1], 
            rotate: [0, -5, 5, 0],
            y: [0, -10, 0]
          },
          transition: { duration: 1, repeat: Infinity }
        };
      case 'celebrating':
        return {
          animate: { 
            scale: [1, 1.2, 1.1, 1.2, 1],
            rotate: [0, -15, 15, -15, 0]
          },
          transition: { duration: 2, repeat: Infinity }
        };
      case 'thinking':
        return {
          animate: { 
            scale: [1, 1.05, 1],
            x: [0, 2, -2, 0]
          },
          transition: { duration: 3, repeat: Infinity }
        };
      case 'encouraging':
        return {
          animate: { 
            y: [0, -5, 0],
            scale: [1, 1.05, 1]
          },
          transition: { duration: 1.5, repeat: Infinity }
        };
      default:
        return {
          animate: { 
            scale: [1, 1.02, 1],
            rotate: [0, 1, -1, 0]
          },
          transition: { duration: 4, repeat: Infinity }
        };
    }
  };

  const { animate, transition } = getAnimationVariants();

  return (
    <div className="relative">
      {/* Character */}
      <motion.div
        className={`
          relative w-24 h-24 rounded-full cursor-pointer
          bg-gradient-to-br ${getCharacterColor()}
          flex items-center justify-center
          shadow-lg hover:shadow-xl
          border-4 border-white dark:border-gray-800
        `}
        animate={animate}
        transition={transition}
        onClick={() => {
          onCharacterClick?.();
          setShowDialog(!showDialog);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Character Face */}
        <div className="text-4xl">
          {getCharacterEmoji()}
        </div>

        {/* Level Badge */}
        <motion.div
          className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {level}
        </motion.div>

        {/* Streak Fire */}
        {streak > 0 && (
          <motion.div
            className="absolute -bottom-2 -left-2"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
              🔥
            </div>
          </motion.div>
        )}

        {/* Sparkle Effects */}
        {currentMood === 'celebrating' && (
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                style={{
                  left: `${20 + Math.cos(i * 45 * Math.PI / 180) * 40}px`,
                  top: `${20 + Math.sin(i * 45 * Math.PI / 180) * 40}px`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Speech Bubble */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            className="absolute -top-16 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                {dialogText}
              </div>
              {/* Speech bubble tail */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Particles */}
      <AnimatePresence>
        {currentMood === 'excited' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: `${30 + i * 20}%`,
                  top: `${30 + i * 10}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Character Customization Panel
export function CharacterCustomization({ 
  currentTheme, 
  onThemeChange,
  availableThemes 
}: {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  availableThemes: Array<{ id: string; name: string; preview: string; unlockLevel: number; }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Karakter Teması</h3>
      <div className="grid grid-cols-3 gap-3">
        {availableThemes.map((theme) => (
          <motion.div
            key={theme.id}
            className={`
              relative p-4 rounded-lg border-2 cursor-pointer transition-all
              ${currentTheme === theme.id 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }
            `}
            onClick={() => onThemeChange(theme.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">{theme.preview}</div>
              <div className="text-sm font-medium">{theme.name}</div>
              {theme.unlockLevel > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Lv. {theme.unlockLevel}
                </div>
              )}
            </div>
            {currentTheme === theme.id && (
              <motion.div
                className="absolute inset-0 border-2 border-blue-500 rounded-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}