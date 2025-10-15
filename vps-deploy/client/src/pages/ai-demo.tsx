import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  ArrowLeft, 
  Brain, 
  MessageCircle, 
  Target, 
  BarChart3,
  CheckCircle,
  Sparkles,
  Clock,
  Users,
  TrendingUp,
  BookOpen,
  Zap,
  ShoppingCart,
  Coins,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const demoFeatures = [
  {
    title: 'AI Kişisel Öğretmen',
    description: 'Size özel sınırsız sohbet ve öğrenme desteği',
    icon: MessageCircle,
    color: 'from-blue-500 to-cyan-500',
    demoText: 'Matematik konusunda yardım alabilirsiniz',
    benefits: ['24/7 erişim', 'Anında yanıt', 'Kişisel yaklaşım']
  },
  {
    title: 'Akıllı Soru Üretimi',
    description: 'Performansınıza göre otomatik soru oluşturma',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    demoText: '10-100 arası soru üretimi',
    benefits: ['Adaptif zorluk', 'Konu odaklı', 'Sınırsız soru']
  },
  {
    title: 'Gelişmiş Analitik',
    description: 'Öğrenme ilerlemesi ve zayıf alan analizi',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-500',
    demoText: 'Güçlü/zayıf yönlerinizi gösterir',
    benefits: ['Detaylı rapor', 'İlerleme takibi', 'Akıllı öneriler']
  }
];

const stats = [
  { label: 'Öğrenci Memnuniyeti', value: '%97', icon: Users },
  { label: 'Başarı Artışı', value: '%35', icon: TrendingUp },
  { label: 'AI Soru Üretimi', value: '250K+', icon: Brain },
  { label: 'Aktif Kullanıcı', value: '50K+', icon: CheckCircle }
];

export default function AIDemo() {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock user ID - in real app this would come from auth context
  const userId = "user123";

  // Fetch user's credit balance
  const { data: creditBalance } = useQuery({
    queryKey: [`/api/ai-credits/balance/${userId}`],
    retry: false
  });

  // Fetch credit info
  const { data: creditInfo } = useQuery({
    queryKey: ['/api/ai-credits/info'],
    retry: false
  });

  // Purchase credits mutation
  const purchaseCreditsMutation = useMutation({
    mutationFn: async ({ userId, creditAmount }: { userId: string, creditAmount: number }) => {
      const response = await apiRequest('POST', '/api/ai-credits/purchase', {
        userId,
        creditAmount
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Kredi Satın Alımı Başarılı!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/ai-credits/balance/${userId}`] });
      setShowCreditDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Satın Alım Hatası",
        description: "Kredi satın alımı sırasında hata oluştu",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentDemo((prev) => (prev + 1) % demoFeatures.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const toggleDemo = () => {
    if (!isPlaying) {
      // Check if user has credits before starting demo
      if (!creditBalance || creditBalance.balance < 5) {
        setShowCreditDialog(true);
        toast({
          title: "AI Kredisi Gerekli",
          description: "AI Demo için en az 5 kredi gerekli",
          variant: "destructive"
        });
        return;
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handlePurchaseCredits = () => {
    if (!creditInfo?.package?.metadata?.creditAmount) return;
    
    purchaseCreditsMutation.mutate({
      userId,
      creditAmount: creditInfo.package.metadata.creditAmount
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ai-education">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Eğitim Demo</h1>
              <p className="text-gray-600">BilgiBite AI özelliklerini keşfedin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Credit Balance Display */}
            <Card className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">
                  {creditBalance ? `${creditBalance.balance} Kredi` : 'Yükleniyor...'}
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowCreditDialog(true)}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100 ml-2"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Satın Al
                </Button>
              </div>
            </Card>
            
            <Button 
              onClick={toggleDemo}
              className={`${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              <Play className="w-4 h-4 mr-2" />
              {isPlaying ? 'Demo Durdur' : 'Demo Başlat'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          
          {/* Demo Viewer */}
          <div>
            <Card className="h-96 relative overflow-hidden">
              <motion.div
                key={currentDemo}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className={`absolute inset-0 bg-gradient-to-br ${demoFeatures[currentDemo].color}`}
              >
                <div className="absolute inset-0 bg-black/10" />
                <div className="relative h-full flex flex-col items-center justify-center text-white p-8 text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm"
                  >
                    {(() => {
                      const IconComponent = demoFeatures[currentDemo].icon;
                      return <IconComponent className="w-10 h-10" />;
                    })()}
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold mb-4">{demoFeatures[currentDemo].title}</h3>
                  <p className="text-white/90 mb-6">{demoFeatures[currentDemo].description}</p>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                    <p className="font-medium">{demoFeatures[currentDemo].demoText}</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Progress Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {demoFeatures.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDemo(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentDemo ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Feature Details */}
          <div>
            <Card className="h-96">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  {demoFeatures[currentDemo].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600">
                  {demoFeatures[currentDemo].description}
                </p>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Avantajlar:</h4>
                  <ul className="space-y-2">
                    {demoFeatures[currentDemo].benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Link href="/ai-education">
                      <Zap className="w-4 h-4 mr-2" />
                      Hemen Deneyin
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center p-6 bg-white/80 backdrop-blur-sm">
                  <IconComponent className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {demoFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="cursor-pointer"
                onClick={() => setCurrentDemo(index)}
              >
                <Card className={`h-full transition-all duration-300 ${
                  currentDemo === index 
                    ? 'ring-2 ring-blue-500 shadow-xl' 
                    : 'hover:shadow-lg'
                }`}>
                  <div className={`h-20 bg-gradient-to-br ${feature.color} relative`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative h-full flex items-center justify-center">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                    
                    <ul className="space-y-1">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center p-8">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Hazır mısınız?</h3>
            <p className="text-blue-100 mb-6">
              AI destekli eğitim deneyimini şimdi yaşayın ve öğrenme hızınızı artırın!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50"
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
                className="border-2 border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/ai-education">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Tüm Özellikler
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Credit Purchase Dialog */}
      {showCreditDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-orange-600" />
                  <CardTitle>AI Kredi Satın Al</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCreditDialog(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Kredi Durumu</span>
                </div>
                <p className="text-sm text-orange-700">
                  Mevcut bakiye: {creditBalance?.balance || 0} kredi
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  AI Demo için en az 5 kredi gerekli
                </p>
              </div>

              {creditInfo && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{creditInfo.package.name}</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {creditInfo.package.metadata.priceInTL}₺
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {creditInfo.package.description}
                  </p>
                  <div className="text-center text-2xl font-bold text-green-600 mb-4">
                    {creditInfo.package.metadata.creditAmount} Kredi
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Soru Üretimi:</span>
                      <span>{creditInfo.costs.AI_QUESTION_GENERATION} kredi</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Öğretmen:</span>
                      <span>{creditInfo.costs.AI_TUTOR_RESPONSE} kredi</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Çalışma Planı:</span>
                      <span>{creditInfo.costs.AI_STUDY_PLAN} kredi</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePurchaseCredits}
                    disabled={purchaseCreditsMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {purchaseCreditsMutation.isPending ? 'İşleniyor...' : 'Kredi Satın Al'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}