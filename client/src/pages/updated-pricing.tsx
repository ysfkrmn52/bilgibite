import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  Sparkles, 
  Zap, 
  Crown, 
  Star,
  Brain,
  Rocket,
  Gift,
  ChevronRight
} from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  basePrice: number;
  aiPrice: number;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  features: string[];
  aiFeatures: string[];
  popular?: boolean;
  enterprise?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Temel',
    basePrice: 0,
    aiPrice: 29,
    description: 'Öğrenmeye başlamak için ideal',
    icon: Star,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: [
      'Sınırlı quiz erişimi (50/ay)',
      'Temel istatistikler',
      'Mobil uygulama',
      'Email destek'
    ],
    aiFeatures: [
      'AI Öğretmen (100 soru/ay)',
      'Kişiselleştirilmiş öneriler',
      'Akıllı soru üretimi',
      'Performans analizi'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    basePrice: 49,
    aiPrice: 69,
    description: 'Ciddi öğrenciler için güçlü araçlar',
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: [
      'Sınırsız quiz erişimi',
      'Detaylı analitik raporlar',
      'Sosyal öğrenme özellikleri',
      'Çevrimdışı çalışma',
      'Öncelikli destek',
      'PDF dışa aktarma'
    ],
    aiFeatures: [
      'AI Öğretmen (Sınırsız)',
      'Gelişmiş soru üretimi',
      'Kişisel çalışma planları',
      'Zayıf nokta analizi',
      'AI mentor desteği',
      'Adaptif öğrenme'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    basePrice: 99,
    aiPrice: 149,
    description: 'Profesyonel hazırlık için eksiksiz paket',
    icon: Crown,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    features: [
      'Pro\'nun tüm özellikleri',
      'Birebir mentörlük (2 saat/ay)',
      'Özel sınav simülasyonları',
      'Video ders içerikleri',
      'Canlı grup çalışmaları',
      'Sertifika programları',
      '7/24 destek'
    ],
    aiFeatures: [
      'AI Premium (Sınırsız)',
      'Gelişmiş AI mentor',
      'Kişiselleştirilmiş müfredat',
      'Gerçek zamanlı feedback',
      'Tahminî başarı analizi',
      'AI ile mock mülakatlar',
      'Öncelikli AI desteği'
    ]
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    basePrice: 299,
    aiPrice: 399,
    description: 'Okullar ve kurumlar için özel çözümler',
    icon: Rocket,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    features: [
      'Premium\'un tüm özellikleri',
      'Sınırsız kullanıcı',
      'Özel dashboard',
      'API entegrasyonu',
      'Beyaz etiket çözümü',
      'Özel eğitim seansları',
      'Dedike hesap yöneticisi'
    ],
    aiFeatures: [
      'AI Enterprise Suite',
      'Kuruma özel AI modeli',
      'Toplu öğrenci analizi',
      'AI ile otomatik raporlama',
      'Özel AI algoritmaları',
      'Kurumsal AI dashboard',
      'AI consultant desteği'
    ],
    enterprise: true
  }
];

export default function UpdatedPricing() {
  const [includeAI, setIncludeAI] = useState<Record<string, boolean>>({
    basic: false,
    pro: false,
    premium: false,
    enterprise: false
  });

  const toggleAI = (planId: string) => {
    setIncludeAI(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Abonelik
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-8">
            İhtiyaçlarına uygun planı seç ve öğrenme yolculuğunu hızlandır. AI özellikler ile daha akıllı çalış.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
        >
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;
            const currentPrice = includeAI[plan.id] ? plan.aiPrice : plan.basePrice;
            
            return (
              <motion.div key={plan.id} variants={cardVariants}>
                <Card className={`
                  h-[650px] relative border-2 transition-all duration-300 hover:shadow-xl
                  ${plan.popular ? 'border-purple-300 shadow-lg scale-105' : 'border-gray-200'}
                  ${plan.enterprise ? 'border-green-300' : ''}
                `}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        En Popüler
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto ${plan.bgColor} rounded-full flex items-center justify-center mb-4`}>
                      <IconComponent className={`w-8 h-8 ${plan.color}`} />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="flex flex-col justify-between h-[500px]">
                    <div className="space-y-6">
                      {/* Price Section */}
                      <div className="text-center">
                        <div className="text-3xl font-bold">
                          {currentPrice === 0 ? 'Ücretsiz' : `₺${currentPrice}`}
                          {currentPrice > 0 && <span className="text-lg text-muted-foreground">/ay</span>}
                        </div>
                        {includeAI[plan.id] && plan.basePrice > 0 && (
                          <div className="text-sm text-muted-foreground line-through">
                            ₺{plan.basePrice}/ay
                          </div>
                        )}
                      </div>

                      {/* AI Toggle */}
                      {plan.basePrice >= 0 && (
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">AI Özellikleri</span>
                            {includeAI[plan.id] && (
                              <Badge variant="secondary" className="text-xs">
                                +₺{plan.aiPrice - plan.basePrice}
                              </Badge>
                            )}
                          </div>
                          <Switch
                            checked={includeAI[plan.id]}
                            onCheckedChange={() => toggleAI(plan.id)}
                          />
                        </div>
                      )}

                      {/* Features */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-900">Temel Özellikler:</h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {includeAI[plan.id] && (
                          <>
                            <h4 className="font-semibold text-sm text-purple-900 pt-2">AI Özellikler:</h4>
                            <ul className="space-y-2">
                              {plan.aiFeatures.map((feature, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Button - Positioned at bottom */}
                    <div className="pt-4">
                      <Button 
                        className={`
                          w-full h-12 transition-all duration-300
                          ${plan.popular 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white' 
                            : plan.enterprise 
                            ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                          }
                        `}
                        data-testid={`button-subscribe-${plan.id}`}
                      >
                        {plan.basePrice === 0 ? 'Ücretsiz Başla' : 'Abonelik Başlat'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                      
                      {plan.enterprise && (
                        <p className="text-center text-xs text-muted-foreground mt-2">
                          Özel fiyatlandırma için iletişime geçin
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* AI Package Tab */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <Tabs defaultValue="packages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="packages">Paket Karşılaştırma</TabsTrigger>
              <TabsTrigger value="ai-features">AI Özellikler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="packages" className="mt-8">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Paket Karşılaştırması</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Özellik</th>
                        <th className="text-center p-3">Temel</th>
                        <th className="text-center p-3">Pro</th>
                        <th className="text-center p-3">Premium</th>
                        <th className="text-center p-3">Kurumsal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">Quiz Sayısı</td>
                        <td className="text-center p-3">50/ay</td>
                        <td className="text-center p-3">Sınırsız</td>
                        <td className="text-center p-3">Sınırsız</td>
                        <td className="text-center p-3">Sınırsız</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">AI Öğretmen</td>
                        <td className="text-center p-3">+₺29</td>
                        <td className="text-center p-3">+₺20</td>
                        <td className="text-center p-3">+₺50</td>
                        <td className="text-center p-3">+₺100</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Sosyal Özellikler</td>
                        <td className="text-center p-3">❌</td>
                        <td className="text-center p-3">✅</td>
                        <td className="text-center p-3">✅</td>
                        <td className="text-center p-3">✅</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="ai-features" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold">AI Öğretmen</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Kişiselleştirilmiş öğretmen deneyimi ile 7/24 destek alın.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Anında soru çözme desteği
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Kişisel çalışma planları
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Zayıf nokta analizi
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold">Akıllı Soru Üretimi</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Size özel sorular üretir ve eksik konulara odaklanır.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Dinamik soru üretimi
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Zorluğa göre adapte olur
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Sürekli öğrenme
                    </li>
                  </ul>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white"
        >
          <Gift className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">İlk 7 Gün Ücretsiz!</h3>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Herhangi bir planı seçin ve ilk 7 gün boyunca tüm özellikleri ücretsiz deneyin. 
            Memnun kalmadığınız takdirde kolayca iptal edebilirsiniz.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
              Ücretsiz Denemeyi Başlat
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Daha Fazla Bilgi
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}