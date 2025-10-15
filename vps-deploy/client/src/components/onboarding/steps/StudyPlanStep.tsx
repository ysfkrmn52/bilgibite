import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Target, Trophy, CheckCircle } from 'lucide-react';
import BilgiBiteMascot from '@/components/mascot/BilgiBiteMascot';

interface StudyPlanStepProps {
  userData: any;
  updateUserData: (data: any) => void;
  onNext: () => void;
}

export default function StudyPlanStep({ userData, updateUserData, onNext }: StudyPlanStepProps) {
  const [generatedPlan, setGeneratedPlan] = React.useState<any>(null);

  React.useEffect(() => {
    if (userData && !generatedPlan) {
      const plan = generateStudyPlan();
      setGeneratedPlan(plan);
    }
  }, [userData, generatedPlan]);

  const generateStudyPlan = () => {
    const { goals, studyTime, difficulty, assessmentResults } = userData;
    
    // Çalışma planı oluştur
    const planData = {
      weeklyGoal: getWeeklyGoal(studyTime),
      dailyTarget: getDailyTarget(studyTime),
      difficulty: difficulty,
      estimatedCompletion: getEstimatedCompletion(goals, difficulty),
      subjects: getSubjectsForGoals(goals),
      schedule: generateWeeklySchedule(studyTime)
    };

    updateUserData({ studyPlan: planData });
    return planData;
  };

  const getWeeklyGoal = (studyTime: string) => {
    const timeMap: { [key: string]: number } = {
      '15min': 105, // 15 * 7
      '30min': 210, // 30 * 7  
      '45min': 315, // 45 * 7
      '60min': 420, // 60 * 7
      'flexible': 200
    };
    return timeMap[studyTime] || 200;
  };

  const getDailyTarget = (studyTime: string) => {
    const targetMap: { [key: string]: number } = {
      '15min': 10,
      '30min': 20,
      '45min': 30,
      '60min': 40,
      'flexible': 25
    };
    return targetMap[studyTime] || 20;
  };

  const getEstimatedCompletion = (goals: string[], difficulty: string) => {
    const baseWeeks = goals.length * 8; // Her hedef için 8 hafta
    const difficultyMultiplier = difficulty === 'hard' ? 1.2 : difficulty === 'easy' ? 0.8 : 1;
    return Math.ceil(baseWeeks * difficultyMultiplier);
  };

  const getSubjectsForGoals = (goals: string[]) => {
    const subjectMap: { [key: string]: string[] } = {
      'yks': ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilimler'],
      'kpss': ['Genel Kültür', 'Genel Yetenek', 'Eğitim Bilimleri', 'Alan Bilgisi'],
      'driving': ['Trafik Kuralları', 'Araç Tekniği', 'İlk Yardım', 'Motor ve Araç'],
      'general': ['Genel Kültür', 'Matematik', 'Türkçe', 'Fen Bilimleri']
    };
    
    const allSubjects = goals.flatMap((goal: string) => subjectMap[goal] || []);
    return Array.from(new Set(allSubjects)); // Duplicates'i kaldır
  };

  const generateWeeklySchedule = (studyTime: string) => {
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const timePerDay = studyTime === 'flexible' ? '20-40 dk' : 
                      studyTime.replace('min', ' dk').replace('60', '1 saat');
    
    return days.map((day: string) => ({
      day,
      duration: timePerDay,
      recommended: day !== 'Pazar' // Pazar dinlenme günü
    }));
  };

  // Planı state'ten al veya default değerler kullan
  const currentPlan = generatedPlan || {
    dailyTarget: 20,
    weeklyGoal: 140,
    estimatedCompletion: 12,
    subjects: ['Matematik', 'Türkçe'],
    schedule: []
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <BilgiBiteMascot emotion="celebrating" size="md" className="mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Kişisel Çalışma Planın Hazır! 📚
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Tercihlerine göre özel olarak hazırladığımız çalışma planını incele
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Özeti */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Plan Özeti</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentPlan.dailyTarget}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Günlük Soru
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {currentPlan.weeklyGoal}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Haftalık Dakika
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Tahmini Tamamlama</span>
                  <Badge variant="secondary">
                    {currentPlan.estimatedCompletion} hafta
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Zorluk Seviyesi</span>
                  <Badge variant="outline">
                    {userData?.difficulty === 'easy' ? 'Kolay' : 
                     userData?.difficulty === 'hard' ? 'Zor' : 'Orta'}
                  </Badge>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">İlerleme</span>
                  <span className="text-sm text-gray-500">0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Konular */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span>Çalışma Konuları</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentPlan.subjects.map((subject: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{subject}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Başlamadı
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Haftalık Program */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Haftalık Çalışma Programı</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                {currentPlan.schedule.map((day: any, index: number) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg text-center ${
                      day.recommended 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm">{day.day}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {day.recommended ? day.duration : 'Dinlenme'}
                    </div>
                    {day.recommended && (
                      <Clock className="w-3 h-3 mx-auto mt-1 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Button 
          onClick={onNext}
          size="lg" 
          className="w-full sm:w-auto px-8"
          data-testid="button-continue"
        >
          Planımı Onayla ve Devam Et
          <Target className="w-4 h-4 ml-2" />
        </Button>
        
        <p className="text-sm text-gray-500 mt-3">
          Bu planı daha sonra ayarlar kısmından değiştirebilirsin
        </p>
      </motion.div>
    </div>
  );
}