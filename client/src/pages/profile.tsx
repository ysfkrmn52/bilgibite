import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Trophy, 
  Target, 
  Book, 
  Clock, 
  Zap,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Download,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "Kullanıcı",
    lastName: "Adı",
    email: "kullanici@bilgibite.com",
    phone: "+90 555 123 4567",
    city: "İstanbul",
    school: "Galatasaray Üniversitesi",
    grade: "12. Sınıf",
    targetExam: "YKS",
    bio: "YKS'ye hazırlanıyorum. Hedefim tıp fakültesi okumak.",
    birthDate: "2005-03-15"
  });

  const userStats = {
    level: 12,
    xp: 2450,
    nextLevelXP: 2800,
    studyStreak: 7,
    totalStudyTime: 142, // saat
    completedQuizzes: 45,
    correctAnswers: 387,
    totalAnswers: 542,
    achievements: 8,
    joinDate: "2024-09-15",
    subscriptionPlan: "Premium",
    subscriptionEnd: "2025-02-15"
  };

  const achievements = [
    { id: 1, title: "İlk Quiz", description: "İlk quizini tamamladın", icon: "🎯", earned: true },
    { id: 2, title: "7 Gün Serisi", description: "7 gün üst üste çalıştın", icon: "🔥", earned: true },
    { id: 3, title: "Matematik Ustası", description: "Matematik'te 100 doğru cevap", icon: "🧮", earned: true },
    { id: 4, title: "Hızlı Öğrenci", description: "5 dakikada quiz bitir", icon: "⚡", earned: true },
    { id: 5, title: "Sosyal Kelebek", description: "10 arkadaş ekle", icon: "👥", earned: false },
    { id: 6, title: "AI Öğrencisi", description: "AI öğretmenle 50 soru çöz", icon: "🤖", earned: false }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // API çağrısı burada olacak
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        
        {/* Profil Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 opacity-10"></div>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src="/avatars/user.png" />
                    <AvatarFallback className="text-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {formData.firstName[0]}{formData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600">
                    Seviye {userStats.level}
                  </Badge>
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-2">
                  <h1 className="text-3xl font-bold">
                    {formData.firstName} {formData.lastName}
                  </h1>
                  <p className="text-muted-foreground">{formData.bio}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {formData.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Book className="h-4 w-4" />
                      {formData.school}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {formData.targetExam} Hedefi
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {userStats.subscriptionPlan}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {userStats.subscriptionEnd} tarihine kadar
                  </p>
                </div>
              </div>

              {/* XP Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Seviye İlerlemesi</span>
                  <span>{userStats.xp} / {userStats.nextLevelXP} XP</span>
                </div>
                <Progress 
                  value={(userStats.xp / userStats.nextLevelXP) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profil Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="personal">Kişisel Bilgiler</TabsTrigger>
            <TabsTrigger value="achievements">Rozetler</TabsTrigger>
            <TabsTrigger value="settings">Ayarlar</TabsTrigger>
            <TabsTrigger value="subscription">Abonelik</TabsTrigger>
          </TabsList>

          {/* Genel Bakış */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* İstatistik Kartları */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Çalışma Serisi</p>
                      <p className="text-2xl font-bold text-orange-600">{userStats.studyStreak}</p>
                      <p className="text-xs text-muted-foreground">gün</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Çalışma</p>
                      <p className="text-2xl font-bold text-blue-600">{userStats.totalStudyTime}</p>
                      <p className="text-xs text-muted-foreground">saat</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Doğru Cevap</p>
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round((userStats.correctAnswers / userStats.totalAnswers) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {userStats.correctAnswers}/{userStats.totalAnswers}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Kazanılan Rozet</p>
                      <p className="text-2xl font-bold text-purple-600">{userStats.achievements}</p>
                      <p className="text-xs text-muted-foreground">toplam</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Son Aktiviteler */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Book className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">YKS Matematik Quizi Tamamlandı</p>
                      <p className="text-sm text-muted-foreground">15/20 doğru • 2 saat önce</p>
                    </div>
                    <Badge>+50 XP</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">"7 Gün Serisi" Rozeti Kazanıldı</p>
                      <p className="text-sm text-muted-foreground">1 gün önce</p>
                    </div>
                    <Badge variant="secondary">Rozet</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kişisel Bilgiler */}
          <TabsContent value="personal">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Kişisel Bilgiler</CardTitle>
                  <CardDescription>
                    Profil bilgilerinizi güncelleyebilirsiniz
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? "Kaydet" : "Düzenle"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Şehir</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => handleInputChange('city', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="İstanbul">İstanbul</SelectItem>
                        <SelectItem value="Ankara">Ankara</SelectItem>
                        <SelectItem value="İzmir">İzmir</SelectItem>
                        <SelectItem value="Bursa">Bursa</SelectItem>
                        <SelectItem value="Antalya">Antalya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetExam">Hedef Sınav</Label>
                    <Select
                      value={formData.targetExam}
                      onValueChange={(value) => handleInputChange('targetExam', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YKS">YKS</SelectItem>
                        <SelectItem value="KPSS">KPSS</SelectItem>
                        <SelectItem value="Ehliyet">Ehliyet Sınavı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="school">Okul</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => handleInputChange('school', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Hakkımda</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rozetler */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Rozetler ve Başarılar</CardTitle>
                <CardDescription>
                  Kazandığın rozetler ve henüz kazanmadığın başarılar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card 
                      key={achievement.id}
                      className={`relative ${
                        achievement.earned 
                          ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950/20 dark:to-orange-950/20 dark:border-yellow-800" 
                          : "opacity-60 border-dashed"
                      }`}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <h4 className="font-medium mb-1">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.earned && (
                          <Badge className="mt-2 bg-yellow-500 hover:bg-yellow-600">
                            Kazanıldı
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ayarlar */}
          <TabsContent value="settings">
            <div className="space-y-6">
              
              {/* Bildirim Ayarları */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Bildirim Ayarları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">E-posta Bildirimleri</p>
                      <p className="text-sm text-muted-foreground">Önemli güncellemeler için e-posta al</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Çalışma Hatırlatıcıları</p>
                      <p className="text-sm text-muted-foreground">Günlük çalışma hatırlatıcıları</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sosyal Bildirimler</p>
                      <p className="text-sm text-muted-foreground">Arkadaş istekleri ve mesajlar</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              {/* Gizlilik Ayarları */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Gizlilik Ayarları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profil Görünürlüğü</p>
                      <p className="text-sm text-muted-foreground">Profilin diğer kullanıcılar tarafından görülsün</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">İstatistik Paylaşımı</p>
                      <p className="text-sm text-muted-foreground">Başarı istatistiklerini arkadaşlarınla paylaş</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Veri Yönetimi */}
              <Card>
                <CardHeader>
                  <CardTitle>Veri Yönetimi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Verilerimi İndir
                  </Button>
                  
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hesabımı Sil
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Abonelik */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Abonelik Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-blue-600">Premium Plan</h3>
                      <p className="text-muted-foreground">Tüm özellikler dahil</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Aktif
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Başlangıç Tarihi:</p>
                      <p className="font-medium">15 Eylül 2024</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bitiş Tarihi:</p>
                      <p className="font-medium">15 Şubat 2025</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Aylık Tutar:</p>
                      <p className="font-medium">130 TL</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sonraki Ödeme:</p>
                      <p className="font-medium">15 Şubat 2025</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Button>Planı Değiştir</Button>
                  <Button variant="outline">Aboneliği İptal Et</Button>
                </div>

                {/* Plan Özellikleri */}
                <div>
                  <h4 className="font-medium mb-3">Plan Dahilindeki Özellikler:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Sınırsız quiz erişimi
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      AI öğretmen (aylık 1000 soru)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Detaylı analitik raporlar
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Sosyal özellikler
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Öncelikli destek
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}