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
import SimpleAdmin from "@/pages/simple-admin";
import AdminQuestions from "@/pages/admin-questions";
import AdminSubscriptionManagement from "@/pages/admin-subscription-management";
import XAdmin from "@/pages/xadmin";
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
const CourseView = lazy(() => import("@/pages/course-view"));
const Pricing = lazy(() => import("@/pages/updated-pricing"));
const MonitoringDashboard = lazy(() => import("@/pages/monitoring-dashboard"));
const EnterpriseDashboard = lazy(() => import("@/pages/enterprise-dashboard"));
const TeacherDashboard = lazy(() => import("@/pages/teacher-dashboard"));
const AIEducationGenerator = lazy(() => import("@/pages/ai-education-generator"));
const AIEducationNew = lazy(() => import("@/pages/ai-education-new"));
const AIEducationPremium = lazy(() => import("@/pages/ai-education-premium"));
const AdminAIQuestions = lazy(() => import("@/pages/admin-ai-questions"));
const AISmartTutor = lazy(() => import("@/pages/ai-smart-tutor"));
const AIDemo = lazy(() => import("@/pages/ai-demo"));
const PdfManager = lazy(() => import("@/pages/pdf-manager"));
const Settings = lazy(() => import("@/pages/settings"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));

// Fast loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
);

function Router() {
  return (
    <div className="min-h-screen">
      <Switch>
        {/* Auth route without navbar */}
        <Route path="/auth" component={() => (
          <Suspense fallback={<PageLoader />}><AuthPage /></Suspense>
        )} />
        
        {/* All other routes with navbar */}
        <Route path="/" component={() => (<><Navbar /><Home /></>)} />
        <Route path="/admin" component={XAdmin} />
        <Route path="/xadmin" component={XAdmin} />
        <Route path="/admin/questions/:categoryId" component={AdminQuestions} />
        <Route path="/admin/users" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><AdminUsers /></Suspense></>
        )} />
        <Route path="/admin/subscriptions" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><SimpleAdmin /></Suspense></>
        )} />
        <Route path="/admin/payments" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><SimpleAdmin /></Suspense></>
        )} />
        <Route path="/admin/analytics" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><SimpleAdmin /></Suspense></>
        )} />
        <Route path="/admin-simple" component={() => (<><Navbar /><SimpleAdmin /></>)} />
        <Route path="/profile" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><Profile /></Suspense></>
        )} />
        <Route path="/settings" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><Settings /></Suspense></>
        )} />
        <Route path="/ai-education" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><AIEducationNew /></Suspense></>
        )} />
        <Route path="/social" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><Social /></Suspense></>
        )} />
        <Route path="/analytics" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><Analytics /></Suspense></>
        )} />
        <Route path="/exams" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><TurkishExams /></Suspense></>
        )} />
        <Route path="/quiz" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><Quiz /></Suspense></>
        )} />
        <Route path="/course/:courseId" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><CourseView /></Suspense></>
        )} />
        <Route path="/admin/ai-education" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><AIEducationGenerator /></Suspense></>
        )} />
        <Route path="/subscription" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><Pricing /></Suspense></>
        )} />
        <Route path="/quiz/:categoryId" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><Quiz /></Suspense></>
        )} />
        <Route path="/badges" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><Rozetler /></Suspense></>
        )} />
        <Route path="/monitoring" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><MonitoringDashboard /></Suspense></>
        )} />
        <Route path="/enterprise" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><EnterpriseDashboard /></Suspense></>
        )} />
        <Route path="/teacher" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><TeacherDashboard /></Suspense></>
        )} />
        <Route path="/simple-admin" component={() => (<><Navbar /><SimpleAdmin /></>)} />
        <Route path="/admin/questions" component={() => (<><Navbar /><AdminQuestions /></>)} />
        <Route path="/admin/ai-questions" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><AdminAIQuestions /></Suspense></>
        )} />
        <Route path="/ai-smart-tutor" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><AISmartTutor /></Suspense></>
        )} />
        <Route path="/ai-demo" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><AIDemo /></Suspense></>
        )} />
        <Route path="/admin/pdf-manager" component={() => (
          <><Navbar /><Suspense fallback={<PageLoader />}><PdfManager /></Suspense></>
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
