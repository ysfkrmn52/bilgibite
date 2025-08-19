import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLocation } from 'wouter';
import '@/utils/debug-clear-auth';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { currentUser, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Debug: Log current auth state
  React.useEffect(() => {
    console.log('AuthPage - currentUser:', currentUser);
    console.log('AuthPage - loading:', loading);
    console.log('AuthPage - localStorage currentUser:', localStorage.getItem('currentUser'));
    console.log('AuthPage - localStorage isAuthenticated:', localStorage.getItem('isAuthenticated'));
  }, [currentUser, loading]);

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

  // Debug: Clear auth button for testing
  const clearAuthForTesting = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    window.location.reload();
  };

  // Giriş/Kayıt formlarını göster
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      {/* Debug button - remove in production */}
      <button 
        onClick={clearAuthForTesting}
        className="fixed top-4 right-4 bg-red-500 text-white px-3 py-1 rounded text-xs"
        style={{ zIndex: 9999 }}
      >
        Clear Auth
      </button>
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