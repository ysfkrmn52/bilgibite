import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Brain, Zap, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ExamCategory {
  id: string;
  name: string;
}

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  topic: string;
}

const examCategories = [
  { id: 'yks', name: 'YKS (TYT/AYT)' },
  { id: 'kpss', name: 'KPSS' },
  { id: 'ehliyet', name: 'Ehliyet' },
  { id: 'src', name: 'SRC Sınavı' },
  { id: 'ales', name: 'ALES' },
  { id: 'dgs', name: 'DGS' },
  { id: 'meb-ogretmenlik', name: 'MEB Öğretmenlik' }
];

export default function AdminAIQuestions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  // Get question counts
  const { data: questionCounts } = useQuery({
    queryKey: ['/api/questions/counts'],
    queryFn: () => fetch('/api/questions/counts').then(res => res.json())
  });

  const generateQuestionsMutation = useMutation({
    mutationFn: async ({ category, count }: { category: string, count: number }) => {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          examCategory: category, 
          count: count,
          difficulty: 'medium',
          topics: []
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
      setSavedCount(data.savedCount || generatedQuestions.length);
      setGeneratedQuestions([]);
      queryClient.invalidateQueries({ queryKey: ['/api/questions/counts'] });
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gelişmiş AI Soru Üretimi
          </h1>
          <p className="text-gray-600">
            YKS, KPSS, Ehliyet, SRC, ALES, DGS ve MEB Öğretmenlik alanlarında AI ile soru üretin
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Soru Üretimi Paneli */}
          <div className="space-y-6">
            {/* Kategori ve Sayı Seçimi */}
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
                      {examCategories.map((category) => (
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
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

            {/* Mevcut Soru Sayıları */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Kategori Başına Soru Sayıları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {examCategories.map(category => {
                    const count = getCategoryCount(category.id);
                    const isReady = count >= 100;
                    return (
                      <div key={category.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{category.name}</span>
                          <div className="text-sm text-gray-500">{count} soru</div>
                        </div>
                        <Badge variant={isReady ? "default" : "secondary"}>
                          {isReady ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Üretilen Sorular */}
          <div className="space-y-6">
            {generatedQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Üretilen Sorular ({generatedQuestions.length})</span>
                    <Button 
                      onClick={handleSaveQuestions}
                      disabled={saveQuestionsMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saveQuestionsMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Tümünü Kaydet
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto space-y-4">
                  {generatedQuestions.map((question, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">{question.topic}</Badge>
                        <Badge 
                          variant={question.difficulty === 'easy' ? 'secondary' : 
                                 question.difficulty === 'hard' ? 'destructive' : 'default'}
                        >
                          {question.difficulty}
                        </Badge>
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
                </CardContent>
              </Card>
            )}

            {savedCount > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {savedCount} soru başarıyla veritabanına kaydedildi!
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}