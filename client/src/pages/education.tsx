import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  BookOpen,
  Video,
  FileText,
  Users,
  Clock,
  Star,
  Play,
  BookMarked,
  Lightbulb,
  Target,
  Award,
  Search,
  Filter,
  ChevronRight,
  Download,
  Share,
  Heart,
  MessageCircle,
  Calendar,
  TrendingUp,
  Globe,
  Headphones,
  PenTool,
  Calculator,
  Atom,
  Languages,
  History,
  Music,
  Palette,
  Code,
  Briefcase
} from 'lucide-react';

// Icon mapping for subjects
const iconMap = {
  'Calculator': Calculator,
  'Atom': Atom,
  'Languages': Languages,
  'History': History,
  'Globe': Globe,
  'Palette': Palette,
  'Code': Code,
  'Briefcase': Briefcase
};

// API data interfaces
interface EducationSubject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface EducationCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  subjectId: string;
  duration: string;
  level: string;
  rating: number;
  totalStudents: number;
  featured: boolean;
  price: number;
  thumbnailUrl?: string;
  videoUrl?: string;
}

export default function Education() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('courses');

  // Fetch subjects data
  const { data: subjects, isLoading: subjectsLoading } = useQuery<EducationSubject[]>({
    queryKey: ['/api/education/subjects'],
  });

  // Fetch courses data
  const { data: courses, isLoading: coursesLoading } = useQuery<EducationCourse[]>({
    queryKey: ['/api/education/courses'],
  });

  // Filter courses based on search and category
  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '' || course.subjectId === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Başlangıç': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Orta': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'İleri': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = subjects?.find(cat => cat.id === categoryId);
    return category ? category.color : 'gray';
  };

  // Mock materials data for now
  const studyMaterials = [
    {
      id: '1',
      title: 'YKS Matematik Formül Kartları',
      type: 'PDF',
      size: '2.5 MB',
      downloads: 15420,
      category: 'matematik',
      description: 'Tüm matematik formüllerini tek PDF\'de topladık.'
    },
    {
      id: '2',
      title: 'Türkçe Yazım Kuralları Rehberi',
      type: 'PDF',
      size: '1.8 MB',
      downloads: 8765,
      category: 'turkce',
      description: 'TDK kurallarına göre hazırlanmış kapsamlı yazım rehberi.'
    },
    {
      id: '3',
      title: 'Tarih Zaman Çizelgesi',
      type: 'Görsel',
      size: '1.2 MB',
      downloads: 12340,
      category: 'tarih',
      description: 'Dünya ve Türk tarihini görsel zaman çizelgesinde inceleyin.'
    }
  ];

  // Mock learning paths data
  const learningPaths = [
    {
      id: '1',
      title: 'YKS Matematik Hazırlığı',
      duration: '3 ay',
      courses: 8,
      difficulty: 'Orta-İleri',
      completionRate: 78,
      description: 'YKS matematik bölümüne sistematik bir şekilde hazırlanın.',
      subjects: ['Fonksiyonlar', 'Limit', 'Türev', 'İntegral', 'Analitik Geometri']
    },
    {
      id: '2',
      title: 'KPSS Genel Kültür',
      duration: '4 ay',
      courses: 12,
      difficulty: 'Orta',
      completionRate: 85,
      description: 'KPSS genel kültür konularında eksik bırakmayın.',
      subjects: ['Tarih', 'Coğrafya', 'Vatandaşlık', 'Türkçe']
    },
    {
      id: '3',
      title: 'Lise Fen Bilimleri',
      duration: '6 ay',
      courses: 15,
      difficulty: 'Başlangıç-Orta',
      completionRate: 92,
      description: 'Lise fen bilimleri müfredatını tamamen kaplayın.',
      subjects: ['Fizik', 'Kimya', 'Biyoloji', 'Matematik']
    }
  ];

  if (subjectsLoading || coursesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Eğitim içerikleri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            BilgiBite Eğitim Merkezi
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sınav hazırlığının ötesinde kapsamlı eğitim içerikleri. İnteraktif kurslar ve çalışma materyalleriyle her konuyu öğren, pratik yap ve ustalaş.
          </p>
        </motion.div>

        {/* Subject Categories Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Konular</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {subjects?.map((category) => {
              const IconComponent = iconMap[category.icon as keyof typeof iconMap] || BookOpen;
              return (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={`h-auto p-4 flex-col gap-2 w-full transition-all duration-200 ${
                      selectedCategory === category.id 
                        ? `bg-${category.color}-500 hover:bg-${category.color}-600 text-white` 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
                    data-testid={`button-category-${category.id}`}
                  >
                    <IconComponent className={`w-6 h-6 ${
                      selectedCategory === category.id ? 'text-white' : `text-${category.color}-600 dark:text-${category.color}-400`
                    }`} />
                    <span className={`text-xs font-medium text-center ${
                      selectedCategory === category.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {category.name}
                    </span>
                    <span className={`text-xs opacity-75 text-center ${
                      selectedCategory === category.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {category.description}
                    </span>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Kurs, eğitmen veya konu ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-courses"
              />
            </div>
            <Button variant="outline" className="gap-2" data-testid="button-filter">
              <Filter className="w-4 h-4" />
              Filtrele
            </Button>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="courses" data-testid="tab-courses">Kurslar</TabsTrigger>
            <TabsTrigger value="materials" data-testid="tab-materials">Materyaller</TabsTrigger>
            <TabsTrigger value="paths" data-testid="tab-paths">Öğrenme Yolları</TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-200 border-0 bg-white backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{(course.rating / 10).toFixed(1)}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{course.instructor}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{course.totalStudents} öğrenci</span>
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {course.price === 0 ? 'Ücretsiz' : `₺${course.price}`}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button className="flex-1" data-testid={`button-enroll-${course.id}`}>
                            <Play className="w-4 h-4 mr-2" />
                            Başla
                          </Button>
                          <Button variant="outline" size="icon" data-testid={`button-bookmark-${course.id}`}>
                            <BookMarked className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            
            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Kurs bulunamadı</h3>
                <p className="text-gray-600 dark:text-gray-400">Arama kriterlerinize uygun kurs bulunmamaktadır.</p>
              </div>
            )}
          </TabsContent>

          {/* Study Materials Tab */}
          <TabsContent value="materials">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {studyMaterials.map((material) => (
                <motion.div
                  key={material.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-200 border-0 bg-white backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary">{material.type}</Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{material.size}</span>
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {material.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                        {material.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Download className="w-4 h-4" />
                          <span>{material.downloads.toLocaleString()} indirme</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1" data-testid={`button-download-${material.id}`}>
                          <Download className="w-4 h-4 mr-2" />
                          İndir
                        </Button>
                        <Button variant="outline" size="icon" data-testid={`button-share-${material.id}`}>
                          <Share className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {learningPaths.map((path) => (
                <motion.div
                  key={path.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-200 border-0 bg-white backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">{path.difficulty}</Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="w-4 h-4" />
                          <span>{path.duration}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {path.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                        {path.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                          <span>{path.courses} kurs</span>
                          <span>%{path.completionRate} tamamlama</span>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">İlerleme</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">%{path.completionRate}</span>
                          </div>
                          <Progress value={path.completionRate} className="h-2" />
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Konular</span>
                          <div className="flex flex-wrap gap-1">
                            {path.subjects.slice(0, 3).map((subject) => (
                              <Badge key={subject} variant="secondary" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                            {path.subjects.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{path.subjects.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button className="w-full" data-testid={`button-start-path-${path.id}`}>
                          <Target className="w-4 h-4 mr-2" />
                          Yola Başla
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}