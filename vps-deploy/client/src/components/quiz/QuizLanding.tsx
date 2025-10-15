import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Clock, Target, Trophy, BookOpen, ArrowRight, Play, FileText } from "lucide-react";
import { ExamCategory } from "@shared/schema";

interface QuizLandingProps {
  categoryId: string;
  onStartQuiz: (mode?: 'quick' | 'exam') => void;
}

export default function QuizLanding({ categoryId, onStartQuiz }: QuizLandingProps) {
  const { data: categories = [] } = useQuery<ExamCategory[]>({
    queryKey: ["/api/exam-categories"],
  });

  const { data: questionCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["/api/questions/counts"],
  });

  const category = categories.find(cat => cat.id === categoryId);
  
  // Check if we have enough questions for exam mode
  const getRequiredQuestions = (categoryId: string) => {
    switch (categoryId) {
      case 'yks': return 120;
      case 'kpss': return 120; 
      case 'ehliyet': return 50;
      default: return 40;
    }
  };
  
  const availableQuestions = questionCounts[categoryId] || 0;
  const requiredQuestions = getRequiredQuestions(categoryId);
  const hasEnoughQuestions = availableQuestions >= requiredQuestions;

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Kategori Bulunamadı</h2>
            <p className="text-muted-foreground mb-4">
              Seçtiğiniz sınav kategorisi mevcut değil.
            </p>
            <Button onClick={() => window.location.href = "/exams"}>
              Sınavlara Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryInfo = {
    yks: {
      description: "Üniversiteye giriş sınavı. TYT: 120 soru (165 dk), AYT: Bölümsel testler.",
      duration: "Hızlı Quiz: 10 soru • Deneme: 120 soru",
      questionCount: "10 soru",
      difficulty: "Orta-Zor",
      tips: [
        "TYT: Türkçe 40, Matematik 40, Fen 20, Sosyal 20 soru",
        "Negatif puanlama var: 4 yanlış = 1 doğru",
        "Zaman yönetimi kritik: soru başına ortalama 1.4 dakika"
      ]
    },
    kpss: {
      description: "Kamu Personeli Seçme Sınavı. Genel Yetenek, Genel Kültür, Eğitim Bilimleri.",
      duration: "Hızlı Quiz: 10 soru • Deneme: 120 soru",
      questionCount: "10 soru",
      difficulty: "Orta-Zor",
      tips: [
        "Genel Yetenek-Genel Kültür: 60+60 soru",
        "Eğitim Bilimleri (öğretmenler için): 80 soru",
        "Güncel olayları ve mevzuatı takip edin"
      ]
    },
    ehliyet: {
      description: "Sürücü Kursu Teorik Sınavı. Trafik kuralları ve güvenlik.",
      duration: "Hızlı Quiz: 10 soru • Deneme: 50 soru",
      questionCount: "10 soru",
      difficulty: "Kolay-Orta",
      tips: [
        "Gerçek sınav: 50 soru, 45 dakika",
        "En az 35 doğru yaparak geçebilirsiniz",
        "Trafik işaretleri ve ilk yardım önemli"
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            >
              <BookOpen className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {categoryInfo[categoryId as keyof typeof categoryInfo]?.description || category.description}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Süre</h3>
                <p className="text-gray-600">{categoryInfo[categoryId as keyof typeof categoryInfo]?.duration}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Soru Sayısı</h3>
                <p className="text-gray-600">{categoryInfo[categoryId as keyof typeof categoryInfo]?.questionCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Zorluk</h3>
                <Badge variant="secondary">
                  {categoryInfo[categoryId as keyof typeof categoryInfo]?.difficulty}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Tips */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Başarı İpuçları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {categoryInfo[categoryId as keyof typeof categoryInfo]?.tips.map((tip, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <ArrowRight className="w-4 h-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Quiz Mode Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group h-full" onClick={() => onStartQuiz('quick')}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                      <Play className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Hızlı Quiz</h3>
                      <p className="text-sm text-gray-600">10 soru • 5-10 dakika</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Karışık sorularla hızlı pratik yapın. Her soru sonrası detaylı açıklama görün.
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-quick-quiz">
                    <Play className="w-4 h-4 mr-2" />
                    Quiz Başlat
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group h-full" onClick={() => onStartQuiz('exam')}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Deneme Sınavı</h3>
                      <p className="text-sm text-gray-600">Gerçek sınav formatı</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Gerçek {category.name} sınav deneyimi yaşayın. Orijinal format ve zamanlama.
                    {categoryId === 'yks' && ' (120 soru - 165 dk)'}
                    {categoryId === 'kpss' && ' (120 soru - 150 dk)'}  
                    {categoryId === 'ehliyet' && ' (50 soru - 45 dk)'}
                  </p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed" 
                    data-testid="button-exam-mode"
                    disabled={!hasEnoughQuestions}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {hasEnoughQuestions ? 'Deneme Sınavı Başlat' : 'Çok Yakında'}
                  </Button>
                  {!hasEnoughQuestions && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Deneme sınavı için {requiredQuestions} soru gerekli (Mevcut: {availableQuestions})
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button 
                onClick={() => window.location.href = "/exams"}
                variant="outline" 
                size="lg"
                className="px-8 py-3 text-lg"
                data-testid="button-back-to-exams"
              >
                Sınavlara Dön
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}