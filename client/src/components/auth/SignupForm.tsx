import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const signupSchema = z.object({
  displayName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Şifre en az bir büyük harf, küçük harf ve rakam içermeli'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export default function SignupForm({ onSwitchToLogin, onSuccess }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);
      await signup(data.email, data.password, data.displayName);
      setSuccess('Hesabınız oluşturuldu! Email adresinizi kontrol edin ve doğrulama linkine tıklayın.');
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError('');
      setIsLoading(true);
      await loginWithGoogle();
      onSuccess?.();
    } catch (err: any) {
      console.error('Google signup error:', err);
      setError(err.message || getErrorMessage(err.code || 'auth/unknown'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignup = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const { signInWithPopup } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      const { facebookProvider } = await import('@/lib/firebase');
      
      const result = await signInWithPopup(auth, facebookProvider);
      onSuccess?.();
    } catch (error: any) {
      let errorMessage = 'Facebook ile kayıt başarısız oldu';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up engellendi. Lütfen pop-up engelleyicinizi devre dışı bırakın.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Kayıt işlemi iptal edildi.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Kayıt penceresi kapatıldı.';
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
      case 'auth/email-already-in-use':
        return 'Bu email adresi zaten kullanımda';
      case 'auth/invalid-email':
        return 'Geçersiz email adresi';
      case 'auth/operation-not-allowed':
        return 'Email/şifre girişi etkinleştirilmemiş';
      case 'auth/weak-password':
        return 'Şifre çok zayıf';
      default:
        return 'Hesap oluşturulurken bir hata oluştu. Lütfen tekrar deneyin';
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '' };
    
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    const texts = ['Çok Zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü'];
    const colors = ['red', 'orange', 'yellow', 'blue', 'green'];
    
    return {
      strength: (strength / 5) * 100,
      text: texts[Math.max(0, strength - 1)] || '',
      color: colors[Math.max(0, strength - 1)] || 'gray'
    };
  };

  const passwordStrength = getPasswordStrength(password);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <LoadingSpinner size="lg" text="Hesap oluşturuluyor..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-2xl font-bold text-white">B</span>
          </motion.div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            BilgiBite'a Katıl!
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Öğrenme yolculuğuna başlamak için hesap oluştur
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

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Ad Soyad</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Adınız Soyadınız"
                  className="pl-10"
                  {...register('displayName')}
                  data-testid="input-name"
                />
              </div>
              {errors.displayName && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.displayName.message}
                </p>
              )}
            </div>

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
                <p className="text-sm text-red-600 dark:text-red-400">
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
              
              {password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Şifre Gücü</span>
                    <span className={`text-${passwordStrength.color}-600`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`bg-${passwordStrength.color}-600 h-1.5 rounded-full transition-all duration-300`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('confirmPassword')}
                  data-testid="input-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  data-testid="toggle-confirm-password"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary"
              disabled={isSubmitting}
              data-testid="button-signup"
            >
              {isSubmitting ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">
                veya
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              className="flex items-center justify-center space-x-2"
              data-testid="button-google-signup"
            >
              <FaGoogle className="w-4 h-4 text-red-600" />
              <span>Google</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="flex items-center justify-center space-x-2"
              onClick={handleFacebookSignup}
              data-testid="button-facebook-signup"
            >
              <FaFacebook className="w-4 h-4 text-blue-600" />
              <span>Facebook</span>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Zaten hesabın var mı?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primary hover:underline font-medium"
                data-testid="link-login"
              >
                Giriş Yap
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}