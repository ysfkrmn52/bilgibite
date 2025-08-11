import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Brain, Zap } from 'lucide-react';
import BilgiBiteMascot from '@/components/mascot/BilgiBiteMascot';

interface PersonalizationStepProps {
  userData: any;
  updateUserData: (data: any) => void;
  onNext: () => void;
}

const studyTimeOptions = [
  { id: '15min', label: '15 dakika', icon: '⚡', description: 'Hızlı tekrar' },
  { id: '30min', label: '30 dakika', icon: '🎯', description: 'Ideal süre', popular: true },
  { id: '45min', label: '45 dakika', icon: '🔥', description: 'Yoğun çalışma' },
  { id: '60min', label: '1 saat', icon: '💪', description: 'Derinlemesine' },
  { id: 'flexible', label: 'Esnek', icon: '🌊', description: 'Günlük değişken' }
];

const learningStyles = [
  { id: 'visual', label: 'Görsel', icon: '👁️', description: 'Resim ve grafikleri seviyorum' },
  { id: 'audio', label: 'İşitsel', icon: '🎧', description: 'Dinleyerek öğreniyorum' },
  { id: 'practical', label: 'Uygulamalı', icon: '✋', description: 'Yaparak öğreniyorum' },
  { id: 'reading', label: 'Okuyarak', icon: '📖', description: 'Metin okumayı tercih ederim' }
];

const difficultyPreferences = [
  { id: 'easy', label: 'Kolay başla', description: 'Güven kazanarak ilerlemek istiyorum' },
  { id: 'medium', label: 'Orta seviye', description: 'Dengeli zorluk seviyesi istiyorum' },
  { id: 'hard', label: 'Zorluğa hazırım', description: 'Kendimi test etmek istiyorum' }
];

export default function PersonalizationStep({ userData, updateUserData, onNext }: PersonalizationStepProps) {
  const [studyTime, setStudyTime] = useState(userData.studyTime || '30min');
  const [learningStyle, setLearningStyle] = useState(userData.learningStyle || []);
  const [difficulty, setDifficulty] = useState(userData.difficulty || 'medium');
  const [motivation, setMotivation] = useState(userData.motivation || [50]);
  const [reminderFrequency, setReminderFrequency] = useState(userData.reminderFrequency || [1]);

  const toggleLearningStyle = (style: string) => {
    const newStyles = learningStyle.includes(style)
      ? learningStyle.filter((s: string) => s !== style)
      : [...learningStyle, style];
    setLearningStyle(newStyles);
  };

  const handleNext = () => {
    updateUserData({
      studyTime,
      learningStyle,
      difficulty,
      motivation: motivation[0],
      reminderFrequency: reminderFrequency[0],
      preferences: {
        studyTime,
        learningStyle,
        difficulty,
        motivation: motivation[0],
        reminderFrequency: reminderFrequency[0]
      }
    });
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <BilgiBiteMascot emotion="happy" size="md" className="mx-auto" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Öğrenme tarzını kişiselleştir
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Sana en uygun öğrenme deneyimini oluşturmak için birkaç tercihini öğrenmek istiyoruz
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Günlük Çalışma Süresi */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Günlük Çalışma Süresi
                </h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {studyTimeOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => setStudyTime(option.id)}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      studyTime === option.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    data-testid={`study-time-${option.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{option.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      {option.popular && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Popüler
                        </Badge>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Öğrenme Tarzı */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Öğrenme Tarzı
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Birden fazla seçebilirsin
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {learningStyles.map((style) => (
                  <motion.button
                    key={style.id}
                    onClick={() => toggleLearningStyle(style.id)}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      learningStyle.includes(style.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    data-testid={`learning-style-${style.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{style.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {style.label}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {style.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Zorluk Seviyesi */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Başlangıç Zorluğu
                </h3>
              </div>
              
              <div className="space-y-3">
                {difficultyPreferences.map((pref) => (
                  <motion.button
                    key={pref.id}
                    onClick={() => setDifficulty(pref.id)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      difficulty === pref.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    data-testid={`difficulty-${pref.id}`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pref.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {pref.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Motivasyon ve Hatırlatma */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Motivasyon Ayarları
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    Motivasyon Seviyesi: %{motivation[0]}
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Ne kadar teşvik ve kutlama istiyorsun?
                  </p>
                  <Slider
                    value={motivation}
                    onValueChange={setMotivation}
                    max={100}
                    step={10}
                    className="w-full"
                    data-testid="motivation-slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Az</span>
                    <span>Orta</span>
                    <span>Çok</span>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">
                    Günlük Hatırlatma: {reminderFrequency[0]} kez
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Günde kaç kez hatırlatalım?
                  </p>
                  <Slider
                    value={reminderFrequency}
                    onValueChange={setReminderFrequency}
                    max={5}
                    min={0}
                    step={1}
                    className="w-full"
                    data-testid="reminder-slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Hiç</span>
                    <span>Az</span>
                    <span>Çok</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Button
          onClick={handleNext}
          size="lg"
          className="bg-gradient-to-r from-primary to-secondary text-white px-8"
          data-testid="button-continue-personalization"
        >
          Kişiselleştirmeyi Tamamla
        </Button>
      </motion.div>
    </div>
  );
}