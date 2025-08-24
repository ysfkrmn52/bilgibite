import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Edit, Trash2, ArrowLeft, Target } from 'lucide-react';
import { EXAM_CATEGORIES } from '../../../shared/categories';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: string;
  category: string;
  createdAt: string;
}

export default function AdminQuestions() {
  const [searchTerm, setSearchTerm] = useState('');
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = window.location.pathname.split('/').pop();
  const selectedCategory = categoryParam || 'all';
  
  const category = EXAM_CATEGORIES.find(cat => cat.id === selectedCategory);
  const categoryName = category?.name || 'Tüm Kategoriler';

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions', selectedCategory],
    queryFn: () => {
      const url = selectedCategory === 'all' 
        ? '/api/questions'
        : `/api/questions/${selectedCategory}`;
      return fetch(url).then(res => res.json());
    }
  });

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.options.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'kolay': return 'bg-green-100 text-green-700';
      case 'orta': return 'bg-yellow-100 text-yellow-700';
      case 'zor': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                {categoryName} Soruları
              </h1>
              <p className="text-gray-600">
                Toplam {questions.length} soru bulundu
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Sorularda ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {filteredQuestions.length} sonuç
          </Badge>
        </div>

        {/* Questions List */}
        <div className="grid gap-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base leading-relaxed flex-1">
                    {question.text}
                  </CardTitle>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Options */}
                <div className="grid gap-2">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        index === question.correctAnswer
                          ? 'bg-green-50 border-green-200 text-green-900 font-medium'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + index)})
                      </span>
                      {option}
                      {index === question.correctAnswer && (
                        <span className="ml-2 text-green-600 font-bold">✓</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">Açıklama:</h4>
                    <p className="text-blue-800 text-sm">{question.explanation}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <span>Kategori: {question.category}</span>
                    <span>ID: {question.id}</span>
                  </div>
                  <span>
                    {new Date(question.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredQuestions.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Soru Bulunamadı
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `"${searchTerm}" için hiçbir soru bulunamadı.`
                    : 'Bu kategoride henüz soru bulunmuyor.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}