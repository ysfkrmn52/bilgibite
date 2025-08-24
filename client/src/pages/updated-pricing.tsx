import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Check, 
  Sparkles, 
  Zap, 
  Crown, 
  Star,
  Brain,
  Rocket,
  Gift,
  ChevronRight,
  Copy,
  CheckCircle2,
  Users
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
    id: 'free',
    name: 'Ücretsiz',
    basePrice: 0,
    aiPrice: 0,
    description: 'Hızlı quizler ve temel özellikler',
    icon: Star,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: [
      'Reklamlı kullanım',
      'Sadece hızlı quiz',
      'Temel istatistikler',
      'Mobil uygulama erişimi',
      'Günde 3 deneme hakkı'
    ],
    aiFeatures: []
  },
  {
    id: 'plus',
    name: 'Plus',
    basePrice: 99,
    aiPrice: 99,
    description: 'Reklamsız tam uygulama erişimi',
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: [
      'Reklamsız deneyim',
      'Tam uygulama erişimi',
      'Sınırsız quiz',
      'Detaylı analitik raporlar',
      'Çevrimdışı çalışma',
      'Öncelikli destek'
    ],
    aiFeatures: [
      'AI kredi ile çalışır',
      'AI Öğretmen erişimi',
      'Akıllı soru üretimi',
      'Kişisel çalışma planları',
      'Performans analizi'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    basePrice: 299,
    aiPrice: 299,
    description: '4 kişilik aile paketi',
    icon: Crown,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    features: [
      'Plus\'ın tüm özellikleri',
      '4 kullanıcı hesabı',
      'Aile yönetimi paneli',
      'Çocuk hesap koruması',
      'Aile ilerleme raporları',
      'Paylaşımlı çalışma grupları',
      '7/24 aile desteği'
    ],
    aiFeatures: [
      'AI kredi ile çalışır',
      'Tüm AI özellikler',
      'Aile için AI mentor',
      'Çocuk güvenli AI',
      'Ebeveyn kontrol paneli',
      'Aile başarı analizi'
    ]
  },
  {
    id: 'ai-credits',
    name: 'AI Kredi',
    basePrice: 50,
    aiPrice: 50,
    description: '500 AI kredi paketi',
    icon: Brain,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    features: [
      '500 AI kredi',
      'AI Öğretmen kullanımı',
      'Soru üretimi',
      'Çalışma planı oluşturma',
      'Performans analizi',
      'Kredi geçerlilik: 6 ay'
    ],
    aiFeatures: [
      'Soru üretimi: 5 kredi/10 soru',
      'AI Öğretmen: 2 kredi/mesaj',
      'Çalışma planı: 10 kredi',
      'Analiz raporu: 8 kredi',
      'Mock sınav: 15 kredi'
    ]
  }
];

export default function UpdatedPricing() {
  const [activeBillingPeriod, setActiveBillingPeriod] = useState('1'); // 1, 3, 6, 12 months
  const [showReferral, setShowReferral] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const { toast } = useToast();

  const billingPeriods = [
    { value: '1', label: '1 Ay', discount: 0 },
    { value: '3', label: '3 Ay', discount: 10 },
    { value: '6', label: '6 Ay', discount: 20 },
    { value: '12', label: '12 Ay', discount: 30 }
  ];

  const generateReferralCode = () => {
    const codes = ['ARKADAS2025', 'OGRENCEM50', 'BASARI123', 'QUIZ2025', 'EGITIM50'];
    return codes[Math.floor(Math.random() * codes.length)];
  };

  const getDiscountedPrice = (basePrice: number) => {
    const currentPeriod = billingPeriods.find(p => p.value === activeBillingPeriod);
    const discount = currentPeriod?.discount || 0;
    return Math.round(basePrice * (1 - discount / 100));
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
          
          {/* Billing Period Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl p-2 shadow-lg border">
              <div className="flex gap-1">
                {billingPeriods.map((period) => (
                  <Button
                    key={period.value}
                    variant={activeBillingPeriod === period.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveBillingPeriod(period.value)}
                    className={`relative px-4 py-2 rounded-lg transition-all ${
                      activeBillingPeriod === period.value 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    data-testid={`button-billing-${period.value}`}
                  >
                    {period.label}
                    {period.discount > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0.5">
                        -%{period.discount}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
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
            const currentPrice = plan.id === 'ai-credits' ? plan.basePrice : getDiscountedPrice(plan.basePrice);
            
            return (
              <motion.div key={plan.id} variants={cardVariants}>
                <Card className={`
                  h-[650px] relative border-2 transition-all duration-300 hover:shadow-xl
                  ${plan.popular ? 'border-purple-300 shadow-lg scale-105' : 'border-gray-200'}
                  ${plan.id === 'ai-credits' ? 'border-orange-300' : ''}
                `}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        En Popüler
                      </Badge>
                    </div>
                  )}

                  {plan.id === 'ai-credits' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1">
                        <Brain className="w-3 h-3 mr-1" />
                        AI Kredi
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
                          {plan.id === 'ai-credits' ? (
                            <span className="text-lg text-muted-foreground"> / 500 kredi</span>
                          ) : currentPrice > 0 ? (
                            <span className="text-lg text-muted-foreground">/ay</span>
                          ) : null}
                        </div>
                        {activeBillingPeriod !== '1' && plan.basePrice > 0 && plan.id !== 'ai-credits' && (
                          <div className="text-sm text-muted-foreground line-through">
                            ₺{plan.basePrice}/ay
                          </div>
                        )}
                        {activeBillingPeriod !== '1' && currentPrice > 0 && plan.id !== 'ai-credits' && (
                          <div className="text-xs text-green-600 font-medium">
                            {billingPeriods.find(p => p.value === activeBillingPeriod)?.discount}% indirim
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-900">Özellikler:</h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {plan.aiFeatures.length > 0 && (
                          <>
                            <h4 className="font-semibold text-sm text-purple-900 pt-2">AI Özellikler:</h4>
                            <ul className="space-y-2">
                              {plan.aiFeatures.map((feature, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                    <Sparkles className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
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
                            : plan.id === 'ai-credits'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                          }
                        `}
                        data-testid={`button-subscribe-${plan.id}`}
                      >
                        {plan.basePrice === 0 ? 'Ücretsiz Başla' : plan.id === 'ai-credits' ? 'Kredi Satın Al' : 'Abonelik Başlat'}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
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
                        <th className="text-center p-3">Ücretsiz</th>
                        <th className="text-center p-3">Plus</th>
                        <th className="text-center p-3">Premium</th>
                        <th className="text-center p-3">AI Kredi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">Reklam</td>
                        <td className="text-center p-3">✅ Var</td>
                        <td className="text-center p-3">❌ Yok</td>
                        <td className="text-center p-3">❌ Yok</td>
                        <td className="text-center p-3">-</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Quiz Türü</td>
                        <td className="text-center p-3">Sadece Hızlı</td>
                        <td className="text-center p-3">Tam Uygulama</td>
                        <td className="text-center p-3">Tam Uygulama</td>
                        <td className="text-center p-3">-</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Kullanıcı Sayısı</td>
                        <td className="text-center p-3">1</td>
                        <td className="text-center p-3">1</td>
                        <td className="text-center p-3">4 Kişi</td>
                        <td className="text-center p-3">-</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">AI Özellikler</td>
                        <td className="text-center p-3">❌</td>
                        <td className="text-center p-3">AI Kredi ile</td>
                        <td className="text-center p-3">AI Kredi ile</td>
                        <td className="text-center p-3">500 Kredi</td>
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

        {/* Referral System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Arkadaşını Davet Et</h3>
                <p className="text-green-700 max-w-2xl mx-auto">
                  Arkadaşın Plus veya Premium paketine abone olduğunda her ikiniz de 1 ay ücretsiz kazanırsınız!
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Sen Kazanırsın:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        1 ay ücretsiz abonelik
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        50 bonus AI kredi
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Arkadaşın Kazanır:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        İlk ay %50 indirim
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        25 bonus AI kredi
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Input
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Arkadaşının referans kodunu gir"
                    className="flex-1"
                    data-testid="input-referral-code"
                  />
                  <Button
                    onClick={() => {
                      if (!referralCode.trim()) {
                        const newCode = generateReferralCode();
                        setReferralCode(newCode);
                        navigator.clipboard.writeText(newCode);
                        toast({
                          title: "Referans Kodu Oluşturuldu!",
                          description: "Kodun kopyalandı. Arkadaşlarınla paylaş!"
                        });
                      } else {
                        navigator.clipboard.writeText(referralCode);
                        toast({
                          title: "Kopyalandı!",
                          description: "Referans kodu panoya kopyalandı."
                        });
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-copy-referral"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {referralCode ? 'Kopyala' : 'Kod Oluştur'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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