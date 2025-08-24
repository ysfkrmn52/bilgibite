import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Users,
  Target,
  Zap,
  Brain,
  Crown,
  DollarSign,
  CreditCard,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Plus,
  Upload,
  FileText,
  TrendingUp,
  UserPlus,
  Activity,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { EXAM_CATEGORIES } from "@shared/categories";

export default function XAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    questionText: '',
    options: ['', '', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  // Queries
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: () => fetch("/api/admin/stats").then((res) => res.json()),
  });

  const { data: subscriptionStats, isLoading: subStatsLoading } = useQuery({
    queryKey: ["/api/admin/subscriptions/stats"],
    retry: 3,
    retryDelay: 1000,
  });

  const { data: questionCounts } = useQuery({
    queryKey: ["/api/questions/counts"],
    queryFn: () => fetch("/api/questions/counts").then((res) => res.json()),
  });

  // Stats combination
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

  // Mutations
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Soru ekleme başarısız');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Yeni soru başarıyla eklendi."
      });
      setNewQuestion({
        category: '',
        difficulty: 'medium',
        questionText: '',
        options: ['', '', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      });
      setShowQuestionForm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/questions/counts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Soru eklenirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleQuestionSubmit = () => {
    if (!newQuestion.category || !newQuestion.questionText.trim()) {
      toast({
        title: "Eksik Bilgi",
        description: "Kategori ve soru metni zorunludur.",
        variant: "destructive"
      });
      return;
    }

    const validOptions = newQuestion.options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      toast({
        title: "Eksik Seçenekler",
        description: "En az 2 seçenek girilmelidir.",
        variant: "destructive"
      });
      return;
    }

    createQuestionMutation.mutate(newQuestion);
  };

  const getCategoryCount = (categoryId: string) => {
    return questionCounts?.[categoryId] || 0;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              BilgiBite Admin Merkezi
            </h1>
            <p className="text-gray-600 mt-1">
              Komple platform yönetimi ve kontrol merkezi
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowQuestionForm(!showQuestionForm)}
              className="flex items-center gap-2"
              data-testid="button-add-question"
            >
              <Plus className="w-4 h-4" />
              Hızlı Soru Ekle
            </Button>
            <Badge
              variant="default"
              className="bg-green-100 text-green-700 px-3 py-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Sistem Aktif
            </Badge>
          </div>
        </div>

        {/* Ana İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Toplam Sorular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-900" data-testid="text-total-questions">
                    {adminStats?.totalQuestions || 0}
                  </div>
                  <div className="text-xs text-blue-600">Veritabanında</div>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Toplam Kullanıcılar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-900" data-testid="text-total-users">
                    {combinedStats.totalUsers}
                  </div>
                  <div className="text-xs text-green-600">Kayıtlı kullanıcı</div>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Aktif Abonelik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-900" data-testid="text-active-subscriptions">
                    {combinedStats.activeSubscriptions}
                  </div>
                  <div className="text-xs text-purple-600">Ödeme yapan</div>
                </div>
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">
                Aylık Gelir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-900" data-testid="text-monthly-revenue">
                    {formatCurrency(combinedStats.monthlyRevenue || 0)}
                  </div>
                  <div className="text-xs text-orange-600">Bu ay</div>
                </div>
                <DollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hızlı Soru Ekleme Formu */}
        {showQuestionForm && (
          <Card className="border-0 shadow-lg border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Hızlı Soru Ekleme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select 
                    value={newQuestion.category} 
                    onValueChange={(value) => setNewQuestion({...newQuestion, category: value})}
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
                <div>
                  <Label htmlFor="difficulty">Zorluk</Label>
                  <Select 
                    value={newQuestion.difficulty} 
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => setNewQuestion({...newQuestion, difficulty: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Kolay</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="hard">Zor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="questionText">Soru Metni</Label>
                <Textarea
                  id="questionText"
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                  placeholder="Soru metnini buraya yazın..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label>Seçenekler</Label>
                <div className="space-y-2">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestion.correctAnswer === index}
                        onChange={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                        className="mt-1"
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[index] = e.target.value;
                          setNewQuestion({...newQuestion, options: newOptions});
                        }}
                        placeholder={`Seçenek ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="explanation">Açıklama (Opsiyonel)</Label>
                <Textarea
                  id="explanation"
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                  placeholder="Sorunun açıklaması..."
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleQuestionSubmit}
                  disabled={createQuestionMutation.isPending}
                  data-testid="button-submit-question"
                >
                  {createQuestionMutation.isPending ? "Ekleniyor..." : "Soru Ekle"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowQuestionForm(false)}
                >
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ana Yönetim Paneli */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Hızlı Aksiyonlar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => (window.location.href = "/admin/questions")}
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="button-question-management"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Soru Yönetimi
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button
                  onClick={() => (window.location.href = "/admin/subscriptions")}
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="button-subscription-management"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Abonelik Yönetimi
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button
                  onClick={() => (window.location.href = "/admin/analytics")}
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="button-analytics"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button
                  onClick={() => (window.location.href = "/admin/ai-questions")}
                  variant="outline"
                  className="w-full justify-start"
                  data-testid="button-ai-questions"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Soru Üretimi
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Son Aktiviteler */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Son Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="recent-activities">
                  {adminStats?.recentActivities?.length ? (
                    adminStats.recentActivities.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{activity.description}</div>
                          <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Activity className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        Henüz aktivite bulunmuyor
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detaylı Yönetim Sekmeleri */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Sorular
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Abonelikler
            </TabsTrigger>
          </TabsList>

          {/* Genel Bakış */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Platform İstatistikleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Toplam Sorular</span>
                      <span className="font-semibold">{adminStats?.totalQuestions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Aktif Kullanıcılar</span>
                      <span className="font-semibold">{combinedStats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Günlük Quiz</span>
                      <span className="font-semibold text-green-600">{adminStats?.dailyQuizzes || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Premium Kullanıcılar</span>
                      <span className="font-semibold text-purple-600">{combinedStats.premiumUsers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-green-600" />
                    Sistem Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" data-testid="system-status">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">PostgreSQL</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Aktif</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AI Claude API</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Hazır</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Error Monitoring</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500">Çalışıyor</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sorular Sekmesi */}
          <TabsContent value="questions">
            <div className="grid gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Kategorilere Göre Soru Dağılımı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {EXAM_CATEGORIES.map((category) => (
                      <div key={category.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{category.name}</span>
                          <Badge variant="secondary">{getCategoryCount(category.id)}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">{category.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  onClick={() => (window.location.href = "/admin/questions")}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <BookOpen className="w-6 h-6" />
                  <span>Detaylı Soru Yönetimi</span>
                </Button>

                <Button
                  onClick={() => (window.location.href = "/admin/ai-questions")}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  <Brain className="w-6 h-6" />
                  <span>AI Soru Üretimi</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Kullanıcılar Sekmesi */}
          <TabsContent value="users">
            <div className="grid gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Kullanıcı İstatistikleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-900">{combinedStats.freeUsers || 0}</div>
                      <div className="text-sm text-blue-600">Ücretsiz</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-900">{combinedStats.plusUsers || 0}</div>
                      <div className="text-sm text-purple-600">Plus</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-900">{combinedStats.premiumUsers || 0}</div>
                      <div className="text-sm text-orange-600">Premium</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Kullanıcı Yönetimi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => (window.location.href = "/admin/users")}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Kullanıcıları Görüntüle
                    </Button>
                    <Button
                      onClick={() => (window.location.href = "/admin/verification")}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Doğrulamalar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Abonelikler Sekmesi */}
          <TabsContent value="subscriptions">
            <div className="grid gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    Abonelik Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {combinedStats.totalUsers > 0 ? (
                    <div className="space-y-4" data-testid="subscription-details">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {combinedStats.freeUsers || 0}
                          </div>
                          <div className="text-sm text-gray-600">Ücretsiz</div>
                          <div className="text-xs text-gray-500">
                            %{Math.round(((combinedStats.freeUsers || 0) / combinedStats.totalUsers) * 100)}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-900">
                            {combinedStats.plusUsers || 0}
                          </div>
                          <div className="text-sm text-blue-600">Plus</div>
                          <div className="text-xs text-blue-500">
                            %{Math.round(((combinedStats.plusUsers || 0) / combinedStats.totalUsers) * 100)}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-900">
                            {combinedStats.premiumUsers || 0}
                          </div>
                          <div className="text-sm text-purple-600">Premium</div>
                          <div className="text-xs text-purple-500">
                            %{Math.round(((combinedStats.premiumUsers || 0) / combinedStats.totalUsers) * 100)}
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Toplam Aylık Gelir</span>
                          <span className="font-bold text-green-600 text-lg">
                            {formatCurrency(combinedStats.monthlyRevenue || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8" data-testid="no-subscription-data">
                      <Crown className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500">Henüz abonelik verisi bulunmuyor</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Paket Fiyatları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">Ücretsiz</span>
                        <div className="text-xs text-gray-500">Temel özellikler</div>
                      </div>
                      <span className="font-bold">₺0/ay</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <span className="font-medium">Plus</span>
                        <div className="text-xs text-gray-500">Gelişmiş özellikler</div>
                      </div>
                      <span className="font-bold text-blue-600">₺99/ay</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <span className="font-medium">Premium</span>
                        <div className="text-xs text-gray-500">Tüm özellikler + AI</div>
                      </div>
                      <span className="font-bold text-purple-600">₺299/ay</span>
                    </div>
                    <Button
                      onClick={() => (window.location.href = "/admin/subscriptions")}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      Detaylı Abonelik Yönetimi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}