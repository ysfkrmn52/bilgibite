import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Trophy,
  Star,
  Calendar,
  Clock,
  BookOpen,
  Target,
  Award,
  Settings,
  Edit,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Brain,
  Zap,
  TrendingUp,
  Activity,
  Flame,
  Save,
  X
} from 'lucide-react';

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

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const earnedAchievements = achievements?.filter(a => a.earned) || [];
  const xpToNextLevel = ((profile?.level || 0) + 1) * 1000;
  const currentLevelXp = profile?.xp || 0;
  const progressToNextLevel = (currentLevelXp % 1000) / 10;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-lg rounded-lg p-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar || "/avatars/user.svg"} />
                <AvatarFallback className="text-2xl">{profile?.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="fullName" className="text-black">Ad Soyad</Label>
                      <Input
                        id="fullName"
                        value={editedProfile.fullName || ''}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-black">Hakkımda</Label>
                      <Textarea
                        id="bio"
                        value={editedProfile.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-black">{profile?.fullName || profile?.username}</h1>
                    <p className="text-black text-lg">@{profile?.username}</p>
                    {profile?.bio && <p className="text-black max-w-md">{profile.bio}</p>}
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 flex justify-end">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={updateProfileMutation.isPending}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Kaydet
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="gap-2">
                    <X className="w-4 h-4" />
                    İptal
                  </Button>
                </div>
              ) : (
                <Button onClick={handleEdit} className="gap-2">
                  <Edit className="w-4 h-4" />
                  Profili Düzenle
                </Button>
              )}
            </div>
          </div>

          {/* Level and XP */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-lg">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">Seviye {profile?.level}</div>
                <div className="text-black text-sm">
                  {currentLevelXp} / {xpToNextLevel} XP
                </div>
                <Progress value={progressToNextLevel} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white via-orange-50 to-yellow-50 border border-orange-100 shadow-lg">
              <div className="h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500"></div>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-orange-600">
                  <Flame className="w-5 h-5" />
                  <span className="text-2xl font-bold">{profile?.streak || 0}</span>
                </div>
                <div className="text-black text-sm">Günlük Seri</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white via-green-50 to-blue-50 border border-green-100 shadow-lg">
              <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{earnedAchievements.length}</div>
                <div className="text-black text-sm">Başarı Rozetleri</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-lg">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Kişisel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="text-black">E-posta</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedProfile.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-black">Konum</Label>
                      <Input
                        id="location"
                        value={editedProfile.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade" className="text-black">Sınıf</Label>
                      <Input
                        id="grade"
                        value={editedProfile.grade || ''}
                        onChange={(e) => handleInputChange('grade', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="targetExam" className="text-black">Hedef Sınav</Label>
                      <Input
                        id="targetExam"
                        value={editedProfile.targetExam || ''}
                        onChange={(e) => handleInputChange('targetExam', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">E-posta</div>
                        <div className="text-black">{profile?.email || 'Belirtilmemiş'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Konum</div>
                        <div className="text-black">{profile?.location || 'Belirtilmemiş'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Sınıf</div>
                        <div className="text-black">{profile?.grade || 'Belirtilmemiş'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Hedef Sınav</div>
                        <div className="text-black">{profile?.targetExam || 'Belirtilmemiş'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Katılım Tarihi</div>
                        <div className="text-black">{profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-white via-green-50 to-blue-50 border border-green-100 shadow-lg">
              <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  İstatistikler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats?.totalQuizzesTaken || 0}</div>
                  <div className="text-black text-sm">Toplam Quiz</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats?.averageScore || 0}%</div>
                  <div className="text-black text-sm">Ortalama Başarı</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{Math.round((stats?.totalStudyTime || 0) / 60)}h</div>
                  <div className="text-black text-sm">Toplam Çalışma</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-black text-sm">En İyi Konu:</span>
                    <Badge variant="secondary" className="text-black">{stats?.strongestSubject || 'Yok'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black text-sm">Gelişim Alanı:</span>
                    <Badge variant="outline" className="text-black">{stats?.weakestSubject || 'Yok'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-white via-yellow-50 to-orange-50 border border-yellow-100 shadow-lg">
            <div className="h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"></div>
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <Award className="w-5 h-5" />
                Başarı Rozetleri ({earnedAchievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {achievements?.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      achievement.earned
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <div className="text-xs font-medium">{achievement.title}</div>
                    {achievement.earned && achievement.earnedDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(achievement.earnedDate).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;