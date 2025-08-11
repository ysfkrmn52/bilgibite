// Leaderboard System with Rankings and Competitions
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star,
  TrendingUp,
  Calendar,
  Users,
  Zap,
  Flame,
  Target,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LeaderboardEntry } from '@/lib/gamification';

interface LeaderboardProps {
  currentUser: {
    userId: string;
    username: string;
    avatar?: string;
    totalXP: number;
    level: number;
    currentStreak: number;
    weeklyXP: number;
    monthlyXP: number;
    rank: number;
  };
  leaderboardData: {
    weekly: LeaderboardEntry[];
    monthly: LeaderboardEntry[];
    allTime: LeaderboardEntry[];
  };
  onUserClick?: (userId: string) => void;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    userId: '1',
    username: 'AhmetYKS2024',
    totalXP: 15420,
    level: 28,
    currentStreak: 45,
    weeklyXP: 2150,
    monthlyXP: 8900,
    rank: 1
  },
  {
    userId: '2', 
    username: 'BilgeKPSS',
    totalXP: 14830,
    level: 27,
    currentStreak: 32,
    weeklyXP: 1980,
    monthlyXP: 8100,
    rank: 2
  },
  {
    userId: '3',
    username: 'EhliyetUstası',
    totalXP: 13950,
    level: 25,
    currentStreak: 28,
    weeklyXP: 1750,
    monthlyXP: 7500,
    rank: 3
  },
  {
    userId: '4',
    username: 'QuizKraliçesi',
    totalXP: 12800,
    level: 24,
    currentStreak: 21,
    weeklyXP: 1650,
    monthlyXP: 6800,
    rank: 4
  },
  {
    userId: '5',
    username: 'HızlıÖğrenen',
    totalXP: 11900,
    level: 22,
    currentStreak: 18,
    weeklyXP: 1500,
    monthlyXP: 6200,
    rank: 5
  }
];

export function Leaderboard({ currentUser, leaderboardData, onUserClick }: LeaderboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return Crown;
      case 2: return Trophy;
      case 3: return Medal;
      default: return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';  
      case 3: return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean = false) => {
    if (isCurrentUser) {
      return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
    }
    
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950 dark:to-orange-950 dark:border-yellow-800';
      case 2: return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 dark:from-gray-950 dark:to-slate-950 dark:border-gray-800';
      case 3: return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950 dark:to-orange-950 dark:border-amber-800';
      default: return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700';
    }
  };

  // Use mock data for now - replace with actual data
  const currentData = MOCK_LEADERBOARD;
  const userRank = currentUser.rank;
  const isUserInTop10 = userRank <= 10;

  return (
    <div className="space-y-6">
      {/* Current User Rank Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-bold">
                    {currentUser.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentUser.level}
                </motion.div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200">
                  {currentUser.username}
                </h3>
                <p className="text-purple-600 dark:text-purple-400">
                  #{userRank} sıradaki
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                #{userRank}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                Genel Sıralama
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {currentUser.totalXP.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Toplam XP</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {currentUser.weeklyXP.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Haftalık XP</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {currentUser.currentStreak}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Günlük Seri</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                Lv.{currentUser.level}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Seviye</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Tabs */}
      <Tabs value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="weekly" className="flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4" />
              Bu Hafta
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2 text-xs">
              <TrendingUp className="w-4 h-4" />
              Bu Ay
            </TabsTrigger>
            <TabsTrigger value="allTime" className="flex items-center gap-2 text-xs">
              <Trophy className="w-4 h-4" />
              Tüm Zamanlar
            </TabsTrigger>
          </TabsList>

          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {currentData.length} Yarışmacı
          </Badge>
        </div>

        <div className="mt-6">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* 2nd Place */}
            <motion.div
              className="order-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {currentData[1] && (
                <Card className={`text-center cursor-pointer transition-all duration-300 hover:shadow-lg ${getRankBg(2)}`}>
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <Avatar className="w-16 h-16 mx-auto">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-lg font-bold">
                          {currentData[1].username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Trophy className="w-6 h-6 text-gray-400" />
                      </motion.div>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{currentData[1].username}</h3>
                    <div className="text-2xl font-bold text-gray-600 mb-1">#2</div>
                    <div className="text-xs text-gray-500">{currentData[1].weeklyXP} XP</div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* 1st Place */}
            <motion.div
              className="order-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              {currentData[0] && (
                <Card className={`text-center cursor-pointer transition-all duration-300 hover:shadow-lg transform scale-110 ${getRankBg(1)}`}>
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <Avatar className="w-20 h-20 mx-auto">
                        <AvatarFallback className="bg-yellow-100 text-yellow-600 text-xl font-bold">
                          {currentData[0].username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                        animate={{ 
                          rotate: [0, -10, 10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Crown className="w-8 h-8 text-yellow-500" />
                      </motion.div>
                    </div>
                    <h3 className="font-semibold mb-1">{currentData[0].username}</h3>
                    <div className="text-3xl font-bold text-yellow-600 mb-1">#1</div>
                    <div className="text-sm text-yellow-600">{currentData[0].weeklyXP} XP</div>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              className="order-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {currentData[2] && (
                <Card className={`text-center cursor-pointer transition-all duration-300 hover:shadow-lg ${getRankBg(3)}`}>
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <Avatar className="w-16 h-16 mx-auto">
                        <AvatarFallback className="bg-amber-100 text-amber-600 text-lg font-bold">
                          {currentData[2].username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Medal className="w-6 h-6 text-amber-600" />
                      </motion.div>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{currentData[2].username}</h3>
                    <div className="text-2xl font-bold text-amber-600 mb-1">#3</div>
                    <div className="text-xs text-amber-600">{currentData[2].weeklyXP} XP</div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Full Leaderboard List */}
          <div className="space-y-2">
            <AnimatePresence>
              {currentData.map((entry, index) => {
                const RankIcon = getRankIcon(entry.rank);
                const isCurrentUser = entry.userId === currentUser.userId;
                
                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                        getRankBg(entry.rank, isCurrentUser)
                      } ${isCurrentUser ? 'ring-2 ring-blue-300 dark:ring-blue-700' : ''}`}
                      onClick={() => onUserClick?.(entry.userId)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-8">
                            {RankIcon ? (
                              <motion.div
                                animate={entry.rank <= 3 ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <RankIcon className={`w-6 h-6 ${getRankColor(entry.rank)}`} />
                              </motion.div>
                            ) : (
                              <span className="text-lg font-bold text-gray-500">
                                #{entry.rank}
                              </span>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar>
                              <AvatarImage src={entry.avatar} />
                              <AvatarFallback className="font-semibold">
                                {entry.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{entry.username}</h4>
                                {isCurrentUser && (
                                  <Badge variant="outline" className="text-xs">Sen</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Lv. {entry.level}</span>
                                <div className="flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-orange-500" />
                                  {entry.currentStreak}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              {entry.weeklyXP.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">XP</div>
                          </div>

                          {/* Rank Change Indicator */}
                          <div className="w-6">
                            {Math.random() > 0.5 ? (
                              <ChevronUp className="w-4 h-4 text-green-500" />
                            ) : Math.random() > 0.3 ? (
                              <ChevronDown className="w-4 h-4 text-red-500" />
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* User's Position if Not in Top 10 */}
          {!isUserInTop10 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="text-center text-sm text-gray-500 mb-2">
                Senin sıralaman
              </div>
              <Card className={getRankBg(0, true)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8">
                      <span className="text-lg font-bold text-blue-600">
                        #{userRank}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar>
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {currentUser.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{currentUser.username}</h4>
                          <Badge className="bg-blue-100 text-blue-800">Sen</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Lv. {currentUser.level}</span>
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {currentUser.currentStreak}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {currentUser.weeklyXP.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">XP</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </Tabs>

      {/* League Information */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-green-500" />
              <div>
                <h4 className="font-semibold">Altın Ligi</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bu hafta top 10'da kal ve ödül kazan!
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              2 gün kaldı
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}