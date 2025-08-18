import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import FirebaseDebug from './FirebaseDebug';
import { logFirebaseConfig } from '@/utils/firebase-debug';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı')
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSuccess?: () => void;
}

export default function LoginForm({ onSwitchToSignup, onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      setIsLoading(true);
      
      // Use our backend API for login instead of Firebase
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Giriş başarısız');
      }

      // Store user data in localStorage
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Redirect to home or admin panel if super admin
      if (result.user.role === 'super_admin' || result.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
      
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Giriş sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsLoading(true);
      
      // Debug Firebase configuration
      logFirebaseConfig();
      
      await loginWithGoogle();
      onSuccess?.();
    } catch (err: any) {
      console.error('Google login error:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        customData: err.customData
      });
      setError(err.message || getErrorMessage(err.code || 'auth/unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const { signInWithPopup } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      const { facebookProvider } = await import('@/lib/firebase');
      
      const result = await signInWithPopup(auth, facebookProvider);
      onSuccess?.();
    } catch (error: any) {
      let errorMessage = 'Facebook ile giriş başarısız oldu';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up engellendi. Lütfen pop-up engelleyicinizi devre dışı bırakın.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Giriş işlemi iptal edildi.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Giriş penceresi kapatıldı.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Bu email adresi farklı bir yöntemle kayıtlı.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Bu email adresi ile kayıtlı kullanıcı bulunamadı';
      case 'auth/wrong-password':
        return 'Hatalı şifre girdiniz';
      case 'auth/invalid-email':
        return 'Geçersiz email adresi';
      case 'auth/user-disabled':
        return 'Bu hesap devre dışı bırakılmış';
      case 'auth/too-many-requests':
        return 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin';
      default:
        return 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Giriş yapılıyor..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-8">
          {/* BilgiBite Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-green-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <svg viewBox="0 0 100 100" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Mascot Head */}
              <circle cx="50" cy="40" r="18" fill="white" opacity="0.9"/>
              {/* Eyes */}
              <circle cx="44" cy="35" r="3" fill="#1E40AF"/>
              <circle cx="56" cy="35" r="3" fill="#1E40AF"/>
              {/* Smile */}
              <path d="M 42 45 Q 50 50 58 45" stroke="#1E40AF" strokeWidth="2" fill="none"/>
              {/* Graduation Cap */}
              <ellipse cx="50" cy="25" rx="16" ry="3" fill="#1E40AF"/>
              <rect x="46" y="22" width="8" height="6" fill="#1E40AF"/>
              <circle cx="62" cy="25" r="2" fill="#F59E0B"/>
            </svg>
          </motion.div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            BilgiBite
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Türkiye'nin en gelişmiş sınav hazırlık platformu
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  className="pl-10"
                  {...register('email')}
                  data-testid="input-email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('password')}
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  data-testid="toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary"
              disabled={isSubmitting}
              data-testid="button-login"
            >
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                veya
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center space-x-2"
              data-testid="button-google-login"
            >
              <FaGoogle className="w-4 h-4 text-red-600" />
              <span>Google</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleFacebookLogin}
              className="flex items-center justify-center space-x-2"
              data-testid="button-facebook-login"
            >
              <FaFacebook className="w-4 h-4 text-blue-600" />
              <span>Facebook</span>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Hesabın yok mu?{' '}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-primary hover:underline font-medium"
                data-testid="link-signup"
              >
                Kayıt Ol
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <FirebaseDebug />
    </motion.div>
  );
}