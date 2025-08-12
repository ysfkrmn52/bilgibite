// AI Question Generator Component
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, BookOpen, Settings, ChevronDown, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AIQuestionGeneratorProps {
  userId: string;
  examCategories: Array<{ id: string; name: string; slug: string }>;
  userLevel: number;
  recentErrors?: string[];
  onQuestionsGenerated: (questions: any[]) => void;
  className?: string;
}

interface GenerationParams {
  examCategory: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  weakAreas: string[];
  topicsToFocus: string[];
  questionCount: number;
}

export default function AIQuestionGenerator({
  userId,
  examCategories,
  userLevel,
  recentErrors = [],
  onQuestionsGenerated,
  className = ""
}: AIQuestionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [params, setParams] = useState<GenerationParams>({
    examCategory: '',
    difficulty: 'intermediate',
    weakAreas: [],
    topicsToFocus: [],
    questionCount: 5
  });
  const [customTopic, setCustomTopic] = useState('');
  const [customWeakArea, setCustomWeakArea] = useState('');
  const { toast } = useToast();

  const handleGenerateQuestions = async () => {
    if (!params.examCategory) {
      toast({
        title: "Hata",
        description: "Lütfen bir sınav kategorisi seçin.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/ai/users/${userId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          userLevel,
          recentErrors
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onQuestionsGenerated(data.questions);
        toast({
          title: "Sorular oluşturuldu!",
          description: `${data.questions.length} adet AI soru hazırlandı.`
        });
      } else {
        throw new Error(data.error || 'Soru oluşturulamadı');
      }
    } catch (error) {
      console.error('AI Question Generation Error:', error);
      toast({
        title: "Hata",
        description: "AI soru üretimi başarısız oldu.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addCustomTopic = () => {
    if (customTopic.trim() && !params.topicsToFocus.includes(customTopic.trim())) {
      setParams(prev => ({
        ...prev,
        topicsToFocus: [...prev.topicsToFocus, customTopic.trim()]
      }));
      setCustomTopic('');
    }
  };

  const addCustomWeakArea = () => {
    if (customWeakArea.trim() && !params.weakAreas.includes(customWeakArea.trim())) {
      setParams(prev => ({
        ...prev,
        weakAreas: [...prev.weakAreas, customWeakArea.trim()]
      }));
      setCustomWeakArea('');
    }
  };

  const removeTopic = (topic: string) => {
    setParams(prev => ({
      ...prev,
      topicsToFocus: prev.topicsToFocus.filter(t => t !== topic)
    }));
  };

  const removeWeakArea = (area: string) => {
    setParams(prev => ({
      ...prev,
      weakAreas: prev.weakAreas.filter(a => a !== area)
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'border-green-300 bg-green-50 text-green-700';
      case 'intermediate': return 'border-yellow-300 bg-yellow-50 text-yellow-700';
      case 'advanced': return 'border-red-300 bg-red-50 text-red-700';
      default: return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wand2 className="w-5 h-5 text-purple-600" />
          <span>AI Soru Üretici</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Sınav Kategorisi</Label>
            <Select 
              value={params.examCategory} 
              onValueChange={(value) => setParams(prev => ({ ...prev, examCategory: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {examCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <Label>Zorluk Seviyesi</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={params.difficulty === difficulty ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setParams(prev => ({ ...prev, difficulty }))}
                  className={params.difficulty === difficulty ? getDifficultyColor(difficulty) : ''}
                >
                  {difficulty === 'beginner' && 'Başlangıç'}
                  {difficulty === 'intermediate' && 'Orta'}
                  {difficulty === 'advanced' && 'İleri'}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Question Count */}
        <div className="space-y-2">
          <Label>Soru Sayısı</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min="1"
              max="10"
              value={params.questionCount}
              onChange={(e) => setParams(prev => ({ 
                ...prev, 
                questionCount: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
              }))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              (1-10 arası)
            </span>
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Gelişmiş Ayarlar</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </Button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 border-t pt-4"
          >
            {/* Focus Topics */}
            <div className="space-y-2">
              <Label>Odaklanılacak Konular</Label>
              <div className="flex space-x-2">
                <Input
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Konu ekle..."
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTopic()}
                />
                <Button onClick={addCustomTopic} size="sm" variant="outline">
                  Ekle
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {params.topicsToFocus.map((topic, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => removeTopic(topic)}
                  >
                    {topic} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Weak Areas */}
            <div className="space-y-2">
              <Label>Zayıf Alanlar</Label>
              <div className="flex space-x-2">
                <Input
                  value={customWeakArea}
                  onChange={(e) => setCustomWeakArea(e.target.value)}
                  placeholder="Zayıf alan ekle..."
                  onKeyPress={(e) => e.key === 'Enter' && addCustomWeakArea()}
                />
                <Button onClick={addCustomWeakArea} size="sm" variant="outline">
                  Ekle
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {params.weakAreas.map((area, index) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="cursor-pointer hover:bg-red-100 border-red-300 text-red-700"
                    onClick={() => removeWeakArea(area)}
                  >
                    {area} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recent Errors */}
            {recentErrors.length > 0 && (
              <div className="space-y-2">
                <Label>Son Hatalar (Otomatik Eklendi)</Label>
                <div className="flex flex-wrap gap-2">
                  {recentErrors.slice(0, 3).map((error, index) => (
                    <Badge key={index} variant="destructive" className="opacity-70">
                      {error}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerateQuestions}
          disabled={isGenerating || !params.examCategory}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              AI Sorular Üretiliyor...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              {params.questionCount} AI Soru Üret
            </>
          )}
        </Button>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">
              AI, seviyenize ve zayıf alanlarınıza göre kişiselleştirilmiş sorular üretecek
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}