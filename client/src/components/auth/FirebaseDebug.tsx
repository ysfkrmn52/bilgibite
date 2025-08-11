import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function FirebaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const info = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Mevcut' : 'Eksik',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Eksik',
      appId: import.meta.env.VITE_FIREBASE_APP_ID ? 'Mevcut' : 'Eksik',
      authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      currentDomain: window.location.hostname,
      currentOrigin: window.location.origin,
      isLocalhost: window.location.hostname === 'localhost',
      port: window.location.port
    };
    setDebugInfo(info);
  }, []);

  if (!showDebug) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDebug(true)}
        className="text-xs text-gray-500"
      >
        <Info className="w-3 h-3 mr-1" />
        Debug
      </Button>
    );
  }

  return (
    <Card className="mt-4 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Firebase Debug Bilgisi</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(false)}
            className="text-xs"
          >
            Gizle
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            {debugInfo.apiKey === 'Mevcut' ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : (
              <AlertCircle className="w-3 h-3 text-red-600" />
            )}
            <span>API Key: {debugInfo.apiKey}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {debugInfo.appId === 'Mevcut' ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : (
              <AlertCircle className="w-3 h-3 text-red-600" />
            )}
            <span>App ID: {debugInfo.appId}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div><strong>Project ID:</strong> {debugInfo.projectId}</div>
          <div><strong>Auth Domain:</strong> {debugInfo.authDomain}</div>
          <div><strong>Current Domain:</strong> {debugInfo.currentDomain}</div>
          <div><strong>Current Origin:</strong> {debugInfo.currentOrigin}</div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs">
          <strong>Firebase Console Kontrol Listesi:</strong>
          <ul className="mt-1 space-y-1 text-xs">
            <li>• Authentication → Sign-in method → Google etkinleştirildi mi?</li>
            <li>• Authentication → Settings → Authorized domains listesinde:</li>
            <li className="ml-4">- localhost</li>
            <li className="ml-4">- {debugInfo.currentDomain}</li>
            <li className="ml-4">- {debugInfo.currentOrigin}</li>
          </ul>
        </div>

        {debugInfo.isLocalhost && (
          <Badge variant="secondary" className="text-xs">
            Localhost Üzerinde Çalışıyor
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}