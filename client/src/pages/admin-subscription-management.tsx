import { AdminLayout } from '@/components/admin/AdminLayout';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  Crown,
  Zap,
  UserCheck,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Calendar,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

// Mock data - bu gerçek API'den gelecek
const mockStats = {
  totalUsers: 1247,
  activeSubscriptions: 892,
  monthlyRevenue: 45680,
  totalRevenue: 234500,
  freeUsers: 355,
  plusUsers: 456,
  premiumUsers: 436,
  aiCreditUsers: 234,
  growth: {
    users: 12.5,
    revenue: 8.3,
    subscriptions: 15.2
  },
  recentTransactions: [
    { id: '1', user: 'Ahmet Yılmaz', plan: 'Premium', amount: 299, date: '2025-01-24T09:30:00Z', status: 'completed' },
    { id: '2', user: 'Ayşe Demir', plan: 'Plus', amount: 99, date: '2025-01-24T08:15:00Z', status: 'completed' },
    { id: '3', user: 'Mehmet Kaya', plan: 'AI Kredi', amount: 50, date: '2025-01-24T07:45:00Z', status: 'pending' },
    { id: '4', user: 'Zeynep Öz', plan: 'Premium', amount: 299, date: '2025-01-23T16:20:00Z', status: 'completed' },
    { id: '5', user: 'Can Aksoy', plan: 'Plus', amount: 99, date: '2025-01-23T14:10:00Z', status: 'completed' }
  ]
};

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
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
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
            
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
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

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
}

export default function AdminSubscriptionManagement() {
  const [timeRange, setTimeRange] = useState('7d');

  // Bu gerçek API call'a dönüştürülecek
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard-stats'],
    enabled: true,
    initialData: mockStats
  });

  if (isLoading || !stats) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-2">
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">BilgiBite admin paneline hoş geldiniz</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Son 7 Gün
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Toplam Kullanıcı"
            value={stats.totalUsers.toLocaleString('tr-TR')}
            change={stats.growth.users}
            icon={Users}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            subtitle="Kayıtlı kullanıcı"
          />
          
          <StatCard
            title="Aktif Abonelik"
            value={stats.activeSubscriptions.toLocaleString('tr-TR')}
            change={stats.growth.subscriptions}
            icon={CreditCard}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            subtitle="Ödeme yapan"
          />
          
          <StatCard
            title="Aylık Gelir"
            value={formatCurrency(stats.monthlyRevenue)}
            change={stats.growth.revenue}
            icon={DollarSign}
            color="bg-gradient-to-r from-green-500 to-green-600"
            subtitle="Bu ay"
          />
          
          <StatCard
            title="Toplam Gelir"
            value={formatCurrency(stats.totalRevenue)}
            icon={TrendingUp}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            subtitle="Genel toplam"
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Subscription Breakdown */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  Abonelik Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="font-medium">Ücretsiz</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{stats.freeUsers}</div>
                        <div className="text-xs text-gray-500">%{Math.round((stats.freeUsers / stats.totalUsers) * 100)}</div>
                      </div>
                    </div>
                    <Progress value={(stats.freeUsers / stats.totalUsers) * 100} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">Plus</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{stats.plusUsers}</div>
                        <div className="text-xs text-gray-500">%{Math.round((stats.plusUsers / stats.totalUsers) * 100)}</div>
                      </div>
                    </div>
                    <Progress value={(stats.plusUsers / stats.totalUsers) * 100} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="font-medium">Premium (Aile)</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{stats.premiumUsers}</div>
                        <div className="text-xs text-gray-500">%{Math.round((stats.premiumUsers / stats.totalUsers) * 100)}</div>
                      </div>
                    </div>
                    <Progress value={(stats.premiumUsers / stats.totalUsers) * 100} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="font-medium">AI Kredi</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{stats.aiCreditUsers}</div>
                        <div className="text-xs text-gray-500">%{Math.round((stats.aiCreditUsers / stats.totalUsers) * 100)}</div>
                      </div>
                    </div>
                    <Progress value={(stats.aiCreditUsers / stats.totalUsers) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Kullanıcı Doğrulama
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Sorunlu Ödemeler
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics Raporu
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Crown className="w-4 h-4 mr-2" />
                    Yeni Paket Oluştur
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Son Ödemeler
              </div>
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {transaction.user.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{transaction.user}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.plan} • {formatDate(transaction.date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(transaction.amount)}</div>
                      <Badge 
                        variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {transaction.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}