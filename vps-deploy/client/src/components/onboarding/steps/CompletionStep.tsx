import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Rocket, Heart } from 'lucide-react';
import BilgiBiteMascot from '@/components/mascot/BilgiBiteMascot';

interface CompletionStepProps {
  userData: any;
  onNext: () => void;
}

export default function CompletionStep({ userData, onNext }: CompletionStepProps) {
  const getWelcomeMessage = () => {
    const level = userData.assessmentResults?.skillLevel || 'Başlangıç';
    const goals = userData.goals || [];
    
    if (level === 'İleri') {
      return "Harika! İleri seviyende olduğun görünüyor. Seni zorlu sorularla karşılayacağız! 🔥";
    } else if (level === 'Orta') {
      return "Güzel! Orta seviyedesin. Seni daha da ileriye taşıyacağız! 💪";
    } else {
      return "Mükemmel! Temellerden başlayıp seni zirveye çıkaracağız! ⭐";
    }
  };

  const getGoalSummary = () => {
    const goalMap: { [key: string]: string } = {
      'yks': 'YKS',
      'kpss': 'KPSS', 
      'driving': 'Ehliyet',
      'general': 'Genel Kültür'
    };
    
    return userData.goals?.map((goal: string) => goalMap[goal]).join(', ') || 'Henüz belirlenmedi';
  };

  return (
    <div className="max-w-3xl mx-auto text-center space-y-8">
      {/* Animated Success */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        className="relative"
      >
        <BilgiBiteMascot emotion="celebrating" size="lg" />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 0,
              rotate: 0 
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 200],
              y: [0, -Math.random() * 100 - 50],
              scale: [0, 1, 0],
              rotate: [0, 360]
            }}
            transition={{
              duration: 2,
              delay: 0.5 + i * 0.1,
              ease: "easeOut"
            }}
            style={{
              left: '50%',
              top: '50%'
            }}
          />
        ))}
      </motion.div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Tebrikler! 🎉
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          BilgiBite ailesi seni kaydıyla karşılıyor!
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-2xl">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {getWelcomeMessage()}
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Seviyeniz
            </h3>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {userData.assessmentResults?.skillLevel || 'Başlangıç'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <Rocket className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Hedefleriniz
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getGoalSummary()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Günlük Hedef
            </h3>
            <p className="text-lg font-bold text-purple-600">
              {userData.studyPlan?.dailyTarget || 20} soru
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-2xl"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Şimdi ne olacak? 🚀
        </h3>
        <ul className="text-left space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span>Seviyene uygun sorularla öğrenmeye başlayacaksın</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span>Her doğru cevapla puan kazanacak ve seviye atlayacaksın</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span>Başarılarını rozet ve başarımlarla kutlayacağız</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            <span>İlerlemeni takip edecek ve motive etmeye devam edeceğiz</span>
          </li>
        </ul>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, type: "spring" }}
        className="space-y-4"
      >
        <Button
          onClick={onNext}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary text-white px-12 py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all"
          data-testid="button-start-learning"
        >
          Öğrenmeye Başla! 🎓
        </Button>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Hazırsan, ilk quizin seni bekliyor! 💪
        </p>
      </motion.div>
    </div>
  );
}