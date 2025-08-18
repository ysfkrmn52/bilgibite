import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Users, BookOpen, Target, Zap, Plus, Brain } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

export default function SimpleAdmin() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState('tyt');
  const [selectedCategory, setSelectedCategory] = useState('turkce');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfAnalysisResult, setPdfAnalysisResult] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Manuel soru ekleme state
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: 'tyt-turkce',
    difficulty: 'medium',
    explanation: ''
  });
  const [aiGenerating, setAiGenerating] = useState(false);

  // Admin istatistikleri query
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Admin stats fetch error:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // 30 saniyede bir güncelle
  });

  const uploadPDFMutation = useMutation({
    mutationFn: async (file: File) => {
      // Dosya boyutu kontrolü (200MB = 200 * 1024 * 1024)
      if (file.size > 200 * 1024 * 1024) {
        throw new Error('Dosya boyutu 200MB\'dan büyük olamaz');
      }

      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/admin/process-pdf`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.detectedQuestions) {
        setPdfAnalysisResult(data);
        toast({
          title: "PDF Analizi Tamamlandı!",
          description: `${data.detectedQuestions} soru tespit edildi. Onayınızı bekliyor.`,
        });
      } else {
        toast({
          title: "PDF Başarıyla Yüklendi!",
          description: `${data.processedQuestions} soru veritabanına eklendi`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      }
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast({
        title: "PDF Yükleme Hatası",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: (questionData: typeof newQuestion) => 
      apiRequest('POST', '/api/admin/questions', questionData),
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Soru başarıyla oluşturuldu'
      });
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        category: 'tyt-turkce',
        difficulty: 'medium',
        explanation: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const generateAIQuestions = async (category: string, count: number = 5) => {
    setAiGenerating(true);
    try {
      const response = await apiRequest('POST', '/api/ai/generate-questions', {
        category,
        count
      });
      
      toast({
        title: "AI Sorular Üretildi!",
        description: `${category} kategorisi için ${count} kaliteli soru üretildi ve kaydedildi`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    } catch (error: any) {
      toast({
        title: "AI Soru Üretim Hatası", 
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAiGenerating(false);
    }
  };

  const generateQuestionsMutation = useMutation({
    mutationFn: async ({ count, examType }: { count: number; examType: string }) => {
      return await apiRequest('POST', '/api/admin/generate-questions', { 
        count, 
        examType
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Sorular Başarıyla Üretildi!",
        description: `${data.generatedCount} soru AI tarafından üretildi ve veritabanına eklendi`,
      });
      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "AI Soru Üretim Hatası",
        description: error.message,
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024 * 1024) { // 200MB limit
      toast({
        title: "Dosya Çok Büyük",
        description: "Maksimum dosya boyutu 200MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setPdfAnalysisResult(null); // Önceki sonuçları temizle
    uploadPDFMutation.mutate(file);
  };

  const confirmPDFQuestions = async (confirm: boolean) => {
    if (!pdfAnalysisResult) return;

    try {
      const response = await fetch('/api/admin/confirm-pdf-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempId: pdfAnalysisResult.tempId,
          confirmAdd: confirm
        })
      });

      if (confirm) {
        toast({
          title: "Sorular Ekleniyor...",
          description: "Tespit edilen sorular veritabanına ekleniyor",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      } else {
        toast({
          title: "İşlem İptal Edildi",
          description: "PDF sorular veritabanına eklenmedi",
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      });
    }

    setPdfAnalysisResult(null);
  };

  const handleCreateQuestion = () => {
    if (!newQuestion.question || !newQuestion.options.every(opt => opt.trim()) || !newQuestion.explanation) {
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
    if (questionCount < 1 || questionCount > 100) {
      toast({
        title: 'Hata',
        description: 'Soru sayısı 1-100 arasında olmalıdır',
        variant: 'destructive'
      });
      return;
    }
    
    setIsGenerating(true);
    generateQuestionsMutation.mutate({ 
      count: questionCount, 
      examType: selectedExamType 
    });
  };

  const examTypes = [
    { value: 'tyt', label: 'TYT' },
    { value: 'yks', label: 'YKS' },
    { value: 'kpss', label: 'KPSS' },
    { value: 'ehliyet', label: 'Ehliyet' },
    { value: 'ale', label: 'ALE' }
  ];

  const categories = [
    { value: 'turkce', label: 'Türkçe' },
    { value: 'matematik', label: 'Matematik' },
    { value: 'fen', label: 'Fen Bilimleri' },
    { value: 'sosyal', label: 'Sosyal Bilimler' },
    { value: 'tarih', label: 'Tarih' },
    { value: 'cografya', label: 'Coğrafya' },
    { value: 'fizik', label: 'Fizik' },
    { value: 'kimya', label: 'Kimya' },
    { value: 'biyoloji', label: 'Biyoloji' }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">BilgiBite Admin Panel</h1>
        <div className="flex gap-2">
          <Link href="/admin/ai-education">
            <Button 
              variant="outline"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
              data-testid="button-ai-education"
            >
              <Brain className="w-4 h-4 text-purple-600" />
              AI Eğitim Üretici
            </Button>
          </Link>
          <Button 
            onClick={() => window.location.href = '/admin/questions'}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Soru Yönetimi
          </Button>
          <Button 
            onClick={() => window.location.href = '/admin/pdf-manager'}
            variant="outline"
            className="flex items-center gap-2 bg-red-50 border-red-200 hover:bg-red-100"
          >
            📄 PDF Yönetimi
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

      <Tabs defaultValue="ai-quick" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-quick">Hızlı AI Sorular</TabsTrigger>
          <TabsTrigger value="upload">PDF Yükleme</TabsTrigger>
          <TabsTrigger value="manual">Manuel Soru</TabsTrigger>
          <TabsTrigger value="ai">Gelişmiş AI</TabsTrigger>
        </TabsList>

        {/* Hızlı AI Soru Üretimi Tab */}
        <TabsContent value="ai-quick">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Hızlı AI Soru Üretimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* TYT Kategorileri */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">TYT Soruları</h3>
                  <div className="grid gap-2">
                    <Button
                      onClick={() => generateAIQuestions('tyt-turkce', 5)}
                      disabled={aiGenerating}
                      variant="outline"
                      className="justify-start"
                    >
                      {aiGenerating ? 'Üretiliyor...' : 'TYT Türkçe (5 soru)'}
                    </Button>
                    <Button
                      onClick={() => generateAIQuestions('tyt-matematik', 5)}
                      disabled={aiGenerating}
                      variant="outline"
                      className="justify-start"
                    >
                      {aiGenerating ? 'Üretiliyor...' : 'TYT Matematik (5 soru)'}
                    </Button>
                  </div>
                </div>

                {/* AYT Kategorileri */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">AYT Soruları</h3>
                  <div className="grid gap-2">
                    <Button
                      onClick={() => generateAIQuestions('ayt-matematik', 5)}
                      disabled={aiGenerating}
                      variant="outline"
                      className="justify-start"
                    >
                      {aiGenerating ? 'Üretiliyor...' : 'AYT Matematik (5 soru)'}
                    </Button>
                    <Button
                      onClick={() => generateAIQuestions('ayt-fizik', 5)}
                      disabled={aiGenerating}
                      variant="outline"
                      className="justify-start"
                    >
                      {aiGenerating ? 'Üretiliyor...' : 'AYT Fizik (5 soru)'}
                    </Button>
                    <Button
                      onClick={() => generateAIQuestions('ayt-kimya', 5)}
                      disabled={aiGenerating}
                      variant="outline"
                      className="justify-start"
                    >
                      {aiGenerating ? 'Üretiliyor...' : 'AYT Kimya (5 soru)'}
                    </Button>
                    <Button
                      onClick={() => generateAIQuestions('ayt-biyoloji', 5)}
                      disabled={aiGenerating}
                      variant="outline"
                      className="justify-start"
                    >
                      {aiGenerating ? 'Üretiliyor...' : 'AYT Biyoloji (5 soru)'}
                    </Button>
                  </div>
                </div>

                {/* Diğer Kategoriler */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Diğer Sınavlar</h3>
                  <div className="grid gap-2">
                    <Button
                      onClick={() => generateAIQuestions('kpss', 5)}
                      disabled={aiGenerating}
                      variant="outline"
                      className="justify-start"
                    >
                      {aiGenerating ? 'Üretiliyor...' : 'KPSS (5 soru)'}
                    </Button>
                    <Button
                      onClick={() => generateAIQuestions('ehliyet', 5)}
                      disabled={aiGenerating}
                      variant="outline"
                      className="justify-start"
                    >
                      {aiGenerating ? 'Üretiliyor...' : 'Ehliyet (5 soru)'}
                    </Button>
                  </div>
                </div>
              </div>
              
              {aiGenerating && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-blue-700">AI sorular üretiyor, lütfen bekleyin...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PDF Yükleme Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                PDF Soru Yükleme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="max-w-md">
                  <Label htmlFor="exam-type">Sınav Türü</Label>
                  <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sınav türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium mb-2">
                        {isUploading ? "PDF İşleniyor..." : `${selectedExamType.toUpperCase()} PDF Dosyası Seçin`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Maksimum dosya boyutu: 200MB
                      </p>
                    </div>
                  </label>
                </div>
                
                {isUploading && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      PDF dosyası işleniyor, lütfen bekleyin...
                    </p>
                  </div>
                )}
                
                {/* PDF Analiz Sonucu ve Onay */}
                {pdfAnalysisResult && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-3 text-blue-900">
                      PDF Analizi Tamamlandı
                    </h3>
                    <p className="text-blue-800 mb-4">
                      <strong>{pdfAnalysisResult.detectedQuestions} soru tespit edildi</strong>
                    </p>
                    
                    {pdfAnalysisResult.preview && pdfAnalysisResult.preview.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2 text-blue-900">Örnek Sorular:</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {pdfAnalysisResult.preview.map((question: any, index: number) => (
                            <div key={index} className="bg-white p-3 rounded border text-sm">
                              <p className="font-medium">{question.questionText}</p>
                              <div className="mt-1 text-xs text-gray-600">
                                Kategori: {question.subject || 'N/A'} | Zorluk: {question.difficulty}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => confirmPDFQuestions(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Evet, Veritabanına Ekle
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => confirmPDFQuestions(false)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        İptal Et
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manuel Soru Ekleme Tab */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Manuel Soru Ekleme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question-text">Soru Metni</Label>
                <Textarea
                  id="question-text"
                  placeholder="Soru metnini buraya yazın..."
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {newQuestion.options.map((option, index) => (
                  <div key={index}>
                    <Label htmlFor={`option-${index}`}>Seçenek {String.fromCharCode(65 + index)}</Label>
                    <Input
                      id={`option-${index}`}
                      placeholder={`${String.fromCharCode(65 + index)} şıkkı`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion(prev => ({ ...prev, options: newOptions }));
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="correct-answer">Doğru Cevap</Label>
                  <Select 
                    value={newQuestion.correctAnswer.toString()} 
                    onValueChange={(value) => setNewQuestion(prev => ({ ...prev, correctAnswer: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Doğru şık" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">A şıkkı</SelectItem>
                      <SelectItem value="1">B şıkkı</SelectItem>
                      <SelectItem value="2">C şıkkı</SelectItem>
                      <SelectItem value="3">D şıkkı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="question-category">Kategori</Label>
                  <Select 
                    value={newQuestion.category} 
                    onValueChange={(value) => setNewQuestion(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tyt-turkce">TYT Türkçe</SelectItem>
                      <SelectItem value="tyt-matematik">TYT Matematik</SelectItem>
                      <SelectItem value="tyt-fen">TYT Fen</SelectItem>
                      <SelectItem value="tyt-sosyal">TYT Sosyal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="difficulty">Zorluk</Label>
                  <Select 
                    value={newQuestion.difficulty} 
                    onValueChange={(value) => setNewQuestion(prev => ({ ...prev, difficulty: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Zorluk seçin" />
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
                <Label htmlFor="explanation">Açıklama</Label>
                <Textarea
                  id="explanation"
                  placeholder="Sorunun açıklaması..."
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
              
              <Button 
                onClick={handleCreateQuestion}
                disabled={createQuestionMutation.isPending}
                className="w-full"
              >
                {createQuestionMutation.isPending ? 'Soru Oluşturuluyor...' : 'Soru Ekle'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Soru Üretimi Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI ile Soru Üretimi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ai-exam-type">Sınav Türü</Label>
                  <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sınav türü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="question-count">Soru Sayısı</Label>
                  <Input
                    id="question-count"
                    type="number"
                    min="1"
                    max="100"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
                    placeholder="Kaç soru üretilsin?"
                  />
                </div>
              </div>
              
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <Zap className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">AI Soru Üretimi</h3>
                <p className="text-gray-600 mb-4">
                  {questionCount} adet {selectedExamType.toUpperCase()} sorusu üretilecek
                </p>
                <Button 
                  onClick={handleGenerateQuestions}
                  disabled={isGenerating}
                  size="lg"
                >
                  {isGenerating ? 'Sorular Üretiliyor...' : 'AI ile Soru Üret'}
                </Button>
              </div>
              
              {isGenerating && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">
                    AI sorularınızı oluşturuyor, lütfen bekleyin...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detaylı İstatistikler Tab */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Kayıtlı Kullanıcı:</span>
                  <Badge variant="outline">{adminStats?.activeUsers || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Quiz Oturumu:</span>
                  <Badge variant="default">{adminStats?.dailyQuizzes || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Premium Kullanıcı:</span>
                  <Badge variant="secondary">{adminStats?.premiumUsers || 0}</Badge>
                </div>

              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Soru & Eğitim İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Toplam Soru:</span>
                  <Badge variant="outline">{adminStats?.totalQuestions || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>TYT Soruları:</span>
                  <Badge variant="default">{adminStats?.tytQuestions || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>KPSS Soruları:</span>
                  <Badge variant="secondary">{adminStats?.kpssQuestions || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Eğitim Materyali:</span>
                  <Badge variant="destructive">{adminStats?.educationMaterials || 0}</Badge>
                </div>

              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}