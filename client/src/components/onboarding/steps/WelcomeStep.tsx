import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BilgiBiteMascot from '@/components/mascot/BilgiBiteMascot';
import { useAuth } from '@/contexts/AuthContext';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { currentUser } = useAuth();
  
  const firstName = currentUser?.displayName?.split(' ')[0] || 'Arkadaş';

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-8">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
      >
        <BilgiBiteMascot emotion="excited" size="lg" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Merhaba {firstName}! 👋
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl">
          BilgiBite'a hoş geldin! Seni muhteşem bir öğrenme yolculuğuna çıkaracağız.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full"
      >
        <Card className="p-6 text-center border-2 border-transparent hover:border-primary/20 transition-all">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Kişisel Hedefler
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sınav hedeflerini belirle ve ona göre özelleştirilmiş plan al
            </p>
          </CardContent>
        </Card>

        <Card className="p-6 text-center border-2 border-transparent hover:border-primary/20 transition-all">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              İlerleme Takibi
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gelişimini takip et ve başarılarını kutla
            </p>
          </CardContent>
        </Card>

        <Card className="p-6 text-center border-2 border-transparent hover:border-primary/20 transition-all">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Eğlenceli Öğrenme
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gamification ile öğrenmeyi keyifli hale getir
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Button 
          onClick={onNext}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 text-lg"
          data-testid="button-start-journey"
        >
          Yolculuğa Başla! 🚀
        </Button>
      </motion.div>
    </div>
  );
}