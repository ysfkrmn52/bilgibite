import { motion } from "framer-motion";
import { Trophy, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateAccuracy } from "@/lib/quiz-data";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    correctAnswers: number;
    totalQuestions: number;
    pointsEarned: number;
    timeSpent: number;
  };
  onStartNewQuiz: () => void;
  onBackToDashboard: () => void;
}

export default function ResultModal({ 
  isOpen, 
  onClose, 
  result, 
  onStartNewQuiz, 
  onBackToDashboard 
}: ResultModalProps) {
  if (!isOpen) return null;

  const accuracy = calculateAccuracy(result.correctAnswers, result.totalQuestions);

  return (
    <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4" data-testid="result-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-br from-success to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Trophy className="text-white text-2xl" />
              </motion.div>
              
              <motion.h3 
                className="text-2xl font-bold text-text-dark mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Tebrikler!
              </motion.h3>
              
              <motion.p 
                className="text-gray-600 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Quiz tamamlandı
              </motion.p>
              
              <motion.div 
                className="space-y-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Doğru Cevap:</span>
                  <span className="font-bold text-success" data-testid="result-correct-answers">
                    {result.correctAnswers}/{result.totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Başarı Oranı:</span>
                  <span className="font-bold text-text-dark" data-testid="result-accuracy">
                    {accuracy}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Kazanılan Puan:</span>
                  <span className="font-bold text-primary" data-testid="result-points">
                    +{result.pointsEarned}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Süre:</span>
                  <span className="font-bold text-text-dark" data-testid="result-time">
                    {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex flex-col gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white btn-primary"
                  onClick={onStartNewQuiz}
                  data-testid="button-new-quiz"
                >
                  <RotateCcw className="mr-2 w-4 h-4" />
                  Yeni Quiz Başlat
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onBackToDashboard}
                  data-testid="button-back-dashboard"
                >
                  <Home className="mr-2 w-4 h-4" />
                  Ana Sayfaya Dön
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
