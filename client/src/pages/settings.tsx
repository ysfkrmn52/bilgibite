import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Bell,
  Lock,
  User,
  Palette,
  Volume2,
  Shield,
  Globe,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Database,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  LogOut,
  Save,
  BookOpen,
  Target,
  Clock,
  Zap,
  Crown
} from 'lucide-react';

interface UserSettings {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    dailyReminder: boolean;
    achievementAlerts: boolean;
    weeklyReport: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showProgress: boolean;
    showAchievements: boolean;
    allowFriendRequests: boolean;
    dataCollection: boolean;
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    soundEffects: boolean;
    animations: boolean;
    autoSave: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  study: {
    dailyGoal: number;
    reminderTime: string;
    breakDuration: number;
    sessionLength: number;
    examFocus: string[];
  };
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user settings
  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ['/api/user/settings'],
    queryFn: async () => {
      const response = await fetch('/api/user/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<UserSettings>) => {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      toast({ title: 'Başarılı', description: 'Ayarlar güncellendi' });
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Ayarlar güncellenirken bir hata oluştu', variant: 'destructive' });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to logout');
      return response.json();
    },
    onSuccess: () => {
      window.location.href = '/';
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Çıkış yapılırken bir hata oluştu', variant: 'destructive' });
    }
  });

  const handleSettingChange = (section: keyof UserSettings, key: string, value: any) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    
    updateSettingsMutation.mutate(updatedSettings);
  };

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logoutMutation.mutate();
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await fetch('/api/user/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bilgibite-verilerim.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: 'Başarılı', description: 'Veriler indirildi' });
    } catch (error) {
      toast({ title: 'Hata', description: 'Veriler indirilemedi', variant: 'destructive' });
    }
  };

  const handleAccountDelete = () => {
    const confirmation = prompt('Hesabınızı silmek için "SİL" yazın:');
    if (confirmation === 'SİL') {
      toast({ title: 'Uyarı', description: 'Hesap silme özelliği henüz aktif değil', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const sections = [
    { id: 'account', title: 'Hesap', description: 'Kişisel bilgiler ve güvenlik', icon: User, color: 'from-blue-500 to-indigo-500' },
    { id: 'notifications', title: 'Bildirimler', description: 'Bildirim tercihleri', icon: Bell, color: 'from-green-500 to-emerald-500' },
    { id: 'privacy', title: 'Gizlilik', description: 'Gizlilik ayarları', icon: Lock, color: 'from-purple-500 to-pink-500' },
    { id: 'preferences', title: 'Tercihler', description: 'Uygulama tercihleri', icon: Palette, color: 'from-orange-500 to-red-500' },
    { id: 'study', title: 'Çalışma', description: 'Çalışma hedefleri', icon: BookOpen, color: 'from-teal-500 to-cyan-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Ayarlar
            </h1>
            <p className="text-gray-600 text-lg">Hesap ayarlarınızı ve tercihlerinizi yönetin</p>
          </div>

          {/* Quick Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              <CardContent className="relative -mt-8 pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                    <AvatarImage src="/avatars/user.png" alt="Profil" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold">
                      AK
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">Ahmet Kaya</h3>
                    <p className="text-gray-600">Premium Üye</p>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mt-1">
                      <Crown className="w-3 h-3 mr-1" />
                      YKS 2025
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Son Giriş</div>
                    <div className="font-medium text-gray-900">Bugün 14:30</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Settings Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm sticky top-6">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Ayar Kategorileri
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const IconComponent = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <motion.button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                          isActive
                            ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                        data-testid={`nav-${section.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5" />
                          <div className="flex-1">
                            <div className="font-medium">{section.title}</div>
                            <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'} mt-1`}>
                              {section.description}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 space-y-6"
          >
            
            {/* Account Settings */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900">Hesap Bilgileri</CardTitle>
                        <CardDescription>Kişisel bilgilerinizi düzenleyin</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-gray-700 font-medium">Kullanıcı Adı</Label>
                        <Input id="username" defaultValue="demo_user" className="bg-white border-gray-200" data-testid="input-username" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">E-posta</Label>
                        <Input id="email" type="email" defaultValue="demo@bilgibite.com" className="bg-white border-gray-200" data-testid="input-email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 font-medium">Telefon</Label>
                        <Input id="phone" defaultValue="+90 555 123 4567" className="bg-white border-gray-200" data-testid="input-phone" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullname" className="text-gray-700 font-medium">Ad Soyad</Label>
                        <Input id="fullname" defaultValue="Ahmet Kaya" className="bg-white border-gray-200" data-testid="input-fullname" />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" data-testid="button-save-account">
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900">Güvenlik</CardTitle>
                        <CardDescription>Hesap güvenliği ayarları</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                      <div>
                        <h4 className="font-medium text-gray-900">Şifre Değiştir</h4>
                        <p className="text-sm text-gray-600">Son değişiklik: 2 ay önce</p>
                      </div>
                      <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" data-testid="button-change-password">
                        Değiştir
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <div>
                        <h4 className="font-medium text-gray-900">İki Faktörlü Doğrulama</h4>
                        <p className="text-sm text-gray-600">Ek güvenlik katmanı</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-slate-500 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-900">Veri Yönetimi</CardTitle>
                        <CardDescription>Hesap verilerinizi yönetin</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button
                        onClick={handleDataExport}
                        variant="outline"
                        className="h-16 flex-col gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                        data-testid="button-export-data"
                      >
                        <Download className="w-5 h-5" />
                        Verilerimi İndir
                      </Button>
                      <Button
                        onClick={handleAccountDelete}
                        variant="outline"
                        className="h-16 flex-col gap-2 border-red-300 text-red-600 hover:bg-red-50"
                        data-testid="button-delete-account"
                      >
                        <Trash2 className="w-5 h-5" />
                        Hesabı Sil
                      </Button>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full h-12 border-gray-300 text-gray-600 hover:bg-gray-50"
                      data-testid="button-logout"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Çıkış Yap
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">Bildirim Ayarları</CardTitle>
                      <CardDescription>Hangi bildirimleri almak istediğinizi seçin</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'push', label: 'Push Bildirimleri', description: 'Telefona gelen bildirimler', icon: Smartphone },
                    { key: 'email', label: 'E-posta Bildirimleri', description: 'Önemli güncellemeler', icon: Mail },
                    { key: 'dailyReminder', label: 'Günlük Hatırlatıcı', description: 'Çalışma zamanı hatırlatıcısı', icon: Clock },
                    { key: 'achievementAlerts', label: 'Başarı Bildirimleri', description: 'Rozet ve başarı bildirimleri', icon: Target },
                    { key: 'weeklyReport', label: 'Haftalık Rapor', description: 'İlerleme özeti', icon: BookOpen }
                  ].map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </div>
                        <Switch
                          checked={settings?.notifications?.[item.key as keyof typeof settings.notifications] || false}
                          onCheckedChange={(checked) => handleSettingChange('notifications', item.key, checked)}
                          data-testid={`switch-${item.key}`}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">Gizlilik Ayarları</CardTitle>
                      <CardDescription>Profilinizin görünürlüğünü kontrol edin</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Profil Görünürlüğü</Label>
                      <Select 
                        value={settings?.privacy?.profileVisibility || 'public'}
                        onValueChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                      >
                        <SelectTrigger className="bg-white" data-testid="select-profile-visibility">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Herkese Açık</SelectItem>
                          <SelectItem value="friends">Sadece Arkadaşlar</SelectItem>
                          <SelectItem value="private">Özel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {[
                      { key: 'showProgress', label: 'İlerleme Göster', description: 'Çalışma ilerlemeni başkalarının görmesine izin ver' },
                      { key: 'showAchievements', label: 'Başarıları Göster', description: 'Kazandığın rozetleri paylaş' },
                      { key: 'allowFriendRequests', label: 'Arkadaşlık Talepleri', description: 'Başkalarının sana arkadaşlık talebi göndermesine izin ver' },
                      { key: 'dataCollection', label: 'Veri Toplama', description: 'Uygulamayı geliştirmek için veri toplamaya izin ver' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-100">
                        <div>
                          <div className="font-medium text-gray-900">{item.label}</div>
                          <div className="text-sm text-gray-600">{item.description}</div>
                        </div>
                        <Switch
                          checked={settings?.privacy?.[item.key as keyof typeof settings.privacy] as boolean || false}
                          onCheckedChange={(checked) => handleSettingChange('privacy', item.key, checked)}
                          data-testid={`switch-privacy-${item.key}`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferences Settings */}
            {activeSection === 'preferences' && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">Uygulama Tercihleri</CardTitle>
                      <CardDescription>Uygulamanızı özelleştirin</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Dil</Label>
                      <Select value={settings?.preferences?.language || 'tr'}>
                        <SelectTrigger className="bg-white" data-testid="select-language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tr">Türkçe</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Tema</Label>
                      <Select value={settings?.preferences?.theme || 'light'}>
                        <SelectTrigger className="bg-white" data-testid="select-theme">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Açık</SelectItem>
                          <SelectItem value="dark">Koyu</SelectItem>
                          <SelectItem value="auto">Otomatik</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'soundEffects', label: 'Ses Efektleri', description: 'Quiz sırasında ses efektlerini çal', icon: Volume2 },
                      { key: 'animations', label: 'Animasyonlar', description: 'Uygulama animasyonlarını göster', icon: Zap },
                      { key: 'autoSave', label: 'Otomatik Kayıt', description: 'İlerlemeyi otomatik olarak kaydet', icon: Save }
                    ].map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-3">
                            <IconComponent className="w-5 h-5 text-gray-600" />
                            <div>
                              <div className="font-medium text-gray-900">{item.label}</div>
                              <div className="text-sm text-gray-600">{item.description}</div>
                            </div>
                          </div>
                          <Switch
                            checked={settings?.preferences?.[item.key as keyof typeof settings.preferences] as boolean || false}
                            onCheckedChange={(checked) => handleSettingChange('preferences', item.key, checked)}
                            data-testid={`switch-${item.key}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Study Settings */}
            {activeSection === 'study' && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900">Çalışma Ayarları</CardTitle>
                      <CardDescription>Çalışma hedeflerinizi ve tercihlerinizi belirleyin</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Günlük Hedef (dakika)</Label>
                      <Input 
                        type="number" 
                        defaultValue={settings?.study?.dailyGoal || 30}
                        className="bg-white border-gray-200"
                        data-testid="input-daily-goal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Hatırlatıcı Saati</Label>
                      <Input 
                        type="time" 
                        defaultValue={settings?.study?.reminderTime || '19:00'}
                        className="bg-white border-gray-200"
                        data-testid="input-reminder-time"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Mola Süresi (dakika)</Label>
                      <Input 
                        type="number" 
                        defaultValue={settings?.study?.breakDuration || 5}
                        className="bg-white border-gray-200"
                        data-testid="input-break-duration"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Çalışma Süresi (dakika)</Label>
                      <Input 
                        type="number" 
                        defaultValue={settings?.study?.sessionLength || 25}
                        className="bg-white border-gray-200"
                        data-testid="input-session-length"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Sınav Odağı</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['YKS', 'KPSS', 'DGS', 'ALES', 'MSÜ', 'Ehliyet'].map((exam) => (
                        <div key={exam} className="flex items-center space-x-2 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-100">
                          <input 
                            type="checkbox" 
                            id={exam} 
                            defaultChecked={settings?.study?.examFocus?.includes(exam)}
                            className="rounded border-gray-300"
                            data-testid={`checkbox-exam-${exam.toLowerCase()}`}
                          />
                          <Label htmlFor={exam} className="text-sm font-medium text-gray-700">{exam}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600" data-testid="button-save-study">
                      <Save className="w-4 h-4 mr-2" />
                      Çalışma Ayarlarını Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}"