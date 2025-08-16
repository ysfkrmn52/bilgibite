import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
  Save
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

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('account');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/user/settings'],
    queryFn: async () => {
      const response = await fetch('/api/user/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json() as UserSettings;
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
      // Account deletion would be implemented here
      toast({ title: 'Uyarı', description: 'Hesap silme özelliği henüz aktif değil', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const sections = [
    { id: 'account', title: 'Hesap', icon: User },
    { id: 'notifications', title: 'Bildirimler', icon: Bell },
    { id: 'privacy', title: 'Gizlilik', icon: Lock },
    { id: 'preferences', title: 'Tercihler', icon: Palette },
    { id: 'study', title: 'Çalışma', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-black">Ayarlar</h1>
          <p className="text-gray-600 mt-2">Hesap ayarlarınızı ve tercihlerinizi yönetin</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Settings Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white border">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-black hover:bg-gray-100'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {section.title}
                      </button>
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
            className="lg:col-span-3"
          >
            
            {/* Account Settings */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <Card className="bg-white border">
                  <CardHeader>
                    <CardTitle className="text-black flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Hesap Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username" className="text-black">Kullanıcı Adı</Label>
                        <Input id="username" defaultValue="demo_user" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-black">E-posta</Label>
                        <Input id="email" type="email" defaultValue="user@example.com" className="mt-1" />
                      </div>
                    </div>
                    <Button className="gap-2">
                      <Save className="w-4 h-4" />
                      Değişiklikleri Kaydet
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white border">
                  <CardHeader>
                    <CardTitle className="text-black flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Güvenlik
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full">Şifre Değiştir</Button>
                    <Button variant="outline" className="w-full">İki Faktörlü Kimlik Doğrulama</Button>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Tehlikeli Bölge
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={handleLogout} 
                      variant="outline" 
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Çıkış Yap
                    </Button>
                    <Button onClick={handleDataExport} variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Verilerimi İndir
                    </Button>
                    <Button 
                      onClick={handleAccountDelete} 
                      variant="destructive" 
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hesabı Sil
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <Card className="bg-white border">
                <CardHeader>
                  <CardTitle className="text-black flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Bildirim Ayarları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'push', label: 'Push Bildirimleri', description: 'Telefona gelen bildirimler' },
                    { key: 'email', label: 'E-posta Bildirimleri', description: 'Önemli güncellemeler' },
                    { key: 'dailyReminder', label: 'Günlük Hatırlatıcı', description: 'Çalışma zamanı hatırlatıcısı' },
                    { key: 'achievementAlerts', label: 'Başarı Bildirimleri', description: 'Rozet ve başarı bildirimleri' },
                    { key: 'weeklyReport', label: 'Haftalık Rapor', description: 'İlerleme özeti' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium text-black">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                      <Switch
                        checked={settings?.notifications?.[item.key as keyof typeof settings.notifications] || false}
                        onCheckedChange={(checked) => handleSettingChange('notifications', item.key, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <Card className="bg-white border">
                <CardHeader>
                  <CardTitle className="text-black flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Gizlilik Ayarları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-black">Profil Görünürlüğü</Label>
                    <Select 
                      value={settings?.privacy?.profileVisibility || 'public'}
                      onValueChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                    >
                      <SelectTrigger>
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
                    { key: 'showProgress', label: 'İlerlemeyi Göster', description: 'Diğerleri ilerlemenizi görebilir' },
                    { key: 'showAchievements', label: 'Başarıları Göster', description: 'Diğerleri başarılarınızı görebilir' },
                    { key: 'allowFriendRequests', label: 'Arkadaşlık İstekleri', description: 'Yeni arkadaşlık isteklerini kabul et' },
                    { key: 'dataCollection', label: 'Veri Toplama', description: 'Ürün geliştirme için anonim veri toplama' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium text-black">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                      <Switch
                        checked={settings?.privacy?.[item.key as keyof typeof settings.privacy] || false}
                        onCheckedChange={(checked) => handleSettingChange('privacy', item.key, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Preference Settings */}
            {activeSection === 'preferences' && (
              <Card className="bg-white border">
                <CardHeader>
                  <CardTitle className="text-black flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Uygulama Tercihleri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-black">Dil</Label>
                      <Select 
                        value={settings?.preferences?.language || 'tr'}
                        onValueChange={(value) => handleSettingChange('preferences', 'language', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tr">Türkçe</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-black">Zorluk Seviyesi</Label>
                      <Select 
                        value={settings?.preferences?.difficulty || 'medium'}
                        onValueChange={(value) => handleSettingChange('preferences', 'difficulty', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Kolay</SelectItem>
                          <SelectItem value="medium">Orta</SelectItem>
                          <SelectItem value="hard">Zor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {[
                    { key: 'soundEffects', label: 'Ses Efektleri', description: 'Doğru/yanlış cevap sesleri' },
                    { key: 'animations', label: 'Animasyonlar', description: 'Geçiş animasyonları' },
                    { key: 'autoSave', label: 'Otomatik Kaydet', description: 'İlerlemeyi otomatik kaydet' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium text-black">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                      <Switch
                        checked={settings?.preferences?.[item.key as keyof typeof settings.preferences] || false}
                        onCheckedChange={(checked) => handleSettingChange('preferences', item.key, checked)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Study Settings */}
            {activeSection === 'study' && (
              <Card className="bg-white border">
                <CardHeader>
                  <CardTitle className="text-black flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Çalışma Ayarları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dailyGoal" className="text-black">Günlük Hedef (dakika)</Label>
                      <Input
                        id="dailyGoal"
                        type="number"
                        value={settings?.study?.dailyGoal || 30}
                        onChange={(e) => handleSettingChange('study', 'dailyGoal', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reminderTime" className="text-black">Hatırlatıcı Saati</Label>
                      <Input
                        id="reminderTime"
                        type="time"
                        value={settings?.study?.reminderTime || '19:00'}
                        onChange={(e) => handleSettingChange('study', 'reminderTime', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sessionLength" className="text-black">Çalışma Süresi (dakika)</Label>
                      <Input
                        id="sessionLength"
                        type="number"
                        value={settings?.study?.sessionLength || 25}
                        onChange={(e) => handleSettingChange('study', 'sessionLength', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="breakDuration" className="text-black">Mola Süresi (dakika)</Label>
                      <Input
                        id="breakDuration"
                        type="number"
                        value={settings?.study?.breakDuration || 5}
                        onChange={(e) => handleSettingChange('study', 'breakDuration', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;