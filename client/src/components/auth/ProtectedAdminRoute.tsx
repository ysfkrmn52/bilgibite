import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
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

      // SECURITY: Only allow specific admin email
      const ADMIN_EMAIL = 'ysfkrmn.5239@gmail.com';
      const isAuthorizedAdmin = currentUser.email === ADMIN_EMAIL;
      
      if (!isAuthorizedAdmin) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      // If authorized email, grant admin access
      setIsAdmin(true);
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

  // User logged in but not authorized admin - redirect to home
  if (!isAdmin) {
    setLocation('/');
    return null;
  }

  // User is admin - show the protected content
  return <>{children}</>;
}