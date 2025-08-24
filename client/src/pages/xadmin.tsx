import { useState } from "react";
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
  Rocket, ChartBar, FileText
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

interface QuestionCounts {
  [key: string]: number;
}

export default function XAdmin() {
  const [aiLoading, setAiLoading] = useState(false);
  const [quickQuestion, setQuickQuestion] = useState({
    text: "",
    category: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: ""
  });
  const [aiPrompt, setAiPrompt] = useState({
    category: "",
    count: 5
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching
  const { data: adminStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: () => fetch("/api/admin/stats").then((res) => res.json()),
  });

  const { data: subscriptionStats } = useQuery({
    queryKey: ["/api/admin/subscriptions/stats"],
    queryFn: () => fetch("/api/admin/subscriptions/stats").then((res) => res.json()),
  });

  const { data: questionCounts } = useQuery<QuestionCounts>({
    queryKey: ["/api/questions/counts"],
    queryFn: () => fetch("/api/questions/counts").then((res) => res.json()),
  });

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
        options: ["", "", "", ""],
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

  // AI Question Generation - Basitleştirildi
  const generateAIQuestionsMutation = useMutation({
    mutationFn: async (aiData: any) => {
      setAiLoading(true);
      const response = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...aiData,
          difficulty: "orta", // Otomatik
          language: "turkish", // Otomatik Türkçe
          topic: "Genel müfredat konuları" // Otomatik
        }),
      });
      if (!response.ok) throw new Error("AI soru üretimi başarısız");
      return response.json();
    },
    onSuccess: (data) => {
      setAiLoading(false);
      toast({
        title: "🤖 AI Başarılı",
        description: `${data.count || aiPrompt.count} adet soru başarıyla üretildi ve eklendi!`,
      });
      setAiPrompt({ category: "", count: 5 });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/counts"] });
    },
    onError: () => {
      setAiLoading(false);
      toast({
        title: "🤖 AI Hata",
        description: "AI soru üretimi sırasında hata oluştu",
        variant: "destructive"
      });
    },
  });

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
    if (validOptions.length < 2) {
      toast({
        title: "⚠️ Eksik Seçenekler", 
        description: "En az 2 seçenek girilmelidir",
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

    generateAIQuestionsMutation.mutate(aiPrompt);
  };

  const getCategoryCount = (categoryId: string) => {
    return questionCounts?.[categoryId] || 0;
  };

  return (
    <AdminLayout>
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-700 px-4 py-2">
            <CheckCircle className="w-4 h-4 mr-2" />
            🟢 Sistem Aktif
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
      </div>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full max-w-3xl bg-white shadow-lg rounded-xl p-1">
          <TabsTrigger value="overview" className="rounded-lg">📊 Genel</TabsTrigger>
          <TabsTrigger value="add-questions" className="rounded-lg">➕ Soru Ekle</TabsTrigger>
          <TabsTrigger value="manage-questions" className="rounded-lg">📝 Soru Yönetimi</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg">👥 Kullanıcılar</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg">🤖 AI</TabsTrigger>
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
          {/* Soru Ekleme Tabları */}
          <Tabs defaultValue="manual" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="manual">⚡ Manuel Soru Ekle</TabsTrigger>
              <TabsTrigger value="ai">🤖 AI ile Üret</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-0">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    ⚡ Manuel Soru Ekleme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select
                        value={quickQuestion.category}
                        onValueChange={(value) => setQuickQuestion(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seç" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXAM_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Soru Metni</Label>
                    <Textarea
                      placeholder="Soru metnini yazın..."
                      value={quickQuestion.text}
                      onChange={(e) => setQuickQuestion(prev => ({ ...prev, text: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickQuestion.options.map((option, index) => (
                      <div key={index} className="space-y-2">
                        <Label>Seçenek {index + 1}</Label>
                        <Input
                          placeholder={`${index + 1}. seçenek`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...quickQuestion.options];
                            newOptions[index] = e.target.value;
                            setQuickQuestion(prev => ({ ...prev, options: newOptions }));
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Doğru Cevap</Label>
                    <Select
                      value={quickQuestion.correctAnswer.toString()}
                      onValueChange={(value) => setQuickQuestion(prev => ({ ...prev, correctAnswer: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Doğru cevabı seç" />
                      </SelectTrigger>
                      <SelectContent>
                        {quickQuestion.options.map((option, index) => (
                          option.trim() && (
                            <SelectItem key={index} value={index.toString()}>
                              {index + 1}. seçenek: {option.slice(0, 30)}...
                            </SelectItem>
                          )
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Açıklama (Opsiyonel)</Label>
                    <Textarea
                      placeholder="Cevap açıklaması..."
                      value={quickQuestion.explanation}
                      onChange={(e) => setQuickQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <Button 
                    onClick={handleQuickAdd}
                    disabled={createQuestionMutation.isPending}
                    className="w-full flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {createQuestionMutation.isPending ? "Ekleniyor..." : "Soruyu Ekle"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-0">
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                    <Brain className="w-6 h-6" />
                    🤖 AI Soru Üretici - Basit Mod
                    <Badge className="bg-purple-100 text-purple-700">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </CardTitle>
                  <p className="text-purple-700 text-sm">
                    Sadece kategori ve soru sayısı seçin, geri kalan herşey otomatik ayarlanacak
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Kategori
                      </Label>
                      <Select
                        value={aiPrompt.category}
                        onValueChange={(value) => setAiPrompt(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXAM_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <ChartBar className="w-4 h-4" />
                        Soru Sayısı
                      </Label>
                      <Select
                        value={aiPrompt.count.toString()}
                        onValueChange={(value) => setAiPrompt(prev => ({ ...prev, count: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Soru</SelectItem>
                          <SelectItem value="5">5 Soru</SelectItem>
                          <SelectItem value="10">10 Soru</SelectItem>
                          <SelectItem value="15">15 Soru</SelectItem>
                          <SelectItem value="20">20 Soru</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-100 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Otomatik Ayarlar:</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Zorluk Seviyesi: Orta</li>
                      <li>• Dil: Türkçe</li>
                      <li>• Müfredat: Genel konular</li>
                      <li>• AI Model: Claude</li>
                    </ul>
                  </div>

                  {aiLoading && (
                    <div className="space-y-3 p-4 bg-purple-100 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-700">
                        <Cpu className="w-5 h-5 animate-spin" />
                        <span className="font-medium">AI Soru Üretiyor...</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <p className="text-sm text-purple-600">
                        Claude AI ile {aiPrompt.count} adet soru oluşturuluyor...
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleAIGenerate}
                    disabled={aiLoading}
                    className="w-full flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {aiLoading ? (
                      <Cpu className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    {aiLoading ? "AI Çalışıyor..." : "🚀 AI ile Üret"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
                  <Button variant="outline" size="sm" className="w-full">
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
      </Tabs>
    </AdminLayout>
  );
}