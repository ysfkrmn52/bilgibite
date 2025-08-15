import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  User, 
  Moon, 
  Sun,
  Globe,
  Trash2,
  Download,
  Upload,
  Save,
  RefreshCw,
  Key,
  Lock,
  Database,
  Smartphone,
  Mail,
  Volume2,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    reminders: boolean;
    achievements: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showProgress: boolean;
    showAchievements: boolean;
    allowFriendRequests: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    fontSize: 'small' | 'medium' | 'large';
    animationsEnabled: boolean;
  };
  study: {
    dailyGoalMinutes: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    autoplaySounds: boolean;
    showHints: boolean;
    reviewMode: boolean;
  };
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      marketing: false,
      reminders: true,
      achievements: true,
    },
    privacy: {
      profileVisibility: 'public',
      showProgress: true,
      showAchievements: true,
      allowFriendRequests: true,
    },
    appearance: {
      theme: 'system',
      language: 'tr',
      fontSize: 'medium',
      animationsEnabled: true,
    },
    study: {
      dailyGoalMinutes: 30,
      difficulty: 'intermediate',
      autoplaySounds: true,
      showHints: true,
      reviewMode: false,
    }
  });

  // Queries
  const { data: userSettings, isLoading } = useQuery({
    queryKey: ['/api/user/settings'],
    queryFn: () => apiRequest('GET', '/api/user/settings').then(res => res.json()),
    onSuccess: (data) => {
      if (data) setSettings(data);
    }
  });

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: UserSettings) =>
      apiRequest('PUT', '/api/user/settings', newSettings),
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Ayarlar kaydedildi',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Ayarlar kaydedilemedi',
        variant: 'destructive'
      });
    }
  });

  const exportDataMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/user/export-data'),
    onSuccess: (response) => {
      // Dosya indirme işlemi
      const blob = new Blob([JSON.stringify(response)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bilgibite-data-export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Başarılı',
        description: 'Verileriniz indirildi',
      });
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/user/account'),
    onSuccess: () => {
      toast({
        title: 'Hesap Silindi',
        description: 'Hesabınız başarıyla silindi',
      });
      // Redirect to login page
      window.location.href = '/auth';
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Hesap silinirken hata oluştu',
        variant: 'destructive'
      });
    }
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  const handleSettingChange = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Ayarlar</h1>
          <p className="text-muted-foreground">Uygulama tercihlerinizi ve hesap ayarlarınızı yönetin</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Genel
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Bildirimler
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Gizlilik
            </TabsTrigger>
            <TabsTrigger value="study" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Çalışma
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Hesap
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Görünüm
                  </CardTitle>
                  <CardDescription>Uygulamanın görünümünü özelleştirin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tema</Label>
                    <Select 
                      value={settings.appearance.theme}
                      onValueChange={(value) => handleSettingChange('appearance', 'theme', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4" />
                            Açık Tema
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4" />
                            Koyu Tema
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            Sistem Teması
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Yazı Boyutu</Label>
                    <Select 
                      value={settings.appearance.fontSize}
                      onValueChange={(value) => handleSettingChange('appearance', 'fontSize', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Küçük</SelectItem>
                        <SelectItem value="medium">Orta</SelectItem>
                        <SelectItem value="large">Büyük</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Animasyonlar</Label>
                    <Switch
                      checked={settings.appearance.animationsEnabled}
                      onCheckedChange={(checked) => handleSettingChange('appearance', 'animationsEnabled', checked)}
                      data-testid="toggle-animations"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Dil ve Bölge
                  </CardTitle>
                  <CardDescription>Dil tercihlerinizi belirleyin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Uygulama Dili</Label>
                    <Select 
                      value={settings.appearance.language}
                      onValueChange={(value) => handleSettingChange('appearance', 'language', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tr">Türkçe</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Bildirim Tercihleri
                </CardTitle>
                <CardDescription>Hangi bildirimleri almak istediğinizi seçin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">E-posta Bildirimleri</p>
                        <p className="text-sm text-muted-foreground">Quiz sonuçları ve güncellemeler</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push Bildirimleri</p>
                        <p className="text-sm text-muted-foreground">Mobil cihazda anlık bildirimler</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Çalışma Hatırlatıcıları</p>
                        <p className="text-sm text-muted-foreground">Günlük çalışma hedefi için hatırlatmalar</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.reminders}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'reminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Başarım Bildirimleri</p>
                        <p className="text-sm text-muted-foreground">Yeni başarımlar kazandığınızda</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.notifications.achievements}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'achievements', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Gizlilik Ayarları
                </CardTitle>
                <CardDescription>Profilinizin görünürlüğünü ve paylaşım tercihlerinizi belirleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Profil Görünürlüğü</Label>
                  <Select 
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Herkese Açık</SelectItem>
                      <SelectItem value="friends">Sadece Arkadaşlar</SelectItem>
                      <SelectItem value="private">Özel</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Profilinizi kimler görebileceğini belirler
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">İlerleme Durumunu Göster</p>
                      <p className="text-sm text-muted-foreground">Quiz sonuçları ve istatistikler</p>
                    </div>
                    <Switch
                      checked={settings.privacy.showProgress}
                      onCheckedChange={(checked) => handleSettingChange('privacy', 'showProgress', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Başarımları Göster</p>
                      <p className="text-sm text-muted-foreground">Kazanılan rozetler ve başarımlar</p>
                    </div>
                    <Switch
                      checked={settings.privacy.showAchievements}
                      onCheckedChange={(checked) => handleSettingChange('privacy', 'showAchievements', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Arkadaşlık İsteklerine İzin Ver</p>
                      <p className="text-sm text-muted-foreground">Diğer kullanıcılardan arkadaşlık istekleri al</p>
                    </div>
                    <Switch
                      checked={settings.privacy.allowFriendRequests}
                      onCheckedChange={(checked) => handleSettingChange('privacy', 'allowFriendRequests', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Study Settings */}
          <TabsContent value="study" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Çalışma Tercihleri</CardTitle>
                <CardDescription>Quiz deneyiminizi kişiselleştirin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Günlük Hedef (dakika)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      type="range"
                      min="10"
                      max="180"
                      step="10"
                      value={settings.study.dailyGoalMinutes}
                      onChange={(e) => handleSettingChange('study', 'dailyGoalMinutes', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">
                      {settings.study.dailyGoalMinutes} dk
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Varsayılan Zorluk Seviyesi</Label>
                  <Select 
                    value={settings.study.difficulty}
                    onValueChange={(value) => handleSettingChange('study', 'difficulty', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Başlangıç</SelectItem>
                      <SelectItem value="intermediate">Orta</SelectItem>
                      <SelectItem value="advanced">İleri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Ses Efektleri</p>
                        <p className="text-sm text-muted-foreground">Doğru/yanlış cevap sesleri</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.study.autoplaySounds}
                      onCheckedChange={(checked) => handleSettingChange('study', 'autoplaySounds', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">İpuçlarını Göster</p>
                      <p className="text-sm text-muted-foreground">Sorularda ipucu butonunu göster</p>
                    </div>
                    <Switch
                      checked={settings.study.showHints}
                      onCheckedChange={(checked) => handleSettingChange('study', 'showHints', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Tekrar Modu</p>
                      <p className="text-sm text-muted-foreground">Yanlış cevaplanan soruları tekrarla</p>
                    </div>
                    <Switch
                      checked={settings.study.reviewMode}
                      onCheckedChange={(checked) => handleSettingChange('study', 'reviewMode', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Management */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Veri Yönetimi
                </CardTitle>
                <CardDescription>Kişisel verilerinizi yönetin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Verilerini İndir</h4>
                    <p className="text-sm text-muted-foreground">
                      Tüm kişisel verilerinizi JSON formatında indirin
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => exportDataMutation.mutate()}
                    disabled={exportDataMutation.isPending}
                    data-testid="button-export-data"
                  >
                    {exportDataMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    İndir
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="w-4 h-4" />
                  Tehlikeli Alan
                </CardTitle>
                <CardDescription>Bu işlemler geri alınamaz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <h4 className="font-medium text-destructive">Hesabı Kalıcı Olarak Sil</h4>
                    <p className="text-sm text-muted-foreground">
                      Bu işlem hesabınızı ve tüm verilerinizi kalıcı olarak siler
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    data-testid="button-delete-account"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hesabı Sil
                  </Button>
                </div>

                {showDeleteConfirm && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-destructive">
                      Bu işlemi gerçekten yapmak istiyor musunuz?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Hesabınız, tüm quiz geçmişiniz, başarımlarınız ve kişisel verileriniz kalıcı olarak silinecektir.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        İptal
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAccountMutation.mutate()}
                        disabled={deleteAccountMutation.isPending}
                      >
                        {deleteAccountMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Evet, Hesabımı Sil
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
            className="min-w-32"
            data-testid="button-save-settings"
          >
            {updateSettingsMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}