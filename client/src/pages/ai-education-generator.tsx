import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  BookOpen, 
  Lightbulb, 
  Target, 
  Video, 
  FileText, 
  Zap, 
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Clock,
  Users,
  Star,
  Play,
  Plus,
  Wand2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

export default function AIEducationGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    subject: '',
    level: 'beginner',
    duration: '',
    targetAudience: '',
    learningObjectives: '',
    topicsToInclude: '',
    difficulty: 'easy'
  });

  const [lessonForm, setLessonForm] = useState({
    courseId: '',
    topic: '',
    duration: '30',
    complexity: 'medium',
    includeExamples: true,
    includeExercises: true,
    languageStyle: 'formal'
  });

  const [batchForm, setBatchForm] = useState({
    subject: '',
    count: 5,
    level: 'beginner',
    topics: '',
    generateQuizzes: true,
    generateMaterials: true
  });

  // Loading states
  const [generatingCourse, setGeneratingCourse] = useState(false);
  const [generatingLesson, setGeneratingLesson] = useState(false);
  const [generatingBatch, setGeneratingBatch] = useState(false);

  // Available subjects
  const subjects = [
    { id: 'mathematics', name: 'Matematik', icon: '🔢' },
    { id: 'physics', name: 'Fizik', icon: '⚛️' },
    { id: 'chemistry', name: 'Kimya', icon: '🧪' },
    { id: 'biology', name: 'Biyoloji', icon: '🧬' },
    { id: 'turkish', name: 'Türkçe', icon: '📚' },
    { id: 'history', name: 'Tarih', icon: '🏛️' },
    { id: 'geography', name: 'Coğrafya', icon: '🌍' },
    { id: 'literature', name: 'Edebiyat', icon: '📖' }
  ];

  // Generate Course Mutation
  const generateCourseMutation = useMutation({
    mutationFn: async (data: typeof courseForm) => {
      const response = await apiRequest('POST', '/api/ai/generate-course', data);
      if (!response.ok) {
        throw new Error('Kurs oluşturulamadı');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Kurs Başarıyla Oluşturuldu!",
        description: `"${data.title}" kursu AI tarafından oluşturuldu ve sisteme eklendi.`,
      });
      setCourseForm({
        title: '',
        description: '',
        subject: '',
        level: 'beginner',
        duration: '',
        targetAudience: '',
        learningObjectives: '',
        topicsToInclude: '',
        difficulty: 'easy'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/education/courses'] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Generate Lesson Mutation
  const generateLessonMutation = useMutation({
    mutationFn: async (data: typeof lessonForm) => {
      const response = await apiRequest('POST', '/api/ai/generate-lesson', data);
      if (!response.ok) {
        throw new Error('Ders oluşturulamadı');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Ders Başarıyla Oluşturuldu!",
        description: `"${data.title}" dersi AI tarafından oluşturuldu.`,
      });
      setLessonForm({
        courseId: '',
        topic: '',
        duration: '30',
        complexity: 'medium',
        includeExamples: true,
        includeExercises: true,
        languageStyle: 'formal'
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Generate Batch Content Mutation
  const generateBatchMutation = useMutation({
    mutationFn: async (data: typeof batchForm) => {
      const response = await apiRequest('POST', '/api/ai/generate-batch-content', data);
      if (!response.ok) {
        throw new Error('Toplu içerik oluşturulamadı');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Toplu İçerik Başarıyla Oluşturuldu!",
        description: `${data.generated} içerik AI tarafından oluşturuldu ve sisteme eklendi.`,
      });
      setBatchForm({
        subject: '',
        count: 5,
        level: 'beginner',
        topics: '',
        generateQuizzes: true,
        generateMaterials: true
      });
      queryClient.invalidateQueries({ queryKey: ['/api/education/courses'] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleGenerateCourse = () => {
    if (!courseForm.title || !courseForm.subject || !courseForm.description) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun.",
        variant: "destructive"
      });
      return;
    }
    setGeneratingCourse(true);
    generateCourseMutation.mutate(courseForm);
    setTimeout(() => setGeneratingCourse(false), 3000);
  };

  const handleGenerateLesson = () => {
    if (!lessonForm.topic) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen ders konusunu girin.",
        variant: "destructive"
      });
      return;
    }
    setGeneratingLesson(true);
    generateLessonMutation.mutate(lessonForm);
    setTimeout(() => setGeneratingLesson(false), 3000);
  };

  const handleGenerateBatch = () => {
    if (!batchForm.subject || !batchForm.topics) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen konu alanı ve konuları belirtin.",
        variant: "destructive"
      });
      return;
    }
    setGeneratingBatch(true);
    generateBatchMutation.mutate(batchForm);
    setTimeout(() => setGeneratingBatch(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Eğitim İçeriği Üretici
              </h1>
              <p className="text-muted-foreground mt-2">
                Yapay zeka ile otomatik eğitim içeriği, kurs ve ders materyali üretin
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Akıllı Kurs Oluşturma</h3>
                    <p className="text-sm text-gray-600">AI ile otomatik kurs yapısı</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">İçerik Optimizasyonu</h3>
                    <p className="text-sm text-gray-600">Öğrenme hedeflerine göre</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Toplu Üretim</h3>
                    <p className="text-sm text-gray-600">Bir anda çoklu içerik</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="course" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="course" data-testid="tab-course">
              <BookOpen className="w-4 h-4 mr-2" />
              Kurs Oluştur
            </TabsTrigger>
            <TabsTrigger value="lesson" data-testid="tab-lesson">
              <Video className="w-4 h-4 mr-2" />
              Ders Oluştur
            </TabsTrigger>
            <TabsTrigger value="batch" data-testid="tab-batch">
              <Zap className="w-4 h-4 mr-2" />
              Toplu Üretim
            </TabsTrigger>
          </TabsList>

          {/* Course Generation Tab */}
          <TabsContent value="course">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-600" />
                    AI Kurs Oluşturucu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="course-title">Kurs Başlığı *</Label>
                        <Input
                          id="course-title"
                          placeholder="Örn: İleri Matematik: Limit ve Türev"
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                          data-testid="input-course-title"
                        />
                      </div>

                      <div>
                        <Label htmlFor="course-subject">Konu Alanı *</Label>
                        <Select value={courseForm.subject} onValueChange={(value) => setCourseForm({...courseForm, subject: value})}>
                          <SelectTrigger data-testid="select-course-subject">
                            <SelectValue placeholder="Konu alanı seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.icon} {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="course-level">Seviye</Label>
                        <Select value={courseForm.level} onValueChange={(value) => setCourseForm({...courseForm, level: value})}>
                          <SelectTrigger data-testid="select-course-level">
                            <SelectValue placeholder="Seviye seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Başlangıç</SelectItem>
                            <SelectItem value="intermediate">Orta</SelectItem>
                            <SelectItem value="advanced">İleri</SelectItem>
                            <SelectItem value="expert">Uzman</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="course-duration">Tahmini Süre</Label>
                        <Input
                          id="course-duration"
                          placeholder="Örn: 4 hafta, 20 saat"
                          value={courseForm.duration}
                          onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                          data-testid="input-course-duration"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="course-description">Kurs Açıklaması *</Label>
                        <Textarea
                          id="course-description"
                          placeholder="Kursun içeriği, hedefleri ve kapsamı hakkında detaylı bilgi..."
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                          rows={4}
                          data-testid="textarea-course-description"
                        />
                      </div>

                      <div>
                        <Label htmlFor="course-audience">Hedef Kitle</Label>
                        <Input
                          id="course-audience"
                          placeholder="Örn: Lise öğrencileri, YKS adayları"
                          value={courseForm.targetAudience}
                          onChange={(e) => setCourseForm({...courseForm, targetAudience: e.target.value})}
                          data-testid="input-course-audience"
                        />
                      </div>

                      <div>
                        <Label htmlFor="course-objectives">Öğrenme Hedefleri</Label>
                        <Textarea
                          id="course-objectives"
                          placeholder="Bu kursu tamamlayan öğrenciler..."
                          value={courseForm.learningObjectives}
                          onChange={(e) => setCourseForm({...courseForm, learningObjectives: e.target.value})}
                          rows={3}
                          data-testid="textarea-course-objectives"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="course-topics">Kapsanacak Konular</Label>
                    <Textarea
                      id="course-topics"
                      placeholder="Örn: Limit kavramı, türev tanımı, türev kuralları, uygulamalar..."
                      value={courseForm.topicsToInclude}
                      onChange={(e) => setCourseForm({...courseForm, topicsToInclude: e.target.value})}
                      rows={3}
                      data-testid="textarea-course-topics"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleGenerateCourse}
                      disabled={generatingCourse || generateCourseMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      data-testid="button-generate-course"
                    >
                      {generatingCourse ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          AI Kurs Oluşturuyor...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Kurs Oluştur
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Lesson Generation Tab */}
          <TabsContent value="lesson">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    AI Ders Oluşturucu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="lesson-topic">Ders Konusu *</Label>
                        <Input
                          id="lesson-topic"
                          placeholder="Örn: Limit Kavramı ve Temel Özellikleri"
                          value={lessonForm.topic}
                          onChange={(e) => setLessonForm({...lessonForm, topic: e.target.value})}
                          data-testid="input-lesson-topic"
                        />
                      </div>

                      <div>
                        <Label htmlFor="lesson-duration">Ders Süresi (dakika)</Label>
                        <Select value={lessonForm.duration} onValueChange={(value) => setLessonForm({...lessonForm, duration: value})}>
                          <SelectTrigger data-testid="select-lesson-duration">
                            <SelectValue placeholder="Süre seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 dakika</SelectItem>
                            <SelectItem value="30">30 dakika</SelectItem>
                            <SelectItem value="45">45 dakika</SelectItem>
                            <SelectItem value="60">60 dakika</SelectItem>
                            <SelectItem value="90">90 dakika</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="lesson-complexity">Karmaşıklık Seviyesi</Label>
                        <Select value={lessonForm.complexity} onValueChange={(value) => setLessonForm({...lessonForm, complexity: value})}>
                          <SelectTrigger data-testid="select-lesson-complexity">
                            <SelectValue placeholder="Seviye seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simple">Basit</SelectItem>
                            <SelectItem value="medium">Orta</SelectItem>
                            <SelectItem value="complex">Karmaşık</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>İçerik Seçenekleri</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="include-examples"
                              checked={lessonForm.includeExamples}
                              onChange={(e) => setLessonForm({...lessonForm, includeExamples: e.target.checked})}
                              className="rounded"
                            />
                            <Label htmlFor="include-examples" className="text-sm">Örnekler ekle</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="include-exercises"
                              checked={lessonForm.includeExercises}
                              onChange={(e) => setLessonForm({...lessonForm, includeExercises: e.target.checked})}
                              className="rounded"
                            />
                            <Label htmlFor="include-exercises" className="text-sm">Alıştırmalar ekle</Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="lesson-style">Dil Stili</Label>
                        <Select value={lessonForm.languageStyle} onValueChange={(value) => setLessonForm({...lessonForm, languageStyle: value})}>
                          <SelectTrigger data-testid="select-lesson-style">
                            <SelectValue placeholder="Stil seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="formal">Resmi</SelectItem>
                            <SelectItem value="casual">Günlük</SelectItem>
                            <SelectItem value="academic">Akademik</SelectItem>
                            <SelectItem value="interactive">İnteraktif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleGenerateLesson}
                      disabled={generatingLesson || generateLessonMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      data-testid="button-generate-lesson"
                    >
                      {generatingLesson ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          AI Ders Oluşturuyor...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Ders Oluştur
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Batch Generation Tab */}
          <TabsContent value="batch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    AI Toplu İçerik Üretici
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="batch-subject">Konu Alanı *</Label>
                        <Select value={batchForm.subject} onValueChange={(value) => setBatchForm({...batchForm, subject: value})}>
                          <SelectTrigger data-testid="select-batch-subject">
                            <SelectValue placeholder="Konu alanı seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.icon} {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="batch-count">Üretilecek İçerik Sayısı</Label>
                        <Select value={batchForm.count.toString()} onValueChange={(value) => setBatchForm({...batchForm, count: parseInt(value)})}>
                          <SelectTrigger data-testid="select-batch-count">
                            <SelectValue placeholder="Sayı seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 İçerik</SelectItem>
                            <SelectItem value="10">10 İçerik</SelectItem>
                            <SelectItem value="15">15 İçerik</SelectItem>
                            <SelectItem value="20">20 İçerik</SelectItem>
                            <SelectItem value="25">25 İçerik</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="batch-level">Seviye</Label>
                        <Select value={batchForm.level} onValueChange={(value) => setBatchForm({...batchForm, level: value})}>
                          <SelectTrigger data-testid="select-batch-level">
                            <SelectValue placeholder="Seviye seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Başlangıç</SelectItem>
                            <SelectItem value="intermediate">Orta</SelectItem>
                            <SelectItem value="advanced">İleri</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="batch-topics">Konular *</Label>
                        <Textarea
                          id="batch-topics"
                          placeholder="Üretilecek içeriklerin konularını listeleyin (örn: limitler, türevler, integraller)"
                          value={batchForm.topics}
                          onChange={(e) => setBatchForm({...batchForm, topics: e.target.value})}
                          rows={4}
                          data-testid="textarea-batch-topics"
                        />
                      </div>

                      <div>
                        <Label>Ek İçerik Türleri</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="generate-quizzes"
                              checked={batchForm.generateQuizzes}
                              onChange={(e) => setBatchForm({...batchForm, generateQuizzes: e.target.checked})}
                              className="rounded"
                            />
                            <Label htmlFor="generate-quizzes" className="text-sm">Quiz'ler oluştur</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="generate-materials"
                              checked={batchForm.generateMaterials}
                              onChange={(e) => setBatchForm({...batchForm, generateMaterials: e.target.checked})}
                              className="rounded"
                            />
                            <Label htmlFor="generate-materials" className="text-sm">Çalışma materyalleri oluştur</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-yellow-600 text-sm">⚠️</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-1">Toplu Üretim Bilgisi</h4>
                        <p className="text-sm text-yellow-700">
                          Toplu içerik üretimi daha uzun sürebilir. AI, belirttiğiniz konularda otomatik olarak 
                          çeşitli eğitim materyalleri, kurslar ve quizler oluşturacaktır.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleGenerateBatch}
                      disabled={generatingBatch || generateBatchMutation.isPending}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      data-testid="button-generate-batch"
                    >
                      {generatingBatch ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          AI Toplu İçerik Üretiyor...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Toplu İçerik Üret
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}