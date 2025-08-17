import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Performance and monitoring imports  
import { useEffect } from "react";
import { initializeAnalytics } from "./lib/analytics";
import MonitoringService from "./lib/monitoring";
import { ErrorBoundaryMonitoring } from "@/components/ErrorBoundaryMonitoring";
import { SEOManager } from "./lib/seo";
import { pwaManager } from "./lib/pwa";

// Core pages loaded immediately for better UX
import Home from "@/pages/simplified-home";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";

// Secondary pages loaded lazily  
import { lazy, Suspense } from "react";
const AuthPage = lazy(() => import("@/pages/auth"));
const Profile = lazy(() => import("@/pages/profile"));
const Quiz = lazy(() => import("@/pages/quiz"));
const Rozetler = lazy(() => import("@/pages/rozetler"));
const AIProtected = lazy(() => import("@/pages/ai-protected"));
const AILearning = lazy(() => import("@/pages/ai-learning"));
const Social = lazy(() => import("@/pages/social"));
const Analytics = lazy(() => import("@/pages/analytics"));
const TurkishExams = lazy(() => import("@/pages/symmetric-exams"));
const Education = lazy(() => import("@/pages/education"));
const Pricing = lazy(() => import("@/pages/updated-pricing"));
const MonitoringDashboard = lazy(() => import("@/pages/monitoring-dashboard"));
const EnterpriseDashboard = lazy(() => import("@/pages/enterprise-dashboard"));
const TeacherDashboard = lazy(() => import("@/pages/teacher-dashboard"));

// Fast loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
);

function Router() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/profile" component={() => (
          <Suspense fallback={<PageLoader />}><Profile /></Suspense>
        )} />
        <Route path="/ai" component={() => (
          <Suspense fallback={<PageLoader />}><AIProtected><AILearning /></AIProtected></Suspense>
        )} />
        <Route path="/social" component={() => (
          <Suspense fallback={<PageLoader />}><Social /></Suspense>
        )} />
        <Route path="/analytics" component={() => (
          <Suspense fallback={<PageLoader />}><Analytics /></Suspense>
        )} />
        <Route path="/exams" component={() => (
          <Suspense fallback={<PageLoader />}><TurkishExams /></Suspense>
        )} />
        <Route path="/education" component={() => (
          <Suspense fallback={<PageLoader />}><Education /></Suspense>
        )} />
        <Route path="/subscription" component={() => (
          <Suspense fallback={<PageLoader />}><Pricing /></Suspense>
        )} />
        <Route path="/quiz/:categoryId" component={() => (
          <Suspense fallback={<PageLoader />}><Quiz /></Suspense>
        )} />
        <Route path="/badges" component={() => (
          <Suspense fallback={<PageLoader />}><Rozetler /></Suspense>
        )} />
        <Route path="/monitoring" component={() => (
          <Suspense fallback={<PageLoader />}><MonitoringDashboard /></Suspense>
        )} />
        <Route path="/enterprise" component={() => (
          <Suspense fallback={<PageLoader />}><EnterpriseDashboard /></Suspense>
        )} />
        <Route path="/teacher" component={() => (
          <Suspense fallback={<PageLoader />}><TeacherDashboard /></Suspense>
        )} />
        <Route path="/auth" component={() => (
          <Suspense fallback={<PageLoader />}><AuthPage /></Suspense>
        )} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  // Initialize core services with better error handling
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing BilgiBite App...');
        
        // Initialize analytics only if configured
        if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
          console.log('Initializing analytics...');
          initializeAnalytics('demo-user-123');
        }

        // Initialize monitoring service with error handling
        try {
          MonitoringService.getInstance().initialize();
          console.log('Monitoring service initialized');
        } catch (error) {
          console.warn('Monitoring service initialization failed:', error);
        }

        // Initialize PWA manager cautiously
        if ('serviceWorker' in navigator) {
          try {
            await pwaManager;
            console.log('PWA manager initialized');
          } catch (error) {
            console.warn('PWA initialization failed:', error);
          }
        }

        // Set up SEO for the app
        try {
          const seoManager = SEOManager.getInstance();
          seoManager.updateMetaTags({
            title: 'BilgiBite - AI Destekli Türk Sınav Hazırlık Platformu',
            description: 'YKS, KPSS ve ehliyet sınavlarına AI destekli modern quiz sistemi ile hazırlanın. Kişisel öğretmen, ilerleme takibi ve gamification özellikleri.',
            keywords: 'YKS, KPSS, ehliyet sınavı, AI öğretmen, quiz, Turkish exam preparation, online test',
            canonical: window.location.origin,
            ogImage: '/icons/icon-512x512.png',
            structuredData: seoManager.generateWebsiteStructuredData()
          });

          // Preload critical resources
          seoManager.preloadCriticalResources();
          console.log('SEO manager initialized');
        } catch (error) {
          console.warn('SEO initialization failed:', error);
        }

        console.log('BilgiBite App initialization complete');
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <ErrorBoundaryMonitoring>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Router />
          </AuthProvider>
          <Toaster />
          <PWAInstallPrompt />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundaryMonitoring>
  );
}

export default App;
