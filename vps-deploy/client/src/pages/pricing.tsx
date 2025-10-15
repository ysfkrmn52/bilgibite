import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, X, Zap, Crown, Target, Brain, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  aiPrice: number;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "Temel Plan",
    description: "Başlangıç seviyesi öğrenciler için",
    basePrice: 80,
    aiPrice: 50,
    features: [
      "Temel quiz erişimi (100 soru/ay)",
      "Basit ilerleme takibi",
      "Temel istatistikler",
      "E-posta desteği"
    ],
    icon: <Target className="h-6 w-6" />
  },
  {
    id: "premium",
    name: "Premium Plan",
    description: "En popüler seçenek - tüm özellikler",
    basePrice: 120,
    aiPrice: 50,
    features: [
      "Sınırsız quiz erişimi",
      "Detaylı analitik raporlar",
      "Sosyal özellikler",
      "Öncelikli destek",
      "Tüm sınav kategorileri",
      "Özel içerikler"
    ],
    popular: true,
    icon: <Crown className="h-6 w-6" />
  },
  {
    id: "enterprise",
    name: "Kurumsal Plan",
    description: "Okullar ve kurumlar için",
    basePrice: 200,
    aiPrice: 50,
    features: [
      "Premium'un tüm özellikleri",
      "Kurumsal yönetim paneli",
      "Öğrenci grup yönetimi",
      "Özel raporlama",
      "API erişimi",
      "Özel entegrasyon desteği",
      "Sınırsız kullanıcı"
    ],
    icon: <Zap className="h-6 w-6" />
  }
];

// AI paket bilgileri
const aiPackages = {
  monthly: { questions: 1000, hours: "30 saat" },
  quarterly: { questions: 3500, hours: "105 saat" },
  semiannual: { questions: 7500, hours: "225 saat" },
  yearly: { questions: 16000, hours: "480 saat" }
};

// Dönem bilgileri
const periodMultipliers = {
  monthly: { multiplier: 1, label: "Aylık", discount: 0 },
  quarterly: { multiplier: 3, label: "3 Aylık", discount: 10 },
  semiannual: { multiplier: 6, label: "6 Aylık", discount: 20 },
  yearly: { multiplier: 12, label: "Yıllık", discount: 30 }
};

export default function NewPricing() {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "semiannual" | "yearly">("monthly");

  const { data: apiPricing } = useQuery({
    queryKey: ["/api/subscription/pricing"],
    queryFn: async () => {
      const response = await fetch("/api/subscription/pricing");
      return response.json();
    },
  });

  const calculatePrice = (basePrice: number, aiPrice: number, period: string) => {
    const periodInfo = periodMultipliers[period as keyof typeof periodMultipliers];
    const totalBase = basePrice * periodInfo.multiplier;
    const totalAi = aiPrice * periodInfo.multiplier;
    const discountAmount = (totalBase + totalAi) * (periodInfo.discount / 100);
    return {
      base: totalBase,
      ai: totalAi,
      total: totalBase + totalAi - discountAmount,
      discount: discountAmount,
      savings: discountAmount
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Planlarımız ve Fiyatlar
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            BilgiBite ile öğrenme yolculuğunda sana en uygun planı seç. 
            Her plan ile başarıya bir adım daha yaklaş!
          </p>
        </motion.div>

        {/* Period Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
              <TabsTrigger value="monthly" className="text-xs">Aylık</TabsTrigger>
              <TabsTrigger value="quarterly" className="text-xs">
                3 Aylık
                <Badge variant="secondary" className="ml-1 text-xs">%10</Badge>
              </TabsTrigger>
              <TabsTrigger value="semiannual" className="text-xs">
                6 Aylık
                <Badge variant="secondary" className="ml-1 text-xs">%20</Badge>
              </TabsTrigger>
              <TabsTrigger value="yearly" className="text-xs">
                Yıllık
                <Badge className="ml-1 text-xs bg-green-100 text-green-800">%30</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Pricing Cards */}
            <TabsContent value={selectedPeriod} className="mt-8">
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {pricingPlans.map((plan, index) => {
                  const pricing = calculatePrice(plan.basePrice, plan.aiPrice, selectedPeriod);
                  const periodInfo = periodMultipliers[selectedPeriod];
                  const aiInfo = aiPackages[selectedPeriod];
                  
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1">
                            En Popüler
                          </Badge>
                        </div>
                      )}
                      
                      <Card className={`relative h-full ${
                        plan.popular 
                          ? "border-2 border-blue-200 dark:border-blue-800 shadow-xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/20" 
                          : "border border-border"
                      }`}>
                        <CardHeader className="text-center pb-6">
                          <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                            {plan.icon}
                          </div>
                          <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                          <CardDescription className="text-base">{plan.description}</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                          {/* Fiyat Breakdown */}
                          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Temel Plan</span>
                              <span className="font-medium">₺{pricing.base}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Brain className="h-4 w-4" />
                                AI Özellikler
                              </span>
                              <span className="font-medium">₺{pricing.ai}</span>
                            </div>
                            
                            {pricing.savings > 0 && (
                              <div className="flex justify-between items-center text-green-600">
                                <span className="text-sm">İndirim</span>
                                <span className="font-medium">-₺{pricing.savings}</span>
                              </div>
                            )}
                            
                            <div className="border-t pt-3">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold">Toplam</span>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-blue-600">
                                    ₺{pricing.total}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {periodInfo.label}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* AI Paket Bilgileri */}
                          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="h-4 w-4 text-orange-600" />
                              <span className="font-medium text-orange-700 dark:text-orange-400">
                                AI Paketi Dahil
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Soru Hakkı:</span>
                                <div className="font-medium">{aiInfo.questions} soru</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Kullanım:</span>
                                <div className="font-medium">{aiInfo.hours}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Features */}
                          <ul className="space-y-3">
                            {plan.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <Button 
                            className={`w-full ${
                              plan.popular 
                                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
                                : ""
                            }`}
                            variant={plan.popular ? "default" : "outline"}
                          >
                            {plan.popular ? "Şimdi Başla" : "Planı Seç"}
                          </Button>
                          
                          {periodInfo.discount > 0 && (
                            <p className="text-center text-sm text-green-600 font-medium">
                              {periodInfo.label} planla %{periodInfo.discount} tasarruf!
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* AI Features Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white">
                <Brain className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                AI Özellikler Neler Sunar?
              </CardTitle>
              <CardDescription className="text-lg">
                50 TL AI eklentisi ile neler kazanıyorsun?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mx-auto">
                    <Brain className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold">Kişisel AI Öğretmen</h4>
                  <p className="text-sm text-muted-foreground">
                    7/24 soru sorabilir, açıklama isteyebilirsin
                  </p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold">Akıllı Soru Üretimi</h4>
                  <p className="text-sm text-muted-foreground">
                    Zayıf alanlarına özel sorular üretilir
                  </p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold">Çalışma Planı</h4>
                  <p className="text-sm text-muted-foreground">
                    AI destekli kişisel çalışma programı
                  </p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold">Anlık Geri Bildirim</h4>
                  <p className="text-sm text-muted-foreground">
                    Her yanlış cevabın için detaylı açıklama
                  </p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  * AI özellikler tüm planlarımızla birlikte sunulur
                </p>
                <Badge className="bg-orange-100 text-orange-800 px-4 py-2">
                  Aylık ortalama 1000 soru + 30 saat AI etkileşimi
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-8">Sıkça Sorulan Sorular</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold mb-2">AI soru hakkım biterse ne olur?</h3>
              <p className="text-muted-foreground">
                AI soru hakkınız bittiğinde normal quiz özelliklerini kullanmaya devam edebilirsiniz. 
                Ek AI paketi satın alarak hakkınızı yenileyebilirsiniz.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Planımı istediğim zaman değiştirebilir miyim?</h3>
              <p className="text-muted-foreground">
                Evet, planınızı istediğiniz zaman yükseltebilir veya düşürebilirsiniz. 
                Değişiklik bir sonraki fatura döneminde geçerli olur.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Hangi dönemde en çok tasarruf ederim?</h3>
              <p className="text-muted-foreground">
                Yıllık planla %30, 6 aylık planla %20, 3 aylık planla %10 indirim kazanırsınız. 
                Yıllık plan en avantajlı seçenektir.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Öğrenci indirimi var mı?</h3>
              <p className="text-muted-foreground">
                Evet! Geçerli öğrenci belgesi ile tüm planlarda %25 indirim sağlıyoruz. 
                Destek ekibimizle iletişime geçin.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}