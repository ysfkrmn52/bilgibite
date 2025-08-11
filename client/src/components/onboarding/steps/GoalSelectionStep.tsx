import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import BilgiBiteMascot from '@/components/mascot/BilgiBiteMascot';

interface GoalSelectionStepProps {
  userData: any;
  updateUserData: (data: any) => void;
  onNext: () => void;
}

const examGoals = [
  {
    id: 'yks',
    name: 'YKS',
    description: 'Yükseköğretim Kurumları Sınavı',
    icon: '🎓',
    color: 'from-blue-500 to-blue-600',
    popular: true
  },
  {
    id: 'kpss',
    name: 'KPSS',
    description: 'Kamu Personeli Seçme Sınavı',
    icon: '🏛️',
    color: 'from-green-500 to-green-600',
    new: true
  },
  {
    id: 'driving',
    name: 'Ehliyet',
    description: 'Sürücü Kursu Sınavı',
    icon: '🚗',
    color: 'from-orange-500 to-orange-600',
    fast: true
  },
  {
    id: 'general',
    name: 'Genel Kültür',
    description: 'Genel bilgi ve kültür',
    icon: '📚',
    color: 'from-purple-500 to-purple-600'
  }
];

export default function GoalSelectionStep({ userData, updateUserData, onNext }: GoalSelectionStepProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userData.goals || []);

  const toggleGoal = (goalId: string) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter(id => id !== goalId)
      : [...selectedGoals, goalId];
    
    setSelectedGoals(newGoals);
    updateUserData({ goals: newGoals });
  };

  const handleNext = () => {
    if (selectedGoals.length > 0) {
      onNext();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <BilgiBiteMascot emotion="thinking" size="md" className="mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Hangi sınavlara hazırlanmak istiyorsun?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Birden fazla seçim yapabilirsin. Daha sonra değiştirebilirsin.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {examGoals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedGoals.includes(goal.id)
                  ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => toggleGoal(goal.id)}
              data-testid={`goal-${goal.id}`}
            >
              <CardContent className="p-6 relative">
                {selectedGoals.includes(goal.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}

                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${goal.color} rounded-2xl flex items-center justify-center text-2xl`}>
                    {goal.icon}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {goal.name}
                      </h3>
                      {goal.popular && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Popüler
                        </Badge>
                      )}
                      {goal.new && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Yeni
                        </Badge>
                      )}
                      {goal.fast && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Hızlı
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {goal.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Button
          onClick={handleNext}
          disabled={selectedGoals.length === 0}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary text-white px-8"
          data-testid="button-continue-goals"
        >
          Devam Et ({selectedGoals.length} hedef seçildi)
        </Button>
      </motion.div>

      {selectedGoals.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400"
        >
          Lütfen en az bir hedef seç
        </motion.p>
      )}
    </div>
  );
}