import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLocation } from 'wouter';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { currentUser, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="BilgiBite yükleniyor..." />
      </div>
    );
  }

  // Kullanıcı giriş yapmışsa ana sayfaya yönlendir
  if (currentUser) {
    // Use useEffect to avoid state update during render
    React.useEffect(() => {
      setLocation('/');
    }, [setLocation]);
    return null;
  }

  const handleAuthSuccess = () => {
    // Giriş başarılı olduğunda ana sayfaya yönlendir
    setLocation('/');
  };

  // Giriş/Kayıt formlarını göster
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
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
                onSuccess={handleAuthSuccess}
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
                onSuccess={handleAuthSuccess}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}