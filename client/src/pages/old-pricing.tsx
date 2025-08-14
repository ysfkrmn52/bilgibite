// Turkish Market Optimized Pricing Page
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Check, Crown, Users, Sparkles, Shield, CreditCard, 
  Zap, Target, TrendingUp, Star, Gift, Clock,
  ChevronRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SubscriptionPlan {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  price: string;
  currency: string;
  billingPeriod: string;
  maxUsers: number;
  features: string[];
  trialDays: number;
  isActive: boolean;
  sortOrder: number;
}

interface PricingData {
  plans: SubscriptionPlan[];
  features: {
    free: string[];
    premium: string[];
    family: string[];
  };
  testimonials: Array<{
    name: string;
    exam: string;
    score: string;
    message: string;
  }>;
  paymentMethods: string[];
  guarantees: string[];
}

interface PaymentForm {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  identityNumber: string;
  phone: string;
  address: {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode: string;
  };
}

const Pricing: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
    identityNumber: '',
    phone: '',
    address: {
      contactName: '',
      city: '',
      country: 'Türkiye',
      address: '',
      zipCode: ''
    }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pricing data
  const { data: pricingData, isLoading } = useQuery<{ pricing: PricingData }>({
    queryKey: ['/api/subscription/pricing'],
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: (data: { planId: string; paymentData: any }) => 
      apiRequest('POST', `/api/subscription/users/mock-user-123/subscribe`, data),
    onSuccess: (data) => {
      toast({
        title: "Abonelik Başarılı! 🎉",
        description: "Premium özelliklerimizi kullanmaya başlayabilirsiniz."
      });
      setShowPaymentDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/users/mock-user-123/current'] });
    },
    onError: (error: any) => {
      toast({
        title: "Ödeme Hatası",
        description: error.message || "Ödeme işlemi sırasında bir hata oluştu.",
        variant: "destructive"
      });
    }
  });

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id === 'basic') {
      toast({
        title: "Zaten Ücretsiz Plan Kullanıyorsunuz",
        description: "Premium özellikler için ücretli planlardan birini seçin."
      });
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) return;

    createSubscriptionMutation.mutate({
      planId: selectedPlan.id,
      paymentData: paymentForm
    });
  };

  const formatPrice = (price: string, period: string) => {
    const numPrice = parseFloat(price);
    if (numPrice === 0) return 'Ücretsiz';
    
    return `₺${numPrice.toFixed(0)}${period === 'yearly' ? '/yıl' : '/ay'}`;
  };

  const getPopularPlan = () => {
    return pricingData?.pricing.plans.find(plan => 
      plan.billingPeriod === billingPeriod && 
      (plan.id.includes('premium') && !plan.id.includes('student'))
    );
  };

  const filteredPlans = pricingData?.pricing.plans.filter(plan => 
    plan.billingPeriod === billingPeriod || plan.id === 'basic' || plan.id === 'family'
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const popularPlan = getPopularPlan();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              🚀 Türkiye'nin En İyi Sınav Hazırlık Platformu
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              YKS, KPSS, ALES ve daha fazlasında başarıya ulaş. AI destekli kişisel öğretmeninle hedeflerine odaklan.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Billing Period Toggle */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                data-testid="button-monthly"
              >
                Aylık
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
                data-testid="button-yearly"
              >
                Yıllık
                <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                  %40 İndirim
                </Badge>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filteredPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="relative"
            >
              {plan.id === popularPlan?.id && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    En Popüler
                  </Badge>
                </div>
              )}
              
              <Card 
                className={`h-full transition-all duration-300 hover:shadow-lg ${
                  plan.id === popularPlan?.id 
                    ? 'border-2 border-purple-500 shadow-purple-100 dark:shadow-purple-900'
                    : 'hover:border-blue-300'
                }`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {plan.id === 'basic' && <Gift className="w-8 h-8 text-white" />}
                    {plan.id.includes('premium') && <Sparkles className="w-8 h-8 text-white" />}
                    {plan.id === 'family' && <Users className="w-8 h-8 text-white" />}
                    {plan.id === 'student' && <Target className="w-8 h-8 text-white" />}
                  </div>
                  
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(plan.price, plan.billingPeriod)}
                    </span>
                    {plan.id !== 'basic' && plan.billingPeriod === 'yearly' && (
                      <p className="text-sm text-gray-500 mt-1">
                        (Ayda sadece ₺{Math.round(parseFloat(plan.price) / 12)})
                      </p>
                    )}
                  </div>

                  {plan.trialDays > 0 && (
                    <Badge variant="outline" className="mt-2">
                      <Clock className="w-3 h-3 mr-1" />
                      {plan.trialDays} gün ücretsiz deneme
                    </Badge>
                  )}
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {(plan.id === 'basic' ? pricingData?.pricing.features.free :
                      plan.id === 'family' ? pricingData?.pricing.features.family :
                      pricingData?.pricing.features.premium)?.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full ${
                      plan.id === popularPlan?.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : plan.id === 'basic'
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : ''
                    }`}
                    variant={plan.id === 'basic' ? 'outline' : 'default'}
                    data-testid={`button-select-${plan.id}`}
                  >
                    {plan.id === 'basic' ? 'Mevcut Plan' : 'Planı Seç'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">🎯 Neden BilgiBite Premium?</CardTitle>
              <CardDescription>
                Türkiye'deki 50,000+ başarılı öğrencinin tercih ettiği platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Kişiselleştirilmiş Öğrenme</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    AI öğretmeniniz zayıf yönlerinizi tespit eder ve özel çalışma planı hazırlar.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Gerçek Sınav Simülasyonu</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    ÖSYM formatında sınavlar, gerçek zamanlı puanlama ve detaylı analiz.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">7/24 Türkçe Destek</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Soru çözerken takıldığınız yerde anında yardım alın.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              🌟 Başarı Hikayeleri
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              BilgiBite ile hedeflerine ulaşan öğrencilerimizden bazıları
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pricingData?.pricing.testimonials.map((testimonial, index) => (
              <Card key={index} className="border-l-4 border-l-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <Badge variant="secondary">{testimonial.exam}</Badge>
                        <Badge variant="outline" className="text-green-600">
                          {testimonial.score}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 italic">
                        "{testimonial.message}"
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Payment Methods & Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Ödeme Yöntemleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {pricingData?.pricing.paymentMethods.map((method, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{method}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Güvencelerimiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {pricingData?.pricing.guarantees.map((guarantee, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>{guarantee}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ödeme Bilgileri</DialogTitle>
            <DialogDescription>
              {selectedPlan?.name} planı için ödeme bilgilerinizi girin
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitPayment} className="space-y-6">
            {/* Credit Card Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Kredi Kartı Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardHolderName">Kart Sahibi Adı</Label>
                  <Input
                    id="cardHolderName"
                    value={paymentForm.cardHolderName}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, cardHolderName: e.target.value }))}
                    placeholder="Ad Soyad"
                    required
                    data-testid="input-card-holder"
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber">Kart Numarası</Label>
                  <Input
                    id="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value.replace(/\s/g, '') }))}
                    placeholder="1234567890123456"
                    maxLength={16}
                    required
                    data-testid="input-card-number"
                  />
                </div>
                <div>
                  <Label htmlFor="expireMonth">Son Kullanma Ay/Yıl</Label>
                  <div className="flex gap-2">
                    <Input
                      id="expireMonth"
                      value={paymentForm.expireMonth}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, expireMonth: e.target.value }))}
                      placeholder="MM"
                      maxLength={2}
                      required
                      data-testid="input-expire-month"
                    />
                    <Input
                      value={paymentForm.expireYear}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, expireYear: e.target.value }))}
                      placeholder="YYYY"
                      maxLength={4}
                      required
                      data-testid="input-expire-year"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    value={paymentForm.cvc}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, cvc: e.target.value }))}
                    placeholder="123"
                    maxLength={3}
                    required
                    data-testid="input-cvc"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Kişisel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="identityNumber">TC Kimlik No</Label>
                  <Input
                    id="identityNumber"
                    value={paymentForm.identityNumber}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, identityNumber: e.target.value }))}
                    placeholder="12345678901"
                    maxLength={11}
                    required
                    data-testid="input-identity"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={paymentForm.phone}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="05321234567"
                    required
                    data-testid="input-phone"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Adres Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Ad Soyad</Label>
                  <Input
                    id="contactName"
                    value={paymentForm.address.contactName}
                    onChange={(e) => setPaymentForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, contactName: e.target.value }
                    }))}
                    placeholder="Ad Soyad"
                    required
                    data-testid="input-contact-name"
                  />
                </div>
                <div>
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    value={paymentForm.address.city}
                    onChange={(e) => setPaymentForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="İstanbul"
                    required
                    data-testid="input-city"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    value={paymentForm.address.address}
                    onChange={(e) => setPaymentForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, address: e.target.value }
                    }))}
                    placeholder="Mahalle, Sokak, No"
                    required
                    data-testid="input-address"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Posta Kodu</Label>
                  <Input
                    id="zipCode"
                    value={paymentForm.address.zipCode}
                    onChange={(e) => setPaymentForm(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, zipCode: e.target.value }
                    }))}
                    placeholder="34000"
                    required
                    data-testid="input-zip"
                  />
                </div>
              </div>
            </div>

            {/* Test Card Information */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Test Modu</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Test için: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">5528790000000008</code> kartını kullanın.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <div>
                <p className="text-lg font-semibold">
                  Toplam: {selectedPlan && formatPrice(selectedPlan.price, selectedPlan.billingPeriod)}
                </p>
                {selectedPlan?.trialDays && (
                  <p className="text-sm text-gray-500">
                    İlk {selectedPlan.trialDays} gün ücretsiz
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPaymentDialog(false)}
                  data-testid="button-cancel"
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSubscriptionMutation.isPending}
                  data-testid="button-pay"
                >
                  {createSubscriptionMutation.isPending ? 'İşlem Yapılıyor...' : 'Ödemeyi Tamamla'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pricing;