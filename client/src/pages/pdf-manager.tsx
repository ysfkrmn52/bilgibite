import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Upload, 
  Folder, 
  FolderPlus, 
  Eye, 
  Download, 
  Trash2, 
  Edit, 
  Search,
  Filter,
  BookOpen,
  FileIcon,
  Calendar,
  User
} from 'lucide-react';

interface PdfMaterial {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  difficulty: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedBy: string;
  tags: string[];
  downloadCount: number;
  viewCount: number;
  createdAt: string;
}

interface PdfFolder {
  id: string;
  name: string;
  parentId?: string;
  category: string;
  subject?: string;
  icon: string;
  color: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
}

interface PdfTopic {
  id: string;
  pdfId: string;
  topicTitle: string;
  topicNumber: number;
  startPage: number;
  endPage: number;
  description?: string;
  keywords: string[];
}

export default function PdfManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    category: '',
    subject: '',
    difficulty: 'medium',
    tags: ''
  });

  // Fetch PDF materials
  const { data: pdfMaterials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ['/api/admin/pdf-materials', selectedCategory, selectedSubject, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (searchTerm) params.append('search', searchTerm);
      return fetch(`/api/admin/pdf-materials?${params}`).then(res => res.json());
    }
  });

  // Fetch PDF folders
  const { data: pdfFolders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['/api/admin/pdf-folders'],
    queryFn: () => fetch('/api/admin/pdf-folders').then(res => res.json())
  });

  // Upload PDF mutation
  const uploadPdfMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/admin/upload-pdf', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pdf-materials'] });
      toast({ title: 'Başarılı', description: 'PDF başarıyla yüklendi!' });
      setUploadFormData({
        title: '',
        description: '',
        category: '',
        subject: '',
        difficulty: 'medium',
        tags: ''
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (error: any) => {
      toast({ 
        title: 'Hata', 
        description: error.message || 'PDF yüklenirken hata oluştu',
        variant: 'destructive'
      });
    }
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (folderData: any) => {
      const response = await fetch('/api/admin/pdf-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folderData)
      });
      if (!response.ok) throw new Error('Folder creation failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pdf-folders'] });
      toast({ title: 'Başarılı', description: 'Klasör oluşturuldu!' });
    }
  });

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.[0]) {
      toast({ title: 'Hata', description: 'Lütfen bir PDF dosyası seçin', variant: 'destructive' });
      return;
    }

    if (!uploadFormData.title || !uploadFormData.category || !uploadFormData.subject) {
      toast({ title: 'Hata', description: 'Lütfen tüm zorunlu alanları doldurun', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('title', uploadFormData.title);
    formData.append('description', uploadFormData.description);
    formData.append('category', uploadFormData.category);
    formData.append('subject', uploadFormData.subject);
    formData.append('difficulty', uploadFormData.difficulty);
    formData.append('tags', uploadFormData.tags);
    formData.append('uploadedBy', 'admin'); // TODO: Get from auth

    uploadPdfMutation.mutate(formData);
  };

  const handleViewPdf = (material: PdfMaterial) => {
    // PDF görüntüleme - yeni pencerede aç
    window.open(`/api/admin/pdf-materials/${material.id}/view`, '_blank');
    
    // Görüntüleme sayısını artır
    fetch(`/api/admin/pdf-materials/${material.id}/increment-view`, { method: 'POST' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const examCategories = [
    { value: 'tyt', label: 'TYT' },
    { value: 'ayt', label: 'AYT' },
    { value: 'kpss', label: 'KPSS' },
    { value: 'ehliyet', label: 'Ehliyet' },
    { value: 'dgs', label: 'DGS' },
    { value: 'ales', label: 'ALES' }
  ];

  const subjects = [
    { value: 'matematik', label: 'Matematik' },
    { value: 'turkce', label: 'Türkçe' },
    { value: 'fizik', label: 'Fizik' },
    { value: 'kimya', label: 'Kimya' },
    { value: 'biyoloji', label: 'Biyoloji' },
    { value: 'tarih', label: 'Tarih' },
    { value: 'cografya', label: 'Coğrafya' },
    { value: 'felsefe', label: 'Felsefe' },
    { value: 'edebiyat', label: 'Edebiyat' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PDF Eğitim Materyalleri</h1>
          <p className="text-muted-foreground">
            Eğitim içeriklerini PDF olarak yükleyin ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => createFolderMutation.mutate({
              name: 'Yeni Klasör',
              category: 'tyt',
              subject: 'matematik',
              createdBy: 'admin'
            })}
            variant="outline"
            size="sm"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Klasör Oluştur
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">PDF Yükle</TabsTrigger>
          <TabsTrigger value="materials">Materyaller</TabsTrigger>
          <TabsTrigger value="folders">Klasörler</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                PDF Dosyası Yükle
              </CardTitle>
              <CardDescription>
                Eğitim materyallerini PDF formatında yükleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">PDF Dosyası *</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      ref={fileInputRef}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Başlık *</Label>
                    <Input
                      id="title"
                      value={uploadFormData.title}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Örn: TYT Matematik Konu Anlatımı"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Sınav Kategorisi *</Label>
                    <Select
                      value={uploadFormData.category}
                      onValueChange={(value) => setUploadFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {examCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Ders *</Label>
                    <Select
                      value={uploadFormData.subject}
                      onValueChange={(value) => setUploadFormData(prev => ({ ...prev, subject: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ders seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subj => (
                          <SelectItem key={subj.value} value={subj.value}>
                            {subj.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Zorluk Seviyesi</Label>
                    <Select
                      value={uploadFormData.difficulty}
                      onValueChange={(value) => setUploadFormData(prev => ({ ...prev, difficulty: value }))}
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

                  <div className="space-y-2">
                    <Label htmlFor="tags">Etiketler</Label>
                    <Input
                      id="tags"
                      value={uploadFormData.tags}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Virgülle ayırın: limit, türev, integral"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Bu PDF hakkında kısa açıklama yazın..."
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={uploadPdfMutation.isPending}
                  className="w-full"
                >
                  {uploadPdfMutation.isPending ? 'Yükleniyor...' : 'PDF Yükle'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          {/* Filtreleme */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Materyal ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tümü</SelectItem>
                    {examCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Ders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tümü</SelectItem>
                    {subjects.map(subj => (
                      <SelectItem key={subj.value} value={subj.value}>
                        {subj.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* PDF Materyalleri Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materialsLoading ? (
              <div className="col-span-full text-center py-8">Yükleniyor...</div>
            ) : pdfMaterials.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Henüz PDF materyali yüklenmemiş
              </div>
            ) : (
              pdfMaterials.map((material: PdfMaterial) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-red-600" />
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm line-clamp-2">
                            {material.title}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {material.category.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {material.subject}
                      </Badge>
                      <Badge 
                        variant={
                          material.difficulty === 'easy' ? 'default' :
                          material.difficulty === 'medium' ? 'secondary' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {material.difficulty === 'easy' ? 'Kolay' :
                         material.difficulty === 'medium' ? 'Orta' : 'Zor'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {material.description || 'Açıklama bulunmuyor'}
                    </p>
                    
                    <div className="text-xs text-muted-foreground space-y-1 mb-4">
                      <div className="flex items-center gap-1">
                        <FileIcon className="h-3 w-3" />
                        {formatFileSize(material.fileSize)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {material.viewCount} görüntüleme
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {material.downloadCount} indirme
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleViewPdf(material)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Görüntüle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          window.open(`/api/admin/pdf-materials/${material.id}/download`);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="folders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Klasör Yapısı
              </CardTitle>
              <CardDescription>
                PDF materyallerini organize etmek için klasörler oluşturun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {foldersLoading ? (
                  <div className="col-span-full text-center py-8">Yükleniyor...</div>
                ) : pdfFolders.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Henüz klasör oluşturulmamış
                  </div>
                ) : (
                  pdfFolders.map((folder: PdfFolder) => (
                    <Card key={folder.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: folder.color + '20' }}
                          >
                            <Folder className="h-5 w-5" style={{ color: folder.color }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium line-clamp-1">{folder.name}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {folder.category.toUpperCase()}
                              </Badge>
                              {folder.subject && (
                                <Badge variant="secondary" className="text-xs">
                                  {folder.subject}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}