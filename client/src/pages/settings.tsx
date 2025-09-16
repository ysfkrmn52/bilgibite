import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  User,
  Bell,
  Lock,
  Palette,
  BookOpen,
  Shield,
  Download,
  Trash2,
  LogOut,
  Settings as SettingsIcon,
  Smartphone,
  Mail,
  Globe,
  Eye,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Zap,
  TrendingUp
} from "lucide-react";

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    weeklyReport: boolean;
    achievementAlerts: boolean;
    studyReminders: boolean;
  };
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    showStats: boolean;
    showProgress: boolean;
    allowFriendRequests: boolean;
  };
  preferences: {
    language: "tr" | "en";
    theme: "light" | "dark" | "system";
    soundEffects: boolean;
    autoAdvance: boolean;
    difficultyAdaptation: boolean;
  };
  study: {
    dailyGoal: number;
    reminderTime: string;
    weeklyTarget: number;
    preferredSubjects: string[];
  };
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState("account");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user settings
  const { data: settings, isLoading } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: UserSettings) =>
      apiRequest("/api/user/settings", {
        method: "PUT",
        body: updatedSettings,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/settings"] });
      toast({
        title: "Başarılı",
        description: "Ayarlarınız güncellendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ayarlar güncellenemedi",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
  });

  const handleSettingChange = (section: keyof UserSettings, key: string, value: any) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    };
    
    updateSettingsMutation.mutate(updatedSettings);
  };

  const handleLogout = () => {
    if (confirm("Çıkış yapmak istediğinizden emin misiniz?")) {
      logoutMutation.mutate();
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await fetch("/api/user/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bilgibite-verilerim.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Başarılı", description: "Veriler indirildi" });
    } catch (error) {
      toast({ title: "Hata", description: "Veriler indirilemedi", variant: "destructive" });
    }
  };

  const handleAccountDelete = () => {
    const confirmation = prompt('Hesabınızı silmek için "SİL" yazın:');
    if (confirmation === "SİL") {
      toast({ title: "Uyarı", description: "Hesap silme özelliği henüz aktif değil", variant: "destructive" });
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
    { id: "account", title: "Hesap", description: "Kişisel bilgiler ve güvenlik", icon: User, color: "from-blue-500 to-indigo-500" },
    { id: "notifications", title: "Bildirimler", description: "Bildirim tercihleri", icon: Bell, color: "from-green-500 to-emerald-500" },
    { id: "privacy", title: "Gizlilik", description: "Gizlilik ayarları", icon: Lock, color: "from-purple-500 to-pink-500" },
    { id: "preferences", title: "Tercihler", description: "Uygulama tercihleri", icon: Palette, color: "from-orange-500 to-red-500" },
    { id: "study", title: "Çalışma", description: "Çalışma hedefleri", icon: BookOpen, color: "from-teal-500 to-cyan-500" },
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
                    <h3 className="text-xl font-bold text-gray-900">Ahmet Kaya</h3>
                    <p className="text-gray-600">demo@bilgibite.com</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Seviye 12</span>
                      </div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Premium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                            activeSection === section.id
                              ? "bg-gradient-to-r " + section.color + " text-white shadow-lg"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                          data-testid={`button-section-${section.id}`}
                        >
                          <Icon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{section.title}</div>
                            <div className={`text-xs ${activeSection === section.id ? "text-white/80" : "text-gray-500"}`}>
                              {section.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === "account" && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-6 h-6" />
                      Hesap Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">E-posta</Label>
                        <Input id="email" type="email" defaultValue="demo@bilgibite.com" data-testid="input-email" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefon</Label>
                        <Input id="phone" type="tel" placeholder="+90 555 123 4567" data-testid="input-phone" />
                      </div>
                      <div>
                        <Label htmlFor="fullName">Ad Soyad</Label>
                        <Input id="fullName" defaultValue="Ahmet Kaya" data-testid="input-fullname" />
                      </div>
                      <div>
                        <Label htmlFor="grade">Sınıf</Label>
                        <Select defaultValue="12">
                          <SelectTrigger data-testid="select-grade">
                            <SelectValue placeholder="Sınıf seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9">9. Sınıf</SelectItem>
                            <SelectItem value="10">10. Sınıf</SelectItem>
                            <SelectItem value="11">11. Sınıf</SelectItem>
                            <SelectItem value="12">12. Sınıf</SelectItem>
                            <SelectItem value="mezun">Mezun</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" data-testid="button-save">
                        Kaydet
                      </Button>
                      <Button variant="outline" onClick={handleDataExport} data-testid="button-export">
                        <Download className="w-4 h-4 mr-2" />
                        Verilerimi İndir
                      </Button>
                    </div>

                    <div className="pt-6 border-t border-red-200">
                      <h3 className="font-semibold text-red-600 mb-3">Tehlikeli Bölge</h3>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50"
                          data-testid="button-logout"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Çıkış Yap
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleAccountDelete}
                          className="w-full justify-start"
                          data-testid="button-delete"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hesabımı Sil
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeSection === "notifications" && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-6 h-6" />
                      Bildirim Ayarları
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {[
                      { key: "email", title: "E-posta Bildirimleri", description: "Önemli güncellemeleri e-posta ile al", icon: Mail },
                      { key: "push", title: "Anlık Bildirimler", description: "Telefon bildirimlerini aktif et", icon: Smartphone },
                      { key: "sms", title: "SMS Bildirimleri", description: "SMS ile bildirim al", icon: Smartphone },
                      { key: "weeklyReport", title: "Haftalık Rapor", description: "Haftalık ilerleme raporu al", icon: BookOpen },
                      { key: "achievementAlerts", title: "Başarı Bildirimleri", description: "Yeni başarılar için bildirim", icon: Bell },
                      { key: "studyReminders", title: "Çalışma Hatırlatıcıları", description: "Çalışma zamanı hatırlatmaları", icon: Bell },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-600" />
                            <div>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-gray-600">{item.description}</div>
                            </div>
                          </div>
                          <Switch
                            checked={Boolean(settings?.notifications?.[item.key as keyof UserSettings["notifications"]])}
                            onCheckedChange={(checked) => handleSettingChange("notifications", item.key, checked)}
                            data-testid={`switch-${item.key}`}
                          />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {activeSection === "privacy" && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-6 h-6" />
                      Gizlilik Ayarları
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Label className="text-base font-medium">Profil Görünürlüğü</Label>
                        <p className="text-sm text-gray-600 mb-3">Profilinizi kimler görebilir?</p>
                        <Select defaultValue="public">
                          <SelectTrigger data-testid="select-profile-visibility">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Herkese Açık</SelectItem>
                            <SelectItem value="friends">Sadece Arkadaşlar</SelectItem>
                            <SelectItem value="private">Gizli</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {[
                        { key: "showStats", title: "İstatistikleri Göster", description: "Diğer kullanıcılar istatistiklerimi görebilsin" },
                        { key: "showProgress", title: "İlerlemeyi Göster", description: "Çalışma ilerlememi paylaş" },
                        { key: "allowFriendRequests", title: "Arkadaşlık İstekleri", description: "Yeni arkadaşlık isteklerini kabul et" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                          <Switch
                            checked={Boolean(settings?.privacy?.[item.key as keyof UserSettings["privacy"]])}
                            onCheckedChange={(checked) => handleSettingChange("privacy", item.key, checked)}
                            data-testid={`switch-${item.key}`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeSection === "preferences" && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-6 h-6" />
                      Uygulama Tercihleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Label className="flex items-center gap-2 text-base font-medium mb-3">
                          <Globe className="w-5 h-5" />
                          Dil
                        </Label>
                        <Select defaultValue="tr">
                          <SelectTrigger data-testid="select-language">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tr">Türkçe</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Label className="flex items-center gap-2 text-base font-medium mb-3">
                          <Eye className="w-5 h-5" />
                          Tema
                        </Label>
                        <Select defaultValue="light">
                          <SelectTrigger data-testid="select-theme">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Açık</SelectItem>
                            <SelectItem value="dark">Koyu</SelectItem>
                            <SelectItem value="system">Sistem</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: "soundEffects", title: "Ses Efektleri", description: "Quiz sırasında ses efektleri çal", icon: Volume2 },
                        { key: "autoAdvance", title: "Otomatik İlerleme", description: "Doğru cevap sonrası otomatik geç", icon: Zap },
                        { key: "difficultyAdaptation", title: "Uyarlamalı Zorluk", description: "Performansa göre soru zorluğunu ayarla", icon: TrendingUp },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-gray-600" />
                              <div>
                                <div className="font-medium">{item.title}</div>
                                <div className="text-sm text-gray-600">{item.description}</div>
                              </div>
                            </div>
                            <Switch
                              checked={Boolean(settings?.preferences?.[item.key as keyof UserSettings["preferences"]])}
                              onCheckedChange={(checked) => handleSettingChange("preferences", item.key, checked)}
                              data-testid={`switch-${item.key}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeSection === "study" && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-6 h-6" />
                      Çalışma Hedefleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Label htmlFor="dailyGoal" className="text-base font-medium">Günlük Hedef (dakika)</Label>
                        <Input id="dailyGoal" type="number" defaultValue="30" className="mt-2" data-testid="input-daily-goal" />
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Label htmlFor="reminderTime" className="text-base font-medium">Hatırlatma Saati</Label>
                        <Input id="reminderTime" type="time" defaultValue="20:00" className="mt-2" data-testid="input-reminder-time" />
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Label htmlFor="weeklyTarget" className="text-base font-medium">Haftalık Hedef (soru)</Label>
                        <Input id="weeklyTarget" type="number" defaultValue="100" className="mt-2" data-testid="input-weekly-target" />
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <Label className="text-base font-medium">Hedef Sınav</Label>
                        <Select defaultValue="yks">
                          <SelectTrigger className="mt-2" data-testid="select-target-exam">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yks">YKS</SelectItem>
                            <SelectItem value="kpss">KPSS</SelectItem>
                            <SelectItem value="ales">ALES</SelectItem>
                            <SelectItem value="dgs">DGS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600" data-testid="button-save-study">
                        Hedefleri Kaydet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}