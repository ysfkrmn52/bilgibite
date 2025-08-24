import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  Check, 
  Sparkles, 
  Zap, 
  Crown, 
  Star,
  Brain,
  Gift,
  ChevronRight,
  Copy,
  CheckCircle2,
  Users,
  Coins,
  ShoppingCart,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  features: string[];
  aiFeatures: string[];
  popular?: boolean;
  isCredit?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    price: 0,
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
    price: 99,
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
      'Öncelikli destek',
      'AI kredi ile AI özellikler'
    ],
    aiFeatures: [],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 299,
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
      '7/24 aile desteği',
      'AI kredi ile AI özellikler'
    ],
    aiFeatures: []
  },
  {
    id: 'ai-credits',
    name: 'AI Kredi',
    price: 50,
    description: '500 AI kredi paketi',
    icon: Brain,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    features: [],
    aiFeatures: [
      '500 AI kredi (6 ay geçerli)',
      'AI Öğretmen: 2 kredi/mesaj',
      'Soru üretimi: 5 kredi/10 soru',
      'Çalışma planı: 10 kredi',
      'Analiz raporu: 8 kredi',
      'Mock sınav: 15 kredi',
      'Plus/Premium ile kullanılır'
    ],
    isCredit: true
  }
];

const aiFeatures = [
  {
    id: 'tutor',
    title: 'AI Kişisel Öğretmen',
    description: 'Size özel sınırsız sohbet ve öğrenme desteği',
    icon: MessageCircle,
    gradient: 'from-blue-500 to-cyan-500',
    cost: '2 kredi/mesaj',
    benefits: ['24/7 erişim', 'Anında yanıt', 'Kişisel yaklaşım']
  },
  {
    id: 'questions',
    title: 'Akıllı Soru Üretimi',
    description: 'Zayıf yönlerinize odaklanmış soru üretimi',
    icon: Brain,
    gradient: 'from-purple-500 to-pink-500',
    cost: '5 kredi/10 soru',
    benefits: ['Adaptif zorluk', 'Konu odaklı', 'Otomatik entegrasyon']
  }
];

export default function UpdatedPricing() {
  const [referralCode, setReferralCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const { toast } = useToast();

  // Mock user ID - in real app this would come from auth context
  const userId = "user123";

  // Fetch user's credit balance
  const { data: creditBalance } = useQuery({
    queryKey: [`/api/ai-credits/balance/${userId}`],
    retry: false
  });

  const generateReferralCode = () => {
    const timestamp = Date.now().toString().slice(-4);
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DAVET${timestamp}${randomStr}`;
  };

  const handleGenerateCode = () => {
    const newCode = generateReferralCode();
    setGeneratedCode(newCode);
    navigator.clipboard.writeText(newCode);
    toast({
      title: "Davet Kodu Oluşturuldu!",
      description: "Benzersiz davet kodun kopyalandı. Arkadaşlarınla paylaş!"
    });
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
            Abonelik Paketleri
          </h1>
          <p className="text-gray-700 text-lg max-w-3xl mx-auto mb-8">
            İhtiyaçlarına en uygun paketi seç ve öğrenme deneyimini geliştir. AI özellikler ile daha akıllı çalış.
          </p>
          
          {/* Current Credit Balance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border mb-8"
          >
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-gray-800">
              Mevcut AI Kredi: {(creditBalance as any)?.balance || 0}
            </span>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {pricingPlans.map((plan) => {
            const IconComponent = plan.icon;
            
            return (
              <motion.div key={plan.id} variants={cardVariants}>
                <Card className={`
                  relative border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
                  ${plan.popular ? 'border-purple-300 shadow-xl' : 'border-gray-200 shadow-lg'}
                  ${plan.isCredit ? 'border-orange-300 shadow-xl' : ''}
                  bg-white overflow-hidden h-[650px] flex flex-col
                `}>
                  
                  {/* Corner Badge for Popular */}
                  {plan.popular && (
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 text-xs font-semibold shadow-lg">
                        <Star className="w-3 h-3 mr-1" />
                        En Popüler
                      </Badge>
                    </div>
                  )}

                  {/* Corner Badge for AI Credits */}
                  {plan.isCredit && (
                    <div className="absolute top-4 right-4 z-20">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 text-xs font-semibold shadow-lg">
                        <Brain className="w-3 h-3 mr-1" />
                        Her Zaman Al
                      </Badge>
                    </div>
                  )}

                  {/* Gradient Background */}
                  <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${plan.bgColor} opacity-60`}></div>

                  <CardHeader className="text-center pb-4 relative z-10">
                    <div className={`w-16 h-16 mx-auto ${plan.bgColor} rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-white`}>
                      <IconComponent className={`w-8 h-8 ${plan.color}`} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                    <p className="text-gray-600 font-medium">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col relative z-10 p-6 min-h-[400px]">
                    {/* Features - Flexible Content */}
                    <div className="flex-1 mb-6">
                      {plan.isCredit ? (
                        /* AI Kredi kartı sadece AI özellikleri gösterir */
                        <div>
                          <h4 className="font-semibold text-sm text-orange-900 mb-3">AI Kredi Özellikleri:</h4>
                          <ul className="space-y-2">
                            {plan.aiFeatures.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                  <Brain className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-gray-800 font-medium">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        /* Diğer kartlar sadece normal özellikler */
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900 mb-3">Özellikler:</h4>
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-gray-800 font-medium">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Button with Price Inside */}
                    <div>
                      <Button 
                        className={`
                          w-full h-14 transition-all duration-300 font-semibold text-lg shadow-lg flex flex-col items-center justify-center gap-1
                          ${plan.popular 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-purple-300' 
                            : plan.isCredit
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-300'
                            : plan.price === 0
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-green-300'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-blue-300'
                          }
                        `}
                        data-testid={`button-subscribe-${plan.id}`}
                      >
                        <div className="font-bold text-lg">
                          {plan.price === 0 ? 'Ücretsiz' : `₺${plan.price}`}
                          {plan.isCredit ? (
                            <span className="text-sm font-normal"> / 500 kredi</span>
                          ) : plan.price > 0 ? (
                            <span className="text-sm font-normal">/ay</span>
                          ) : null}
                        </div>
                        <div className="text-sm opacity-90 flex items-center gap-1">
                          {plan.price === 0 
                            ? 'Hemen Başla' 
                            : plan.isCredit 
                            ? 'Satın Al' 
                            : 'Paketi Seç'}
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Package Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center py-8">
              <CardTitle className="text-2xl font-bold">Paket Karşılaştırması</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-6 font-bold text-gray-900">Özellik</th>
                      <th className="text-center p-6 font-bold text-blue-600">Ücretsiz</th>
                      <th className="text-center p-6 font-bold text-purple-600">Plus</th>
                      <th className="text-center p-6 font-bold text-yellow-600">Premium</th>
                      <th className="text-center p-6 font-bold text-orange-600">AI Kredi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-6 font-semibold text-gray-800">Reklam</td>
                      <td className="text-center p-6">
                        <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                          <AlertTriangle className="w-4 h-4" />
                          Var
                        </span>
                      </td>
                      <td className="text-center p-6">
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Yok
                        </span>
                      </td>
                      <td className="text-center p-6">
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Yok
                        </span>
                      </td>
                      <td className="text-center p-6 text-gray-500">-</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-6 font-semibold text-gray-800">Quiz Türü</td>
                      <td className="text-center p-6 text-gray-700 font-medium">Sadece Hızlı</td>
                      <td className="text-center p-6 text-gray-700 font-medium">Tam Uygulama</td>
                      <td className="text-center p-6 text-gray-700 font-medium">Tam Uygulama</td>
                      <td className="text-center p-6 text-gray-500">-</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-6 font-semibold text-gray-800">Kullanıcı Sayısı</td>
                      <td className="text-center p-6 text-gray-700 font-medium">1</td>
                      <td className="text-center p-6 text-gray-700 font-medium">1</td>
                      <td className="text-center p-6">
                        <span className="inline-flex items-center gap-1 text-yellow-600 font-bold">
                          <Users className="w-4 h-4" />
                          4 Kişi
                        </span>
                      </td>
                      <td className="text-center p-6 text-gray-500">-</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-6 font-semibold text-gray-800">AI Özellikler</td>
                      <td className="text-center p-6">
                        <span className="text-red-600 font-medium">❌</span>
                      </td>
                      <td className="text-center p-6">
                        <span className="inline-flex items-center gap-1 text-purple-600 font-medium">
                          <Coins className="w-4 h-4" />
                          AI Kredi ile
                        </span>
                      </td>
                      <td className="text-center p-6">
                        <span className="inline-flex items-center gap-1 text-purple-600 font-medium">
                          <Coins className="w-4 h-4" />
                          AI Kredi ile
                        </span>
                      </td>
                      <td className="text-center p-6">
                        <span className="inline-flex items-center gap-1 text-orange-600 font-bold">
                          <Brain className="w-4 h-4" />
                          500 Kredi
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-8">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold mb-2">Arkadaşını Davet Et</CardTitle>
              <p className="text-green-100 max-w-2xl mx-auto">
                Arkadaşın Plus veya Premium paketine abone olduğunda her ikiniz de 1 ay ücretsiz kazanırsınız!
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Sen Kazanırsın:
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-800 font-medium">1 ay ücretsiz abonelik</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-800 font-medium">50 bonus AI kredi</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Arkadaşın Kazanır:
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-800 font-medium">İlk ay %50 indirim</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-800 font-medium">25 bonus AI kredi</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                  <h4 className="font-bold text-gray-800 mb-4 text-center">Davet Kodun</h4>
                  <div className="flex gap-4 max-w-lg mx-auto">
                    {generatedCode ? (
                      <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border">
                        <span className="font-mono font-bold text-lg text-gray-800">{generatedCode}</span>
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedCode);
                            toast({
                              title: "Kopyalandı!",
                              description: "Davet kodu panoya kopyalandı."
                            });
                          }}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid="button-copy-code"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleGenerateCode}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3"
                        data-testid="button-generate-referral"
                      >
                        <Users className="w-5 h-5 mr-2" />
                        Benzersiz Davet Kodu Oluştur
                      </Button>
                    )}
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-4">
                    * Davet kodu sadece bir kez kullanılabilir ve yeni üyelerde geçerlidir
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Features Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-center py-8">
              <CardTitle className="text-2xl font-bold mb-2">AI Özellikleri</CardTitle>
              <p className="text-purple-100">Yapay zeka ile öğrenme deneyiminizi geliştirin</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {aiFeatures.slice(0, 2).map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={feature.id} className={`p-6 rounded-xl bg-gradient-to-br ${feature.gradient} text-white`}>
                      <div className="flex items-center gap-3 mb-4">
                        <IconComponent className="w-8 h-8" />
                        <h3 className="text-xl font-bold">{feature.title}</h3>
                      </div>
                      <p className="mb-4 opacity-90">{feature.description}</p>
                      <div className="flex items-center gap-2 mb-4">
                        <Coins className="w-4 h-4" />
                        <span className="text-sm font-medium">{feature.cost}</span>
                      </div>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Credit Purchase CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8">
                <Coins className="w-16 h-16 mx-auto mb-4 opacity-90" />
                <h2 className="text-3xl font-bold mb-4">AI Özelliklerini Dene</h2>
                <p className="text-orange-100 mb-6 max-w-2xl mx-auto text-lg">
                  AI kredi satın alarak Plus ve Premium paketlerde AI özelliklerini kullanabilirsiniz
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-3 font-semibold shadow-lg"
                    data-testid="button-buy-ai-credits"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    500 AI Kredi Satın Al - ₺50
                  </Button>
                  <div className="text-orange-100 text-sm">
                    6 ay geçerli • Herhangi bir zamanda satın alınabilir
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}