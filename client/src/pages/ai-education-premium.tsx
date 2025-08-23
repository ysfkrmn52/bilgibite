import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  BookOpen, 
  MessageCircle, 
  Zap, 
  Target, 
  TrendingUp,
  Sparkles,
  Crown,
  Star,
  ArrowRight,
  Play,
  Users,
  Clock,
  Trophy,
  ChevronRight,
  Lightbulb,
  Wand2,
  Rocket,
  Shield,
  Gauge,
  PlusCircle,
  BarChart3,
  Settings,
  Gift
} from 'lucide-react';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  features: string[];
  comingSoon?: boolean;
}

const aiFeatures: FeatureCard[] = [
  {
    id: 'smart-tutor',
    title: 'AI Kişisel Öğretmen',
    description: 'Size özel sınırsız sohbet ve öğrenme desteği',
    icon: MessageCircle,
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      'Sınırsız soru sorabilme',
      'Anında detaylı açıklamalar',
      'Kişisel öğrenme stili analizi',
      '24/7 erişilebilir destek'
    ]
  },
  {
    id: 'adaptive-questions',
    title: 'Akıllı Soru Üretimi',
    description: 'Zayıf yönlerinize odaklanmış soru üretimi',
    icon: Brain,
    gradient: 'from-purple-500 to-pink-500',
    features: [
      'Performansınıza göre uyum',
      'Zayıf konularda ekstra sorular',
      'Farklı zorluk seviyeleri',
      'Otomatik veritabanı entegrasyonu'
    ]
  },
  {
    id: 'study-planner',
    title: 'AI Çalışma Planlayıcı',
    description: 'Hedeflerinize özel çalışma programı',
    icon: Target,
    gradient: 'from-green-500 to-emerald-500',
    features: [
      'Kişiselleştirilmiş programlar',
      'Günlük çalışma önerileri',
      'İlerleme takibi',
      'Sınav tarihi optimizasyonu'
    ]
  },
  {
    id: 'performance-analytics',
    title: 'Gelişmiş Analitik',
    description: 'AI destekli öğrenme analizi ve öneriler',
    icon: BarChart3,
    gradient: 'from-orange-500 to-red-500',
    features: [
      'Detaylı performans analizi',
      'Güçlü/zayıf yön tespiti',
      'Öğrenme trendi analizi',
      'Akıllı öneriler'
    ]
  },
  {
    id: 'exam-simulator',
    title: 'AI Sınav Simülatörü',
    description: 'Gerçeğe en yakın sınav deneyimi',
    icon: Gauge,
    gradient: 'from-indigo-500 to-purple-500',
    features: [
      'Gerçek sınav atmosferi',
      'Adaptif zorluk ayarı',
      'Detaylı sonuç analizi',
      'Kişisel gelişim önerileri'
    ]
  },
  {
    id: 'content-generator',
    title: 'İçerik Üreticisi',
    description: 'İstediğiniz konuda anında eğitim materyali',
    icon: Wand2,
    gradient: 'from-pink-500 to-rose-500',
    features: [
      'Anında konu anlatımı',
      'Görsel destekli açıklamalar',
      'Örneklerle öğrenme',
      'Kişisel öğrenme hızı'
    ]
  }
];

const stats = [
  { label: 'AI Sorular Üretildi', value: '250K+', icon: Brain },
  { label: 'Öğrenci Memnuniyeti', value: '%97', icon: Star },
  { label: 'Ortalama Başarı Artışı', value: '%35', icon: TrendingUp },
  { label: 'Aktif Kullanıcı', value: '50K+', icon: Users }
];

export default function AIEducationPremium() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStartFeature = (featureId: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      // Navigate to specific feature
      window.location.href = `/ai-${featureId}`;
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [background-position:0_1px] opacity-20" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full mb-6"
          >
            <Crown className="w-5 h-5" />
            <span className="font-medium">Premium AI Eğitim Merkezi</span>
            <Sparkles className="w-4 h-4" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6 leading-tight"
          >
            Yapay Zeka ile<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Kişiselleştirilmiş
            </span> Öğrenme
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            En gelişmiş AI teknolojisi ile size özel soru üretimi, kişisel öğretmen desteği 
            ve detaylı analiz. Hedeflerinize ulaşmanın en akıllı yolu.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/50"
                >
                  <IconComponent className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
              asChild
            >
              <Link href="/ai-smart-tutor">
                <MessageCircle className="w-5 h-5 mr-2" />
                AI Öğretmenle Başla
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-gray-200 hover:border-blue-300 px-8 py-4 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200"
              asChild
            >
              <Link href="/ai-demo">
                <Play className="w-5 h-5 mr-2" />
                Demo İzle
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {aiFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                <Card className="h-full bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {feature.comingSoon && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        Yakında
                      </Badge>
                    </div>
                  )}
                  
                  <div className={`h-32 bg-gradient-to-br ${feature.gradient} relative`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <div className="relative h-full flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                      >
                        <IconComponent className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-2 mb-6">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full group/button bg-gradient-to-r from-gray-600 to-gray-700 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-300"
                      onClick={() => handleStartFeature(feature.id)}
                      disabled={feature.comingSoon || isGenerating}
                    >
                      {feature.comingSoon ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Yakında
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2 group-hover/button:translate-x-1 transition-transform" />
                          Başla
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white text-center mb-16"
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Hemen Başlamaya Hazır Mısınız?</h3>
            <p className="text-blue-100 mb-6">
              Binlerce öğrencinin tercih ettiği AI destekli eğitim deneyimini yaşayın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-medium"
                asChild
              >
                <Link href="/ai-question-generator">
                  <Brain className="w-5 h-5 mr-2" />
                  Soru Üret
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-xl font-medium"
                asChild
              >
                <Link href="/ai-chat">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  AI ile Sohbet
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-xl font-medium"
                asChild
              >
                <Link href="/ai-analytics">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Analiz Gör
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Premium Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Premium Deneyimin Avantajları
          </h3>
          <p className="text-gray-600 mb-8">
            AI teknolojisinin gücüyle eğitimde yeni bir deneyim
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-100">
              <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Güvenilir AI</h4>
              <p className="text-sm text-gray-600">
                En güncel AI modelleriyle güvenilir ve doğru öğrenme desteği
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-100">
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Hızlı Sonuç</h4>
              <p className="text-sm text-gray-600">
                Anında soru üretimi ve açıklama ile zaman kaybetmeyin
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-gray-100">
              <Trophy className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Garanti Başarı</h4>
              <p className="text-sm text-gray-600">
                %97 kullanıcı memnuniyeti ve %35 ortalama başarı artışı
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 text-center shadow-2xl"
            >
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Hazırlanıyor</h3>
              <p className="text-gray-600">Kişisel öğrenme deneyiminiz oluşturuluyor...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}