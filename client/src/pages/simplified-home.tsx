import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  ScrollReveal, 
  HoverLift, 
  FloatingElement, 
  Pressable,
  containerVariants,
  itemVariants,
  hoverLiftVariants,
  floatVariants
} from '@/components/AnimationWrappers';
import { useParallax } from '@/hooks/useParallax';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Play,
  Trophy,
  Zap,
  Flame,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Star,
  Award,
  ChevronRight,
  Calendar,
  Users,
  Globe,
  Newspaper,
  GraduationCap,
  Heart,
  Sparkles
} from 'lucide-react';


// MEB News Mock Data
const mebNews = [
  {
    id: "1",
    title: "2025 YKS Takvimi Açıklandı",
    summary: "Üniversite sınavının tarihleri ve yeni değişiklikler duyuruldu.",
    date: "2025-08-15",
    category: "YKS",
    url: "#"
  },
  {
    id: "2", 
    title: "KPSS Müfredat Güncellemesi",
    summary: "Kamu personel seçme sınavında yeni konular eklendi.",
    date: "2025-08-14",
    category: "KPSS",
    url: "#"
  },
  {
    id: "3",
    title: "Dijital Eğitim Platformları Desteklenecek",
    summary: "MEB'den online öğrenme platformları için yeni destekler.",
    date: "2025-08-13", 
    category: "Eğitim",
    url: "#"
  }
];

export default function SimplifiedHome() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { currentUser } = useAuth();
  const [weeklyGoal, setWeeklyGoal] = useState(300);
  
  // Parallax effects for background elements
  const heroParallax = useParallax({ speed: 0.3, direction: 'up' });
  const backgroundParallax = useParallax({ speed: 0.1, direction: 'down' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get real user data
  const userId = currentUser?.uid || 'demo-user-123';
  
  const { data: userProgress = [] } = useQuery({
    queryKey: ['/api/users', userId, 'progress'],
    enabled: !!userId
  });

  const { data: userStats = null } = useQuery({
    queryKey: ['/api/users', userId, 'stats'],
    enabled: !!userId
  });

  const { data: examCategories = [] } = useQuery({
    queryKey: ['/api/exam-categories']
  });

  // Calculate real user statistics or use defaults for new users
  const currentStats = {
    totalXP: (userStats as any)?.totalXP || 0,
    currentLevel: (userStats as any)?.currentLevel || 1,
    streak: (userStats as any)?.streak || 0,
    completedQuizzes: Array.isArray(userProgress) ? userProgress.length : 0,
    weeklyGoal: weeklyGoal,
    studyTime: (userStats as any)?.studyTime || 0,
    todayStudyTime: (userStats as any)?.todayStudyTime || 0,
    correctAnswers: (userStats as any)?.correctAnswers || 0,
    successRate: (userStats as any)?.successRate || 0,
    levelProgress: (userStats as any)?.levelProgress || 0
  };

  // Free user ad component
  const AdBanner = () => {
    if ((currentUser as any)?.subscription_type === 'premium') return null;
    
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📚</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Premium'a geç, reklamları kaldır!</p>
              <p className="text-xs text-gray-600">Sınırsız quiz, AI öğretmen ve daha fazlası</p>
            </div>
            <Button size="sm" variant="outline">Yükselt</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi öğlenler";
    return "İyi akşamlar";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        ref={backgroundParallax.ref}
        style={backgroundParallax.style}
        className="absolute inset-0"
      >
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </motion.div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <FloatingElement duration={6} intensity={8}>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                Bilgi<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Bite</span>
              </h1>
            </FloatingElement>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-300 mb-8"
            >
              Türkiye'nin en gelişmiş sınav hazırlık platformu
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Hemen Başla
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl backdrop-blur-sm">
                Demo İzle
                <Play className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Exam Categories Grid */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Sınav Kategorileri</h2>
            <p className="text-gray-300 text-lg">Hazırlanmak istediğin sınavı seç ve başla</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {examCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 5,
                  z: 50
                }}
                className="group cursor-pointer perspective-1000"
              >
                <Card className="h-full bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-500 overflow-hidden">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <motion.div
                        className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.8 }}
                      >
                        <GraduationCap className="w-10 h-10 text-white" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                        {category.name}
                      </h3>
                      
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        {category.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">150+</div>
                          <div className="text-xs text-gray-400">Soru</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">%95</div>
                          <div className="text-xs text-gray-400">Başarı</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">4.8</div>
                          <div className="text-xs text-gray-400">Puan</div>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                        Başla
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <div>
              <motion.div 
                className="text-4xl md:text-5xl font-bold text-white mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.0, type: "spring", stiffness: 200 }}
              >
                50K+
              </motion.div>
              <p className="text-gray-300">Öğrenci</p>
            </div>
            <div>
              <motion.div 
                className="text-4xl md:text-5xl font-bold text-white mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.2, type: "spring", stiffness: 200 }}
              >
                10K+
              </motion.div>
              <p className="text-gray-300">Soru</p>
            </div>
            <div>
              <motion.div 
                className="text-4xl md:text-5xl font-bold text-white mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.4, type: "spring", stiffness: 200 }}
              >
                %98
              </motion.div>
              <p className="text-gray-300">Başarı Oranı</p>
            </div>
            <div>
              <motion.div 
                className="text-4xl md:text-5xl font-bold text-white mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.6, type: "spring", stiffness: 200 }}
              >
                24/7
              </motion.div>
              <p className="text-gray-300">Destek</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}