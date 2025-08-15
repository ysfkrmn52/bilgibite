import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lock, 
  Sparkles, 
  Crown, 
  Zap,
  Brain,
  Star,
  Gift,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

// Mock subscription check - in real app this would come from user data
const hasAISubscription = false; // Change this to test different states

export default function AIProtected({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();

  // If user has AI subscription, show the AI content
  if (hasAISubscription) {
    return <>{children}</>;
  }

  // Otherwise, show subscription upgrade page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Lock Icon */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lock className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
              AI Özellikler
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Bu özellik AI paketine sahip kullanıcılar için özeldir
            </p>
            <p className="text-lg text-gray-600">
              AI destekli öğrenme deneyimini keşfet!
            </p>
          </motion.div>

          {/* AI Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mb-10"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Öğretmen</h3>
                <p className="text-sm text-gray-600">
                  Kişiselleştirilmiş öğretim ve anında geri bildirim
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Akıllı Sorular</h3>
                <p className="text-sm text-gray-600">
                  Size özel üretilen sorular ve adaptif zorluk
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performans Analizi</h3>
                <p className="text-sm text-gray-600">
                  AI destekli detaylı başarı raporu ve öneriler
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription Options */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-xl border"
          >
            <div className="flex items-center justify-center mb-6">
              <Crown className="w-8 h-8 text-yellow-500 mr-3" />
              <h2 className="text-2xl font-bold">AI Paketi Özellikleri</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-3 text-purple-700">Temel AI Özellikler (+₺29/ay)</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">AI Öğretmen (100 soru/ay)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Kişiselleştirilmiş öneriler</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Akıllı soru üretimi</span>
                  </li>
                </ul>
              </div>

              <div className="text-left">
                <h3 className="font-semibold text-lg mb-3 text-indigo-700">Premium AI Özellikler (+₺149/ay)</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">AI Premium (Sınırsız)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Gelişmiş AI mentor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">AI ile mock mülakatlar</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-8"
                onClick={() => navigate('/subscription')}
              >
                <Gift className="w-5 h-5 mr-2" />
                AI Paketini Keşfet
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/')}
              >
                Ana Sayfaya Dön
              </Button>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-green-600" />
                <Badge className="bg-green-500 text-white">Özel Teklif!</Badge>
              </div>
              <p className="text-sm text-green-700 font-medium">
                İlk 7 gün ücretsiz deneme + %30 indirim
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}