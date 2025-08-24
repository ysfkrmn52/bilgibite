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
import { 
  Plus, Users, BookOpen, TrendingUp, CheckCircle, 
  Target, Award, Calendar, BarChart3, Activity,
  Settings, Database, Crown
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
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickQuestion, setQuickQuestion] = useState({
    text: "",
    category: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: ""
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

  // Question mutation
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
        title: "Başarılı",
        description: "Soru başarıyla eklendi",
      });
      setQuickQuestion({
        text: "",
        category: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: ""
      });
      setShowQuickAdd(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/questions/counts"] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Soru eklenirken bir hata oluştu",
        variant: "destructive"
      });
    },
  });

  const handleQuickAdd = () => {
    if (!quickQuestion.text.trim() || !quickQuestion.category) {
      toast({
        title: "Eksik Bilgi",
        description: "Soru metni ve kategori zorunludur",
        variant: "destructive"
      });
      return;
    }

    const validOptions = quickQuestion.options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      toast({
        title: "Eksik Seçenekler", 
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

  const getCategoryCount = (categoryId: string) => {
    return questionCounts?.[categoryId] || 0;
  };

  return (
    <AdminLayout>
      {/* Quick Add Form */}
      {showQuickAdd && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Hızlı Soru Ekleme</CardTitle>
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

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleQuickAdd}
                disabled={createQuestionMutation.isPending}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {createQuestionMutation.isPending ? "Ekleniyor..." : "Soruyu Ekle"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowQuickAdd(false)}
              >
                İptal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Badge variant="default" className="bg-green-100 text-green-700 px-3 py-1">
            <CheckCircle className="w-4 h-4 mr-1" />
            Sistem Aktif
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            v1.0.0
          </Badge>
        </div>
        <Button
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className="flex items-center gap-2"
          data-testid="button-add-question"
        >
          <Plus className="w-4 h-4" />
          Hızlı Soru Ekle
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <div className="text-xs text-green-600">Kayıtlı</div>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Quiz Oturumları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-900" data-testid="text-quiz-sessions">
                  {adminStats?.dailyQuizzes || 0}
                </div>
                <div className="text-xs text-purple-600">Tamamlandı</div>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Premium Kullanıcı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-900" data-testid="text-premium-users">
                  {combinedStats.premiumUsers}
                </div>
                <div className="text-xs text-orange-600">Aktif</div>
              </div>
              <Crown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Genel</TabsTrigger>
          <TabsTrigger value="questions">Sorular</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Son Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adminStats?.recentActivities?.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-sm text-gray-700">{activity.description}</span>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Hızlı İstatistikler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ücretsiz Kullanıcılar</span>
                  <Badge variant="secondary">{combinedStats.freeUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Plus Kullanıcılar</span>
                  <Badge variant="default">{combinedStats.plusUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Aktif Abonelikler</span>
                  <Badge variant="outline">{combinedStats.activeSubscriptions}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Aylık Gelir</span>
                  <Badge variant="secondary">₺{combinedStats.monthlyRevenue}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXAM_CATEGORIES.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {getCategoryCount(category.id)}
                      </div>
                      <div className="text-xs text-gray-500">soru</div>
                    </div>
                    <Target className="w-6 h-6 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Toplam Kullanıcılar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{combinedStats.totalUsers}</div>
                <p className="text-blue-600 text-sm">Kayıtlı kullanıcı sayısı</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader>
                <CardTitle className="text-green-900">Ücretsiz Kullanıcılar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">{combinedStats.freeUsers}</div>
                <p className="text-green-600 text-sm">Temel plan kullanıcıları</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader>
                <CardTitle className="text-purple-900">Premium Kullanıcılar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{combinedStats.premiumUsers}</div>
                <p className="text-purple-600 text-sm">Ücretli plan kullanıcıları</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Platform Metrikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Toplam Sorular</span>
                  <span className="font-semibold">{adminStats?.totalQuestions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Günlük Quiz</span>
                  <span className="font-semibold">{adminStats?.dailyQuizzes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">KPSS Soruları</span>
                  <span className="font-semibold">{getCategoryCount('kpss')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">YKS Soruları</span>
                  <span className="font-semibold">{getCategoryCount('yks')}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Sistem Durumu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Veritabanı</span>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API</span>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Çalışıyor
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Servisler</span>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Aktif
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ödemeler</span>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Güvenli
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}