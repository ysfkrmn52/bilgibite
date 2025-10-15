/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Firebase Configuration
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  
  // Analytics
  readonly VITE_GA_MEASUREMENT_ID: string;
  readonly VITE_CLARITY_ID: string;
  readonly VITE_YANDEX_METRIKA_ID: string;
  readonly VITE_FACEBOOK_PIXEL_ID: string;
  
  // Payment Systems
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_IYZICO_API_KEY: string;
  
  // Monitoring & Error Tracking
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_LOGROCK_APP_ID: string;
  
  // PWA & Push Notifications
  readonly VITE_VAPID_PUBLIC_KEY: string;
  
  // API Configuration
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CDN_URL: string;
  
  // Feature Flags
  readonly VITE_ENABLE_AI_FEATURES: string;
  readonly VITE_ENABLE_OFFLINE_MODE: string;
  readonly VITE_ENABLE_PUSH_NOTIFICATIONS: string;
  
  // Environment
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  readonly VITE_APP_VERSION: string;
  
  // Turkish Market Specific
  readonly VITE_TURKISH_BANK_INTEGRATION: string;
  readonly VITE_STUDENT_VERIFICATION_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}