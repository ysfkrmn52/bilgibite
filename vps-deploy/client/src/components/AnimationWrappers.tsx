import { motion, useReducedMotion, useInView } from 'framer-motion';
import { ReactNode, useRef, useEffect, useState } from 'react';

// Page transition variants
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

// Stagger animation for lists
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Button hover effects
export const buttonHoverVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.98 }
};

// Card hover effects
export const cardHoverVariants = {
  hover: { 
    y: -4, 
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
  }
};

// Fade in animation
export const fadeInVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// Scale animation
export const scaleVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
};

// Slide in from left
export const slideInLeftVariants = {
  initial: { x: -50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -50, opacity: 0 }
};

// Slide in from right
export const slideInRightVariants = {
  initial: { x: 50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 50, opacity: 0 }
};

// Bounce animation
export const bounceVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const
    }
  }
};

// Pulse animation
export const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop" as const
    }
  }
};

// Wiggle animation
export const wiggleVariants = {
  animate: {
    rotate: [-3, 3, -3, 3, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: 2
    }
  }
};

// Enhanced interactive animations
export const hoverLiftVariants = {
  idle: { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  hover: { 
    y: -4, 
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: { type: "spring", stiffness: 300 }
  }
};

export const tiltHoverVariants = {
  idle: { rotateX: 0, rotateY: 0 },
  hover: { rotateX: 5, rotateY: 5 }
};

export const pressableVariants = {
  idle: { scale: 1 },
  pressed: { scale: 0.95 },
  hover: { scale: 1.02 }
};

export const floatVariants = {
  float: {
    y: [-3, 3, -3],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Quiz feedback animations
export const correctAnswerVariants = {
  initial: { scale: 1, backgroundColor: "#ffffff" },
  success: {
    scale: [1, 1.05, 1],
    backgroundColor: ["#ffffff", "#10b981", "#ffffff"],
    transition: { duration: 0.6 }
  }
};

export const incorrectAnswerVariants = {
  initial: { x: 0, backgroundColor: "#ffffff" },
  error: {
    x: [-5, 5, -5, 5, 0],
    backgroundColor: ["#ffffff", "#ef4444", "#ffffff"],
    transition: { duration: 0.5 }
  }
};

// Parallax background variants
export const parallaxVariants = {
  idle: { y: 0 },
  scroll: (offset: number) => ({
    y: offset * 0.5,
    transition: { type: "tween", ease: "linear", duration: 0 }
  })
};

// Check if animations should be disabled
const useAnimationsEnabled = () => {
  const prefersReducedMotion = useReducedMotion();
  const [animationsDisabled, setAnimationsDisabled] = useState(false);

  useEffect(() => {
    const envDisabled = import.meta.env.VITE_ANIMATIONS === 'off';
    setAnimationsDisabled(prefersReducedMotion || envDisabled);
  }, [prefersReducedMotion]);

  return !animationsDisabled;
};

// Enhanced wrapper components
interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  once?: boolean;
  delay?: number;
}

export function ScrollReveal({ 
  children, 
  className = "", 
  threshold = 0.1,
  once = true,
  delay = 0
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const animationsEnabled = useAnimationsEnabled();
  
  if (!animationsEnabled) {
    return <div ref={ref} className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

interface HoverLiftProps {
  children: ReactNode;
  className?: string;
  liftHeight?: number;
}

export function HoverLift({ 
  children, 
  className = "", 
  liftHeight = 4 
}: HoverLiftProps) {
  const animationsEnabled = useAnimationsEnabled();
  
  if (!animationsEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ 
        y: -liftHeight,
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        transition: { type: "spring", stiffness: 300 }
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  duration?: number;
}

export function FloatingElement({ 
  children, 
  className = "", 
  intensity = 3,
  duration = 3 
}: FloatingElementProps) {
  const animationsEnabled = useAnimationsEnabled();
  
  if (!animationsEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{
        y: [-intensity, intensity, -intensity],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

interface PressableProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function Pressable({ 
  children, 
  onClick, 
  className = "",
  disabled = false
}: PressableProps) {
  const animationsEnabled = useAnimationsEnabled();
  
  if (!animationsEnabled || disabled) {
    return (
      <button onClick={onClick} className={className} disabled={disabled}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}

// Motion components
export const MotionDiv = motion.div;
export const MotionSection = motion.section;
export const MotionButton = motion.button;
export const MotionCard = motion.div;