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
  const [showSystemSettings, setShowSystemSettings] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  
  // Form states
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    role: 'admin' as const,
    permissions: [] as string[]
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
  const { data: adminStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/stats');
      return response as any;
    }
  });

  const { data: adminUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      return response as AdminUser[];
    }
  });

  const { data: courses } = useQuery({
    queryKey: ['/api/admin/courses'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/courses');
      return response as Course[];
    }
  });

  const { data: teachers } = useQuery({
    queryKey: ['/api/admin/teachers'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/teachers');
      return response as Teacher[];
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

  const handleCreateAdmin = () => {
    if (!newAdmin.username || !newAdmin.email || !newAdmin.role) {
      toast({ title: 'Hata', description: 'Tüm alanlar doldurulmalıdır', variant: 'destructive' });
      return;
    }
    createAdminMutation.mutate(newAdmin);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contentType', 'questions');

    try {
      const response = await fetch('/api/admin/process-content', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({ title: 'Başarılı', description: 'Dosya başarıyla işlendi' });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/questions'] });
      }
    } catch (error) {
      toast({ title: 'Hata', description: 'Dosya işlenirken hata oluştu', variant: 'destructive' });
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      className="h-20 flex-col gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="w-6 h-6" />
                      Toplu Soru Yükle
                    </Button>
                    <Button className="h-20 flex-col gap-2" variant="outline">
                      <Brain className="w-6 h-6" />
                      AI Soru Üret
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
                  <Button>
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
      </div>
    </div>
  );
}