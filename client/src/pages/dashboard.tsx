import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Plus, PlayCircle } from "lucide-react";
import Header from "@/components/Header";
import ExamCard from "@/components/ExamCard";
import ProgressOverview from "@/components/ProgressOverview";
import Achievements from "@/components/Achievements";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CategorySelection } from "@/components/quiz/CategorySelection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExamCategory, UserProgress } from "@shared/schema";
import { Achievement } from "@/lib/types";
import { MOCK_USER_ID, calculateAccuracy } from "@/lib/quiz-data";
import { MotionDiv, containerVariants, itemVariants } from "@/components/AnimationWrappers";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [showCategorySelection, setShowCategorySelection] = useState(false);

  // Mock user data
  const mockUser = {
    username: "Ahmet Yılmaz",
    level: 12,
    totalPoints: 2450,
    streakDays: 7,
    initials: "AY"
  };

  // Fetch exam categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<ExamCategory[]>({
    queryKey: ["/api/exam-categories"],
  });

  // Fetch user progress
  const { data: userProgress = [], isLoading: progressLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/users", MOCK_USER_ID, "progress"],
  });

  // Mock achievements data
  const mockAchievements: Achievement[] = [
    {
      id: "streak-7",
      name: "7 Gün Seri",
      description: "Günlük çalışma",
      icon: "fas fa-medal",
      color: "yellow",
      isEarned: true
    },
    {
      id: "questions-100",
      name: "100 Soru",
      description: "Toplam çözüm",
      icon: "fas fa-star",
      color: "purple",
      isEarned: true
    },
    {
      id: "accuracy-80",
      name: "80% Başarı",
      description: "Son 10 soruda",
      icon: "fas fa-bullseye",
      color: "green",
      isEarned: true
    },
    {
      id: "study-time",
      name: "2 Saat",
      description: "Bugün çalışma",
      icon: "fas fa-clock",
      color: "blue",
      isEarned: true
    }
  ];

  // Calculate weekly stats
  const weeklyStats = {
    questionsAnswered: userProgress.reduce((sum, p) => sum + p.questionsAnswered, 0) || 187,
    correctAnswers: userProgress.reduce((sum, p) => sum + p.correctAnswers, 0) || 142,
    studyTime: userProgress.reduce((sum, p) => sum + (p.studyTimeMinutes / 60), 0) || 4.2,
    accuracy: userProgress.length > 0 
      ? calculateAccuracy(
          userProgress.reduce((sum, p) => sum + p.correctAnswers, 0),
          userProgress.reduce((sum, p) => sum + p.questionsAnswered, 0)
        )
      : 76
  };

  const handleStartExam = (categoryId: string) => {
    setLocation(`/quiz/${categoryId}`);
  };

  const getProgressForCategory = (categoryId: string): number => {
    const progress = userProgress.find(p => p.examCategoryId === categoryId);
    if (!progress || progress.questionsAnswered === 0) {
      // Return mock progress values
      if (categoryId === "yks") return 67;
      if (categoryId === "kpss") return 23;
      if (categoryId === "driving") return 89;
      return 0;
    }
    return calculateAccuracy(progress.correctAnswers, progress.questionsAnswered);
  };

  const getBadgeForCategory = (categoryId: string): string => {
    if (categoryId === "yks") return "Popüler";
    if (categoryId === "kpss") return "Yeni";
    if (categoryId === "driving") return "Hızlı";
    return "";
  };

  if (categoriesLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-bg-soft dark:bg-gray-900">
        <Header user={mockUser} />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Quiz verileri yükleniyor..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft dark:bg-gray-900">
      <Header user={mockUser} />
      
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-primary to-secondary text-white relative overflow-hidden">
            <CardContent className="p-6 relative z-10">
              <motion.h2 
                className="text-2xl md:text-3xl font-bold mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                data-testid="welcome-message"
              >
                Hoş geldin, {mockUser.username.split(' ')[0]}!
              </motion.h2>
              <motion.p 
                className="text-white/90 mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Bugün hangi sınava hazırlanmak istiyorsun?
              </motion.p>
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-white/20 rounded-lg px-3 py-1">
                  <span className="text-sm font-medium">Seviye: </span>
                  <span className="font-bold" data-testid="user-level">{mockUser.level}</span>
                </div>
                <div className="bg-white/20 rounded-lg px-3 py-1">
                  <span className="text-sm font-medium">Puan: </span>
                  <span className="font-bold" data-testid="user-points">{mockUser.totalPoints.toLocaleString()}</span>
                </div>
              </motion.div>
              <div className="absolute top-4 right-4 opacity-20">
                <i className="fas fa-trophy text-6xl"></i>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <ProgressOverview stats={weeklyStats} />
        </motion.div>

        {/* Exam Categories */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white" id="exams">Sınav Kategorileri</h3>
            <Button
              onClick={() => setShowCategorySelection(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Duolingo Quiz
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <ExamCard
                key={category.id}
                category={category}
                progress={getProgressForCategory(category.id)}
                onStart={handleStartExam}
                badge={getBadgeForCategory(category.id)}
                index={index}
              />
            ))}
            
            {/* Gamification Hub Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + (categories.length * 0.1), duration: 0.5 }}
            >
              <Card 
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-purple-200 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950"
                onClick={() => setLocation('/gamification')}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform">
                      🏆
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200 mb-2">
                    Gamification Hub
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400 text-sm mb-4">
                    XP, başarılar, liderlik tablosu ve daha fazlası!
                  </p>
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Yeni Özellik!
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Achievements achievements={mockAchievements} />
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <Button
          size="lg"
          className="w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-full shadow-lg hover:shadow-xl btn-primary"
          onClick={() => {
            // Quick quiz with random category
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            if (randomCategory) {
              handleStartExam(randomCategory.id);
            }
          }}
          data-testid="button-quick-quiz"
        >
          <Plus className="text-xl" />
        </Button>
      </motion.div>

      {/* Category Selection Modal */}
      {showCategorySelection && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Duolingo Style Quiz</h2>
            <Button
              variant="ghost"
              onClick={() => setShowCategorySelection(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Plus className="w-5 h-5 transform rotate-45" />
            </Button>
          </div>
          
          <CategorySelection
            categories={categories}
            onSelectCategory={(categoryId) => {
              setShowCategorySelection(false);
              setLocation(`/quiz/${categoryId}`);
            }}
            userProgress={categories.reduce((acc, cat) => ({
              ...acc,
              [cat.id]: getProgressForCategory(cat.id)
            }), {})}
          />
        </div>
      )}
    </div>
  );
}
