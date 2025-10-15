import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BilgiBiteMascot from '@/components/mascot/BilgiBiteMascot';
import WelcomeStep from './steps/WelcomeStep';
import GoalSelectionStep from './steps/GoalSelectionStep';
import SkillAssessmentStep from './steps/SkillAssessmentStep';
import PersonalizationStep from './steps/PersonalizationStep';
import StudyPlanStep from './steps/StudyPlanStep';
import CompletionStep from './steps/CompletionStep';

interface OnboardingFlowProps {
  onComplete: (userData: any) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    goals: [],
    skillLevel: '',
    studyTime: '',
    examType: '',
    preferences: {},
    assessmentResults: {}
  });

  const steps = [
    { component: WelcomeStep, title: 'Hoş Geldin!' },
    { component: GoalSelectionStep, title: 'Hedeflerini Seç' },
    { component: SkillAssessmentStep, title: 'Seviye Testi' },
    { component: PersonalizationStep, title: 'Kişiselleştir' },
    { component: StudyPlanStep, title: 'Çalışma Planı' },
    { component: CompletionStep, title: 'Hazırsın!' }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(userData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateUserData = (data: any) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <BilgiBiteMascot emotion="encouraging" size="sm" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  BilgiBite
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Öğrenme Yolculuğuna Başla
                </p>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentStep + 1} / {steps.length}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{steps[currentStep].title}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="min-h-[calc(100vh-200px)]"
          >
            <CurrentStepComponent
              userData={userData}
              updateUserData={updateUserData}
              onNext={nextStep}
              onPrev={prevStep}
              canGoNext={true}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Geri</span>
            </Button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  animate={{
                    scale: index === currentStep ? 1.2 : 1,
                  }}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary"
              data-testid="button-next"
            >
              <span>
                {currentStep === steps.length - 1 ? 'Başla' : 'İleri'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}