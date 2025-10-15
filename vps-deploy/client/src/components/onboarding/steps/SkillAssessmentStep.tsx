import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import BilgiBiteMascot from '@/components/mascot/BilgiBiteMascot';

interface SkillAssessmentStepProps {
  userData: any;
  updateUserData: (data: any) => void;
  onNext: () => void;
}

const assessmentQuestions = [
  {
    id: 1,
    question: "Türkiye'nin başkenti neresidir?",
    options: ["İstanbul", "Ankara", "İzmir", "Antalya"],
    correct: 1,
    category: "Genel Kültür",
    difficulty: "Kolay"
  },
  {
    id: 2,
    question: "2 × 15 + 8 işleminin sonucu kaçtır?",
    options: ["30", "38", "46", "40"],
    correct: 1,
    category: "Matematik",
    difficulty: "Kolay"
  },
  {
    id: 3,
    question: "Osmanlı İmparatorluğu kaç yılında kurulmuştur?",
    options: ["1299", "1300", "1301", "1298"],
    correct: 0,
    category: "Tarih",
    difficulty: "Orta"
  },
  {
    id: 4,
    question: "Hangisi bir enerji türü değildir?",
    options: ["Kinetik", "Potansiyel", "Termal", "Manyetik"],
    correct: 3,
    category: "Fizik",
    difficulty: "Orta"
  },
  {
    id: 5,
    question: "Şu cümledeki yazım hatası nerede?",
    options: [
      "Bugün hava çok güzel",
      "Arkadaşımla sinemaya gittim",
      "Kitabı okumayı seviyorum",
      "Hepsi doğru"
    ],
    correct: 3,
    category: "Türkçe",
    difficulty: "Zor"
  }
];

export default function SkillAssessmentStep({ userData, updateUserData, onNext }: SkillAssessmentStepProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const question = assessmentQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / assessmentQuestions.length) * 100;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);

      if (currentQuestion < assessmentQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(30);
      } else {
        // Test tamamlandı
        const correctAnswers = newAnswers.reduce((count, answer, index) => {
          return count + (answer === assessmentQuestions[index].correct ? 1 : 0);
        }, 0);

        const percentage = (correctAnswers / assessmentQuestions.length) * 100;
        let skillLevel = 'Başlangıç';
        
        if (percentage >= 80) skillLevel = 'İleri';
        else if (percentage >= 60) skillLevel = 'Orta';
        else if (percentage >= 40) skillLevel = 'Başlangıç-Orta';

        updateUserData({
          assessmentResults: {
            score: correctAnswers,
            total: assessmentQuestions.length,
            percentage,
            skillLevel,
            answers: newAnswers
          }
        });

        setIsCompleted(true);
      }
    }
  };

  const getResultColor = () => {
    const percentage = (userData.assessmentResults?.percentage || 0);
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMascotEmotion = () => {
    const percentage = (userData.assessmentResults?.percentage || 0);
    if (percentage >= 80) return 'celebrating';
    if (percentage >= 60) return 'happy';
    if (percentage >= 40) return 'encouraging';
    return 'thinking';
  };

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <BilgiBiteMascot emotion={getMascotEmotion()} size="lg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Seviye Testi Tamamlandı! 🎉
          </h2>
          
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getResultColor()}`}>
                  {userData.assessmentResults?.score}/{userData.assessmentResults?.total}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  %{Math.round(userData.assessmentResults?.percentage || 0)} başarı
                </p>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Seviyeniz
                </h3>
                <p className={`text-lg font-bold ${getResultColor()}`}>
                  {userData.assessmentResults?.skillLevel}
                </p>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bu seviye testine göre size uygun sorular ve çalışma planı hazırlayacağız.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={onNext}
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary text-white px-8"
            data-testid="button-continue-assessment"
          >
            Devam Et
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <BilgiBiteMascot emotion="thinking" size="md" className="mx-auto" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Seviye Belirleme Testi
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Size uygun sorular hazırlayabilmemiz için kısa bir test yapıyoruz
          </p>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Soru {currentQuestion + 1} / {assessmentQuestions.length}
          </span>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {question.category}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {question.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {question.question}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === index
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid={`option-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                        selectedAnswer === index
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {option}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center">
        <Button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary text-white px-8"
          data-testid="button-next-question"
        >
          {currentQuestion === assessmentQuestions.length - 1 ? 'Testi Bitir' : 'Sonraki Soru'}
        </Button>
      </div>
    </div>
  );
}