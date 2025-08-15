import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Upload, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  Trash2,
  Edit,
  Eye,
  Download,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  totalXP: number;
  streakCount: number;
  lastActive: string;
  joinDate: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [selectedTab, setSelectedTab] = useState('overview');
  const [questionFilter, setQuestionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Question form state
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    category: '',
    difficulty: 'beginner' as const,
    tags: [] as string[]
  });

  // Queries
  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ['/api/admin/questions'],
    queryFn: () => apiRequest('GET', '/api/admin/questions').then(res => res.json())
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => apiRequest('GET', '/api/admin/users').then(res => res.json())
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: () => apiRequest('GET', '/api/admin/stats').then(res => res.json())
  });

  // Mutations
  const createQuestionMutation = useMutation({
    mutationFn: (questionData: any) => 
      apiRequest('POST', '/api/admin/questions', questionData),
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Soru başarıyla eklendi',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      resetQuestionForm();
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Soru eklenirken hata oluştu',
        variant: 'destructive'
      });
    }
  });

  const uploadFileMutation = useMutation({
    mutationFn: (formData: FormData) => 
      apiRequest('POST', '/api/admin/upload-questions', formData),
    onSuccess: (response) => {
      toast({
        title: 'Başarılı',
        description: `${response.count} soru başarıyla yüklendi`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      setIsUploading(false);
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Dosya yüklenirken hata oluştu',
        variant: 'destructive'
      });
      setIsUploading(false);
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) =>
      apiRequest('DELETE', `/api/admin/questions/${questionId}`),
    onSuccess: () => {
      toast({
        title: 'Başarılı',
        description: 'Soru silindi',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
    }
  });

  // Functions
  const resetQuestionForm = () => {
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      category: '',
      difficulty: 'beginner',
      tags: []
    });
  };

  const handleCreateQuestion = () => {
    if (!newQuestion.question || !newQuestion.options.every(opt => opt.trim())) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm alanları doldurun',
        variant: 'destructive'
      });
      return;
    }

    createQuestionMutation.mutate(newQuestion);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Supported formats: PDF, TXT, JSON
    const supportedFormats = ['application/pdf', 'text/plain', 'application/json'];
    if (!supportedFormats.includes(file.type)) {
      toast({
        title: 'Hata',
        description: 'Desteklenen formatlar: PDF, TXT, JSON',
        variant: 'destructive'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    uploadFileMutation.mutate(formData);
  };

  const filteredQuestions = questions.filter((q: Question) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = questionFilter === 'all' || q.difficulty === questionFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">BilgiBite yönetim paneli - Tüm sistem kontrolü</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Genel
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Sorular
            </TabsTrigger>
            <TabsTrigger value="add-question" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Soru Ekle
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Toplu Yükle
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Ayarlar
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Toplam Soru</p>
                      <p className="text-3xl font-bold">{stats?.totalQuestions || 0}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Aktif Kullanıcı</p>
                      <p className="text-3xl font-bold">{stats?.activeUsers || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Günlük Quiz</p>
                      <p className="text-3xl font-bold">{stats?.dailyQuizzes || 0}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Başarı Oranı</p>
                      <p className="text-3xl font-bold">{stats?.successRate || 0}%</p>
                    </div>
                    <RefreshCw className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
                <CardDescription>Sistemdeki son hareketler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentActivities?.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{activity.description}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions Management Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Soru Yönetimi</CardTitle>
                    <CardDescription>Tüm soruları görüntüle ve yönet</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Soru ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                        data-testid="search-questions"
                      />
                    </div>
                    <Select value={questionFilter} onValueChange={setQuestionFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Hepsi</SelectItem>
                        <SelectItem value="beginner">Başlangıç</SelectItem>
                        <SelectItem value="intermediate">Orta</SelectItem>
                        <SelectItem value="advanced">İleri</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {questionsLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredQuestions.map((question: Question) => (
                      <Card key={question.id} className="border border-muted">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium mb-2">{question.question}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{question.category}</Badge>
                                <Badge variant={
                                  question.difficulty === 'beginner' ? 'default' :
                                  question.difficulty === 'intermediate' ? 'secondary' : 
                                  'destructive'
                                }>
                                  {question.difficulty}
                                </Badge>
                                {question.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {question.options.length} seçenek
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" data-testid={`view-question-${question.id}`}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" data-testid={`edit-question-${question.id}`}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteQuestionMutation.mutate(question.id)}
                                data-testid={`delete-question-${question.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Question Tab */}
          <TabsContent value="add-question" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Yeni Soru Ekle</CardTitle>
                <CardDescription>Manuel olarak tek soru ekleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="question">Soru Metni</Label>
                  <Textarea
                    id="question"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                    placeholder="Sorunuzu buraya yazın..."
                    className="mt-1"
                    data-testid="input-question-text"
                  />
                </div>

                <div>
                  <Label>Seçenekler</Label>
                  <div className="space-y-2 mt-2">
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index] = e.target.value;
                            setNewQuestion({...newQuestion, options: newOptions});
                          }}
                          placeholder={`${String.fromCharCode(65 + index)} seçeneği`}
                          data-testid={`input-option-${index}`}
                        />
                        <Button
                          type="button"
                          variant={newQuestion.correctAnswer === index ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewQuestion({...newQuestion, correctAnswer: index})}
                          data-testid={`button-correct-${index}`}
                        >
                          Doğru
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="yks">YKS</SelectItem>
                        <SelectItem value="kpss">KPSS</SelectItem>
                        <SelectItem value="ehliyet">Ehliyet</SelectItem>
                        <SelectItem value="src">SRC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Zorluk</Label>
                    <Select
                      value={newQuestion.difficulty}
                      onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                        setNewQuestion({...newQuestion, difficulty: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Başlangıç</SelectItem>
                        <SelectItem value="intermediate">Orta</SelectItem>
                        <SelectItem value="advanced">İleri</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="explanation">Açıklama</Label>
                  <Textarea
                    id="explanation"
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                    placeholder="Sorunun açıklaması..."
                    className="mt-1"
                    data-testid="input-explanation"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetQuestionForm}>
                    Temizle
                  </Button>
                  <Button 
                    onClick={handleCreateQuestion}
                    disabled={createQuestionMutation.isPending}
                    data-testid="button-create-question"
                  >
                    {createQuestionMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Soru Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* File Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Toplu Soru Yükleme</CardTitle>
                <CardDescription>PDF, TXT veya JSON dosyasından toplu soru yükleyin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Dosya Yükle</h3>
                  <p className="text-muted-foreground mb-4">
                    PDF, TXT veya JSON dosyanızı sürükleyin veya seçin
                  </p>
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.txt,.json"
                    className="hidden"
                    data-testid="file-upload-input"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    data-testid="button-upload-file"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Dosya Seç
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <FileText className="w-8 h-8 text-blue-500 mb-2" />
                      <h4 className="font-semibold">PDF Format</h4>
                      <p className="text-sm text-muted-foreground">
                        Yapılandırılmış PDF dosyalarından soru çıkarımı
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <FileText className="w-8 h-8 text-green-500 mb-2" />
                      <h4 className="font-semibold">TXT Format</h4>
                      <p className="text-sm text-muted-foreground">
                        Düz metin dosyasından yapılandırılmış soru ayrıştırma
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <FileText className="w-8 h-8 text-purple-500 mb-2" />
                      <h4 className="font-semibold">JSON Format</h4>
                      <p className="text-sm text-muted-foreground">
                        Yapılandırılmış JSON verilerinden doğrudan import
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Dosya Format Örnekleri:</h4>
                  <div className="text-sm space-y-2">
                    <p><strong>JSON:</strong> {'[{"question": "...", "options": [...], "correctAnswer": 0, ...}]'}</p>
                    <p><strong>TXT:</strong> Her soru yeni satırda, seçenekler A), B), C), D) formatında</p>
                    <p><strong>PDF:</strong> Standart soru bankası formatı (AI ile ayrıştırılır)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Yönetimi</CardTitle>
                <CardDescription>Tüm kullanıcıları görüntüle ve yönet</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user: User) => (
                      <Card key={user.id} className="border border-muted">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-semibold">{user.username}</h4>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-xs">Seviye {user.level}</span>
                                  <span className="text-xs">{user.totalXP} XP</span>
                                  <span className="text-xs">{user.streakCount} gün seri</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Son aktif</p>
                              <p className="text-sm">{user.lastActive}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Genel Ayarlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Sistem Adı</Label>
                    <Input defaultValue="BilgiBite" className="mt-1" />
                  </div>
                  <div>
                    <Label>Günlük Quiz Limiti</Label>
                    <Input type="number" defaultValue="50" className="mt-1" />
                  </div>
                  <div>
                    <Label>XP Katsayısı</Label>
                    <Input type="number" step="0.1" defaultValue="1.0" className="mt-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>İçerik Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Varsayılan Zorluk</Label>
                    <Select defaultValue="intermediate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Başlangıç</SelectItem>
                        <SelectItem value="intermediate">Orta</SelectItem>
                        <SelectItem value="advanced">İleri</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Soru Onay Süreci</Label>
                    <Select defaultValue="manual">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Otomatik</SelectItem>
                        <SelectItem value="manual">Manuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Bakım İşlemleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Veri Yedekle
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Cache Temizle
                  </Button>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Log Temizle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}