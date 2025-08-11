import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="BilgiBite yükleniyor..." />
      </div>
    );
  }

  // Kullanıcı giriş yapmış ve onboarding tamamlanmış
  if (currentUser && !showOnboarding) {
    // localStorage'dan onboarding durumunu kontrol et
    const onboardingCompleted = localStorage.getItem(`onboarding-${currentUser.uid}`);
    if (!onboardingCompleted) {
      setShowOnboarding(true);
      return null;
    }
    return <>{children}</>;
  }

  // Onboarding göster
  if (currentUser && showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={(userData) => {
          // Onboarding verilerini localStorage'a kaydet
          localStorage.setItem(`onboarding-${currentUser.uid}`, JSON.stringify(userData));
          localStorage.setItem(`user-preferences-${currentUser.uid}`, JSON.stringify(userData));
          setShowOnboarding(false);
        }}
      />
    );
  }

  // Giriş/Kayıt formlarını göster
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {authMode === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <LoginForm
                onSwitchToSignup={() => setAuthMode('signup')}
                onSuccess={() => setShowOnboarding(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SignupForm
                onSwitchToLogin={() => setAuthMode('login')}
                onSuccess={() => setShowOnboarding(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}