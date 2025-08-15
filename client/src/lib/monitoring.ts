// Error Monitoring and Performance Tracking
import { AnalyticsManager } from './analytics';

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  userAgent: string;
  timestamp: number;
  userId?: string;
  context?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceMetrics {
  loadTime: number;
  domReady: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private errors: ErrorReport[] = [];
  private analytics: AnalyticsManager;
  private isInitialized = false;

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  constructor() {
    this.analytics = AnalyticsManager.getInstance();
  }

  initialize() {
    if (this.isInitialized) return;

    this.setupErrorHandlers();
    this.setupPerformanceMonitoring();
    this.setupNetworkMonitoring();
    this.setupResourceMonitoring();
    
    this.isInitialized = true;
    console.log('Monitoring service initialized');
  }

  private setupErrorHandlers() {
    // Global JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        line: event.lineno,
        column: event.colno,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'high'
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'high',
        context: 'promise_rejection'
      });
    });

    // React error boundary integration
    window.addEventListener('react-error', ((event: CustomEvent) => {
      this.reportError({
        message: event.detail.message,
        stack: event.detail.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'critical',
        context: 'react_component'
      });
    }) as EventListener);
  }

  private setupPerformanceMonitoring() {
    // Core Web Vitals
    this.observeWebVitals();

    // Page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = this.collectPerformanceMetrics();
        this.reportPerformanceMetrics(metrics);
      }, 1000);
    });

    // Long tasks detection
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.analytics.trackPerformance('long_task', entry.duration);
            console.warn(`Long task detected: ${entry.duration}ms`);
          }
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Longtask API not supported
      }
    }
  }

  private observeWebVitals() {
    if (!('PerformanceObserver' in window)) return;

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.analytics.trackPerformance('lcp', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.analytics.trackPerformance('fid', (entry as any).processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          this.analytics.trackPerformance('cls', (entry as any).value);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private setupNetworkMonitoring() {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] as string;

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Track slow API calls
        if (duration > 2000) {
          this.analytics.trackPerformance('slow_api_call', duration, url);
        }

        // Track failed requests
        if (!response.ok) {
          this.reportError({
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: url,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            severity: response.status >= 500 ? 'high' : 'medium',
            context: 'api_error'
          });
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.reportError({
          message: `Network error: ${(error as Error).message}`,
          url: url,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          severity: 'high',
          context: 'network_error'
        });

        throw error;
      }
    };
  }

  private setupResourceMonitoring() {
    // Monitor resource loading
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          
          // Track slow resources
          if (resource.duration > 3000) {
            this.analytics.trackPerformance('slow_resource', resource.duration, resource.name);
          }

          // Track failed resources
          if (resource.transferSize === 0 && resource.decodedBodySize === 0) {
            this.reportError({
              message: `Failed to load resource: ${resource.name}`,
              url: resource.name,
              userAgent: navigator.userAgent,
              timestamp: Date.now(),
              severity: 'medium',
              context: 'resource_loading'
            });
          }
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
    }
  }

  private collectPerformanceMetrics(): PerformanceMetrics {
    const timing = performance.timing;
    const paintEntries = performance.getEntriesByType('paint');

    return {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      largestContentfulPaint: 0, // Will be updated by observer
      cumulativeLayoutShift: 0, // Will be updated by observer
      firstInputDelay: 0, // Will be updated by observer
      timeToInteractive: this.calculateTTI()
    };
  }

  private calculateTTI(): number {
    // Simplified TTI calculation
    // In production, use a proper TTI calculation library
    return performance.timing.domInteractive - performance.timing.navigationStart;
  }

  reportError(error: ErrorReport) {
    // Store error locally
    this.errors.push(error);

    // Report to analytics
    this.analytics.trackError(new Error(error.message), error.context);

    // Send to monitoring service (Sentry, LogRocket, etc.)
    this.sendToMonitoringService(error);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Monitored error:', error);
    }
  }

  private reportPerformanceMetrics(metrics: PerformanceMetrics) {
    Object.entries(metrics).forEach(([key, value]) => {
      if (value > 0) {
        this.analytics.trackPerformance(key, value);
      }
    });

    // Alert on poor performance
    if (metrics.loadTime > 5000) {
      this.reportError({
        message: `Slow page load: ${metrics.loadTime}ms`,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'medium',
        context: 'performance'
      });
    }
  }

  private async sendToMonitoringService(error: ErrorReport) {
    // Filter out Firebase auth errors in development mode
    if (error.message.includes('Failed to fetch') && 
        (error.url?.includes('googleapis.com') || error.url?.includes('firebaseapp.com'))) {
      console.warn('Firebase auth error (expected in development):', error.message);
      return;
    }

    // Filter out Replit beacon errors
    if (error.message.includes('beacon.js')) {
      return;
    }

    try {
      // In production, send to your monitoring service
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error)
      });
    } catch (e) {
      console.warn('Failed to send error to monitoring service:', e);
    }
  }

  // Memory monitoring
  monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usage = {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };

      this.analytics.trackPerformance('memory_usage', usage.used);

      // Alert on high memory usage
      if (usage.used > 100) { // 100MB
        console.warn('High memory usage detected:', usage);
      }

      return usage;
    }
  }

  // User session tracking
  trackUserSession() {
    const sessionStart = performance.timing.navigationStart;
    let lastActivity = Date.now();

    // Track user activity
    ['click', 'scroll', 'keypress', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        lastActivity = Date.now();
      });
    });

    // Track session duration on unload
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - sessionStart;
      this.analytics.trackEvent({
        action: 'session_duration',
        category: 'Engagement',
        value: Math.round(sessionDuration / 1000)
      });
    });

    // Track inactive sessions
    setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      if (inactiveTime > 300000) { // 5 minutes
        this.analytics.trackEvent({
          action: 'user_inactive',
          category: 'Engagement',
          value: Math.round(inactiveTime / 1000)
        });
      }
    }, 60000); // Check every minute
  }

  // Get error summary
  getErrorSummary() {
    return {
      totalErrors: this.errors.length,
      criticalErrors: this.errors.filter(e => e.severity === 'critical').length,
      highPriorityErrors: this.errors.filter(e => e.severity === 'high').length,
      recentErrors: this.errors.filter(e => Date.now() - e.timestamp < 300000) // Last 5 minutes
    };
  }

  // Clear old errors
  clearOldErrors() {
    const cutoff = Date.now() - 86400000; // 24 hours
    this.errors = this.errors.filter(error => error.timestamp > cutoff);
  }
}

// React Error Boundary integration - moved to separate component file

export default MonitoringService;