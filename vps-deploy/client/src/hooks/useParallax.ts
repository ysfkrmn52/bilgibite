import { useEffect, useState, useRef, MutableRefObject } from 'react';
import { useReducedMotion } from 'framer-motion';

interface ParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down';
  threshold?: number;
  rootMargin?: string;
}

interface ParallaxReturn {
  ref: MutableRefObject<HTMLElement | null>;
  offset: number;
  style: {
    transform: string;
    willChange?: string;
  };
}

export function useParallax({
  speed = 0.5,
  direction = 'up',
  threshold = 0,
  rootMargin = '0px'
}: ParallaxOptions = {}): ParallaxReturn {
  const [offset, setOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Skip parallax if reduced motion is preferred or animations are disabled
    if (prefersReducedMotion || import.meta.env.VITE_ANIMATIONS === 'off') {
      return;
    }

    const element = ref.current;
    if (!element) return;

    // Intersection Observer to check if element is visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { 
        threshold,
        rootMargin 
      }
    );

    observer.observe(element);

    const handleScroll = () => {
      if (!isVisible || !element) return;

      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      // Calculate scroll progress for the element
      const progress = (windowHeight - elementTop) / (windowHeight + elementHeight);
      
      // Apply speed multiplier and direction
      const scrollOffset = progress * speed * 100;
      const finalOffset = direction === 'up' ? -scrollOffset : scrollOffset;
      
      setOffset(finalOffset);
    };

    // Use requestAnimationFrame for smooth scrolling
    let rafId: number;
    const throttledScroll = () => {
      rafId = requestAnimationFrame(handleScroll);
    };

    // Initial calculation
    handleScroll();

    // Add scroll listener with throttling
    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [speed, direction, threshold, rootMargin, isVisible, prefersReducedMotion]);

  // Return style object for transform
  const style = {
    transform: `translateY(${offset}px)`,
    ...(isVisible && !prefersReducedMotion && { willChange: 'transform' })
  };

  return { ref, offset, style };
}

// Hook for scroll-based scale animation
export function useScrollScale(options: { 
  scale?: [number, number];
  threshold?: number;
} = {}) {
  const { scale = [0.8, 1], threshold = 0.1 } = options;
  const [scaleValue, setScaleValue] = useState(scale[0]);
  const ref = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setScaleValue(scale[1]);
        } else {
          setScaleValue(scale[0]);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [scale, threshold, prefersReducedMotion]);

  return {
    ref,
    style: {
      transform: `scale(${scaleValue})`,
      transition: 'transform 0.6s ease-out'
    }
  };
}

// Hook for scroll-based rotation
export function useScrollRotate(options: {
  rotation?: number;
  threshold?: number;
} = {}) {
  const { rotation = 360, threshold = 0.1 } = options;
  const [rotateValue, setRotateValue] = useState(0);
  const ref = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, 
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      ));
      
      setRotateValue(progress * rotation);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [rotation, prefersReducedMotion]);

  return {
    ref,
    style: {
      transform: `rotate(${rotateValue}deg)`,
      transition: 'transform 0.1s linear'
    }
  };
}