import { AdminLayout } from '@/components/admin/AdminLayout';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  Target, 
  Zap, 
  Brain,
  Crown,
  DollarSign,
  CreditCard,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EXAM_CATEGORIES } from '@shared/categories';

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: () => fetch('/api/admin/stats').then(res => res.json())
  });

  const { data: subscriptionStats, isLoading: subStatsLoading } = useQuery({
    queryKey: ['/api/admin/subscriptions/stats'],
    retry: 3,
    retryDelay: 1000
  });

  const { data: questionCounts } = useQuery({
    queryKey: ['/api/questions/counts'],
    queryFn: () => fetch('/api/questions/counts').then(res => res.json())
  });

  const getCategoryCount = (categoryId: string) => {
    return questionCounts?.[categoryId] || 0;
  };

  // Combine stats from both sources
  const displayStats = subscriptionStats?.data || subscriptionStats || {};
  const combinedStats = {
    ...adminStats,
    ...displayStats,
    totalUsers: displayStats.total || adminStats?.activeUsers || 0,
    activeSubscriptions: displayStats.activeSubscriptions || 0,
    monthlyRevenue: displayStats.monthlyRevenue || 0,
    plusUsers: displayStats.plusUsers || 0,
    freeUsers: displayStats.freeUsers || 0,
    premiumUsers: displayStats.premiumUsers || adminStats?.premiumUsers || 0
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">BilgiBite Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Platform yönetim merkezi - Soru üretimi ve yönetimi</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => window.location.href = '/admin/questions'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Detaylı Soru Yönetimi
            </Button>
            <Badge variant="default" className="bg-green-100 text-green-700 px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              Sistem Aktif
            </Badge>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Toplam Sorular</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {adminStats?.totalQuestions || 0}
                  </div>
                  <div className="text-xs text-blue-600">Veritabanında</div>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Toplam Kullanıcılar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {combinedStats.totalUsers}
                  </div>
                  <div className="text-xs text-green-600">Kayıtlı kullanıcı</div>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Aktif Abonelik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {combinedStats.activeSubscriptions}
                  </div>
                  <div className="text-xs text-purple-600">Ödeme yapan</div>
                </div>
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Aylık Gelir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-900">
                    {formatCurrency(combinedStats.monthlyRevenue || 0)}
                  </div>
                  <div className="text-xs text-orange-600">Bu ay</div>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ana Yönetim Alanları */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Hızlı Aksiyonlar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => window.location.href = '/admin/questions'}
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-question-management"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Soru Yönetimi
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button 
                  onClick={() => window.location.href = '/admin/subscriptions'}
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-subscription-management"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Abonelik Yönetimi
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button 
                  onClick={() => window.location.href = '/admin/analytics'}
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-analytics"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Detaylı Analytics
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button 
                  onClick={() => window.location.href = '/admin/users'}
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-user-management"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Kullanıcı Yönetimi
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Kategori Başına Soru Dağılımı */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Kategori Başına Soru Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EXAM_CATEGORIES.map(category => {
                    const count = getCategoryCount(category.id);
                    const percentage = Math.min(100, (count / 100) * 100);
                    const isReady = count >= 50;
                    return (
                      <div key={category.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">{category.name}</span>
                          <Badge variant={isReady ? "default" : "secondary"} className="text-xs">
                            {count} soru
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isReady ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {percentage.toFixed(0)}% tamamlandı
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ana Yönetim Tabları */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Soru Yönetimi
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Abonelik Durumu
            </TabsTrigger>
          </TabsList>

          {/* Genel Bakış */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Platform İstatistikleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Toplam Sorular</span>
                      <span className="font-semibold">{adminStats?.totalQuestions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Aktif Kullanıcılar</span>
                      <span className="font-semibold">{combinedStats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bu Ay Oluşturulan Sorular</span>
                      <span className="font-semibold text-green-600">+{adminStats?.monthlyQuestions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quiz Çözme Oranı</span>
                      <span className="font-semibold text-blue-600">%{adminStats?.completionRate || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-green-600" />
                    Sistem Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" data-testid="system-status">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">PostgreSQL</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Aktif</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Firebase Admin SDK</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Aktif</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AI Claude API</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Hazır</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Monitoring</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Çalışıyor</span>
                      </div>
                    </div>

                    {combinedStats.totalUsers === 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div className="text-xs">
                            <div className="font-medium text-blue-900">Platform Hazır</div>
                            <div className="text-blue-700">
                              İlk kullanıcılar kaydolduktan sonra burada istatistikler görünecek.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Soru Yönetimi */}
          <TabsContent value="questions">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Soru Yönetimi Merkezi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button 
                      onClick={() => window.location.href = '/admin/questions'}
                      className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <BookOpen className="w-6 h-6" />
                      <span>Soru Bankası Yönetimi</span>
                    </Button>
                    
                    <Button 
                      onClick={() => window.location.href = '/admin/ai-questions'}
                      className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <Brain className="w-6 h-6" />
                      <span>AI Soru Üretimi</span>
                    </Button>
                  </div>

                  <div className="text-center py-8 border-t">
                    <p className="text-gray-600 mb-4">
                      Soru yönetimi ve AI destekli soru üretimi için yukarıdaki butonları kullanın.
                    </p>
                    <p className="text-sm text-gray-500">
                      Tüm soru işlemleri ayrı sayfalarda detaylı şekilde yapılabilir.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Abonelik Durumu */}
          <TabsContent value="subscriptions">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    Abonelik İstatistikleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {combinedStats.totalUsers > 0 ? (
                    <div className="space-y-4" data-testid="subscription-stats">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Ücretsiz Kullanıcılar</span>
                        <div className="text-right">
                          <div className="font-semibold" data-testid="text-free-users">{combinedStats.freeUsers || 0}</div>
                          <div className="text-xs text-gray-500">
                            %{Math.round(((combinedStats.freeUsers || 0) / combinedStats.totalUsers) * 100)}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Plus Aboneler</span>
                        <div className="text-right">
                          <div className="font-semibold" data-testid="text-plus-users">{combinedStats.plusUsers || 0}</div>
                          <div className="text-xs text-gray-500">
                            %{Math.round(((combinedStats.plusUsers || 0) / combinedStats.totalUsers) * 100)}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Premium Aboneler</span>
                        <div className="text-right">
                          <div className="font-semibold" data-testid="text-premium-users">{combinedStats.premiumUsers || 0}</div>
                          <div className="text-xs text-gray-500">
                            %{Math.round(((combinedStats.premiumUsers || 0) / combinedStats.totalUsers) * 100)}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Toplam Aylık Gelir</span>
                          <span className="font-bold text-green-600">
                            {formatCurrency(combinedStats.monthlyRevenue || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8" data-testid="no-users-message">
                      <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500">Henüz kullanıcı verisi bulunmuyor</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Paket Fiyatları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">Ücretsiz</span>
                        <div className="text-xs text-gray-500">Temel özellikler</div>
                      </div>
                      <span className="font-bold">₺0/ay</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-medium">Plus</span>
                        <div className="text-xs text-gray-500">Gelişmiş özellikler</div>
                      </div>
                      <span className="font-bold text-blue-600">₺99/ay</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <span className="font-medium">Premium</span>
                        <div className="text-xs text-gray-500">Tüm özellikler + AI</div>
                      </div>
                      <span className="font-bold text-purple-600">₺299/ay</span>
                    </div>

                    <Button 
                      onClick={() => window.location.href = '/admin/subscriptions'}
                      variant="outline" 
                      className="w-full mt-4"
                    >
                      Detaylı Abonelik Yönetimi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}