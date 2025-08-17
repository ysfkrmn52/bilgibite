import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  RefreshCw,
  Brain,
  CheckCircle,
  AlertCircle,
  Shield,
  UserPlus,
  Crown,
  BookOpen,
  GraduationCap,
  Database,
  Layers,
  Server,
  Key,
  Package,
  Mail,
  Bell,
  Globe,
  Palette,
  Code,
  Zap,
  Activity,
  TrendingUp,
  FileX,
  FolderPlus,
  Cog,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  ChevronDown,
  MoreHorizontal,
  Save,
  X
} from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'teacher';
  permissions: string[];
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  aiQuestionLimit: number;
  maxFileSize: number;
  supportedFormats: string[];
  theme: 'light' | 'dark' | 'auto';
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  enrollmentCount: number;
  createdAt: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  studentsCount: number;
  coursesCount: number;
  isActive: boolean;
  joinedAt: string;
}

const ADMIN_ROLES = {
  super_admin: { name: 'Süper Admin', color: 'bg-red-100 text-red-800', icon: Crown },
  admin: { name: 'Admin', color: 'bg-blue-100 text-blue-800', icon: Shield },
  moderator: { name: 'Moderatör', color: 'bg-green-100 text-green-800', icon: UserCheck },
  teacher: { name: 'Öğretmen', color: 'bg-purple-100 text-purple-800', icon: GraduationCap }
};

const PERMISSIONS = [
  { id: 'users.read', name: 'Kullanıcı Görüntüleme', category: 'Kullanıcılar' },
  { id: 'users.write', name: 'Kullanıcı Düzenleme', category: 'Kullanıcılar' },
  { id: 'users.delete', name: 'Kullanıcı Silme', category: 'Kullanıcılar' },
  { id: 'content.read', name: 'İçerik Görüntüleme', category: 'İçerik' },
  { id: 'content.write', name: 'İçerik Düzenleme', category: 'İçerik' },
  { id: 'content.delete', name: 'İçerik Silme', category: 'İçerik' },
  { id: 'system.read', name: 'Sistem Ayarları Görüntüleme', category: 'Sistem' },
  { id: 'system.write', name: 'Sistem Ayarları Düzenleme', category: 'Sistem' },
  { id: 'analytics.read', name: 'Analitik Görüntüleme', category: 'Analitik' },
  { id: 'api.manage', name: 'API Yönetimi', category: 'Geliştirici' }
];

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showManualQuestionForm, setShowManualQuestionForm] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState('tyt');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // Form states
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    role: 'admin' as const,
    permissions: [] as string[]
  });

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    explanation: '',
    tags: [] as string[]
  });

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: 0,
    price: 0,
    isPublished: false
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'BilgiBite',
    siteDescription: 'AI destekli öğrenme platformu',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    aiQuestionLimit: 1000,
    maxFileSize: 10,
    supportedFormats: ['pdf', 'txt', 'json'],
    theme: 'light'
  });

  // Queries with proper typing
  const { data: adminStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/stats');
      return response as any;
    },
    refetchInterval: 30000 // Auto refresh every 30 seconds
  });

  const { data: adminUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      return response as unknown as AdminUser[];
    }
  });

  const { data: courses } = useQuery({
    queryKey: ['/api/admin/courses'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/courses');
      return response as unknown as Course[];
    }
  });

  const { data: teachers } = useQuery({
    queryKey: ['/api/admin/teachers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/teachers');
      return response as unknown as Teacher[];
    }
  });

  // Mutations
  const createAdminMutation = useMutation({
    mutationFn: (adminData: typeof newAdmin) => 
      apiRequest('POST', '/api/admin/create-admin', adminData),
    onSuccess: () => {
      toast({ title: 'Başarılı', description: 'Yeni admin oluşturuldu' });
      setShowCreateAdmin(false);
      setNewAdmin({ username: '', email: '', role: 'admin', permissions: [] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    }
  });

  const updateSystemSettingsMutation = useMutation({
    mutationFn: (settings: SystemSettings) => 
      apiRequest('PUT', '/api/admin/system-settings', settings),
    onSuccess: () => {
      toast({ title: 'Başarılı', description: 'Sistem ayarları güncellendi' });
    }
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string, isActive: boolean }) =>
      apiRequest('PUT', `/api/admin/users/${userId}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'Başarılı', description: 'Kullanıcı durumu güncellendi' });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiRequest('DELETE', `/api/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'Başarılı', description: 'Kullanıcı silindi' });
    }
  });

  const createQuestionMutation = useMutation({
    mutationFn: (questionData: typeof newQuestion) => 
      apiRequest('POST', '/api/admin/questions', questionData),
    onSuccess: () => {
      toast({ title: 'Başarılı', description: 'Soru başarıyla oluşturuldu' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      setShowCreateQuestion(false);
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        category: '',
        difficulty: 'medium',
        explanation: '',
        tags: []
      });
    }
  });

  const createCourseMutation = useMutation({
    mutationFn: (courseData: typeof newCourse) => 
      apiRequest('POST', '/api/admin/courses', courseData),
    onSuccess: () => {
      toast({ title: 'Başarılı', description: 'Kurs başarıyla oluşturuldu' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      setShowCreateCourse(false);
      setNewCourse({
        title: '',
        description: '',
        category: '',
        level: 'beginner',
        duration: 0,
        price: 0,
        isPublished: false
      });
    }
  });

  // General PDF processing mutation
  const processPDFMutation = useMutation({
    mutationFn: async ({ file, examType }: { file: File; examType: string }) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const fileContent = e.target?.result as string;
            
            console.log(`Dosya boyutu: ${fileContent.length} karakter`);
            setProcessingProgress(20);
            
            const response = await fetch(`/api/exam/${examType}/process-pdf`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ fileContent, examType })
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            setProcessingProgress(100);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => reject(new Error('Dosya okuma hatası'));
        reader.readAsText(file, 'utf-8');
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "PDF Başarıyla İşlendi!",
        description: `${data.processedQuestions} soru kategorilere ayrılıp veritabanına kaydedildi`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setShowPDFUpload(false);
      setProcessingProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: "PDF İşleme Hatası",
        description: error.message || "PDF dosyası işlenirken bir hata oluştu",
        variant: "destructive",
      });
      setProcessingProgress(0);
    },
  });

  const handleCreateAdmin = () => {
    if (!newAdmin.username || !newAdmin.email || !newAdmin.role) {
      toast({ title: 'Hata', description: 'Tüm alanlar doldurulmalıdır', variant: 'destructive' });
      return;
    }
    createAdminMutation.mutate(newAdmin);
  };

  const handleCreateQuestion = () => {
    if (!newQuestion.question || !newQuestion.category || newQuestion.options.some(opt => !opt.trim())) {
      toast({ title: 'Hata', description: 'Tüm alanlar doldurulmalıdır', variant: 'destructive' });
      return;
    }
    createQuestionMutation.mutate(newQuestion);
  };

  const handleCreateCourse = () => {
    if (!newCourse.title || !newCourse.description || !newCourse.category) {
      toast({ title: 'Hata', description: 'Tüm alanlar doldurulmalıdır', variant: 'destructive' });
      return;
    }
    createCourseMutation.mutate(newCourse);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Determine exam type from filename or set default
      let examType = 'tyt';
      if (file.name.toLowerCase().includes('kpss')) {
        examType = 'kpss';
      } else if (file.name.toLowerCase().includes('ehliyet')) {
        examType = 'ehliyet';
      } else if (file.name.toLowerCase().includes('ale')) {
        examType = 'ale';
      } else if (file.name.toLowerCase().includes('dgs')) {
        examType = 'dgs';
      }

      const response = await fetch(`/api/exam/${examType}/process-pdf`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok && !result.error) {
        const questionCount = result.addedQuestions?.length || 0;
        toast({ 
          title: 'Başarılı', 
          description: `PDF başarıyla işlendi. ${questionCount} soru eklendi.` 
        });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      } else {
        toast({ 
          title: 'Hata', 
          description: result.message || 'PDF işlenirken hata oluştu', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Hata', description: 'Dosya yüklenirken hata oluştu', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                BilgiBite Admin Paneli
              </h1>
              <p className="text-gray-600">
                Gelişmiş sistem yönetimi ve içerik düzenleme merkezi
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Activity className="w-4 h-4 mr-2" />
                Sistem Durumu
              </Button>
              <Button onClick={() => setShowSystemSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Sistem İstatistikleri</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchStats()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Yenile
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Toplam Kullanıcı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {adminStats?.totalUsers || 0}
                </span>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs text-green-600 mt-1">+12% bu ay</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Aktif Kurslar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {adminStats?.activeCourses || 0}
                </span>
                <BookOpen className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-xs text-green-600 mt-1">+8% bu ay</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Toplam Soru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {adminStats?.totalQuestions || 0}
                </span>
                <Brain className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-xs text-green-600 mt-1">+25% bu ay</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Öğretmenler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {adminStats?.totalTeachers || 0}
                </span>
                <GraduationCap className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-xs text-green-600 mt-1">+5% bu ay</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
            <TabsTrigger value="content">İçerik</TabsTrigger>
            <TabsTrigger value="courses">Kurslar</TabsTrigger>
            <TabsTrigger value="teachers">Öğretmenler</TabsTrigger>
            <TabsTrigger value="system">Sistem</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Son Aktiviteler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">Yeni kullanıcı kaydı</span>
                      <span className="text-xs text-gray-500">2 dakika önce</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">Yeni kurs oluşturuldu</span>
                      <span className="text-xs text-gray-500">15 dakika önce</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm">AI soru üretildi</span>
                      <span className="text-xs text-gray-500">1 saat önce</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Hızlı İşlemler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Yeni Admin Ekle
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Toplu İçerik Yükle
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Verileri Dışa Aktar
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Mail className="w-4 h-4 mr-2" />
                    Toplu E-posta Gönder
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Admin Kullanıcıları</CardTitle>
                  <Button onClick={() => setShowCreateAdmin(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Yeni Admin
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(adminUsers) && adminUsers.map((user: AdminUser) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-medium">{user.username}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <Badge className={ADMIN_ROLES[user.role].color}>
                          {ADMIN_ROLES[user.role].name}
                        </Badge>
                        {user.isActive ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Pasif
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleUserStatusMutation.mutate({ 
                            userId: user.id, 
                            isActive: !user.isActive 
                          })}
                        >
                          {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Kullanıcıyı sil?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu işlem geri alınamaz. Kullanıcı kalıcı olarak silinecek.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteUserMutation.mutate(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Destekli İçerik Yönetimi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button 
                      className="h-20 flex-col gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="w-6 h-6" />
                      Toplu Soru Yükle
                    </Button>
                    <Button 
                      className="h-20 flex-col gap-2" 
                      variant="outline"
                      onClick={() => setShowCreateQuestion(true)}
                    >
                      <FileText className="w-6 h-6" />
                      Manuel Soru Ekle
                    </Button>
                    <Button 
                      className="h-20 flex-col gap-2" 
                      variant="outline"
                      onClick={() => setShowPDFUpload(true)}
                    >
                      <FileText className="w-6 h-6" />
                      Sınav PDF İşle
                    </Button>
                    <Button className="h-20 flex-col gap-2" variant="outline">
                      <Download className="w-6 h-6" />
                      Verileri Dışa Aktar
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Kurs Yönetimi</CardTitle>
                  <Button onClick={() => setShowCreateCourse(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Kurs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(courses) && courses.map((course: Course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-gray-600">{course.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{course.category}</Badge>
                          <Badge variant="outline">{course.level}</Badge>
                          <Badge variant="outline">{course.enrollmentCount} öğrenci</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Öğretmen Yönetimi</CardTitle>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Yeni Öğretmen
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(teachers) && teachers.map((teacher: Teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{teacher.name}</h4>
                        <p className="text-sm text-gray-600">{teacher.email}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>{teacher.subject}</span>
                          <span>{teacher.studentsCount} öğrenci</span>
                          <span>{teacher.coursesCount} kurs</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Sistem Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Site Adı</Label>
                    <Input 
                      value={systemSettings.siteName}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Site Açıklaması</Label>
                    <Textarea 
                      value={systemSettings.siteDescription}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Bakım Modu</Label>
                    <Switch 
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Yeni Kayıt</Label>
                    <Switch 
                      checked={systemSettings.registrationEnabled}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, registrationEnabled: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>API & İmkanlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>AI Soru Limiti (Aylık)</Label>
                    <Input 
                      type="number"
                      value={systemSettings.aiQuestionLimit}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, aiQuestionLimit: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maksimum Dosya Boyutu (MB)</Label>
                    <Input 
                      type="number"
                      value={systemSettings.maxFileSize}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>E-posta Bildirimleri</Label>
                    <Switch 
                      checked={systemSettings.emailNotifications}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => updateSystemSettingsMutation.mutate(systemSettings)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Ayarları Kaydet
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Admin Dialog */}
        <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Admin Oluştur</DialogTitle>
              <DialogDescription>
                Yeni admin kullanıcısı oluşturun ve yetkileri belirleyin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kullanıcı Adı</Label>
                  <Input 
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-posta</Label>
                  <Input 
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={newAdmin.role} onValueChange={(value) => setNewAdmin(prev => ({ ...prev, role: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderatör</SelectItem>
                    <SelectItem value="teacher">Öğretmen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Yetkiler</Label>
                <div className="grid grid-cols-2 gap-4 max-h-40 overflow-y-auto">
                  {PERMISSIONS.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={newAdmin.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAdmin(prev => ({ 
                              ...prev, 
                              permissions: [...prev.permissions, permission.id] 
                            }));
                          } else {
                            setNewAdmin(prev => ({ 
                              ...prev, 
                              permissions: prev.permissions.filter(p => p !== permission.id) 
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={permission.id} className="text-sm">
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateAdmin(false)}>
                  İptal
                </Button>
                <Button 
                  onClick={handleCreateAdmin}
                  disabled={createAdminMutation.isPending}
                >
                  {createAdminMutation.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Question Dialog */}
        <Dialog open={showCreateQuestion} onOpenChange={setShowCreateQuestion}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Yeni Soru Oluştur</DialogTitle>
              <DialogDescription>
                Manuel olarak yeni soru ekleyin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Soru Metni</Label>
                <Textarea 
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Sorunuzu buraya yazın..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Seçenekler</Label>
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion(prev => ({ ...prev, options: newOptions }));
                      }}
                      placeholder={`Seçenek ${String.fromCharCode(65 + index)}`}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={newQuestion.correctAnswer === index}
                      onChange={() => setNewQuestion(prev => ({ ...prev, correctAnswer: index }))}
                      className="w-4 h-4"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={newQuestion.category} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yks">YKS</SelectItem>
                      <SelectItem value="kpss">KPSS</SelectItem>
                      <SelectItem value="ehliyet">Ehliyet</SelectItem>
                      <SelectItem value="matematik">Matematik</SelectItem>
                      <SelectItem value="fen">Fen Bilimleri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zorluk</Label>
                  <Select value={newQuestion.difficulty} onValueChange={(value: any) => setNewQuestion(prev => ({ ...prev, difficulty: value }))}>
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
              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Textarea 
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Cevabın açıklaması..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateQuestion(false)}>
                  İptal
                </Button>
                <Button 
                  onClick={handleCreateQuestion}
                  disabled={createQuestionMutation.isPending}
                >
                  {createQuestionMutation.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Course Dialog */}
        <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Kurs Oluştur</DialogTitle>
              <DialogDescription>
                Yeni bir kurs oluşturun ve detaylarını belirleyin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Kurs Adı</Label>
                <Input 
                  value={newCourse.title}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Kurs adını girin..."
                />
              </div>
              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Textarea 
                  value={newCourse.description}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Kurs açıklaması..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select value={newCourse.category} onValueChange={(value) => setNewCourse(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yks">YKS</SelectItem>
                      <SelectItem value="kpss">KPSS</SelectItem>
                      <SelectItem value="ehliyet">Ehliyet</SelectItem>
                      <SelectItem value="matematik">Matematik</SelectItem>
                      <SelectItem value="fen">Fen Bilimleri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Seviye</Label>
                  <Select value={newCourse.level} onValueChange={(value: any) => setNewCourse(prev => ({ ...prev, level: value }))}>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Süre (Saat)</Label>
                  <Input 
                    type="number"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fiyat (₺)</Label>
                  <Input 
                    type="number"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={newCourse.isPublished}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, isPublished: e.target.checked }))}
                />
                <Label htmlFor="isPublished">Hemen yayınla</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateCourse(false)}>
                  İptal
                </Button>
                <Button 
                  onClick={handleCreateCourse}
                  disabled={createCourseMutation.isPending}
                >
                  {createCourseMutation.isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* General PDF Upload Dialog */}
        <Dialog open={showPDFUpload} onOpenChange={setShowPDFUpload}>
          <DialogContent className="max-w-md bg-white border border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Sınav PDF İşle</DialogTitle>
              <DialogDescription className="text-gray-600">
                Sınav sorularını içeren PDF dosyasını yükleyin. AI sistemi soruları konularına göre kategorize edip veritabanına kaydedecek.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="exam-type" className="text-gray-700">Sınav Türü</Label>
                <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="tyt" className="text-gray-900 hover:bg-gray-100">TYT (Temel Yeterlilik Testi)</SelectItem>
                    <SelectItem value="kpss" className="text-gray-900 hover:bg-gray-100">KPSS (Kamu Personeli Seçme Sınavı)</SelectItem>
                    <SelectItem value="ehliyet" className="text-gray-900 hover:bg-gray-100">Ehliyet Sınavı</SelectItem>
                    <SelectItem value="ale" className="text-gray-900 hover:bg-gray-100">ALE (Açık Lise)</SelectItem>
                    <SelectItem value="dgs" className="text-gray-900 hover:bg-gray-100">DGS (Dikey Geçiş Sınavı)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pdf-file" className="text-gray-700">PDF/TXT Dosyası</Label>
                <Input 
                  id="pdf-file"
                  ref={pdfFileInputRef}
                  type="file" 
                  accept=".pdf,.txt"
                  className="bg-white border-gray-300 text-gray-900"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Dosya formatı kontrolü
                      const allowedTypes = ['application/pdf', 'text/plain'];
                      const isValidExtension = file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.txt');
                      
                      if (!allowedTypes.includes(file.type) && !isValidExtension) {
                        toast({
                          title: "Desteklenmeyen Dosya Formatı",
                          description: "Lütfen sadece PDF veya TXT dosyası yükleyin. HTML dosyalar desteklenmez.",
                          variant: "destructive"
                        });
                        // Input'u temizle
                        e.target.value = '';
                        return;
                      }
                      
                      // Dosya boyutu kontrolü (50MB = 52,428,800 bytes)
                      if (file.size > 52428800) {
                        toast({
                          title: "Dosya Çok Büyük",
                          description: `Dosya boyutu: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maksimum 50MB yükleyebilirsiniz.`,
                          variant: "destructive"
                        });
                        // Input'u temizle
                        e.target.value = '';
                        return;
                      }
                      
                      console.log(`Geçerli dosya: ${file.name}, Tip: ${file.type}, Boyut: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                      processPDFMutation.mutate({ file, examType: selectedExamType });
                    }
                  }}
                />
              </div>
              
              {processingProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>AI ile işleniyor...</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPDFUpload(false)}
                  disabled={processPDFMutation.isPending}
                  className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                >
                  İptal
                </Button>
                <Button 
                  onClick={() => pdfFileInputRef.current?.click()}
                  disabled={processPDFMutation.isPending}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Dosya Seç
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}