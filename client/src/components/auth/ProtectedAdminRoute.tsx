import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isDemoMode } from '@/lib/firebase';
import { Card } from '@/components/ui/card';
import { AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function checkAdminRole() {
      if (!currentUser) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      // Demo mode: always allow admin access for development
      if (isDemoMode) {
        console.log('🔧 Demo mode: Granting admin access');
        setIsAdmin(true);
        setAdminLoading(false);
        return;
      }

      try {
        // Get Firebase custom claims to check admin role
        const idTokenResult = await currentUser.getIdTokenResult();
        const claims = idTokenResult.claims;
        
        // Check if user has admin or super_admin role
        const hasAdminRole = claims.role === 'admin' || claims.role === 'super_admin';
        
        console.log('🔐 Checking admin role:', {
          uid: currentUser.uid,
          email: currentUser.email,
          role: claims.role,
          hasAdminRole
        });
        
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error('❌ Failed to check admin role:', error);
        setIsAdmin(false);
      }
      
      setAdminLoading(false);
    }

    if (!loading) {
      checkAdminRole();
    }
  }, [currentUser, loading]);

  // Show loading spinner while auth or role check is in progress
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Yetki kontrol ediliyor...</p>
        </Card>
      </div>
    );
  }

  // User not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Giriş Yapmanız Gerekiyor
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Admin paneline erişmek için önce giriş yapmalısınız.
          </p>
          <Button 
            onClick={() => setLocation('/auth')}
            className="w-full"
            data-testid="button-login"
          >
            Giriş Yap
          </Button>
        </Card>
      </div>
    );
  }

  // User logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Erişim Reddedildi
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Admin paneline erişmek için admin yetkilerine sahip olmanız gerekir.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => setLocation('/')}
              className="w-full"
              data-testid="button-go-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfa'ya Dön
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLocation('/profile')}
              className="w-full"
              data-testid="button-go-profile"
            >
              Profil Sayfası
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // User is admin - show the protected content
  return <>{children}</>;
}