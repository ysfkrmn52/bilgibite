// Social Learning Hub - Duolingo-style Community Features
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  MessageSquare, 
  Crown, 
  Zap, 
  Heart,
  UserPlus,
  Calendar,
  Target,
  Award,
  Home,
  Search,
  Filter,
  Clock,
  TrendingUp,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';

const mockUserId = "mock-user-123";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Social data queries
  const { data: friends = [] } = useQuery({
    queryKey: ['/api/social/users', mockUserId, 'friends'],
    queryFn: async () => {
      const response = await fetch(`/api/social/users/${mockUserId}/friends`);
      const data = await response.json();
      return data.friends || [];
    }
  });

  const { data: socialFeed = [] } = useQuery({
    queryKey: ['/api/social/users', mockUserId, 'feed'],
    queryFn: async () => {
      const response = await fetch(`/api/social/users/${mockUserId}/feed`);
      const data = await response.json();
      return data.activities || [];
    }
  });

  const { data: currentLeague } = useQuery({
    queryKey: ['/api/social/users', mockUserId, 'league', 'current'],
    queryFn: async () => {
      const response = await fetch(`/api/social/users/${mockUserId}/league/current`);
      const data = await response.json();
      return data;
    }
  });

  const { data: userChallenges = [] } = useQuery({
    queryKey: ['/api/social/users', mockUserId, 'challenges'],
    queryFn: async () => {
      const response = await fetch(`/api/social/users/${mockUserId}/challenges`);
      const data = await response.json();
      return data.challenges || [];
    }
  });

  const { data: userGroups = [] } = useQuery({
    queryKey: ['/api/social/users', mockUserId, 'groups'],
    queryFn: async () => {
      const response = await fetch(`/api/social/users/${mockUserId}/groups`);
      const data = await response.json();
      return data.groups || [];
    }
  });

  const { data: discoveredUsers = [] } = useQuery({
    queryKey: ['/api/social/users', mockUserId, 'discover'],
    queryFn: async () => {
      const response = await fetch(`/api/social/users/${mockUserId}/discover`);
      const data = await response.json();
      return data.users || [];
    },
    enabled: activeTab === 'discover'
  });

  // Mutations for social actions
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const response = await fetch(`/api/social/users/${mockUserId}/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Arkadaşlık talebi gönderildi!",
        description: "Talebiniz başarıyla iletildi.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social/users', mockUserId, 'discover'] });
    }
  });

  const challengeFriendMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const response = await fetch(`/api/social/users/${mockUserId}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          challengedUserId: targetUserId,
          challengeType: 'quiz_duel',
          categoryId: 'yks',
          targetScore: 20,
          duration: 300
        })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Meydan okuma gönderildi!",
        description: "Arkadaşınız bildiri alacak.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social/users', mockUserId, 'challenges'] });
    }
  });

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/social/users/${mockUserId}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Yeni Çalışma Grubu",
          description: "Beraber çalışalım!",
          category: "yks",
          maxMembers: 10,
          weeklyGoal: 500
        })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Grup oluşturuldu!",
        description: "Arkadaşlarını davet edebilirsin.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social/users', mockUserId, 'groups'] });
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Sosyal Öğrenme
                  </h1>
                  <p className="text-black">
                    Arkadaşlarınla birlikte öğren ve yarış!
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <Card className="p-3 bg-white">
                <div className="flex items-center gap-2 text-center">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-lg font-bold text-blue-600">{friends.length}</div>
                    <div className="text-xs text-black">Arkadaş</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 bg-white">
                <div className="flex items-center gap-2 text-center">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                  <div>
                    <div className="text-lg font-bold text-yellow-600">
                      {currentLeague?.league?.name || 'Bronze'}
                    </div>
                    <div className="text-xs text-black">Lig</div>
                  </div>
                </div>
              </Card>

              <Card className="p-3 bg-white">
                <div className="flex items-center gap-2 text-center">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-lg font-bold text-purple-600">{userChallenges.length}</div>
                    <div className="text-xs text-black">Meydan Okuma</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Ana Sayfa</span>
            </Button>
          </Link>
        </motion.div>

        {/* Social Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="feed" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Akış</span>
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Arkadaşlar</span>
              </TabsTrigger>
              <TabsTrigger value="leagues" className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Ligler</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Meydan Okuma</span>
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Gruplar</span>
              </TabsTrigger>
              <TabsTrigger value="discover" className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Keşfet</span>
              </TabsTrigger>
            </TabsList>

            {/* Social Feed */}
            <TabsContent value="feed" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      Arkadaş Aktiviteleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {socialFeed.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-black">
                          Henüz arkadaş aktivitesi yok
                        </p>
                        <p className="text-sm text-black mt-2">
                          Arkadaş ekleyerek onların başarılarını takip edebilirsin!
                        </p>
                      </div>
                    ) : (
                      socialFeed.map((activity: any, index: number) => (
                        <div key={`${activity.activity.id}-${index}`} className="flex items-start gap-3 p-4 bg-white border rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/avatars/user.svg" />
                            <AvatarFallback>{activity.user.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{activity.user.username}</span>
                              <Badge variant="secondary" className="text-xs">
                                Seviye {activity.user.level}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {activity.activity.title}
                            </p>
                            {activity.activity.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {activity.activity.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{new Date(activity.activity.createdAt).toLocaleDateString('tr-TR')}</span>
                              <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                                <Heart className="h-3 w-3" />
                                {activity.activity.likeCount}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Friends */}
            <TabsContent value="friends" className="space-y-6">
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Arkadaşlarım ({friends.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {friends.length === 0 ? (
                        <div className="text-center py-6">
                          <UserPlus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-black">Henüz arkadaşın yok</p>
                        </div>
                      ) : (
                        friends.map((friend: any, index: number) => (
                          <div key={`${friend.id}-${index}`} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src="/avatars/user.svg" />
                                <AvatarFallback>{friend.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{friend.username}</div>
                                <div className="text-sm text-black">
                                  Seviye {friend.level} • {friend.xp} XP
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => challengeFriendMutation.mutate(friend.id)}
                              disabled={challengeFriendMutation.isPending}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Meydan Oku
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Friend Requests & Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-blue-600" />
                      Arkadaş Önerileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {discoveredUsers.slice(0, 3).map((user: any, index: number) => (
                        <div key={`${user.id}-${index}`} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="/avatars/user.svg" />
                              <AvatarFallback>{user.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.username}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                Seviye {user.level}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs"
                            onClick={() => sendFriendRequestMutation.mutate(user.id)}
                            disabled={sendFriendRequestMutation.isPending}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Ekle
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Leagues */}
            <TabsContent value="leagues" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-600" />
                      Bu Hafta Ligin: {currentLeague?.league?.name || 'Bronze'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">
                        {currentLeague?.league?.name || 'Bronze'} Ligi
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Bu hafta {currentLeague?.participation?.weeklyXP || 0} XP kazandın
                      </p>
                      <div className="flex items-center justify-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-green-600">Top 5</div>
                          <div className="text-gray-600 dark:text-gray-400">Yükselme</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-600">6-25</div>
                          <div className="text-gray-600 dark:text-gray-400">Sabit</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-red-600">Son 5</div>
                          <div className="text-gray-600 dark:text-gray-400">Düşme</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Challenges */}
            <TabsContent value="challenges" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      Aktif Meydan Okumalar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userChallenges.length === 0 ? (
                      <div className="text-center py-8">
                        <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Henüz aktif meydan okuman yok
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                          Arkadaşlarını meydan okumaya çağır!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userChallenges.map((challenge: any) => (
                          <div key={challenge.challenge.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-medium">{challenge.challenge.challengeType}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  vs {challenge.challenger.username}
                                </div>
                              </div>
                              <Badge variant={challenge.challenge.status === 'active' ? 'default' : 'secondary'}>
                                {challenge.challenge.status === 'active' ? 'Aktif' : 'Bekliyor'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div>Sen: {challenge.challenge.challengedScore}</div>
                              <div>Rakip: {challenge.challenge.challengerScore}</div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="h-3 w-3" />
                                {Math.floor((new Date(challenge.challenge.endsAt).getTime() - Date.now()) / (1000 * 60 * 60))} saat kaldı
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Study Groups */}
            <TabsContent value="groups" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      Çalışma Gruplarım
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userGroups.length === 0 ? (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Henüz bir çalışma grubunda değilsin
                        </p>
                        <Button 
                          className="mt-4"
                          onClick={() => createGroupMutation.mutate()}
                          disabled={createGroupMutation.isPending}
                        >
                          <Target className="h-4 w-4 mr-2" />
                          Grup Oluştur
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userGroups.map((groupData: any) => (
                          <div key={groupData.group.id} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <Target className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium">{groupData.group.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {groupData.group.currentMembers} üye
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {groupData.group.description}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                Haftalık hedef: {groupData.group.weeklyGoal} XP
                              </div>
                              <Badge variant="secondary">
                                {groupData.membership.role}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Discover */}
            <TabsContent value="discover" className="space-y-6">
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-4 mb-6">
                  <Input
                    placeholder="Kullanıcı ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {discoveredUsers.map((user: any) => (
                    <Card key={user.id} className="p-4">
                      <div className="text-center">
                        <Avatar className="h-16 w-16 mx-auto mb-3">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} />
                          <AvatarFallback className="text-lg">
                            {user.username?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium mb-1">{user.username}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Seviye {user.level} • {user.xp} XP
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => sendFriendRequestMutation.mutate(user.id)}
                            disabled={sendFriendRequestMutation.isPending}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Arkadaş Ekle
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => challengeFriendMutation.mutate(user.id)}
                            disabled={challengeFriendMutation.isPending}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Meydan Oku
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
}