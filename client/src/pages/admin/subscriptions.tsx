import { AdminLayout } from '@/components/admin/AdminLayout';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  Crown,
  Shield,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, change, icon: Icon, color, subtitle }: StatCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div>
                <p className="text-2xl font-bold text-gray-900" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {value}
                </p>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
              </div>
              {change !== undefined && (
                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="text-sm font-medium">%{Math.abs(change)}</span>
                  <span className="text-xs text-gray-500">bu ay</span>
                </div>
              )}
            </div>
            
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0
  }).format(amount);
}

export default function AdminSubscriptionsPage() {
  // Gerçek API'den veri çekme
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/admin/subscriptions/stats'],
    enabled: true,
    retry: 3,
    retryDelay: 1000
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Abonelik Yönetimi</h1>
              <p className="text-gray-600 mt-1">Veriler yükleniyor...</p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  // API hatası durumu
  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Abonelik Yönetimi</h1>
              <p className="text-red-600 mt-1">Veri yüklenirken hata oluştu</p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()} data-testid="button-refresh-page">
              Sayfayı Yenile
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Yüklenemedi</h3>
              <p className="text-gray-600 mb-4">
                Subscription verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
              </p>
              <Button onClick={() => window.location.reload()} data-testid="button-retry-load">
                Sayfayı Yenile
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  // Veri güvenli şekilde parse et
  const displayStats = stats?.data || stats || {};
  const totalUsers = displayStats.total || 0;
  const activeSubscriptions = displayStats.activeSubscriptions || 0;
  const freeUsers = displayStats.freeUsers || 0;
  const plusUsers = displayStats.plusUsers || 0;
  const premiumUsers = displayStats.premiumUsers || 0;
  const monthlyRevenue = displayStats.monthlyRevenue || 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Abonelik Yönetimi</h1>
            <p className="text-gray-600 mt-1">Kullanıcı abonelik istatistikleri ve gelir raporları</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="default" className="bg-green-100 text-green-700 px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              Sistem Aktif
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Toplam Kullanıcı"
            value={totalUsers.toLocaleString('tr-TR')}
            change={displayStats.growth?.users}
            icon={Users}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            subtitle="Kayıtlı kullanıcı"
          />
          
          <StatCard
            title="Aktif Abonelik"
            value={activeSubscriptions.toLocaleString('tr-TR')}
            change={displayStats.growth?.subscriptions}
            icon={CreditCard}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            subtitle="Ödeme yapan"
          />
          
          <StatCard
            title="Aylık Gelir"
            value={formatCurrency(monthlyRevenue)}
            change={displayStats.growth?.revenue}
            icon={DollarSign}
            color="bg-gradient-to-r from-green-500 to-green-600"
            subtitle="Bu ay"
          />
          
          <StatCard
            title="Plus Kullanıcı"
            value={plusUsers.toLocaleString('tr-TR')}
            icon={Crown}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            subtitle="Plus abonelik"
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Subscription Breakdown */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  Abonelik Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalUsers > 0 ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                          <span className="font-medium text-gray-900">Ücretsiz</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg" data-testid="stat-free-users">{freeUsers}</div>
                          <div className="text-xs text-gray-500">
                            %{Math.round((freeUsers / totalUsers) * 100)}
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={(freeUsers / totalUsers) * 100} 
                        className="h-3" 
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">Plus</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg" data-testid="stat-plus-users">{plusUsers}</div>
                          <div className="text-xs text-gray-500">
                            %{Math.round((plusUsers / totalUsers) * 100)}
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={(plusUsers / totalUsers) * 100} 
                        className="h-3" 
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                          <span className="font-medium text-gray-900">Premium</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg" data-testid="stat-premium-users">{premiumUsers}</div>
                          <div className="text-xs text-gray-500">
                            %{Math.round((premiumUsers / totalUsers) * 100)}
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={(premiumUsers / totalUsers) * 100} 
                        className="h-3" 
                      />
                    </div>

                    <div className="pt-6 border-t">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900" data-testid="stat-total-users-summary">{totalUsers}</div>
                        <div className="text-sm text-gray-500">Toplam Kullanıcı</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Henüz Kullanıcı Yok
                    </h3>
                    <p className="text-gray-500">
                      İlk kullanıcılar kaydolduktan sonra burada görünecek
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <div>
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Sistem Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Servisler</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">PostgreSQL</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">Aktif</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Firebase</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">Aktif</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Error Monitor</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">Çalışıyor</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Subscription Fiyatları</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Ücretsiz</span>
                        <span className="font-medium">₺0/ay</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Plus</span>
                        <span className="font-medium">₺99/ay</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Premium</span>
                        <span className="font-medium">₺299/ay</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Platform Info */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Platform Bilgileri
              </div>
              <Badge variant="outline" className="text-sm">
                v2.0.0 Production
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Özellikler</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>4 Subscription paketi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Firebase Authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Admin Panel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Error Monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Email Notifications</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Database Storage</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kullanıcılar</span>
                    <span className="font-medium">{totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aktif Abonelik</span>
                    <span className="font-medium">{activeSubscriptions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aylık Gelir</span>
                    <span className="font-medium">{formatCurrency(monthlyRevenue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {totalUsers === 0 && (
              <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Platform Yeni Başladı</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Platform production'a hazır durumda. İlk kullanıcılar kaydolduktan sonra 
                      bu panelde detaylı istatistikler görünecek.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}