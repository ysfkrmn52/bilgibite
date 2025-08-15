import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap,
  Building,
  Car,
  Radio,
  BookOpen,
  Clock,
  Target,
  Trophy,
  Play,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';

// Symmetric exam data with consistent structure
const examCategories = [
  {
    id: "yks",
    name: "YKS",
    fullName: "Yükseköğretim Kurumları Sınavı",
    icon: GraduationCap,
    color: "from-blue-500 to-purple-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    iconColor: "text-blue-600",
    questionsCount: 450,
    totalStudents: 2500000,
    averageScore: 65,
    userProgress: 75,
    description: "Üniversiteye giriş sınavı. Matematik, Türkçe, Fen ve Sosyal alanları kapsıyor."
  },
  {
    id: "kpss",
    name: "KPSS", 
    fullName: "Kamu Personeli Seçme Sınavı",
    icon: Building,
    color: "from-green-500 to-teal-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    iconColor: "text-green-600",
    questionsCount: 320,
    totalStudents: 1800000,
    averageScore: 58,
    userProgress: 60,
    description: "Kamu kurumlarında çalışmak için gerekli sınav. Genel Kültür ve Genel Yetenek alanları."
  },
  {
    id: "ehliyet",
    name: "Ehliyet",
    fullName: "Sürücü Kursu Sınavı", 
    icon: Car,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    iconColor: "text-orange-600",
    questionsCount: 180,
    totalStudents: 850000,
    averageScore: 78,
    userProgress: 40,
    description: "Sürücü belgesi almak için gerekli teorik sınav. Trafik kuralları ve işaretler."
  },
  {
    id: "src",
    name: "SRC",
    fullName: "Mesleki Yeterlilik Sınavları (SRC1-4)",
    icon: Radio,
    color: "from-pink-500 to-rose-600", 
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
    iconColor: "text-pink-600",
    questionsCount: 200,
    totalStudents: 120000,
    averageScore: 72,
    userProgress: 30,
    description: "SRC1-4 mesleki yeterlilik sınavları. Yolcu ve yük taşımacılığı için gerekli."
  },
  {
    id: "ales",
    name: "ALES",
    fullName: "Akademik Personel ve Lisansüstü Eğitimi Giriş Sınavı",
    icon: BookOpen,
    color: "from-indigo-500 to-blue-600",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    iconColor: "text-indigo-600",
    questionsCount: 80,
    totalStudents: 350000,
    averageScore: 55,
    userProgress: 45,
    description: "Lisansüstü eğitim ve akademik kariyer için gerekli sınav."
  },
  {
    id: "dgs",
    name: "DGS",
    fullName: "Dikey Geçiş Sınavı",
    icon: GraduationCap,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    iconColor: "text-purple-600",
    questionsCount: 120,
    totalStudents: 180000,
    averageScore: 62,
    userProgress: 55,
    description: "Önlisans mezunlarının 4 yıllık programa geçiş sınavı."
  },
  {
    id: "meb-ogretmenlik",
    name: "MEB Öğretmenlik",
    fullName: "Öğretmenlik Alan Bilgisi Sınavı",
    icon: Users,
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    iconColor: "text-emerald-600",
    questionsCount: 75,
    totalStudents: 450000,
    averageScore: 68,
    userProgress: 35,
    description: "MEB öğretmenlik kadroları için alan bilgisi ve eğitim bilimleri sınavı."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function SymmetricExams() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Sınavlar
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hedeflediğin sınavı seç ve hazırlığa başla. Her sınav için özel hazırlanmış sorular ve detaylı analizler.
          </p>
        </motion.div>

        {/* Exam Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10"
        >
          {examCategories.map((exam) => {
            const IconComponent = exam.icon;
            return (
              <motion.div key={exam.id} variants={cardVariants}>
                <Card className="h-80 hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
                  <div className={`h-20 bg-gradient-to-r ${exam.color} relative`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    <div className="relative h-full flex items-center justify-between px-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{exam.name}</h3>
                        <p className="text-white/80 text-sm">{exam.fullName}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {exam.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`${exam.bgColor} p-3 rounded-lg text-center`}>
                          <BookOpen className={`w-5 h-5 mx-auto mb-1 ${exam.iconColor}`} />
                          <div className={`text-lg font-bold ${exam.textColor}`}>{exam.questionsCount}</div>
                          <div className="text-xs text-gray-600">Soru</div>
                        </div>
                        
                        <div className={`${exam.bgColor} p-3 rounded-lg text-center`}>
                          <Users className={`w-5 h-5 mx-auto mb-1 ${exam.iconColor}`} />
                          <div className={`text-lg font-bold ${exam.textColor}`}>
                            {(exam.totalStudents / 1000000).toFixed(1)}M
                          </div>
                          <div className="text-xs text-gray-600">Aday</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">İlerleme</span>
                          <span className={`font-medium ${exam.textColor}`}>{exam.userProgress}%</span>
                        </div>
                        <Progress value={exam.userProgress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-500">Ortalama: </span>
                          <span className={`font-medium ${exam.textColor}`}>{exam.averageScore}</span>
                        </div>
                        <Badge variant="outline" className={`${exam.textColor} border-current`}>
                          Popüler
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <Button 
                        className={`w-full bg-gradient-to-r ${exam.color} hover:scale-105 transition-transform text-white border-0 shadow-lg`}
                        asChild
                        data-testid={`button-start-exam-${exam.id}`}
                      >
                        <Link href={`/quiz?category=${exam.id}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Sınavı Başlat
                        </Link>
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          asChild
                          data-testid={`button-stats-${exam.id}`}
                        >
                          <Link href={`/analytics?exam=${exam.id}`}>
                            <BarChart3 className="w-3 h-3 mr-1" />
                            İstatistik
                          </Link>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          asChild
                          data-testid={`button-schedule-${exam.id}`}
                        >
                          <Link href={`/dashboard?tab=calendar&exam=${exam.id}`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            Program
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Card className="inline-block p-6 bg-gradient-to-r from-gray-50 to-blue-50">
            <h3 className="text-lg font-semibold mb-4">Daha Fazla Özellik</h3>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild data-testid="button-all-analytics">
                <Link href="/analytics">
                  <Trophy className="w-4 h-4 mr-2" />
                  Genel İstatistikler
                </Link>
              </Button>
              
              <Button variant="outline" asChild data-testid="button-study-plan">
                <Link href="/dashboard">
                  <Target className="w-4 h-4 mr-2" />
                  Çalışma Planı
                </Link>
              </Button>
              
              <Button variant="outline" asChild data-testid="button-ai-help">
                <Link href="/ai-learning">
                  <BookOpen className="w-4 h-4 mr-2" />
                  AI Yardımcı
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}