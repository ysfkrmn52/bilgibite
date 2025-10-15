import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  PlayCircle, 
  FileText,
  Calculator,
  Target,
  ArrowRight,
  ArrowLeft,
  Home,
  Star,
  Users
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  rating: number;
  totalStudents: number;
  thumbnailUrl?: string;
}

interface Chapter {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  duration: string;
  content: string;
  exercises: any[];
  isCompleted: boolean;
}

const CourseView: React.FC = () => {
  const [match, params] = useRoute('/course/:courseId');
  const [currentChapter, setCurrentChapter] = useState<number>(0);
  const queryClient = useQueryClient();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['/api/education/courses', params?.courseId],
    enabled: !!params?.courseId
  });

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ['/api/education/courses', params?.courseId, 'chapters'],
    enabled: !!params?.courseId
  });

  const completeChapterMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      return apiRequest('POST', `/api/education/chapters/${chapterId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/education/courses'] });
    }
  });

  if (!match || courseLoading || chaptersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentChapterData = chapters[currentChapter];
  const completedChapters = chapters.filter((ch: Chapter) => ch.isCompleted).length;
  const progressPercentage = chapters.length > 0 ? (completedChapters / chapters.length) * 100 : 0;

  const handleCompleteChapter = () => {
    if (currentChapterData && !currentChapterData.isCompleted) {
      completeChapterMutation.mutate(currentChapterData.id);
    }
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {course?.title}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{course?.level}</Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {course?.duration}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    {course?.totalStudents} öğrenci
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Star className="h-4 w-4" />
                    {course?.rating}/5
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">İlerleme</div>
                <div className="font-semibold">{completedChapters}/{chapters.length} tamamlandı</div>
              </div>
              <Progress value={progressPercentage} className="w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chapter List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Bölümler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {chapters.map((chapter: Chapter, index: number) => (
                  <Button
                    key={chapter.id}
                    variant={currentChapter === index ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => setCurrentChapter(index)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-shrink-0 mt-1">
                        {chapter.isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : currentChapter === index ? (
                          <PlayCircle className="h-4 w-4 text-blue-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-tight">
                          {index + 1}. {chapter.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {chapter.duration}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentChapterData ? (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {currentChapter + 1}. {currentChapterData.title}
                      </CardTitle>
                      {currentChapterData.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          {currentChapterData.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={currentChapterData.isCompleted ? "default" : "secondary"}>
                      {currentChapterData.isCompleted ? "Tamamlandı" : "Devam Ediyor"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="content" className="w-full">
                    <TabsList>
                      <TabsTrigger value="content">İçerik</TabsTrigger>
                      {currentChapterData.exercises.length > 0 && (
                        <TabsTrigger value="exercises">Alıştırmalar</TabsTrigger>
                      )}
                    </TabsList>
                    
                    <TabsContent value="content" className="mt-6">
                      <div className="prose max-w-none dark:prose-invert">
                        <div dangerouslySetInnerHTML={{ __html: currentChapterData.content }} />
                      </div>
                    </TabsContent>
                    
                    {currentChapterData.exercises.length > 0 && (
                      <TabsContent value="exercises" className="mt-6">
                        <div className="space-y-6">
                          {currentChapterData.exercises.map((exercise, idx) => (
                            <Card key={idx} className="border border-blue-200 dark:border-blue-800">
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Target className="h-5 w-5 text-blue-500" />
                                  Alıştırma {idx + 1}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="mb-4">{exercise.question}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {exercise.options?.map((option: string, optIdx: number) => (
                                    <Button
                                      key={optIdx}
                                      variant="outline"
                                      size="sm"
                                      className="justify-start"
                                    >
                                      {String.fromCharCode(65 + optIdx)}) {option}
                                    </Button>
                                  ))}
                                </div>
                                {exercise.solution && (
                                  <details className="mt-4">
                                    <summary className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400">
                                      Çözümü Göster
                                    </summary>
                                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                                      <p className="text-sm">{exercise.solution}</p>
                                    </div>
                                  </details>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
                      disabled={currentChapter === 0}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Önceki Bölüm
                    </Button>

                    <div className="flex items-center gap-3">
                      {!currentChapterData.isCompleted && (
                        <Button
                          onClick={handleCompleteChapter}
                          disabled={completeChapterMutation.isPending}
                        >
                          {completeChapterMutation.isPending ? (
                            "Tamamlanıyor..."
                          ) : currentChapter === chapters.length - 1 ? (
                            "Kursu Tamamla"
                          ) : (
                            "Tamamla ve Devam Et"
                          )}
                          <CheckCircle className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                      
                      {currentChapter < chapters.length - 1 && (
                        <Button
                          onClick={() => setCurrentChapter(currentChapter + 1)}
                        >
                          Sonraki Bölüm
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Bu kurs için henüz içerik eklenmemiş.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;