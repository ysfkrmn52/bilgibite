// Progressive Web App Features Enhancement
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, Bell, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PWAFeaturesProps {
  showFeatures?: boolean;
}

export default function PWAFeatures({ showFeatures = false }: PWAFeaturesProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Uygulama yüklenemedi",
        description: "Bu tarayıcı uygulama yüklemeyi desteklemiyor.",
        variant: "destructive"
      });
      return;
    }

    const result = await deferredPrompt.prompt();
    console.log('PWA install prompt result:', result);
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);

    if (result.outcome === 'accepted') {
      toast({
        title: "Uygulama yüklendi!",
        description: "BilgiBite başarıyla cihazınıza yüklendi.",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BilgiBite - Turkish Quiz App',
          text: 'Modern Duolingo tarzı quiz uygulaması ile YKS, KPSS ve ehliyet sınavlarına hazırlan!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback for browsers without share API
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link kopyalandı!",
          description: "Uygulama linki panoya kopyalandı.",
        });
      } catch (err) {
        console.log('Copy failed:', err);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Bildirimler desteklenmiyor",
        description: "Bu tarayıcı bildirim özelliğini desteklemiyor.",
        variant: "destructive"
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast({
        title: "Bildirimler açıldı!",
        description: "Artık önemli güncellemelerden haberdar olacaksınız.",
      });
    } else {
      toast({
        title: "Bildirimlere izin verilmedi",
        description: "Tarayıcı ayarlarından bildirimleri açabilirsiniz.",
        variant: "destructive"
      });
    }
  };

  if (!showFeatures) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Connection Status */}
      <Card className={`border-2 ${isOnline ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-orange-200 bg-orange-50 dark:bg-orange-950'}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Çevrimiçi</p>
                  <p className="text-sm text-green-600 dark:text-green-300">Tüm özellikler kullanılabilir</p>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">Çevrimdışı</p>
                  <p className="text-sm text-orange-600 dark:text-orange-300">Kaydedilen verilerle çalışabilirsiniz</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PWA Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Install App */}
        <AnimatePresence>
          {showInstallPrompt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <CardContent className="p-4 text-center">
                  <Download className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Uygulamayı Yükle
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    BilgiBite'ı cihazınıza yükleyerek daha hızlı erişin
                  </p>
                  <Button
                    onClick={handleInstallApp}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Yükle
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share App */}
        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950">
          <CardContent className="p-4 text-center">
            <Share className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              Arkadaşlarla Paylaş
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
              BilgiBite'ı sevdiklerinle paylaş
            </p>
            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
              size="sm"
            >
              Paylaş
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-4 text-center">
            <Bell className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              Bildirimler
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              Günlük hatırlatma ve güncellemeler al
            </p>
            <Button
              onClick={requestNotificationPermission}
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-100"
              size="sm"
            >
              Aç
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}