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
  const generateStudyPlan = () => {
    const { goals, studyTime, difficulty, assessmentResults } = userData;
    
    // Çalışma planı oluştur
    const studyPlan = {
      weeklyGoal: getWeeklyGoal(studyTime),
      dailyTarget: getDailyTarget(studyTime),
      difficulty: difficulty,
      estimatedCompletion: getEstimatedCompletion(goals, difficulty),
      subjects: getSubjectsForGoals(goals),
      schedule: generateWeeklySchedule(studyTime)
    };

    updateUserData({ studyPlan });
    return studyPlan;
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
    
    const allSubjects = goals.flatMap(goal => subjectMap[goal] || []);
    return [...new Set(allSubjects)]; // Duplicates'i kaldır
  };

  const generateWeeklySchedule = (studyTime: string) => {
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const timePerDay = studyTime === 'flexible' ? '20-40 dk' : 
                      studyTime.replace('min', ' dk').replace('60', '1 saat');
    
    return days.map(day => ({
      day,
      duration: timePerDay,
      recommended: day !== 'Pazar' // Pazar dinlenme günü
    }));
  };

  const studyPlan = generateStudyPlan();

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
                    {studyPlan.dailyTarget}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Günlük Soru
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {studyPlan.weeklyGoal}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Haftalık Dakika
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Tahmini Tamamlanma
                  </span>
                  <Badge variant="outline">
                    {studyPlan.estimatedCompletion} hafta
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Zorluk Seviyesi
                  </span>
                  <Badge variant={studyPlan.difficulty === 'hard' ? 'destructive' : 
                               studyPlan.difficulty === 'easy' ? 'secondary' : 'default'}>
                    {studyPlan.difficulty === 'hard' ? 'Zor' :
                     studyPlan.difficulty === 'easy' ? 'Kolay' : 'Orta'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Çalışılacak Konular */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span>Çalışılacak Konular</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studyPlan.subjects.map((subject, index) => (
                  <motion.div
                    key={subject}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {subject}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Haftalık Takvim */}
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
                <span>Haftalık Çalışma Takvimi</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {studyPlan.schedule.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`p-4 rounded-lg text-center border-2 ${
                      day.recommended
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                        : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {day.day}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {day.recommended ? (
                        <>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {day.duration}
                        </>
                      ) : (
                        'Dinlenme'
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>İpucu:</strong> Bu plan senin tercihlerine göre hazırlandı. 
            İstediğin zaman ayarlarını değiştirebilirsin!
          </p>
        </div>
        
        <Button
          onClick={onNext}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary text-white px-8"
          data-testid="button-approve-plan"
        >
          Planı Onayla ve Devam Et
        </Button>
      </motion.div>
    </div>
  );
}