import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Brain, 
  TrendingUp,
  FileText,
  Video,
  PlusCircle,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ClassAnalytics {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  averageScore: number;
  completionRate: number;
  strugglingStudents: Array<{ id: string; name: string; score: number }>;
  topPerformers: Array<{ id: string; name: string; score: number }>;
}

interface StudentInsight {
  studentId: string;
  name: string;
  email: string;
  overallProgress: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  lastActivity: Date;
}

export default function TeacherDashboard() {
  const [selectedClass, setSelectedClass] = useState('demo-class-123');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration
  const mockClasses = [
    { id: 'demo-class-123', name: 'YKS Matematik 2025', subject: 'Matematik', students: 28 },
    { id: 'demo-class-456', name: 'KPSS Türkçe', subject: 'Türkçe', students: 35 },
    { id: 'demo-class-789', name: 'Ehliyet Teorik', subject: 'Trafik', students: 42 }
  ];

  const mockAnalytics: ClassAnalytics = {
    totalStudents: 28,
    activeStudents: 24,
    averageProgress: 73.5,
    averageScore: 78.2,
    completionRate: 85.7,
    strugglingStudents: [
      { id: '1', name: 'Ahmet Yılmaz', score: 45 },
      { id: '2', name: 'Fatma Kaya', score: 52 },
      { id: '3', name: 'Mehmet Öz', score: 48 }
    ],
    topPerformers: [
      { id: '4', name: 'Ayşe Demir', score: 96 },
      { id: '5', name: 'Ali Şen', score: 94 },
      { id: '6', name: 'Zehra Can', score: 92 }
    ]
  };

  const { data: classAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/teacher/classes', selectedClass, 'analytics'],
    queryFn: () => apiRequest('GET', `/api/teacher/classes/${selectedClass}/analytics`).then(res => res.json()),
    enabled: !!selectedClass
  });

  const { data: studentInsights } = useQuery({
    queryKey: ['/api/teacher/students', selectedStudent, 'insights'],
    queryFn: () => apiRequest('GET', `/api/teacher/students/${selectedStudent}/insights`).then(res => res.json()),
    enabled: !!selectedStudent
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (assignmentData: any) => 
      apiRequest('POST', '/api/teacher/assignments', assignmentData).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Ödev Oluşturuldu",
        description: "Ödev başarıyla oluşturuldu ve öğrencilere atandı.",
      });
      setShowCreateAssignment(false);
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/classes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: "Ödev oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  });

  const generateCustomQuizMutation = useMutation({
    mutationFn: (quizData: any) => 
      apiRequest('POST', '/api/teacher/custom-quiz', quizData).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "AI Quiz Oluşturuldu",
        description: "AI tarafından özelleştirilmiş quiz başarıyla oluşturuldu.",
      });
    }
  });

  const handleCreateAIQuiz = () => {
    generateCustomQuizMutation.mutate({
      studentIds: mockAnalytics.strugglingStudents.map(s => s.id),
      topic: 'Matematik Temel Kavramlar',
      difficulty: 3,
      questionCount: 10,
      focusAreas: ['Cebir', 'Geometri', 'Sayılar']
    });
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Öğretmen Paneli
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              AI destekli sınıf yönetimi ve öğrenci analitikleri
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowCreateAssignment(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Yeni Ödev
            </Button>
            <Button variant="outline" onClick={handleCreateAIQuiz}>
              <Brain className="w-4 h-4 mr-2" />
              AI Quiz Oluştur
            </Button>
          </div>
        </div>

        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Sınıflarım</CardTitle>
            <CardDescription>Yönettiğiniz sınıfları seçin ve analiz edin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockClasses.map((classItem) => (
                <Card 
                  key={classItem.id}
                  className={`cursor-pointer transition-all ${
                    selectedClass === classItem.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setSelectedClass(classItem.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{classItem.name}</h3>
                        <p className="text-sm text-muted-foreground">{classItem.subject}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span className="text-sm">{classItem.students}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="students">Öğrenci Detayları</TabsTrigger>
            <TabsTrigger value="content">İçerik Yönetimi</TabsTrigger>
            <TabsTrigger value="ai-tools">AI Araçları</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Toplam Öğrenci</p>
                      <p className="text-3xl font-bold">{mockAnalytics.totalStudents}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Aktif Öğrenci</p>
                      <p className="text-3xl font-bold">{mockAnalytics.activeStudents}</p>
                      <p className="text-sm text-green-600">
                        %{((mockAnalytics.activeStudents / mockAnalytics.totalStudents) * 100).toFixed(1)} aktiflik
                      </p>
                    </div>
                    <GraduationCap className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ortalama Skor</p>
                      <p className="text-3xl font-bold">{mockAnalytics.averageScore}</p>
                      <p className="text-sm text-blue-600">Sınıf ortalaması</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tamamlama Oranı</p>
                      <p className="text-3xl font-bold">{mockAnalytics.completionRate}%</p>
                      <p className="text-sm text-green-600">Hedefin üzerinde</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                    Destek Gereken Öğrenciler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockAnalytics.strugglingStudents.map((student) => (
                    <div 
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30"
                      onClick={() => setSelectedStudent(student.id)}
                    >
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">Skor: {student.score}/100</div>
                      </div>
                      <Badge variant="destructive">Dikkat</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Başarılı Öğrenciler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockAnalytics.topPerformers.map((student) => (
                    <div 
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30"
                      onClick={() => setSelectedStudent(student.id)}
                    >
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">Skor: {student.score}/100</div>
                      </div>
                      <Badge variant="secondary">Mükemmel</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Öğrenci Detaylı Analizi</CardTitle>
                <CardDescription>
                  AI destekli bireysel öğrenci performans analizi
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Genel Performans</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Genel İlerleme</span>
                              <span className="text-sm font-medium">68%</span>
                            </div>
                            <Progress value={68} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Quiz Performansı</span>
                              <span className="text-sm font-medium">74%</span>
                            </div>
                            <Progress value={74} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Video İzleme</span>
                              <span className="text-sm font-medium">82%</span>
                            </div>
                            <Progress value={82} className="h-2" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">AI Önerileri</h3>
                        <div className="space-y-2">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Güçlü Yönler
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                              Geometri, Problem Çözme
                            </div>
                          </div>
                          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-sm font-medium text-orange-800 dark:text-orange-200">
                              Gelişim Alanları
                            </div>
                            <div className="text-sm text-orange-600 dark:text-orange-400">
                              Cebir, Fonksiyonlar
                            </div>
                          </div>
                          <Badge className="mt-2">Orta Risk Seviyesi</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Detaylı analiz için bir öğrenci seçin
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>İçerik Yönetimi</CardTitle>
                <CardDescription>
                  Dersler, ödevler ve quiz'ler oluşturun ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="w-8 h-8 mx-auto mb-4 text-blue-500" />
                      <h3 className="font-semibold mb-2">Ders Planları</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        AI destekli ders planı oluşturun
                      </p>
                      <Button size="sm" className="w-full">
                        Yeni Plan Oluştur
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <Video className="w-8 h-8 mx-auto mb-4 text-purple-500" />
                      <h3 className="font-semibold mb-2">Video Dersler</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        İnteraktif video içerikleri yükleyin
                      </p>
                      <Button size="sm" className="w-full" variant="outline">
                        Video Yükle
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <Brain className="w-8 h-8 mx-auto mb-4 text-green-500" />
                      <h3 className="font-semibold mb-2">AI Quiz</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Özelleştirilmiş sorular oluşturun
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full" 
                        variant="outline"
                        onClick={handleCreateAIQuiz}
                        disabled={generateCustomQuizMutation.isPending}
                      >
                        {generateCustomQuizMutation.isPending ? 'Oluşturuluyor...' : 'AI Quiz Oluştur'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  AI Öğretmen Araçları
                </CardTitle>
                <CardDescription>
                  Yapay zeka destekli öğretim araçları ve analitkler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Adaptif Öğrenme Motoru</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <span className="text-sm font-medium">Aktif Öğrenci</span>
                          <Badge>18 / 28</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <span className="text-sm font-medium">Zorluk Ayarlaması</span>
                          <Badge variant="secondary">Otomatik</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="text-sm font-medium">Performans Artışı</span>
                          <Badge variant="secondary">+23%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Tahmine Dayalı Analiz</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div>
                            <div className="text-sm font-medium">Sınav Başarı Tahmini</div>
                            <div className="text-xs text-muted-foreground">YKS 2025</div>
                          </div>
                          <div className="text-lg font-bold text-green-600">84%</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div>
                            <div className="text-sm font-medium">Risk Altındaki Öğrenci</div>
                            <div className="text-xs text-muted-foreground">Müdahale gerekli</div>
                          </div>
                          <div className="text-lg font-bold text-yellow-600">3</div>
                        </div>
                        <Button size="sm" className="w-full">
                          Detaylı Rapor Görüntüle
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Assignment Modal */}
        {showCreateAssignment && (
          <Card className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Yeni Ödev Oluştur</CardTitle>
                  <CardDescription>
                    AI destekli ödev oluşturun ve öğrencilerinize atayın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Ödev Başlığı</Label>
                      <Input id="title" placeholder="Matematik Quiz 1" />
                    </div>
                    <div>
                      <Label htmlFor="type">Ödev Türü</Label>
                      <select className="w-full p-2 border rounded">
                        <option value="quiz">Quiz</option>
                        <option value="video">Video İzleme</option>
                        <option value="practice">Pratik Egzersiz</option>
                        <option value="exam">Sınav</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea id="description" placeholder="Ödev açıklaması..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dueDate">Son Teslim Tarihi</Label>
                      <Input id="dueDate" type="datetime-local" />
                    </div>
                    <div>
                      <Label htmlFor="passingScore">Geçme Notu</Label>
                      <Input id="passingScore" type="number" placeholder="70" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={() => setShowCreateAssignment(false)}>
                      İptal
                    </Button>
                    <Button 
                      onClick={() => createAssignmentMutation.mutate({
                        classId: selectedClass,
                        title: 'Matematik Quiz 1',
                        description: 'AI destekli matematik quiz',
                        type: 'quiz',
                        content: { questions: [] },
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        maxAttempts: 3,
                        passingScore: 70
                      })}
                      disabled={createAssignmentMutation.isPending}
                    >
                      {createAssignmentMutation.isPending ? 'Oluşturuluyor...' : 'Ödev Oluştur'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}