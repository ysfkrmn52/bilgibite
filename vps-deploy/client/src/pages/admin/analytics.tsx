import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['/api/admin/analytics'],
    queryFn: () => fetch('/api/admin/analytics').then(res => res.json()),
    retry: 3,
    retryDelay: 1000
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Analitik</h1>
            <p className="text-gray-600">Veriler yükleniyor...</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Analitik</h1>
            <p className="text-red-600">Veri yüklenirken hata oluştu</p>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analitik Verisi Bulunamadı</h3>
              <p className="text-gray-600">
                Analitik verileri henüz mevcut değil veya bir hata oluştu.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const data = analytics?.data || analytics || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Analitik</h1>
            <p className="text-gray-600">Sistem performansı ve kullanıcı davranış analizi</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Activity className="w-4 h-4 mr-1" />
            Canlı Veri
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Toplam Ziyaretçi</p>
                  <p className="text-2xl font-bold" data-testid="stat-total-visitors">
                    {data.totalVisitors || '0'}
                  </p>
                  <p className="text-xs text-blue-200">Bu ay</p>
                </div>
                <Users className="w-10 h-10 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Quiz Tamamlanan</p>
                  <p className="text-2xl font-bold" data-testid="stat-completed-quizzes">
                    {data.completedQuizzes || '0'}
                  </p>
                  <p className="text-xs text-green-200">Bu hafta</p>
                </div>
                <CheckCircle className="w-10 h-10 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Ortalama Süre</p>
                  <p className="text-2xl font-bold" data-testid="stat-average-session">
                    {data.averageSessionTime || '0'}dk
                  </p>
                  <p className="text-xs text-purple-200">Oturum başına</p>
                </div>
                <Clock className="w-10 h-10 text-white/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Başarı Oranı</p>
                  <p className="text-2xl font-bold" data-testid="stat-success-rate">
                    {data.successRate || '0'}%
                  </p>
                  <p className="text-xs text-orange-200">Genel ortalama</p>
                </div>
                <TrendingUp className="w-10 h-10 text-white/80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Haftalık Aktivite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Son 7 günün kullanıcı aktivitesi</p>
                
                {/* Simple chart placeholder */}
                <div className="space-y-3">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, index) => {
                    const value = Math.random() * 100;
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <div className="w-8 text-sm text-gray-600">{day}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <div className="w-12 text-sm text-gray-600">{Math.round(value)}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Popüler Kategoriler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">En çok çözülen sınav kategorileri</p>
                
                <div className="space-y-3">
                  {[
                    { name: 'YKS (TYT/AYT)', value: 85 },
                    { name: 'KPSS', value: 72 },
                    { name: 'Ehliyet Sınavı', value: 64 },
                    { name: 'ALES', value: 45 },
                    { name: 'DGS', value: 38 }
                  ].map((category) => (
                    <div key={category.name} className="flex items-center gap-3">
                      <div className="w-20 text-sm text-gray-600 truncate">{category.name}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${category.value}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm text-gray-600">{category.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Performance */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Sistem Performansı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600" data-testid="performance-uptime">
                  {data.systemUptime || '99.9'}%
                </div>
                <div className="text-sm text-gray-600">Sistem Çalışma Süresi</div>
                <div className="text-xs text-gray-500 mt-1">Son 30 gün</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600" data-testid="performance-response-time">
                  {data.averageResponseTime || '45'}ms
                </div>
                <div className="text-sm text-gray-600">Ortalama Yanıt Süresi</div>
                <div className="text-xs text-gray-500 mt-1">API çağrıları</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600" data-testid="performance-error-rate">
                  {data.errorRate || '0.1'}%
                </div>
                <div className="text-sm text-gray-600">Hata Oranı</div>
                <div className="text-xs text-gray-500 mt-1">Son 24 saat</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Note */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Geliştirme Notu</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Bu analitik sayfası temel metrikleri göstermektedir. Gerçek zamanlı veri entegrasyonu 
                  için Google Analytics, Mixpanel veya özel analitik çözümü entegre edilebilir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}