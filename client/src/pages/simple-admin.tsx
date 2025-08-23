import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, Target, Zap, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { EXAM_CATEGORIES } from '@shared/categories';

interface AdminStats {
  totalQuestions: number;
  activeUsers: number;
  dailyQuizzes: number;
  premiumUsers: number;
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  topic: string;
}

// Using unified category system from @shared/categories

export default function SimpleAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // States
  const [newQuestion, setNewQuestion] = useState({
    examCategoryId: '',
    subject: '',
    difficulty: 'medium',
    questionText: '',
    options: ['', '', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Queries
  const { data: adminStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: () => fetch('/api/admin/stats').then(res => res.json())
  });

  const { data: questionCounts } = useQuery({
    queryKey: ['/api/questions/counts'],
    queryFn: () => fetch('/api/questions/counts').then(res => res.json())
  });

  // Mutations
  const createQuestionMutation = useMutation({
    mutationFn: (question: any) => apiRequest('POST', '/api/questions', question),
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Soru başarıyla eklendi",
      });
      setNewQuestion({
        examCategoryId: '',
        subject: '',
        difficulty: 'medium',
        questionText: '',
        options: ['', '', '', '', ''],
        correctAnswer: 0,
        explanation: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Soru eklenirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  const generateQuestionsMutation = useMutation({
    mutationFn: async ({ category, count }: { category: string, count: number }) => {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          examCategory: category, 
          count: count
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Soru üretimi başarısız');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedQuestions(data.questions || []);
      toast({
        title: "AI Soru Üretimi Başarılı!",
        description: `${data.questions?.length || 0} soru başarıyla üretildi.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || 'Soru üretimi sırasında hata oluştu.',
        variant: "destructive"
      });
    }
  });

  const saveQuestionsMutation = useMutation({
    mutationFn: async (questions: GeneratedQuestion[]) => {
      const formattedQuestions = questions.map(q => ({
        examCategoryId: selectedCategory,
        subject: q.topic || 'Genel',
        difficulty: q.difficulty,
        questionType: 'multiple_choice',
        questionText: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: 1,
        topic: q.topic
      }));

      const response = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: formattedQuestions })
      });

      if (!response.ok) {
        throw new Error('Sorular kaydedilemedi');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedQuestions([]);
      queryClient.invalidateQueries({ queryKey: ['/api/questions/counts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Sorular Kaydedildi!",
        description: `${data.savedCount || generatedQuestions.length} soru veritabanına eklendi.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || 'Sorular kaydedilemedi.',
        variant: "destructive"
      });
    }
  });

  // Handlers
  const handleCreateQuestion = () => {
    if (!newQuestion.questionText || !newQuestion.options.every(opt => opt.trim()) || !newQuestion.explanation) {
      toast({
        title: 'Hata',
        description: 'Tüm alanları doldurunuz',
        variant: 'destructive'
      });
      return;
    }
    createQuestionMutation.mutate(newQuestion);
  };

  const handleGenerateQuestions = () => {
    if (!selectedCategory) {
      toast({
        title: "Hata",
        description: "Lütfen bir sınav kategorisi seçin.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    generateQuestionsMutation.mutate({ 
      category: selectedCategory, 
      count: questionCount 
    });
    
    setTimeout(() => setIsGenerating(false), 3000);
  };

  const handleSaveQuestions = () => {
    if (generatedQuestions.length === 0) return;
    saveQuestionsMutation.mutate(generatedQuestions);
  };

  const getCategoryCount = (categoryId: string) => {
    return questionCounts?.[categoryId] || 0;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">BilgiBite Admin Panel</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => window.location.href = '/admin/questions'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Soru Yönetimi
          </Button>
        </div>
      </div>
      
      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Sorular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-bold">{adminStats?.totalQuestions || 0}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aktif Kullanıcılar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold">{adminStats?.activeUsers || 0}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Günlük Quizler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-2xl font-bold">{adminStats?.dailyQuizzes || 0}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ücretli Kullanıcılar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-2xl font-bold">{adminStats?.premiumUsers || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manuel Soru Ekleme</TabsTrigger>
          <TabsTrigger value="ai">Gelişmiş AI Soru Üretimi</TabsTrigger>
        </TabsList>

        {/* Manuel Soru Ekleme */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manuel Soru Ekleme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select 
                    value={newQuestion.examCategoryId} 
                    onValueChange={(value) => setNewQuestion({...newQuestion, examCategoryId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAM_CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="subject">Konu</Label>
                  <Input
                    value={newQuestion.subject}
                    onChange={(e) => setNewQuestion({...newQuestion, subject: e.target.value})}
                    placeholder="Matematik, Türkçe, vb."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="difficulty">Zorluk</Label>
                <Select 
                  value={newQuestion.difficulty} 
                  onValueChange={(value) => setNewQuestion({...newQuestion, difficulty: value})}
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

              <div>
                <Label htmlFor="question">Soru Metni</Label>
                <Textarea
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
                  placeholder="Soru metnini buraya yazın..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Seçenekler (A, B, C, D, E)</Label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 mt-2">
                    <span className="font-medium w-6">{String.fromCharCode(65 + index)})</span>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion({...newQuestion, options: newOptions});
                      }}
                      placeholder={`Seçenek ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={newQuestion.correctAnswer === index}
                      onChange={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                      className="w-4 h-4"
                    />
                    <span className="text-xs text-gray-500">Doğru</span>
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="explanation">Açıklama</Label>
                <Textarea
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                  placeholder="Sorunun detaylı açıklaması..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleCreateQuestion}
                disabled={createQuestionMutation.isPending}
                className="w-full"
              >
                {createQuestionMutation.isPending ? 'Ekleniyor...' : 'Soruyu Ekle'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gelişmiş AI Soru Üretimi */}
        <TabsContent value="ai">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* AI Soru Üretimi Ayarları */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  AI Soru Üretimi Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Sınav Kategorisi</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAM_CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{category.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {getCategoryCount(category.id)} soru
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="count">Soru Sayısı (10'un katları)</Label>
                  <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Soru
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerateQuestions}
                  disabled={!selectedCategory || isGenerating || generateQuestionsMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {isGenerating || generateQuestionsMutation.isPending ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-pulse" />
                      AI Sorular Üretiyor...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      {questionCount} Soru Üret
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Kategori Başına Soru Sayıları */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Kategori Başına Soru Sayıları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {EXAM_CATEGORIES.map(category => {
                    const count = getCategoryCount(category.id);
                    const isReady = count >= 100;
                    return (
                      <div key={category.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{category.name}</span>
                          <div className="text-sm text-gray-500">{count} soru</div>
                        </div>
                        <Badge variant={isReady ? "default" : "secondary"}>
                          {isReady ? 'Hazır' : 'Eksik'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Üretilen Sorular */}
            {generatedQuestions.length > 0 && (
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Üretilen Sorular ({generatedQuestions.length})</span>
                      <Button 
                        onClick={handleSaveQuestions}
                        disabled={saveQuestionsMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saveQuestionsMutation.isPending ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-y-auto space-y-4">
                    {generatedQuestions.slice(0, 3).map((question, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline">{question.topic}</Badge>
                          <Badge variant="secondary">{question.difficulty}</Badge>
                        </div>
                        
                        <p className="font-medium mb-3">{question.question}</p>
                        
                        <div className="space-y-1 mb-3">
                          {question.options.map((option, optIndex) => (
                            <div 
                              key={optIndex} 
                              className={`text-sm p-2 rounded ${
                                optIndex === question.correctAnswer 
                                  ? 'bg-green-100 text-green-800 font-medium' 
                                  : 'bg-gray-50'
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}) {option}
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Açıklama:</strong> {question.explanation}
                        </div>
                      </div>
                    ))}
                    
                    {generatedQuestions.length > 3 && (
                      <div className="text-center py-4 text-gray-500">
                        +{generatedQuestions.length - 3} soru daha...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}