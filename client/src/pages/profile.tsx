import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  User, 
  Edit3, 
  Trophy, 
  Target, 
  Calendar,
  BookOpen,
  BarChart3,
  Award,
  Flame,
  Camera,
  Save,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  School,
  Users,
  Clock
} from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  school: string;
  bio: string;
  avatar: string;
  level: number;
  totalXP: number;
  streakCount: number;
  joinDate: string;
  lastActive: string;
  goals: string[];
  preferences: {
    examFocus: string[];
    dailyGoal: number;
    difficulty: string;
    notifications: boolean;
    privacy: string;
  };
}

interface UserStats {
  totalQuizzesTaken: number;
  averageScore: number;
  totalTimeSpent: number;
  bestStreak: number;
  completedChallenges: number;
  achievementsCount: number;
  weeklyProgress: number[];
  categoryStats: { category: string; score: number; quizCount: number }[];
}

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    school: '',
    bio: '',
    goals: [],
    preferences: {
      examFocus: [],
      dailyGoal: 20,
      difficulty: 'intermediate',
      notifications: true,
      privacy: 'public'
    }
  });

  // Queries
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: () => apiRequest('GET', '/api/user/profile').then(res => res.json()),
    onSuccess: (data) => {
      setProfileData(data);
    }
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/stats'],
    queryFn: () => apiRequest('GET', '/api/user/stats').then(res => res.json())
  });

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/user/achievements'],
    queryFn: () => apiRequest('GET', '/api/user/achievements').then(res => res.json())
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => 
      apiRequest('PUT', '/api/user/profile', data),
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Profil güncellendi',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Profil güncellenirken hata oluştu',
        variant: 'destructive'
      });
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (formData: FormData) =>
      apiRequest('POST', '/api/user/avatar', formData),
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Profil fotoğrafı güncellendi',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    }
  });

  // Functions
  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    uploadAvatarMutation.mutate(formData);
  };

  const calculateLevelProgress = (xp: number) => {
    const currentLevelXP = Math.floor(xp / 1000) * 1000;
    const nextLevelXP = currentLevelXP + 1000;
    return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {profile?.firstName?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full p-2 h-auto"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  data-testid="button-upload-avatar"
                >
                  <Camera className="w-3 h-3" />
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  data-testid="input-avatar-upload"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">
                    {profile?.firstName && profile?.lastName 
                      ? `${profile.firstName} ${profile.lastName}` 
                      : profile?.username || 'Kullanıcı'
                    }
                  </h1>
                  <Badge variant="secondary">Seviye {profile?.level || 1}</Badge>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  {profile?.bio || 'Henüz bir bio eklenmemiş'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{profile?.totalXP || 0} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">{profile?.streakCount || 0} gün seri</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Üye: {new Date(profile?.joinDate || Date.now()).getFullYear()}</span>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Seviye {profile?.level || 1}</span>
                    <span>Seviye {(profile?.level || 1) + 1}</span>
                  </div>
                  <Progress value={calculateLevelProgress(profile?.totalXP || 0)} className="h-2" />
                </div>
              </div>

              <Button 
                variant={isEditing ? "default" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                data-testid="button-edit-profile"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? 'Düzenleme Modu' : 'Profili Düzenle'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              İstatistikler
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Başarımlar
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Hedefler
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Ayarlar
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kişisel Bilgiler</CardTitle>
                  <CardDescription>Temel profil bilgilerinizi güncelleyin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Ad</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName || ''}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        disabled={!isEditing}
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Soyad</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName || ''}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        disabled={!isEditing}
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">E-posta</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profile?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={profileData.phone || ''}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        data-testid="input-phone"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Konum</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={profileData.location || ''}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        disabled={!isEditing}
                        placeholder="Şehir, Ülke"
                        data-testid="input-location"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="school">Okul/Kurum</Label>
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="school"
                        value={profileData.school || ''}
                        onChange={(e) => setProfileData({...profileData, school: e.target.value})}
                        disabled={!isEditing}
                        data-testid="input-school"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        İptal
                      </Button>
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-profile"
                      >
                        {updateProfileMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Kaydet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hakkımda</CardTitle>
                  <CardDescription>Kendinizi tanıtın</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      className="w-full min-h-[120px] p-3 border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={profileData.bio || ''}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      disabled={!isEditing}
                      placeholder="Kendiniz hakkında birkaç kelime..."
                      data-testid="textarea-bio"
                    />
                  </div>

                  <div>
                    <Label>Sınav Hedefleri</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['YKS', 'KPSS', 'Ehliyet', 'SRC'].map((exam) => (
                        <Badge
                          key={exam}
                          variant={profileData.goals?.includes(exam) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (!isEditing) return;
                            const goals = profileData.goals || [];
                            const newGoals = goals.includes(exam)
                              ? goals.filter(g => g !== exam)
                              : [...goals, exam];
                            setProfileData({...profileData, goals: newGoals});
                          }}
                          data-testid={`badge-goal-${exam.toLowerCase()}`}
                        >
                          {exam}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{stats?.totalQuizzesTaken || 0}</p>
                      <p className="text-sm text-muted-foreground">Quiz Tamamlandı</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats?.averageScore || 0}%</p>
                      <p className="text-sm text-muted-foreground">Ortalama Skor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalQuizzesTaken || 0}</p>
                      <p className="text-sm text-muted-foreground">Toplam Quiz</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.averageScore || 0}%</p>
                      <p className="text-sm text-muted-foreground">Ortalama Skor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{Math.floor((stats?.totalTimeSpent || 0) / 60)}h</p>
                      <p className="text-sm text-muted-foreground">Çalışma Süresi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Kategori Performansı</CardTitle>
                <CardDescription>Her sınav kategorisindeki performansınız</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.categoryStats?.map((stat: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{stat.category}</span>
                        <span>{stat.score}% ({stat.quizCount} quiz)</span>
                      </div>
                      <Progress value={stat.score} className="h-2" />
                    </div>
                  )) || (
                    <p className="text-center text-muted-foreground py-8">
                      Henüz quiz verisi bulunmuyor
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements?.map((achievement: any, index: number) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg ${achievement.unlocked ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <Award className={`w-6 h-6 ${achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-primary mt-2">
                            Kazanıldı: {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {achievement.progress !== undefined && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>İlerleme</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )) || (
                <div className="col-span-full text-center py-8">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Henüz başarım kazanılmadı</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hedef Takibi</CardTitle>
                <CardDescription>Kişisel öğrenme hedeflerinizi belirleyin ve takip edin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Günlük Çalışma Hedefi</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={profileData.preferences?.dailyGoal || 20}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences!,
                          dailyGoal: parseInt(e.target.value)
                        }
                      })}
                      className="flex-1"
                      disabled={!isEditing}
                    />
                    <span className="text-sm font-medium w-12">
                      {profileData.preferences?.dailyGoal || 20} dk
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Sınav Odağı</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['YKS', 'KPSS', 'Ehliyet', 'SRC'].map((exam) => (
                      <Badge
                        key={exam}
                        variant={profileData.preferences?.examFocus?.includes(exam) ? "default" : "outline"}
                        className={`cursor-pointer ${!isEditing ? 'pointer-events-none' : ''}`}
                        onClick={() => {
                          if (!isEditing) return;
                          const focus = profileData.preferences?.examFocus || [];
                          const newFocus = focus.includes(exam)
                            ? focus.filter(e => e !== exam)
                            : [...focus, exam];
                          setProfileData({
                            ...profileData,
                            preferences: {
                              ...profileData.preferences!,
                              examFocus: newFocus
                            }
                          });
                        }}
                      >
                        {exam}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bildirim Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>E-posta Bildirimleri</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences!,
                          notifications: !profileData.preferences?.notifications
                        }
                      })}
                      disabled={!isEditing}
                    >
                      {profileData.preferences?.notifications ? 'Açık' : 'Kapalı'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gizlilik Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Profil Görünürlüğü</Label>
                    <select
                      value={profileData.preferences?.privacy || 'public'}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences!,
                          privacy: e.target.value
                        }
                      })}
                      className="w-full mt-1 p-2 border border-input bg-background rounded-md"
                      disabled={!isEditing}
                    >
                      <option value="public">Herkese Açık</option>
                      <option value="friends">Sadece Arkadaşlar</option>
                      <option value="private">Özel</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Hesap İşlemleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <h4 className="font-medium text-destructive">Hesabı Sil</h4>
                    <p className="text-sm text-muted-foreground">Bu işlem geri alınamaz</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Hesabı Sil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}