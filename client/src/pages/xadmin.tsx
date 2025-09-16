import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Users, BookOpen, TrendingUp, CheckCircle, 
  Target, Award, Calendar, BarChart3, Activity,
  Settings, Database, Crown, Brain, Sparkles,
  Zap, Clock, Globe, Star, Lightbulb, Cpu,
  Rocket, ChartBar, FileText, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EXAM_CATEGORIES } from "../../../shared/categories";

interface AdminStats {
  totalQuestions: number;
  activeUsers: number;
  dailyQuizzes: number;
  premiumUsers: number;
  tytQuestions: number;
  kpssQuestions: number;
  educationMaterials: number;
  recentActivities: Array<{
    description: string;
    time: string;
  }>;
}

interface SuperadminData {
  totalRevenue: number;
  packagesSold: number;
  monthlyRevenue: number;
  premiumSubscriptions: number;
}

interface QuestionCounts {
  [key: string]: number;
}

export default function XAdmin() {
  const [aiLoading, setAiLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [quickQuestion, setQuickQuestion] = useState({
    text: "",
    category: "",
    options: ["", "", "", "", ""], // 5 şık
    correctAnswer: 0,
    explanation: ""
  });
  const [aiPrompt, setAiPrompt] = useState({
    category: "",
    count: 10
  });
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Otomatik üretim state'leri
  const [autoGenerationEnabled, setAutoGenerationEnabled] = useState(false);
  const [systemErrors, setSystemErrors] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState<Date | null>(null);
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: 'yks',
    tuesday: 'kpss', 
    wednesday: 'ehliyet',
    thursday: 'ales',
    friday: 'dgs',
    saturday: 'src',
    sunday: 'meb-ogretmenlik'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching
  const { data: adminStats, isError: adminStatsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: () => fetch("/api/admin/stats").then((res) => res.json()),
  });

  const { data: subscriptionStats, isError: subscriptionStatsError } = useQuery({
    queryKey: ["/api/admin/subscriptions/stats"],
    queryFn: () => fetch("/api/admin/subscriptions/stats").then((res) => res.json()),
  });

  const { data: questionCounts, isError: questionCountsError } = useQuery<QuestionCounts>({
    queryKey: ["/api/questions/counts"],
    queryFn: () => fetch("/api/questions/counts").then((res) => res.json()),
  });

  // Backend'den otomatik üretim durumunu al
  const { data: autoGenerationStatus, isError: autoGenerationError } = useQuery({
    queryKey: ["/api/admin/auto-generation/status"],
    queryFn: () => fetch("/api/admin/auto-generation/status").then((res) => res.json()),
  });

  // Hata takibi - API hatalarına göre sistem hatalarını güncelle
  useEffect(() => {
    const errorCount = [adminStatsError, subscriptionStatsError, questionCountsError, autoGenerationError]
      .filter(Boolean).length;
    
    if (errorCount > 0) {
      setSystemErrors(errorCount);
      setLastErrorTime(new Date());
    }
  }, [adminStatsError, subscriptionStatsError, questionCountsError, autoGenerationError]);

  // Backend durumu ile senkronize et
  useEffect(() => {
    if (autoGenerationStatus) {
      setAutoGenerationEnabled(autoGenerationStatus.enabled);
      if (autoGenerationStatus.schedule) {
        setWeeklySchedule(autoGenerationStatus.schedule);
      }
    }
  }, [autoGenerationStatus]);

  const { data: superadminData } = useQuery<SuperadminData>({
    queryKey: ["/api/admin/superadmin-stats"],
    queryFn: () => fetch("/api/admin/superadmin-stats").then((res) => res.json()),
    enabled: isSuperAdmin,
  });

  // Superadmin kontrol (basit demo için localStorage kullanıyorum)
  useEffect(() => {
    const loginEmail = localStorage.getItem('adminEmail') || 'ysfkrmn@bilgibite.com'; // Demo için otomatik
    if (loginEmail === 'ysfkrmn@bilgibite.com') {
      setIsSuperAdmin(true);
    }
  }, []);

  const displayStats = subscriptionStats?.data || subscriptionStats || {};
  const combinedStats = {
    ...adminStats,
    ...displayStats,
    totalUsers: (displayStats as any)?.total || adminStats?.activeUsers || 0,
    activeSubscriptions: (displayStats as any)?.activeSubscriptions || 0,
    monthlyRevenue: (displayStats as any)?.monthlyRevenue || 0,
    plusUsers: (displayStats as any)?.plusUsers || 0,
    freeUsers: (displayStats as any)?.freeUsers || 0,
    premiumUsers: (displayStats as any)?.premiumUsers || adminStats?.premiumUsers || 0,
  };

  // Question mutations
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });
      if (!response.ok) throw new Error("Soru eklenemedi");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "🎉 Başarılı",
        description: "Soru başarıyla eklendi",
      });
      setQuickQuestion({
        text: "",
        category: "",
        options: ["", "", "", "", ""], // 5 şık
        correctAnswer: 0,
        explanation: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/counts"] });
    },
    onError: () => {
      toast({
        title: "❌ Hata",
        description: "Soru eklenirken bir hata oluştu",
        variant: "destructive"
      });
    },
  });

  // AI Question Preview - Önce göster sonra kaydet
  const generateAIPreviewMutation = useMutation({
    mutationFn: async (aiData: any) => {
      setPreviewLoading(true);
      const response = await fetch("/api/ai/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...aiData,
          language: "turkish" // Otomatik Türkçe
        }),
      });
      if (!response.ok) throw new Error("AI soru üretimi başarısız");
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewLoading(false);
      setAiGeneratedQuestions(data.questions || []);
      setShowPreview(true);
      toast({
        title: "🤖 Sorular Hazır!",
        description: `${data.questions?.length || 0} soru önizleme için hazırlandı`,
      });
    },
    onError: () => {
      setPreviewLoading(false);
      toast({
        title: "🤖 AI Hata",
        description: "AI soru üretimi sırasında hata oluştu",
        variant: "destructive"
      });
    },
  });

  // AI Sorularını Veritabanına Kaydet
  const saveAIQuestionsMutation = useMutation({
    mutationFn: async (questions: any[]) => {
      const response = await fetch("/api/questions/bulk-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });
      if (!response.ok) throw new Error("Sorular kaydedilemedi");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Tamamlandı!",
        description: `${data.saved} soru veritabanına kaydedildi`,
      });
      setShowPreview(false);
      setAiGeneratedQuestions([]);
      setAiPrompt({ category: "", count: 10 });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/counts"] });
    },
    onError: () => {
      toast({
        title: "❌ Hata",
        description: "Sorular kaydedilirken hata oluştu",
        variant: "destructive"
      });
    },
  });

  // Otomatik üretim mutation'ları
  const toggleAutoGenerationMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await fetch("/api/admin/auto-generation/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, schedule: weeklySchedule }),
      });
      if (!response.ok) throw new Error("Ayar güncellenemedi");
      return response.json();
    },
    onSuccess: (data) => {
      setAutoGenerationEnabled(data.enabled);
      toast({
        title: data.enabled ? "✅ Sistem Başlatıldı" : "⏹️ Sistem Durduruldu",
        description: data.enabled 
          ? "Otomatik soru üretimi aktif hale getirildi" 
          : "Otomatik soru üretimi durduruldu",
      });
    },
    onError: () => {
      toast({
        title: "❌ Hata",
        description: "Sistem ayarları güncellenirken bir hata oluştu",
        variant: "destructive"
      });
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async (newSchedule: typeof weeklySchedule) => {
      const response = await fetch("/api/admin/auto-generation/schedule", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: newSchedule }),
      });
      if (!response.ok) throw new Error("Program güncellenemedi");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "📅 Program Güncellendi",
        description: "Haftalık üretim programı başarıyla kaydedildi",
      });
    },
    onError: () => {
      toast({
        title: "❌ Hata",
        description: "Program güncellenirken bir hata oluştu",
        variant: "destructive"
      });
    },
  });

  const handleScheduleChange = (day: keyof typeof weeklySchedule, category: string) => {
    const newSchedule = { ...weeklySchedule, [day]: category };
    setWeeklySchedule(newSchedule);
    updateScheduleMutation.mutate(newSchedule);
  };

  // Sistem durumu hesaplama
  const getSystemStatus = () => {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Log'lardan hata sayısını kontrol et (SSL ve HTTP 500 hataları var)
    const recentErrors = systemErrors > 0 || (lastErrorTime && lastErrorTime > last24Hours);
    
    // Hata varsa öncelikli olarak turuncu göster
    if (recentErrors) {
      return { 
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-200',
        dotColor: 'bg-orange-500',
        status: 'Hatalı',
        message: 'Sistem Hatası Var',
        emoji: '🟠'
      };
    } else if (autoGenerationEnabled) {
      return { 
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200',
        dotColor: 'bg-green-500',
        status: 'Çalışıyor',
        message: 'Sistem Aktif',
        emoji: '🟢'
      };
    } else {
      return { 
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        dotColor: 'bg-red-500',
        status: 'Kapalı',
        message: 'Sistem Durdurulmuş',
        emoji: '🔴'
      };
    }
  };

  const systemStatus = getSystemStatus();

  // Backend'den nextRunAt bilgisini alıp geri sayım hesaplayan fonksiyon
  const getNextGenerationInfo = () => {
    if (!autoGenerationEnabled || !autoGenerationStatus?.nextRunAt) return null;

    const now = new Date();
    const nextRunTime = new Date(autoGenerationStatus.nextRunAt);
    const diffMs = nextRunTime.getTime() - now.getTime();
    
    // Geçmiş zaman ise null döndür
    if (diffMs <= 0) return null;
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    // Maksimum 60 dakika içinde göster (saatlik sistem)
    if (diffMins > 60) {
      return {
        timeText: `${diffHours} saat ${remainingMins} dakika`,
        category: autoGenerationStatus.currentCategory || "YKS (TYT/AYT)",
        isToday: true
      };
    }
    
    return {
      timeText: diffHours > 0 ? `${diffHours} saat ${remainingMins} dakika` : `${remainingMins} dakika`,
      category: autoGenerationStatus.currentCategory || "YKS (TYT/AYT)",
      isToday: true
    };
  };

  const nextGeneration = getNextGenerationInfo();

  const handleQuickAdd = () => {
    if (!quickQuestion.text.trim() || !quickQuestion.category) {
      toast({
        title: "⚠️ Eksik Bilgi",
        description: "Soru metni ve kategori zorunludur",
        variant: "destructive"
      });
      return;
    }

    const validOptions = quickQuestion.options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 5) {
      toast({
        title: "⚠️ Eksik Seçenekler", 
        description: "5 seçenek de girilmelidir",
        variant: "destructive"
      });
      return;
    }

    createQuestionMutation.mutate({
      ...quickQuestion,
      options: validOptions,
    });
  };

  const handleAIGenerate = () => {
    if (!aiPrompt.category) {
      toast({
        title: "⚠️ Eksik Bilgi",
        description: "Kategori seçimi zorunludur",
        variant: "destructive"
      });
      return;
    }

    generateAIPreviewMutation.mutate(aiPrompt);
  };

  const handleSaveAIQuestions = () => {
    if (aiGeneratedQuestions.length === 0) {
      toast({
        title: "⚠️ Soru Yok",
        description: "Kaydedilecek soru bulunamadı",
        variant: "destructive"
      });
      return;
    }

    saveAIQuestionsMutation.mutate(aiGeneratedQuestions);
  };

  const getCategoryCount = (categoryId: string) => {
    return questionCounts?.[categoryId] || 0;
  };

  return (
    <AdminLayout>
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Badge className={`${systemStatus.bgColor} ${systemStatus.textColor} px-4 py-2`}>
            <CheckCircle className="w-4 h-4 mr-2" />
            {systemStatus.emoji} {systemStatus.message}
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-2">
            <Rocket className="w-4 h-4 mr-2" />
            v2.0.0
          </Badge>
          <Badge className="bg-purple-100 text-purple-700 px-4 py-2">
            <Brain className="w-4 h-4 mr-2" />
            AI Ready
          </Badge>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Toplam Sorular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold" data-testid="text-total-questions">
                  {adminStats?.totalQuestions || 0}
                </div>
                <div className="text-xs text-blue-200">Veritabanında</div>
              </div>
              <BookOpen className="w-10 h-10 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Toplam Kullanıcılar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold" data-testid="text-total-users">
                  {combinedStats.totalUsers}
                </div>
                <div className="text-xs text-green-200">Kayıtlı</div>
              </div>
              <Users className="w-10 h-10 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Quiz Oturumları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold" data-testid="text-quiz-sessions">
                  {adminStats?.dailyQuizzes || 0}
                </div>
                <div className="text-xs text-purple-200">Tamamlandı</div>
              </div>
              <Activity className="w-10 h-10 text-white/80" />
            </div>
          </CardContent>
        </Card>

        {isSuperAdmin ? (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">
                💰 Toplam Gelir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold" data-testid="text-total-revenue">
                    ₺{superadminData?.totalRevenue || 0}
                  </div>
                  <div className="text-xs text-orange-200">Toplam kazanç</div>
                </div>
                <Crown className="w-10 h-10 text-white/80" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">
                Premium Kullanıcı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold" data-testid="text-premium-users">
                    {combinedStats.premiumUsers}
                  </div>
                  <div className="text-xs text-orange-200">Aktif</div>
                </div>
                <Crown className="w-10 h-10 text-white/80" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Superadmin Extra Stats */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-yellow-200 shadow-xl bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                💼 Satılan Paketler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">
                {superadminData?.packagesSold || 0}
              </div>
              <div className="text-xs text-yellow-700">Toplam satış</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 shadow-xl bg-gradient-to-br from-emerald-50 to-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                📊 Aylık Gelir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">
                ₺{superadminData?.monthlyRevenue || 0}
              </div>
              <div className="text-xs text-emerald-700">Bu ay</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
                <Star className="w-4 h-4" />
                👑 Premium Abonelik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {superadminData?.premiumSubscriptions || 0}
              </div>
              <div className="text-xs text-purple-700">Aktif premium</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl bg-white shadow-lg rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg">📊 Genel</TabsTrigger>
          <TabsTrigger value="auto-generate" className="rounded-lg">🔄 Otomatik Üretim</TabsTrigger>
          <TabsTrigger value="manage-questions" className="rounded-lg">📝 Soru Yönetimi</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg">👥 Kullanıcılar</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg">📈 Analitik</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities - Enhanced */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  📋 Son Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminStats?.recentActivities?.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 py-3 border-b last:border-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm text-gray-700">{activity.description}</span>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats - Enhanced */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  ⚡ Hızlı İstatistikler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Ücretsiz Kullanıcılar</span>
                  <Badge className="bg-blue-100 text-blue-700">{combinedStats.freeUsers}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Plus Kullanıcılar</span>
                  <Badge className="bg-purple-100 text-purple-700">{combinedStats.plusUsers}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Aktif Abonelikler</span>
                  <Badge className="bg-green-100 text-green-700">{combinedStats.activeSubscriptions}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Aylık Gelir</span>
                  <Badge className="bg-orange-100 text-orange-700">₺{combinedStats.monthlyRevenue}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add-questions" className="space-y-6">
          {/* Soru Ekleme - Basitleştirilmiş */}
          <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                📝 Soru Yönetimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Soru ekleme ve AI üretim özellikleri geliştirme aşamasındadır.
                </p>
                <p className="text-sm text-gray-500">
                  Bu özellikler yakında kullanıma sunulacaktır.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage-questions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXAM_CATEGORIES.map((category) => (
              <Card key={category.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {getCategoryCount(category.id)}
                      </div>
                      <div className="text-xs text-gray-500">soru mevcut</div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(`/admin/questions/${category.id}`, '_blank')}
                  >
                    📝 Soruları Görüntüle
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="text-blue-100 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Toplam Kullanıcılar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{combinedStats.totalUsers}</div>
                <p className="text-blue-200 text-sm">Kayıtlı kullanıcı sayısı</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader>
                <CardTitle className="text-green-100 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Ücretsiz Kullanıcılar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{combinedStats.freeUsers}</div>
                <p className="text-green-200 text-sm">Temel plan kullanıcıları</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-purple-100 flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Premium Kullanıcılar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{combinedStats.premiumUsers}</div>
                <p className="text-purple-200 text-sm">Ücretli plan kullanıcıları</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Brain className="w-6 h-6" />
                  🤖 AI Soru Üretici Durumu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">AI Durumu</span>
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aktif
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Model</span>
                    <Badge className="bg-purple-100 text-purple-700">Claude AI</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Dil Desteği</span>
                    <Badge className="bg-blue-100 text-blue-700">🇹🇷 Türkçe</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mod</span>
                    <Badge className="bg-orange-100 text-orange-700">Basit</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Otomatik AI Sistemi */}
            <Card className="shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Clock className="w-6 h-6" />
                  🕒 Otomatik AI Sistemi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">
                        Haftalık Üretim
                      </span>
                      <Badge className="bg-green-200 text-green-800">
                        <Calendar className="w-3 h-3 mr-1" />
                        Aktif
                      </Badge>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Her Pazartesi 03:00'da 1000 soru üretilir
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-white rounded border">
                      <div className="font-medium text-gray-900">Son Çalışma</div>
                      <div className="text-xs text-gray-600">21 Ağustos 03:00</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="font-medium text-gray-900">Sonraki Çalışma</div>
                      <div className="text-xs text-gray-600">28 Ağustos 03:00</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="font-medium text-gray-900">Üretilen Soru</div>
                      <div className="text-xs text-gray-600">950 adet</div>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <div className="font-medium text-gray-900">Başarı Oranı</div>
                      <div className="text-xs text-gray-600">95%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Bu haftaki ilerleme</span>
                      <span>950/1000</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-6 h-6 text-blue-600" />
                  ⚡ Sistem Performans
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">CPU Kullanımı</span>
                      <span className="text-sm font-medium">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Bellek Kullanımı</span>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">AI İşlem Kapasitesi</span>
                      <span className="text-sm font-medium">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  📊 Platform Metrikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{adminStats?.totalQuestions || 0}</div>
                    <div className="text-sm text-blue-600">Toplam Sorular</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">{adminStats?.dailyQuizzes || 0}</div>
                    <div className="text-sm text-green-600">Günlük Quiz</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{getCategoryCount('kpss')}</div>
                    <div className="text-sm text-purple-600">KPSS Soruları</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-900">{getCategoryCount('yks')}</div>
                    <div className="text-sm text-orange-600">YKS Soruları</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  🔧 Sistem Durumu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Veritabanı", status: "Online", color: "green" },
                  { label: "API", status: "Çalışıyor", color: "green" },
                  { label: "AI Servisler", status: "Aktif", color: "green" },
                  { label: "Ödemeler", status: "Güvenli", color: "green" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">{item.label}</span>
                    <Badge className={`bg-${item.color}-100 text-${item.color}-700`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="auto-generate" className="space-y-6">
          {/* Otomatik Soru Üretimi Paneli */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle className="text-xl text-orange-900 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                🔄 Otomatik Soru Üretimi Sistemi
                <Badge className="bg-orange-100 text-orange-700">
                  <Cpu className="w-3 h-3 mr-1" />
                  7/24 Aktif
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sistem Durumu */}
              <div className={`p-4 bg-white rounded-lg border border-${systemStatus.color}-200`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${systemStatus.bgColor} rounded-full ${systemStatus.status === 'Çalışıyor' ? 'animate-pulse' : ''}`}></div>
                    <span className="font-medium text-gray-700">Sistem Durumu</span>
                  </div>
                  <Badge className={`bg-${systemStatus.color}-100 ${systemStatus.textColor}`}>
                    <Activity className="w-3 h-3 mr-1" />
                    {systemStatus.status}
                  </Badge>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  {systemStatus.message}
                </div>
              </div>

              {/* Haftalık Program */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      📅 Haftalık Üretim Programı
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { day: 'Pazartesi', category: '', selected: 'yks' },
                      { day: 'Salı', category: '', selected: 'kpss' },
                      { day: 'Çarşamba', category: '', selected: 'ehliyet' },
                      { day: 'Perşembe', category: '', selected: 'ales' },
                      { day: 'Cuma', category: '', selected: 'dgs' },
                      { day: 'Cumartesi', category: '', selected: 'src' },
                      { day: 'Pazar', category: '', selected: 'meb-ogretmenlik' }
                    ].map((dayConfig, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-20 text-sm font-medium text-gray-700">
                          {dayConfig.day}
                        </div>
                        <div className="flex-1">
                          <Select 
                            value={weeklySchedule[dayConfig.day.toLowerCase() as keyof typeof weeklySchedule]}
                            onValueChange={(value) => handleScheduleChange(dayConfig.day.toLowerCase() as keyof typeof weeklySchedule, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Kategori seç" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yks">YKS (TYT/AYT)</SelectItem>
                              <SelectItem value="kpss">KPSS</SelectItem>
                              <SelectItem value="ehliyet">Ehliyet Sınavı</SelectItem>
                              <SelectItem value="ales">ALES</SelectItem>
                              <SelectItem value="dgs">DGS</SelectItem>
                              <SelectItem value="src">SRC Sınavı</SelectItem>
                              <SelectItem value="meb-ogretmenlik">MEB Öğretmenlik</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          10/saat
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* İstatistikler ve Kontroller */}
                <div className="space-y-4">
                  <Card className="border border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        📊 Üretim İstatistikleri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Bu Hafta Üretilen</span>
                        <Badge className="bg-gray-100 text-gray-700 font-bold">0 soru</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Bugün Üretilen</span>
                        <Badge className="bg-gray-100 text-gray-700 font-bold">0 soru</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Toplam Veritabanı</span>
                        <Badge className="bg-gray-100 text-gray-700 font-bold">{Object.values(questionCounts || {}).reduce((sum, count) => sum + count, 0)} soru</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border ${systemStatus.borderColor} ${systemStatus.bgColor}`}>
                    <CardHeader>
                      <CardTitle className={`text-lg ${systemStatus.textColor} flex items-center gap-2`}>
                        <Settings className="w-5 h-5" />
                        ⚙️ Sistem Kontrolü
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Button 
                          className={`flex-1 ${autoGenerationEnabled 
                            ? 'bg-gray-500 hover:bg-gray-600 text-white cursor-not-allowed' 
                            : 'bg-green-500 hover:bg-green-600 text-white'}`}
                          data-testid="button-start-generation"
                          onClick={() => toggleAutoGenerationMutation.mutate(true)}
                          disabled={toggleAutoGenerationMutation.isPending || autoGenerationEnabled}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          {toggleAutoGenerationMutation.isPending 
                            ? "Başlatılıyor..." 
                            : autoGenerationEnabled 
                              ? "Çalışıyor" 
                              : "Başlat"}
                        </Button>
                        <Button 
                          className={`flex-1 ${autoGenerationEnabled 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'border-red-300 text-red-600 hover:bg-red-50'}`}
                          variant={autoGenerationEnabled ? "default" : "outline"}
                          data-testid="button-stop-generation"
                          onClick={() => toggleAutoGenerationMutation.mutate(false)}
                          disabled={toggleAutoGenerationMutation.isPending || !autoGenerationEnabled}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          {toggleAutoGenerationMutation.isPending ? "Durduruluyor..." : "Durdur"}
                        </Button>
                      </div>

                      {/* Gelecek Üretim Bilgisi */}
                      {autoGenerationEnabled && nextGeneration ? (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 text-blue-800 text-sm mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Gelecek Üretim:</span>
                          </div>
                          <div className="text-xs text-blue-700 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">⏰ Süre:</span>
                              <span className="text-blue-900 font-semibold">{nextGeneration.timeText} kaldı</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">📚 Kategori:</span>
                              <span className="text-blue-900 font-semibold">{nextGeneration.category}</span>
                            </div>
                            {!nextGeneration.isToday && nextGeneration.dayName && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium">📅 Gün:</span>
                                <span className="text-blue-900">{nextGeneration.dayName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : !autoGenerationEnabled ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium">Sistem Kapalı</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Otomatik soru üretimi şu anda devre dışı. Sistemi başlatmak için "Başlat" butonunu kullanın.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-green-700 text-sm">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Saatlik Sistem Aktif</span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            Sistem her saat başında otomatik çalışır. Haftalık program artık gerekli değil.
                          </p>
                        </div>
                      )}

                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 text-yellow-800 text-sm">
                          <Lightbulb className="w-4 h-4" />
                          <span className="font-medium">Bilgi:</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          Otomatik soru üretimi sistem tarih ve saatini kullanır. Üretilen sorular inceleme sonrası yayınlanır.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Son Aktiviteler */}
              <Card className="border border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    🔄 Son Üretim Aktiviteleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Aktivite Yok</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Otomatik soru üretimi başlatıldığında aktiviteler burada görünecek
                    </p>
                    {!autoGenerationEnabled && (
                      <Badge variant="outline" className="text-xs">
                        Sistem kapalı
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </AdminLayout>
  );
}