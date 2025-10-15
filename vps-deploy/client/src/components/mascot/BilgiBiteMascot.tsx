import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface MascotProps {
  emotion?: 'happy' | 'excited' | 'thinking' | 'celebrating' | 'encouraging';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BilgiBiteMascot({ 
  emotion = 'happy', 
  size = 'md',
  className = '' 
}: MascotProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Blink animation effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32'
  };

  const emotionVariants = {
    happy: {
      scale: [1, 1.05, 1],
      rotate: [0, 2, -2, 0],
    },
    excited: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      y: [0, -5, 0],
    },
    thinking: {
      rotate: [0, 10, -10, 0],
      scale: 1,
    },
    celebrating: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      y: [0, -10, 0],
    },
    encouraging: {
      scale: [1, 1.08, 1],
      y: [0, -3, 0],
    }
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}
      variants={emotionVariants}
      animate={emotion}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      {/* Mascot SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <motion.circle
          cx="50"
          cy="60"
          r="25"
          fill="url(#bodyGradient)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        />
        
        {/* Head */}
        <motion.circle
          cx="50"
          cy="35"
          r="20"
          fill="url(#headGradient)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
        />
        
        {/* Graduation Cap */}
        <motion.g
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <ellipse cx="50" cy="25" rx="18" ry="3" fill="#2D3748" />
          <rect x="45" y="22" width="10" height="8" fill="#2D3748" />
          <circle cx="65" cy="25" r="2" fill="#F6AD55" />
        </motion.g>

        {/* Eyes */}
        <motion.g>
          <circle 
            cx="44" 
            cy="32" 
            r={isBlinking ? "0.5" : "3"} 
            fill="#2D3748"
            className="transition-all duration-150"
          />
          <circle 
            cx="56" 
            cy="32" 
            r={isBlinking ? "0.5" : "3"} 
            fill="#2D3748"
            className="transition-all duration-150"
          />
          {!isBlinking && (
            <>
              <circle cx="45" cy="31" r="1" fill="white" />
              <circle cx="57" cy="31" r="1" fill="white" />
            </>
          )}
        </motion.g>

        {/* Mouth based on emotion */}
        <motion.g>
          {emotion === 'happy' && (
            <path d="M 42 40 Q 50 45 58 40" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
          {emotion === 'excited' && (
            <>
              <circle cx="50" cy="42" r="4" fill="#F6AD55" />
              <path d="M 46 41 Q 50 44 54 41" stroke="#2D3748" strokeWidth="1.5" fill="none" />
            </>
          )}
          {emotion === 'thinking' && (
            <ellipse cx="50" cy="41" rx="2" ry="1" fill="#2D3748" />
          )}
          {emotion === 'celebrating' && (
            <>
              <circle cx="50" cy="42" r="5" fill="#F6AD55" />
              <path d="M 44 41 Q 50 46 56 41" stroke="#2D3748" strokeWidth="2" fill="none" />
            </>
          )}
          {emotion === 'encouraging' && (
            <path d="M 44 40 Q 50 44 56 40" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
        </motion.g>

        {/* Arms */}
        <motion.g
          initial={{ rotate: -20 }}
          animate={{ rotate: emotion === 'celebrating' ? [0, 20, 0] : 0 }}
          transition={{ duration: 1, repeat: emotion === 'celebrating' ? Infinity : 0 }}
          style={{ transformOrigin: "40px 55px" }}
        >
          <ellipse cx="35" cy="55" rx="3" ry="8" fill="url(#bodyGradient)" transform="rotate(-30 35 55)" />
        </motion.g>
        
        <motion.g
          initial={{ rotate: 20 }}
          animate={{ rotate: emotion === 'celebrating' ? [0, -20, 0] : 0 }}
          transition={{ duration: 1, repeat: emotion === 'celebrating' ? Infinity : 0 }}
          style={{ transformOrigin: "65px 55px" }}
        >
          <ellipse cx="65" cy="55" rx="3" ry="8" fill="url(#bodyGradient)" transform="rotate(30 65 55)" />
        </motion.g>

        {/* Thought bubbles for thinking emotion */}
        {emotion === 'thinking' && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <circle cx="72" cy="20" r="2" fill="#E2E8F0" />
            <circle cx="78" cy="15" r="3" fill="#E2E8F0" />
            <circle cx="85" cy="12" r="4" fill="#E2E8F0" />
          </motion.g>
        )}

        {/* Celebration particles */}
        {emotion === 'celebrating' && (
          <motion.g>
            {[...Array(6)].map((_, i) => (
              <motion.circle
                key={i}
                cx={30 + i * 8}
                cy={15}
                r="1"
                fill={i % 2 === 0 ? "#F6AD55" : "#4299E1"}
                initial={{ y: 0, opacity: 1 }}
                animate={{ 
                  y: [-10, -20, -10],
                  opacity: [1, 0.7, 1],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </motion.g>
        )}

        {/* Gradients */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4299E1" />
            <stop offset="100%" stopColor="#3182CE" />
          </linearGradient>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#63B3ED" />
            <stop offset="100%" stopColor="#4299E1" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}