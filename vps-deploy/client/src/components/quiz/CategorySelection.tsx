// Duolingo-style Category Selection Interface
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Clock, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExamCategory } from '@shared/schema';

interface CategorySelectionProps {
  categories: ExamCategory[];
  onSelectCategory: (categoryId: string) => void;
  userProgress?: {[categoryId: string]: number};
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const categoryData: {[key: string]: any} = {
  'yks': {
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100',
    darkBgGradient: 'from-blue-900/20 to-blue-800/20',
    popularity: 'En Popüler',
    difficulty: 'Zor',
    averageTime: '45 dk',
    participants: '125.4k',
    topics: ['Matematik', 'Türkçe', 'Fen', 'Sosyal']
  },
  'kpss': {
    gradient: 'from-green-500 to-green-600',
    bgGradient: 'from-green-50 to-green-100',
    darkBgGradient: 'from-green-900/20 to-green-800/20',
    popularity: 'Trending',
    difficulty: 'Orta',
    averageTime: '30 dk',
    participants: '89.2k',
    topics: ['Genel Yetenek', 'Genel Kültür', 'ÖABT']
  },
  'driving': {
    gradient: 'from-orange-500 to-orange-600',
    bgGradient: 'from-orange-50 to-orange-100',
    darkBgGradient: 'from-orange-900/20 to-orange-800/20',
    popularity: 'Hızlı',
    difficulty: 'Kolay',
    averageTime: '15 dk',
    participants: '67.8k',
    topics: ['Trafik Kuralları', 'İşaretler', 'Güvenlik']
  },
  'src': {
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-purple-100',
    darkBgGradient: 'from-purple-900/20 to-purple-800/20',
    popularity: 'Yeni',
    difficulty: 'Orta',
    averageTime: '25 dk',
    participants: '12.3k',
    topics: ['Denizcilik', 'Güvenlik', 'Navigasyon']
  }
};

function CategoryCard({ category, onSelect, progress = 0 }: { 
  category: ExamCategory;
  onSelect: (categoryId: string) => void;
  progress?: number;
}) {
  const data = categoryData[category.id] || categoryData['yks'];

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={`bg-gradient-to-br ${data.bgGradient} dark:${data.darkBgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer h-full`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${data.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
              <i className={`${category.icon} text-white text-lg`}></i>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge className="bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-white text-xs">
                {data.popularity}
              </Badge>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {category.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {category.description}
            </p>
          </div>

          {/* Topics */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {data.topics.slice(0, 3).map((topic: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs bg-white/50 dark:bg-gray-800/50">
                  {topic}
                </Badge>
              ))}
              {data.topics.length > 3 && (
                <Badge variant="outline" className="text-xs bg-white/50 dark:bg-gray-800/50">
                  +{data.topics.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Zorluk</div>
              <div className="font-semibold text-gray-800 dark:text-white text-sm">{data.difficulty}</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center justify-center">
                <Clock className="w-3 h-3 mr-1" />
                Süre
              </div>
              <div className="font-semibold text-gray-800 dark:text-white text-sm">{data.averageTime}</div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center justify-center">
                <Users className="w-3 h-3 mr-1" />
                Katılım
              </div>
              <div className="font-semibold text-gray-800 dark:text-white text-sm">{data.participants}</div>
            </div>
          </div>

          {/* Progress */}
          {progress > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">İlerleme</span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={() => onSelect(category.id)}
            className={`w-full bg-gradient-to-r ${data.gradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            {progress > 0 ? 'Devam Et' : 'Başla'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CategorySelection({ categories, onSelectCategory, userProgress = {} }: CategorySelectionProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          Hangi Sınava Hazırlanıyorsun?
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Duolingo tarzında eğlenceli ve etkileşimli quiz deneyimi ile sınavına hazırlan
        </p>
      </motion.div>

      {/* Featured Stats */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">250k+</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Aktif Kullanıcı</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">15M+</div>
            <div className="text-sm text-green-600 dark:text-green-400">Çözülen Soru</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">4.8★</div>
            <div className="text-sm text-purple-600 dark:text-purple-400">Ortalama Puan</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-0">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">95%</div>
            <div className="text-sm text-orange-600 dark:text-orange-400">Başarı Oranı</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onSelect={onSelectCategory}
            progress={userProgress[category.id] || 0}
          />
        ))}
      </motion.div>
    </div>
  );
}