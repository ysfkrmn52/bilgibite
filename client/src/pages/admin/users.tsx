import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search, 
  Filter, 
  Package, 
  Star,
  Shield,
  Zap,
  Gift,
  Crown,
  Trash2
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  subscriptionType: string;
  hasAiPackage: boolean;
  level: number;
  totalPoints: number;
  gems: number;
  xp: number;
  lives: number;
  streakDays: number;
  createdAt: string;
  lastActiveDate?: string;
}

const roleIcons = {
  'user': Users,
  'admin': Shield,
  'super_admin': Crown
};

const roleColors = {
  'user': 'bg-gray-100 text-gray-800',
  'admin': 'bg-blue-100 text-blue-800',
  'super_admin': 'bg-purple-100 text-purple-800'
};

const subscriptionColors = {
  'free': 'bg-gray-100 text-gray-800',
  'premium': 'bg-gold-100 text-gold-800',
  'enterprise': 'bg-purple-100 text-purple-800'
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Users listesi
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      return response.json();
    }
  });

  // Test paketi verme mutation
  const giveTestPackageMutation = useMutation({
    mutationFn: async ({ userId, packageType }: { userId: string; packageType: string }) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/test-package`, { packageType });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "✅ Test Paketi Verildi",
        description: "Kullanıcıya test paketi başarıyla atandı.",
      });
      setSelectedUser(null);
    },
    onError: () => {
      toast({
        title: "❌ Hata",
        description: "Test paketi verilemedi. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    }
  });

  // AI paketi toggle
  const toggleAiPackageMutation = useMutation({
    mutationFn: async ({ userId, hasAiPackage }: { userId: string; hasAiPackage: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${userId}/ai-package`, { hasAiPackage });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: variables.hasAiPackage ? "🤖 AI Paketi Verildi" : "❌ AI Paketi Kaldırıldı",
        description: variables.hasAiPackage ? "Kullanıcı AI özelliklerine erişebilir." : "Kullanıcının AI erişimi kaldırıldı.",
      });
    }
  });

  // Abonelik tipi değişimi
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, subscriptionType }: { userId: string; subscriptionType: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${userId}/subscription`, { subscriptionType });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "📦 Abonelik Güncellendi",
        description: "Kullanıcının abonelik tipi başarıyla değiştirildi.",
      });
    }
  });

  // Filtreleme
  const usersList = Array.isArray(users) ? users : [];
  const filteredUsers = usersList.filter((user: User) => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSubscription = subscriptionFilter === 'all' || user.subscriptionType === subscriptionFilter;
    
    return matchesSearch && matchesRole && matchesSubscription;
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
            <p className="text-gray-600">Kullanıcıları yönetin ve test paketleri atayın</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {filteredUsers.length} kullanıcı
          </Badge>
        </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Kullanıcı ara (isim, email)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-users"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40" data-testid="select-role-filter">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="user">Kullanıcı</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Süper Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger className="w-40" data-testid="select-subscription-filter">
                <SelectValue placeholder="Abonelik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Abonelikler</SelectItem>
                <SelectItem value="free">Ücretsiz</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kullanıcılar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Kullanıcı</th>
                  <th className="text-left p-3 font-medium">Rol</th>
                  <th className="text-left p-3 font-medium">Abonelik</th>
                  <th className="text-left p-3 font-medium">AI Paketi</th>
                  <th className="text-left p-3 font-medium">İstatistikler</th>
                  <th className="text-left p-3 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user: User) => {
                  const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || Users;
                  return (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {user.role === 'super_admin' ? 'Süper Admin' : 
                           user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={subscriptionColors[user.subscriptionType as keyof typeof subscriptionColors]}>
                          {user.subscriptionType === 'free' ? 'Ücretsiz' :
                           user.subscriptionType === 'premium' ? 'Premium' : 'Enterprise'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {user.hasAiPackage ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Zap className="h-3 w-3 mr-1" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline">Yok</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="text-xs space-y-1">
                          <div>Seviye: {user.level}</div>
                          <div>XP: {user.xp}</div>
                          <div>Streak: {user.streakDays} gün</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              data-testid={`button-manage-user-${user.id}`}
                            >
                              <Package className="h-4 w-4 mr-1" />
                              Yönet
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                {user.username} - Test Paketi Ver
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* AI Package Toggle */}
                              <div className="flex items-center justify-between">
                                <Label htmlFor="ai-package">AI Paketi</Label>
                                <Switch
                                  id="ai-package"
                                  checked={user.hasAiPackage}
                                  onCheckedChange={(checked) => 
                                    toggleAiPackageMutation.mutate({ userId: user.id, hasAiPackage: checked })
                                  }
                                  data-testid={`switch-ai-package-${user.id}`}
                                />
                              </div>

                              {/* Subscription Type */}
                              <div className="space-y-2">
                                <Label>Abonelik Tipi</Label>
                                <Select 
                                  value={user.subscriptionType} 
                                  onValueChange={(value) => 
                                    updateSubscriptionMutation.mutate({ userId: user.id, subscriptionType: value })
                                  }
                                >
                                  <SelectTrigger data-testid={`select-subscription-${user.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="free">Ücretsiz</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Test Package Actions */}
                              <div className="space-y-2">
                                <Label>Test Paketleri</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => giveTestPackageMutation.mutate({ 
                                      userId: user.id, 
                                      packageType: 'premium_trial' 
                                    })}
                                    disabled={giveTestPackageMutation.isPending}
                                    data-testid={`button-premium-trial-${user.id}`}
                                  >
                                    <Star className="h-4 w-4 mr-1" />
                                    Premium Deneme
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => giveTestPackageMutation.mutate({ 
                                      userId: user.id, 
                                      packageType: 'ai_trial' 
                                    })}
                                    disabled={giveTestPackageMutation.isPending}
                                    data-testid={`button-ai-trial-${user.id}`}
                                  >
                                    <Zap className="h-4 w-4 mr-1" />
                                    AI Deneme
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => giveTestPackageMutation.mutate({ 
                                      userId: user.id, 
                                      packageType: 'bonus_gems' 
                                    })}
                                    disabled={giveTestPackageMutation.isPending}
                                    data-testid={`button-bonus-gems-${user.id}`}
                                  >
                                    <Gift className="h-4 w-4 mr-1" />
                                    Bonus Elmas
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => giveTestPackageMutation.mutate({ 
                                      userId: user.id, 
                                      packageType: 'unlimited_lives' 
                                    })}
                                    disabled={giveTestPackageMutation.isPending}
                                    data-testid={`button-unlimited-lives-${user.id}`}
                                  >
                                    <Crown className="h-4 w-4 mr-1" />
                                    Sınırsız Can
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Aradığınız kriterlere uygun kullanıcı bulunamadı.</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}