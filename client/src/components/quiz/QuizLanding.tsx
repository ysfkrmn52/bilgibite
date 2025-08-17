import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Clock, Target, Trophy, BookOpen, ArrowRight, Play } from "lucide-react";
import { ExamCategory } from "@shared/schema";

interface QuizLandingProps {
  categoryId: string;
  onStartQuiz: () => void;
}

export default function QuizLanding({ categoryId, onStartQuiz }: QuizLandingProps) {
  const { data: categories = [] } = useQuery<ExamCategory[]>({
    queryKey: ["/api/exam-categories"],
  });

  const category = categories.find(cat => cat.id === categoryId);

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
      description: "Üniversiteye giriş sınavı. Matematik, Türkçe, Fen ve Sosyal alanları.",
      duration: "2-5 dakika",
      questionCount: "5-20 soru",
      difficulty: "Orta",
      tips: [
        "Her soru için ortalama 15-30 saniye ayırın",
        "Emin olmadığınız sorularda tahmin yapın",
        "Zaman yönetimi çok önemli"
      ]
    },
    kpss: {
      description: "Kamu kurumlarında çalışmak için gerekli sınav.",
      duration: "2-5 dakika", 
      questionCount: "5-20 soru",
      difficulty: "Orta-Zor",
      tips: [
        "Genel kültür sorularına dikkat edin",
        "Güncel olayları takip etmeyi unutmayın",
        "Analitik düşünme becerilerinizi geliştirin"
      ]
    },
    ehliyet: {
      description: "Sürücü belgesi almak için gerekli teorik sınav.",
      duration: "2-5 dakika",
      questionCount: "5-20 soru", 
      difficulty: "Kolay-Orta",
      tips: [
        "Trafik işaretlerini iyi öğrenin",
        "Hız limitleri ve kuralları ezberleyin",
        "Güvenlik önceliklerini unutmayın"
      ]
    }
  };

  const info = categoryInfo[categoryId as keyof typeof categoryInfo] || categoryInfo.yks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="secondary" className="mb-4">
            {category.name} Sınavı
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            {category.name} Quiz'e Hoş Geldiniz
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {info.description}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Quiz Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Quiz Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Süre
                  </span>
                  <Badge variant="outline">{info.duration}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Target className="w-4 h-4" />
                    Soru Sayısı
                  </span>
                  <Badge variant="outline">{info.questionCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    Zorluk
                  </span>
                  <Badge variant="outline">{info.difficulty}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  İpuçları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {info.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Start Quiz Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Hazır mısınız?</h3>
                <p className="text-muted-foreground text-sm">
                  Quiz başlatıldıktan sonra geri dönemezsiniz.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={onStartQuiz}
                  className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                  size="lg"
                  data-testid="start-quiz-button"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Quiz'i Başlat
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "/exams"}
                  className="w-full"
                  data-testid="back-to-exams-button"
                >
                  Sınavlara Dön
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}