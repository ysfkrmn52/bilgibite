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
import Dashboard from "@/pages/dashboard";
import Quiz from "@/pages/quiz";
import Gamification from "@/pages/gamification";
import AILearning from "@/pages/ai-learning";
import Social from "@/pages/social";
import Analytics from "@/pages/analytics";
import TurkishExams from "@/pages/turkish-exams";
import Pricing from "@/pages/pricing";
import MonitoringDashboard from "@/pages/monitoring-dashboard";
import EnterpriseDashboard from "@/pages/enterprise-dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/ai-learning" component={AILearning} />
      <Route path="/social" component={Social} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/turkish-exams" component={TurkishExams} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/quiz/:categoryId" component={Quiz} />
      <Route path="/gamification" component={Gamification} />
      <Route path="/monitoring" component={MonitoringDashboard} />
      <Route path="/enterprise" component={EnterpriseDashboard} />
      <Route path="/teacher" component={TeacherDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize performance monitoring and analytics
  useEffect(() => {
    // Initialize analytics
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      initializeAnalytics('mock-user-123'); // Replace with actual user ID
    }

    // Initialize monitoring service
    MonitoringService.getInstance().initialize();

    // Initialize PWA manager
    if ('serviceWorker' in navigator) {
      pwaManager; // Initialize PWA manager
    }

    // Set up SEO for the app
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
