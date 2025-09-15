// BilgiBite Analytics Dashboard
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar,
  AreaChart, Area, ComposedChart, Legend
} from 'recharts';
import { 
  Calendar, Clock, Target, TrendingUp, Award, Brain,
  BarChart3, Activity, Zap, BookOpen, Star, Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

// Ad Banner Component
const AdBanner = () => {
  const getCurrentUser = () => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        return JSON.parse(currentUser);
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const currentUser = getCurrentUser();
  const subscriptionType = currentUser?.subscription_type || 'free';

  if (subscriptionType === 'premium') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-lg font-semibold mb-2">🚀 Premium'a Geçin!</h3>
        <p className="text-sm text-blue-100 mb-4">
          Reklamları kaldırın ve tüm premium özelliklerden yararlanın!
        </p>
        <Button 
          className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
          onClick={() => window.location.href = '/subscription'}
        >
          Premium'a Yükselt
        </Button>
      </div>
    </motion.div>
  );
};

// Types for analytics data
interface StudySession {
  id: string;
  date: string;
  duration: number;
  questionsAnswered: number;
  correctAnswers: number;
  category: string;
  xpGained: number;
}

interface PerformanceData {
  category: string;
  accuracy: number;
  timeSpent: number;
  questionsAnswered: number;
  strength: 'strong' | 'moderate' | 'weak';
}

interface DailyStats {
  date: string;
  xp: number;
  accuracy: number;
  timeSpent: number;
  streak: number;
}

interface WeaknessArea {
  topic: string;
  category: string;
  accuracy: number;
  recommendedStudyTime: number;
  priority: 'high' | 'medium' | 'low';
}

interface LearningGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  category: string;
}

const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/dashboard?period=${selectedPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  // Export functionality
  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    
    const element = document.getElementById('analytics-dashboard');
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save('bilgibite-analytics.pdf');
  };

  // Mock data for development - New user experience (all zeros)
  const mockDailyStats: DailyStats[] = [
    { date: '2025-08-07', xp: 0, accuracy: 0, timeSpent: 0, streak: 0 },
    { date: '2025-08-08', xp: 0, accuracy: 0, timeSpent: 0, streak: 0 },
    { date: '2025-08-09', xp: 0, accuracy: 0, timeSpent: 0, streak: 0 },
    { date: '2025-08-10', xp: 0, accuracy: 0, timeSpent: 0, streak: 0 },
    { date: '2025-08-11', xp: 0, accuracy: 0, timeSpent: 0, streak: 0 },
    { date: '2025-08-12', xp: 0, accuracy: 0, timeSpent: 0, streak: 0 },
    { date: '2025-08-13', xp: 0, accuracy: 0, timeSpent: 0, streak: 0 }
  ];

  const mockPerformanceData: PerformanceData[] = [
    { category: 'Matematik', accuracy: 0, timeSpent: 0, questionsAnswered: 0, strength: 'weak' },
    { category: 'Türkçe', accuracy: 0, timeSpent: 0, questionsAnswered: 0, strength: 'weak' },
    { category: 'Fen', accuracy: 0, timeSpent: 0, questionsAnswered: 0, strength: 'weak' },
    { category: 'Sosyal', accuracy: 0, timeSpent: 0, questionsAnswered: 0, strength: 'weak' },
    { category: 'İngilizce', accuracy: 0, timeSpent: 0, questionsAnswered: 0, strength: 'weak' }
  ];

  const mockWeaknesses: WeaknessArea[] = [
    // Yeni kullanıcı - henüz zayıf alan analizi yok
  ];

  const mockGoals: LearningGoal[] = [
    // Yeni kullanıcı - henüz öğrenme hedefleri yok
  ];

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div id="analytics-dashboard" className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black">
              📊 İstatistikler
            </h1>
            <p className="text-black mt-1">
              Öğrenme sürecinizi analiz edin ve gelişim alanlarınızı keşfedin
            </p>
          </div>
          
          <div className="flex gap-3">
            <div className="flex rounded-lg bg-white p-1">
              {(['week', 'month', 'year'] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period === 'week' ? 'Hafta' : period === 'month' ? 'Ay' : 'Yıl'}
                </Button>
              ))}
            </div>
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              PDF İndir
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Decorative top stripe */}
              <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black">Toplam XP</p>
                    <p className="text-3xl font-bold text-blue-600">0</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-500" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-black">+0 bu hafta</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-white via-green-50 to-blue-50 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Decorative top stripe */}
              <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black">Ortalama Başarı</p>
                    <p className="text-3xl font-bold text-green-600">0%</p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-black">+0% artış</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-white via-purple-50 to-pink-50 border border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Decorative top stripe */}
              <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black">Çalışma Süresi</p>
                    <p className="text-3xl font-bold text-purple-600">0h</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-black">Bu ay toplam</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-white via-orange-50 to-red-50 border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Decorative top stripe */}
              <div className="h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black">Güncel Seri</p>
                    <p className="text-3xl font-bold text-orange-600">0</p>
                  </div>
                  <Activity className="w-8 h-8 text-orange-500" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-black">Günlük çalışma</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-6 w-full">
            <TabsTrigger value="overview">Genel</TabsTrigger>
            <TabsTrigger value="performance">Performans</TabsTrigger>
            <TabsTrigger value="weaknesses">Zayıf Alanlar</TabsTrigger>
            <TabsTrigger value="goals">Hedefler</TabsTrigger>
            <TabsTrigger value="time">Zaman</TabsTrigger>
            <TabsTrigger value="achievements">Başarılar</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Progress Chart */}
              <Card className="bg-gradient-to-br from-white via-blue-50 to-purple-50 border border-blue-100 shadow-lg">
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                <CardHeader>
                  <CardTitle className="text-black">Günlük İlerleme</CardTitle>
                  <CardDescription className="text-black">Son 7 günün XP ve başarı oranı</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={mockDailyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })} />
                      <YAxis yAxisId="xp" />
                      <YAxis yAxisId="accuracy" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="xp" dataKey="xp" fill="#3b82f6" name="XP" />
                      <Line yAxisId="accuracy" type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} name="Başarı %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card className="bg-gradient-to-br from-white via-green-50 to-blue-50 border border-green-100 shadow-lg">
                <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
                <CardHeader>
                  <CardTitle className="text-black">Kategori Performansı</CardTitle>
                  <CardDescription className="text-black">Alan bazında başarı oranları</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="accuracy" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Study Time Distribution */}
            <Card className="bg-gradient-to-br from-white via-purple-50 to-pink-50 border border-purple-100 shadow-lg">
              <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
              <CardHeader>
                <CardTitle className="text-black">Çalışma Süresi Dağılımı</CardTitle>
                <CardDescription className="text-black">Kategorilere göre harcanan zaman</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={mockPerformanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, timeSpent }) => `${category}: ${timeSpent}dk`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="timeSpent"
                    >
                      {mockPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {mockPerformanceData.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {category.category}
                        <Badge 
                          variant={category.strength === 'strong' ? 'default' : category.strength === 'moderate' ? 'secondary' : 'destructive'}
                        >
                          {category.strength === 'strong' ? 'Güçlü' : category.strength === 'moderate' ? 'Orta' : 'Zayıf'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Başarı Oranı</span>
                          <span>{category.accuracy}%</span>
                        </div>
                        <Progress value={category.accuracy} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Süre</p>
                          <p className="font-semibold">{category.timeSpent}dk</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Soru</p>
                          <p className="font-semibold">{category.questionsAnswered}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Accuracy Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Başarı Oranı Trendi</CardTitle>
                <CardDescription>Zaman içindeki gelişim</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockDailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="accuracy" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weaknesses Tab */}
          <TabsContent value="weaknesses" className="space-y-6">
            <div className="grid gap-4">
              {mockWeaknesses.map((weakness, index) => (
                <motion.div
                  key={weakness.topic}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Brain className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold">{weakness.topic}</h3>
                            <Badge variant="outline">{weakness.category}</Badge>
                            <Badge 
                              variant={weakness.priority === 'high' ? 'destructive' : weakness.priority === 'medium' ? 'default' : 'secondary'}
                            >
                              {weakness.priority === 'high' ? 'Yüksek' : weakness.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
                            </Badge>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Mevcut Başarı</p>
                              <div className="flex items-center gap-2">
                                <Progress value={weakness.accuracy} className="h-2 flex-1" />
                                <span className="text-sm font-semibold">{weakness.accuracy}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Önerilen Süre</p>
                              <p className="font-semibold">{weakness.recommendedStudyTime} dakika/gün</p>
                            </div>
                            <div>
                              <Button size="sm" className="w-full">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Çalışmaya Başla
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid gap-4">
              {mockGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{goal.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Hedef Tarih: {new Date(goal.deadline).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <Badge variant="outline">{goal.category}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>İlerleme</span>
                          <span>{goal.current}/{goal.target}</span>
                        </div>
                        <Progress value={(goal.current / goal.target) * 100} className="h-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          %{Math.round((goal.current / goal.target) * 100)} tamamlandı
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Time Analytics Tab */}
          <TabsContent value="time" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Günlük Çalışma Süresi</CardTitle>
                <CardDescription>Son 7 günün detaylı analizi</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockDailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString('tr-TR', { weekday: 'short' })} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="timeSpent" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Başarı galerisi yakında eklenecek!
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reklam Alanı */}
        <AdBanner />
      </motion.div>
    </div>
  );
};

export default Analytics;