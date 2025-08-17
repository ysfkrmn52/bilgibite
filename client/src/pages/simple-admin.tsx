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
import { Upload, Users, BookOpen, Target, Zap, Plus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function SimpleAdmin() {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState('tyt');
  const [selectedCategory, setSelectedCategory] = useState('turkce');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
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

  // Admin istatistikleri query
  const { data: adminStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: () => apiRequest('GET', '/api/admin/stats')
  });

  const uploadPDFMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/exam/${selectedExamType}/process-pdf`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "PDF Başarıyla Yüklendi!",
        description: `${data.processedQuestions} soru veritabanına eklendi`,
      });
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
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

  const generateQuestionsMutation = useMutation({
    mutationFn: async ({ count, category }: { count: number; category: string }) => {
      return await apiRequest('POST', '/api/admin/generate-questions', { 
        count, 
        category,
        examType: selectedExamType
      });
    },
    onSuccess: (data) => {
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

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast({
        title: "Dosya Çok Büyük",
        description: "Maksimum dosya boyutu 50MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    uploadPDFMutation.mutate(file);
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
      category: selectedCategory 
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
      <h1 className="text-3xl font-bold mb-8">BilgiBite Admin Panel</h1>
      
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

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">PDF Yükleme</TabsTrigger>
          <TabsTrigger value="manual">Manuel Soru</TabsTrigger>
          <TabsTrigger value="ai">AI Soru Üretimi</TabsTrigger>
          <TabsTrigger value="stats">Detaylı İstatistikler</TabsTrigger>
        </TabsList>

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
                <div className="grid grid-cols-2 gap-4">
                  <div>
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
                  
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                        {isUploading ? "PDF İşleniyor..." : `${selectedExamType.toUpperCase()} - ${selectedCategory} PDF Dosyası Seçin`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Maksimum dosya boyutu: 50MB
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
              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="ai-category">Kategori</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
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
                  {questionCount} adet {selectedExamType.toUpperCase()} - {selectedCategory} sorusu üretilecek
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
                  <span>Toplam Kullanıcı:</span>
                  <Badge variant="outline">{adminStats?.totalUsers || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Aktif Kullanıcı:</span>
                  <Badge variant="default">{adminStats?.activeUsers || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ücretsiz Kullanıcı:</span>
                  <Badge variant="secondary">{adminStats?.freeUsers || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ücretli Kullanıcı:</span>
                  <Badge variant="destructive">{adminStats?.premiumUsers || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Çevrimiçi:</span>
                  <Badge className="bg-green-500">{adminStats?.onlineUsers || 0}</Badge>
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
                <div className="flex justify-between items-center">
                  <span>Günlük Quiz:</span>
                  <Badge className="bg-purple-500">{adminStats?.dailyQuizzes || 0}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}