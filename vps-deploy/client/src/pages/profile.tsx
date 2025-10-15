import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  Clock,
  Star,
  Award,
  Settings,
  Edit3,
  Save,
  X,
  Crown,
  Flame,
  Zap,
  GraduationCap,
  Brain,
  Activity
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  joinDate: string;
  location: string;
  grade: string;
  targetExam: string;
}

interface UserStats {
  totalQuizzesTaken: number;
  averageScore: number;
  totalStudyTime: number;
  strongestSubject: string;
  weakestSubject: string;
  currentStreak: number;
  longestStreak: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  category: string;
}

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    }
  });

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/stats'],
    queryFn: async () => {
      const response = await fetch('/api/user/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  // Fetch achievements
  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/user/achievements'],
    queryFn: async () => {
      const response = await fetch('/api/user/achievements');
      if (!response.ok) throw new Error('Failed to fetch achievements');
      return response.json();
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: Partial<UserProfile>) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setIsEditing(false);
      setEditedProfile({});
      toast({ title: 'Başarılı', description: 'Profil bilgileri güncellendi' });
    },
    onError: () => {
      toast({ title: 'Hata', description: 'Profil güncellenirken bir hata oluştu', variant: 'destructive' });
    }
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile || {});
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editedProfile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  if (profileLoading || statsLoading || achievementsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const earnedAchievements = achievements?.filter((a: Achievement) => a.earned) || [];
  const xpToNextLevel = ((profile?.level || 0) + 1) * 1000;
  const currentLevelXp = profile?.xp || 0;
  const progressToNextLevel = (currentLevelXp % 1000) / 10;

  const statCards = [
    { 
      label: "Tamamlanan Quiz", 
      value: stats?.totalQuizzesTaken || 0, 
      icon: BookOpen, 
      color: "text-blue-600", 
      bg: "from-blue-50 to-indigo-50",
      border: "border-blue-100"
    },
    { 
      label: "Ortalama Başarı", 
      value: `${stats?.averageScore || 0}%`, 
      icon: Star, 
      color: "text-yellow-600", 
      bg: "from-yellow-50 to-amber-50",
      border: "border-yellow-100"
    },
    { 
      label: "Günlük Seri", 
      value: profile?.streak || 0, 
      icon: Flame, 
      color: "text-orange-600", 
      bg: "from-orange-50 to-red-50",
      border: "border-orange-100"
    },
    { 
      label: "Kazanılan Rozet", 
      value: earnedAchievements.length, 
      icon: Award, 
      color: "text-purple-600", 
      bg: "from-purple-50 to-pink-50",
      border: "border-purple-100"
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Profilim
              </h1>
              <p className="text-gray-600 mt-2">Kişisel bilgilerinizi ve başarılarınızı görüntüleyin</p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className={isEditing ? "" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"}
              data-testid={isEditing ? "button-cancel-edit" : "button-edit-profile"}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Düzenle
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Profil Header Kartı */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
            {/* Gradient Header */}
            <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            
            <CardContent className="relative -mt-16 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-6">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                    <AvatarImage src={profile?.avatar || "/avatars/user.png"} alt="Profil" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-4xl font-bold">
                      {profile?.fullName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || profile?.username?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-3 border-4 border-white shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Profil Bilgileri */}
                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <div className="space-y-3 max-w-md">
                      <div>
                        <Label htmlFor="fullName" className="text-gray-700">Ad Soyad</Label>
                        <Input
                          id="fullName"
                          value={editedProfile.fullName || ''}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="mt-1"
                          data-testid="input-fullname"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio" className="text-gray-700">Hakkımda</Label>
                        <Textarea
                          id="bio"
                          value={editedProfile.bio || ''}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          className="mt-1"
                          rows={2}
                          data-testid="textarea-bio"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {profile?.fullName || profile?.username || 'Kullanıcı'}
                      </h2>
                      <p className="text-lg text-gray-600 mb-1">@{profile?.username}</p>
                      {profile?.bio && (
                        <p className="text-gray-700 max-w-2xl">{profile.bio}</p>
                      )}
                      <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1">
                          <Crown className="w-3 h-3 mr-1" />
                          {profile?.targetExam || 'Hedef Belirlenmedi'}
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) : 'Bilinmiyor'}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSave} 
                        disabled={updateProfileMutation.isPending}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        data-testid="button-save-profile"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                      </Button>
                      <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-profile">
                        <X className="w-4 h-4 mr-2" />
                        İptal
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleEdit} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" data-testid="button-edit-profile">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Profili Düzenle
                    </Button>
                  )}
                </div>
              </div>

              {/* Seviye ve İstatistikler */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Seviye Kartı */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">Seviye {profile?.level || 1}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {currentLevelXp} / {xpToNextLevel} XP
                    </div>
                    <Progress value={progressToNextLevel} className="h-2" />
                  </div>
                </div>

                {/* İstatistik Kartları */}
                {statCards.slice(0, 3).map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={`bg-gradient-to-br ${stat.bg} p-4 rounded-xl border ${stat.border}`}
                  >
                    <div className="text-center">
                      <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                      <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sol Sütun - Kişisel Bilgiler */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <User className="w-5 h-5 text-blue-600" />
                    Kişisel Bilgiler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email" className="text-gray-700">E-posta</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editedProfile.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1"
                          data-testid="input-email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-gray-700">Konum</Label>
                        <Input
                          id="location"
                          value={editedProfile.location || ''}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="mt-1"
                          data-testid="input-location"
                        />
                      </div>
                      <div>
                        <Label htmlFor="grade" className="text-gray-700">Sınıf</Label>
                        <Input
                          id="grade"
                          value={editedProfile.grade || ''}
                          onChange={(e) => handleInputChange('grade', e.target.value)}
                          className="mt-1"
                          data-testid="input-grade"
                        />
                      </div>
                      <div>
                        <Label htmlFor="targetExam" className="text-gray-700">Hedef Sınav</Label>
                        <Input
                          id="targetExam"
                          value={editedProfile.targetExam || ''}
                          onChange={(e) => handleInputChange('targetExam', e.target.value)}
                          className="mt-1"
                          data-testid="input-target-exam"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">{profile?.email || 'Belirtilmemiş'}</div>
                          <div className="text-sm text-gray-600">E-posta</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <MapPin className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900">{profile?.location || 'Belirtilmemiş'}</div>
                          <div className="text-sm text-gray-600">Konum</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-medium text-gray-900">{profile?.grade || 'Belirtilmemiş'}</div>
                          <div className="text-sm text-gray-600">Sınıf</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                        <Target className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="font-medium text-gray-900">{profile?.targetExam || 'Belirtilmemiş'}</div>
                          <div className="text-sm text-gray-600">Hedef Sınav</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Çalışma Hedefleri Kartı */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Çalışma Hedefleri ve İlerleme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Haftalık Hedef */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-700">Haftalık Soru Hedefi</span>
                        </div>
                        <span className="text-sm font-semibold text-blue-600">67 / 100</span>
                      </div>
                      <Progress value={67} className="h-2" />
                      <div className="text-xs text-gray-600 mt-1">33 soru daha!</div>
                    </div>

                    {/* Günlük Çalışma */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-gray-700">Günlük Çalışma</span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">45 / 60 dk</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <div className="text-xs text-gray-600 mt-1">15 dakika daha!</div>
                    </div>

                    {/* Favori Konular */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-gray-700">En Çok Çalışılan Konular</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-purple-500 text-white text-xs">Matematik</Badge>
                        <Badge className="bg-blue-500 text-white text-xs">Fizik</Badge>
                        <Badge className="bg-green-500 text-white text-xs">Kimya</Badge>
                        <Badge variant="outline" className="border-purple-300 text-purple-600 text-xs">Biyoloji</Badge>
                      </div>
                    </div>

                    {/* Bu Haftaki Aktivite */}
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-gray-700">Bu Haftaki Aktivite</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Pazartesi</span>
                          <span className="font-medium text-orange-600">3 quiz</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Salı</span>
                          <span className="font-medium text-orange-600">2 quiz</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Çarşamba</span>
                          <span className="font-medium text-orange-600">1 quiz</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Perşembe</span>
                          <span>-</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sağ Sütun - İstatistikler ve Başarılar */}
          <div className="space-y-6">
            {/* Detaylı İstatistikler */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Detaylı İstatistikler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{Math.round((stats?.totalStudyTime || 0) / 60)}h</div>
                    <div className="text-sm text-gray-600">Toplam Çalışma</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <span className="text-sm text-gray-700">En İyi Konu:</span>
                      <Badge className="bg-green-500 text-white">{stats?.strongestSubject || 'Yok'}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100">
                      <span className="text-sm text-gray-700">Gelişim Alanı:</span>
                      <Badge variant="outline" className="border-red-300 text-red-600">{stats?.weakestSubject || 'Yok'}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
                      <span className="text-sm text-gray-700">En Uzun Seri:</span>
                      <Badge className="bg-orange-500 text-white">{stats?.longestStreak || 0} gün</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Son Başarılar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Son Başarılar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {earnedAchievements.length > 0 ? (
                    <div className="space-y-3">
                      {earnedAchievements.slice(0, 3).map((achievement: Achievement, index: number) => (
                        <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-100">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                            {achievement.earnedDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(achievement.earnedDate).toLocaleDateString('tr-TR')}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Henüz başarı rozetiniz yok</p>
                      <p className="text-sm">Quiz çözerek rozet kazanabilirsiniz!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Tüm Başarılar */}
        {achievements && achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Tüm Başarı Rozetleri ({earnedAchievements.length}/{achievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {achievements.map((achievement: Achievement) => (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.05 }}
                      className={`p-4 rounded-lg border text-center transition-all cursor-pointer ${
                        achievement.earned
                          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800 shadow-md'
                          : 'bg-gray-50 border-gray-200 text-gray-400'
                      }`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <div className="text-xs font-medium">{achievement.title}</div>
                      {achievement.earned && achievement.earnedDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(achievement.earnedDate).toLocaleDateString('tr-TR')}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}