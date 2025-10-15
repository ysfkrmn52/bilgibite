// Performance Optimization Utilities
import { Suspense, lazy, ComponentType } from 'react';

// Lazy loading component wrapper with error boundary
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  componentName: string
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error(`Failed to load ${componentName}:`, error);
      // Retry mechanism
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await componentImport();
    }
  });
}

// Preload critical components
export function preloadComponent(componentImport: () => Promise<any>) {
  return componentImport();
}

// Image optimization utilities
export function generateImageSizes(src: string, sizes: number[] = [320, 640, 768, 1024, 1200]) {
  return sizes.map(size => `${src}?w=${size} ${size}w`).join(', ');
}

export function getOptimalImageSize(containerWidth: number): number {
  if (containerWidth <= 320) return 320;
  if (containerWidth <= 640) return 640;
  if (containerWidth <= 768) return 768;
  if (containerWidth <= 1024) return 1024;
  return 1200;
}

// Memory management
export class MemoryManager {
  private observers: IntersectionObserver[] = [];
  private timers: NodeJS.Timeout[] = [];

  createIntersectionObserver(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    const observer = new IntersectionObserver(callback, options);
    this.observers.push(observer);
    return observer;
  }

  createTimer(callback: () => void, delay: number) {
    const timer = setTimeout(callback, delay);
    this.timers.push(timer);
    return timer;
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.timers.forEach(timer => clearTimeout(timer));
    this.observers = [];
    this.timers = [];
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;

  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  measurePageLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
      
      console.log('Performance Metrics:', {
        loadTime: `${loadTime}ms`,
        domReady: `${domReady}ms`,
        firstPaint: this.getFirstPaint(),
        largestContentfulPaint: this.getLCP()
      });

      // Report to analytics
      if (window.gtag) {
        window.gtag('event', 'page_load_time', {
          event_category: 'Performance',
          value: loadTime
        });
      }
    }
  }

  private getFirstPaint(): string {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? `${Math.round(firstPaint.startTime)}ms` : 'N/A';
  }

  private getLCP(): string {
    return new Promise(resolve => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(`${Math.round(lastEntry.startTime)}ms`);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }) as any;
  }

  measureApiCall(url: string, startTime: number) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 1000) {
      console.warn(`Slow API call detected: ${url} took ${duration}ms`);
    }

    if (window.gtag) {
      window.gtag('event', 'api_call', {
        event_category: 'Performance',
        event_label: url,
        value: Math.round(duration)
      });
    }
  }
}

// Bundle size optimization utilities
export function dynamicImport<T>(
  moduleFactory: () => Promise<T>,
  fallback: T
): Promise<T> {
  return moduleFactory().catch(error => {
    console.error('Dynamic import failed:', error);
    return fallback;
  });
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    PerformanceMonitor.getInstance().measurePageLoad();
  });
}