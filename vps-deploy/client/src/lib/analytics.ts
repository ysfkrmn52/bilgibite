// Advanced Analytics and Monitoring System
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    clarity: (...args: any[]) => void;
    // Turkish analytics alternatives
    yandexMetrika: any;
    gemius: any;
  }
}

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  customParameters?: Record<string, any>;
}

interface ConversionEvent {
  event: string;
  transaction_id?: string;
  value?: number;
  currency?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
}

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private isInitialized = false;
  private userId: string | null = null;

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  async initialize(userId?: string) {
    if (this.isInitialized) return;

    this.userId = userId || null;

    // Initialize Google Analytics
    await this.initializeGoogleAnalytics();
    
    // Initialize Microsoft Clarity
    await this.initializeMicrosoftClarity();
    
    // Initialize Yandex Metrika (popular in Turkey)
    await this.initializeYandexMetrika();
    
    // Initialize Facebook Pixel
    await this.initializeFacebookPixel();

    this.isInitialized = true;
    console.log('Analytics initialized successfully');
  }

  private async initializeGoogleAnalytics() {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (!measurementId) return;

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      user_id: this.userId,
      send_page_view: false // We'll send manually
    });
  }

  private async initializeMicrosoftClarity() {
    const clarityId = import.meta.env.VITE_CLARITY_ID;
    if (!clarityId) return;

    const script = document.createElement('script');
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${clarityId}");
    `;
    document.head.appendChild(script);
  }

  private async initializeYandexMetrika() {
    const yandexId = import.meta.env.VITE_YANDEX_METRIKA_ID;
    if (!yandexId) return;

    const script = document.createElement('script');
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        
      ym(${yandexId}, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
      });
    `;
    document.head.appendChild(script);

    // Add noscript pixel
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${yandexId}" style="position:absolute; left:-9999px;" alt="" /></div>`;
    document.body.appendChild(noscript);
  }

  private async initializeFacebookPixel() {
    const pixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID;
    if (!pixelId) return;

    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    if (!this.isInitialized) return;

    // Google Analytics
    if (window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title
      });
    }

    // Yandex Metrika
    if (window.yandexMetrika) {
      window.yandexMetrika.hit(path);
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    if (!this.isInitialized) return;

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        user_id: event.userId || this.userId,
        ...event.customParameters
      });
    }

    // Yandex Metrika
    if (window.yandexMetrika) {
      window.yandexMetrika.reachGoal(event.action, event.customParameters);
    }

    // Microsoft Clarity
    if (window.clarity) {
      window.clarity('event', event.action);
    }

    console.log('Analytics event tracked:', event);
  }

  // Track conversions (purchases, subscriptions)
  trackConversion(conversion: ConversionEvent) {
    if (!this.isInitialized) return;

    // Google Analytics Enhanced Ecommerce
    if (window.gtag) {
      window.gtag('event', conversion.event, {
        transaction_id: conversion.transaction_id,
        value: conversion.value,
        currency: conversion.currency || 'TRY',
        items: conversion.items
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        value: conversion.value,
        currency: conversion.currency || 'TRY'
      });
    }

    console.log('Conversion tracked:', conversion);
  }

  // Track user engagement
  trackEngagement(action: string, details?: Record<string, any>) {
    this.trackEvent({
      action,
      category: 'Engagement',
      customParameters: details
    });
  }

  // Track quiz performance
  trackQuizPerformance(quizId: string, score: number, timeSpent: number) {
    this.trackEvent({
      action: 'quiz_completed',
      category: 'Learning',
      label: quizId,
      value: score,
      customParameters: {
        time_spent: timeSpent,
        quiz_id: quizId
      }
    });
  }

  // Track subscription events
  trackSubscription(action: 'started' | 'completed' | 'cancelled', planId: string, value?: number) {
    this.trackEvent({
      action: `subscription_${action}`,
      category: 'Subscription',
      label: planId,
      value,
      customParameters: {
        plan_id: planId
      }
    });

    // Track conversion for completed subscriptions
    if (action === 'completed' && value) {
      this.trackConversion({
        event: 'purchase',
        transaction_id: `sub_${Date.now()}`,
        value,
        currency: 'TRY',
        items: [{
          item_id: planId,
          item_name: `BilgiBite Premium - ${planId}`,
          category: 'Subscription',
          price: value,
          quantity: 1
        }]
      });
    }
  }

  // Track AI usage
  trackAIUsage(feature: string, tokensUsed?: number) {
    this.trackEvent({
      action: 'ai_feature_used',
      category: 'AI',
      label: feature,
      value: tokensUsed,
      customParameters: {
        feature,
        tokens_used: tokensUsed
      }
    });
  }

  // A/B Testing support
  trackExperiment(experimentId: string, variant: string) {
    this.trackEvent({
      action: 'experiment_view',
      category: 'A/B Testing',
      label: `${experimentId}:${variant}`,
      customParameters: {
        experiment_id: experimentId,
        variant
      }
    });
  }

  // Error tracking
  trackError(error: Error, context?: string) {
    this.trackEvent({
      action: 'javascript_error',
      category: 'Error',
      label: error.message,
      customParameters: {
        error_message: error.message,
        stack_trace: error.stack,
        context,
        user_agent: navigator.userAgent,
        url: window.location.href
      }
    });
  }

  // Performance tracking
  trackPerformance(metric: string, value: number, context?: string) {
    this.trackEvent({
      action: 'performance_metric',
      category: 'Performance',
      label: metric,
      value: Math.round(value),
      customParameters: {
        metric,
        context
      }
    });
  }

  // Set user properties
  setUserProperty(property: string, value: any) {
    if (window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        [property]: value
      });
    }
  }

  // GDPR compliance
  setConsentStatus(adStorage: boolean, analyticsStorage: boolean) {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: adStorage ? 'granted' : 'denied',
        analytics_storage: analyticsStorage ? 'granted' : 'denied'
      });
    }
  }
}

// Convenience hooks for React components
export function useAnalytics() {
  return AnalyticsManager.getInstance();
}

// Initialize analytics on app start
export function initializeAnalytics(userId?: string) {
  const analytics = AnalyticsManager.getInstance();
  analytics.initialize(userId);
  return analytics;
}

export default AnalyticsManager;