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

import AuthPage from "@/pages/auth";
import Home from "@/pages/simplified-home";
import Profile from "@/pages/profile";
import Quiz from "@/pages/quiz";
import Rozetler from "@/pages/rozetler";
import AIProtected from "@/pages/ai-protected";
import AILearning from "@/pages/ai-learning";
import Social from "@/pages/social";
import Analytics from "@/pages/analytics";
import TurkishExams from "@/pages/symmetric-exams";
import Pricing from "@/pages/updated-pricing";
import MonitoringDashboard from "@/pages/monitoring-dashboard";
import EnterpriseDashboard from "@/pages/enterprise-dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";

function Router() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/profile" component={Profile} />
        <Route path="/ai" component={() => <AIProtected><AILearning /></AIProtected>} />
        <Route path="/social" component={Social} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/exams" component={TurkishExams} />
        <Route path="/subscription" component={Pricing} />
        <Route path="/quiz/:categoryId" component={Quiz} />
        <Route path="/badges" component={Rozetler} />
        <Route path="/monitoring" component={MonitoringDashboard} />
        <Route path="/enterprise" component={EnterpriseDashboard} />
        <Route path="/teacher" component={TeacherDashboard} />
        <Route path="/auth" component={AuthPage} />
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
