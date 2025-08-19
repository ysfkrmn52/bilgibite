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

  // Debug: Log current auth state
  React.useEffect(() => {
    console.log('AuthPage - currentUser:', currentUser);
    console.log('AuthPage - loading:', loading);
    console.log('AuthPage - localStorage currentUser:', localStorage.getItem('currentUser'));
    console.log('AuthPage - localStorage isAuthenticated:', localStorage.getItem('isAuthenticated'));
  }, [currentUser, loading]);

  // Debug: Clear auth button for testing
  const clearAuthForTesting = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    console.log('Auth cleared, reloading...');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="BilgiBite yükleniyor..." />
      </div>
    );
  }

  // Kullanıcı giriş yapmışsa admin panel göster
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Zaten giriş yapmışsın!</h2>
          <p className="mb-6 text-gray-600">Admin: <strong>{currentUser.email}</strong></p>
          <div className="space-y-3">
            <button 
              onClick={clearAuthForTesting}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              data-testid="button-logout"
            >
              🚪 Çıkış Yap ve Login Ekranını Gör
            </button>
            <button 
              onClick={() => setLocation('/')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              data-testid="button-dashboard"
            >
              📊 Dashboard'a Git
            </button>
          </div>
        </div>
      </div>
    );
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