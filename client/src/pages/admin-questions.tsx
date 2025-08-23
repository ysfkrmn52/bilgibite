import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Book, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EXAM_CATEGORIES } from '@shared/categories';

interface Question {
  id: string;
  examCategoryId: string;
  subject: string;
  difficulty: string;
  questionType: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  points: number;
  topic: string | null;
  year: number | null;
  questionNumber: number | null;
  createdAt: string;
}

interface ExamCategory {
  id: string;
  name: string;
}



export default function AdminQuestions() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading: questionsLoading, refetch } = useQuery({
    queryKey: ['/api/questions', selectedCategory],
    enabled: !!selectedCategory
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Soru silinemedi');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Soru başarıyla silindi",
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Soru silinirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Soru Yönetimi
          </h1>
          <p className="text-gray-600">
            Veritabanındaki tüm soruları kategori seçerek görüntüleyin
          </p>
        </div>

        {/* Category Selection */}
        <Card className="mb-6 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              Kategori Seçimi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Sınav kategorisi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedCategory && (
                <Button onClick={() => refetch()} variant="outline">
                  Yenile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions Display */}
        {selectedCategory && (
          <div className="space-y-4">
            {questionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2">Sorular yükleniyor...</span>
              </div>
            ) : questions.length === 0 ? (
              <Card className="bg-white">
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Bu kategoride henüz soru bulunmuyor.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                      <div className="text-sm text-gray-600">Toplam Soru</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {questions.filter((q: Question) => q.difficulty === 'easy').length}
                      </div>
                      <div className="text-sm text-gray-600">Kolay</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {questions.filter((q: Question) => q.difficulty === 'medium').length}
                      </div>
                      <div className="text-sm text-gray-600">Orta</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {questions.filter((q: Question) => q.difficulty === 'hard').length}
                      </div>
                      <div className="text-sm text-gray-600">Zor</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Questions List */}
                {questions.map((question: Question, index: number) => (
                  <Card key={question.id} className="bg-white">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">
                            #{index + 1}
                          </span>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            {question.subject}
                          </Badge>
                          {question.points && (
                            <Badge variant="outline">
                              {question.points} puan
                            </Badge>
                          )}
                        </div>
                        <Button
                          onClick={() => deleteQuestionMutation.mutate(question.id)}
                          disabled={deleteQuestionMutation.isPending}
                          variant="destructive"
                          size="sm"
                          className="ml-2"
                        >
                          {deleteQuestionMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Sil
                        </Button>
                        <div className="text-xs text-gray-400">
                          {new Date(question.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Question Text */}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-3">
                          {question.questionText}
                        </h3>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(Array.isArray(question.options) ? question.options : []).map((option: any, optionIndex: number) => {
                          const optionText = typeof option === 'string' ? option : option?.text || `Seçenek ${getOptionLetter(optionIndex)}`;
                          const isCorrect = optionIndex === question.correctAnswer;
                          
                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-lg border-2 flex items-center gap-3 ${
                                isCorrect 
                                  ? 'bg-green-50 border-green-300' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                isCorrect 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-300 text-gray-600'
                              }`}>
                                {getOptionLetter(optionIndex)}
                              </div>
                              <span className="flex-1 text-gray-800">
                                {optionText}
                              </span>
                              {isCorrect && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {question.explanation && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Açıklama:</h4>
                          <p className="text-blue-800">{question.explanation}</p>
                        </div>
                      )}

                      {/* Additional Info */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-2 border-t">
                        <span>ID: {question.id.slice(0, 8)}...</span>
                        {question.topic && <span>Konu: {question.topic}</span>}
                        {question.year && <span>Yıl: {question.year}</span>}
                        {question.questionNumber && <span>Soru No: {question.questionNumber}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}