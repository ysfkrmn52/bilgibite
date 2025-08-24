import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  BookOpen, 
  MessageCircle, 
  Zap, 
  Target, 
  TrendingUp,
  Play,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Users,
  Clock,
  BarChart3,
  Lightbulb,
  Rocket,
  Star,
  Coins,
  ShoppingCart,
  AlertCircle,
  Wand2,
  Trophy,
  PlusCircle
} from "lucide-react";

interface WeakArea {
  topic: string;
  category: string;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const aiFeatures = [
  {
    id: 'tutor',
    title: 'AI Kişisel Öğretmen',
    description: 'Size özel sınırsız sohbet ve öğrenme desteği',
    icon: MessageCircle,
    gradient: 'from-blue-500 to-cyan-500',
    cost: '2 kredi/mesaj',
    benefits: ['24/7 erişim', 'Anında yanıt', 'Kişisel yaklaşım']
  },
  {
    id: 'questions',
    title: 'Akıllı Soru Üretimi',
    description: 'Zayıf yönlerinize odaklanmış soru üretimi',
    icon: Brain,
    gradient: 'from-purple-500 to-pink-500',
    cost: '5 kredi/10 soru',
    benefits: ['Adaptif zorluk', 'Konu odaklı', 'Otomatik entegrasyon']
  },
  {
    id: 'planner',
    title: 'AI Çalışma Planlayıcı',
    description: 'Hedeflerinize özel çalışma programı',
    icon: Target,
    gradient: 'from-green-500 to-emerald-500',
    cost: '10 kredi/plan',
    benefits: ['Kişisel program', 'Günlük öneriler', 'Sınav optimizasyonu']
  },
  {
    id: 'analytics',
    title: 'Gelişmiş Analitik',
    description: 'AI destekli öğrenme analizi ve öneriler',
    icon: BarChart3,
    gradient: 'from-orange-500 to-red-500',
    cost: '8 kredi/rapor',
    benefits: ['Detaylı analiz', 'Güçlü/zayıf yön', 'Akıllı öneriler']
  }
];

const stats = [
  { label: 'Öğrenci Memnuniyeti', value: '%97', icon: Users, color: 'text-blue-600' },
  { label: 'Başarı Artışı', value: '%35', icon: TrendingUp, color: 'text-green-600' },
  { label: 'AI Soru Üretimi', value: '250K+', icon: Brain, color: 'text-purple-600' },
  { label: 'Aktif Kullanıcı', value: '50K+', icon: CheckCircle, color: 'text-orange-600' }
];

export default function AIEducationNew() {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [customTopic, setCustomTopic] = useState<string>("");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questionCategory, setQuestionCategory] = useState<string>("tyt");
  const [activeFeature, setActiveFeature] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock user ID - in real app this would come from auth context
  const userId = "user123";

  // Fetch user's credit balance
  const { data: creditBalance } = useQuery({
    queryKey: [`/api/ai-credits/balance/${userId}`],
    retry: false
  });

  // Default balance to prevent undefined errors
  const currentBalance = creditBalance?.balance || 0;

  // Fetch user's weak areas from quiz performance
  const { data: weakAreas, isLoading: weakAreasLoading } = useQuery({
    queryKey: ['/api/ai/weak-areas'],
  });

  // Fetch chat sessions
  const { data: chatSessions, isLoading: chatLoading } = useQuery({
    queryKey: ['/api/ai/chat-sessions'],
  });

  // Topic explanation mutation
  const explainTopicMutation = useMutation({
    mutationFn: async ({ topic }: { topic: string }) => {
      const response = await fetch('/api/ai/explain-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      if (!response.ok) throw new Error('Topic explanation failed');
      return response.json();
    },
    onSuccess: (data) => {
      setActiveChat(data.chatId);
      toast({ 
        title: 'Konu Anlatımı Hazır', 
        description: 'AI asistanınız konuyu detaylarıyla açıkladı!' 
      });
    },
    onError: () => {
      toast({ 
        title: 'Hata', 
        description: 'Konu anlatımı sırasında bir hata oluştu',
        variant: 'destructive'
      });
    }
  });

  // Generate questions mutation
  const generateQuestionsMutation = useMutation({
    mutationFn: async ({ topic, count, category }: { topic: string, count: number, category: string }) => {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, count, category })
      });
      if (!response.ok) throw new Error('Question generation failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: 'Sorular Hazırlandı!', 
        description: `${data.questionsGenerated} soru başarıyla oluşturuldu`,
      });
    }
  });

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % aiFeatures.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI Eğitim Merkezi
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto mb-6">
            Yapay zeka destekli kişiselleştirilmiş öğrenme deneyimi. Zayıf yönlerinizi güçlendirin, 
            AI öğretmeninizle sohbet edin ve özel sorular üretin.
          </p>

          {/* Credit Balance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg border"
          >
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-gray-700">
              Mevcut Kredi: {currentBalance}
            </span>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              data-testid="button-buy-credits"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Kredi Al
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div key={index} variants={cardVariants}>
                <Card className="text-center p-6 border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
                  <IconComponent className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* AI Features Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="overflow-hidden border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center py-8">
              <CardTitle className="text-3xl font-bold mb-2">AI Özellikler</CardTitle>
              <CardDescription className="text-indigo-100 text-lg">
                Yapay zeka ile öğrenme deneyiminizi geliştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Feature Cards */}
                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className={`p-6 rounded-xl bg-gradient-to-r ${aiFeatures[activeFeature].gradient} text-white`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {React.createElement(aiFeatures[activeFeature].icon, { className: "w-8 h-8" })}
                        <h3 className="text-xl font-bold">{aiFeatures[activeFeature].title}</h3>
                      </div>
                      <p className="mb-4 opacity-90">{aiFeatures[activeFeature].description}</p>
                      <div className="flex items-center gap-2 mb-4">
                        <Coins className="w-4 h-4" />
                        <span className="text-sm font-medium">{aiFeatures[activeFeature].cost}</span>
                      </div>
                      <ul className="space-y-2">
                        {aiFeatures[activeFeature].benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>

                  {/* Feature Navigation */}
                  <div className="flex gap-2 justify-center">
                    {aiFeatures.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveFeature(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === activeFeature ? 'bg-purple-500' : 'bg-gray-300'
                        }`}
                        data-testid={`button-feature-${index}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Interactive Demo */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Play className="w-5 h-5 text-green-600" />
                      Canlı Demo
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-600">Siz:</span>
                        </div>
                        <p className="text-gray-700">Matematik fonksiyonları konusunda yardım alabilir miyim?</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-purple-600">AI Öğretmen:</span>
                        </div>
                        <p className="text-gray-700">Tabii ki! Fonksiyonlar konusunu adım adım açıklayayım. Hangi seviyede çalışmak istiyorsunuz?</p>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        AI Öğretmen ile Konuşmaya Başla
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="weak-areas" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="weak-areas" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Zayıf Alanlar
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                AI Sohbet
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Soru Üretimi
              </TabsTrigger>
              <TabsTrigger value="planner" className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Çalışma Planı
              </TabsTrigger>
            </TabsList>

            {/* Weak Areas Tab */}
            <TabsContent value="weak-areas">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-6 h-6 text-red-600" />
                    Geliştirilmesi Gereken Alanlar
                  </CardTitle>
                  <CardDescription>
                    Quiz performansınıza göre tespit edilen zayıf konularınız
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {weakAreasLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {(weakAreas || [])?.map((area: WeakArea, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-800">{area.topic}</h3>
                              <p className="text-sm text-gray-600">{area.category}</p>
                            </div>
                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                              %{area.accuracy} başarı
                            </Badge>
                          </div>
                          <Progress value={area.accuracy} className="mb-3" />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                explainTopicMutation.mutate({ topic: area.topic });
                              }}
                              disabled={explainTopicMutation.isPending}
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                              data-testid={`button-explain-${index}`}
                            >
                              <Lightbulb className="w-4 h-4 mr-1" />
                              Konu Anlatımı
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                generateQuestionsMutation.mutate({ 
                                  topic: area.topic, 
                                  count: 10, 
                                  category: area.category 
                                });
                              }}
                              disabled={generateQuestionsMutation.isPending}
                              data-testid={`button-generate-${index}`}
                            >
                              <Wand2 className="w-4 h-4 mr-1" />
                              Soru Üret
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                    AI Öğretmen Sohbeti
                  </CardTitle>
                  <CardDescription>
                    7/24 kişisel AI öğretmeninizle sohbet edin
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6">
                    {/* Chat Sessions */}
                    <div>
                      <h3 className="font-semibold mb-4">Son Sohbetler</h3>
                      <div className="grid gap-3">
                        {(chatSessions || [])?.map((session: ChatSession, index: number) => (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 cursor-pointer hover:shadow-md transition-all"
                            onClick={() => setActiveChat(session.id)}
                            data-testid={`chat-session-${session.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-800">{session.title}</h4>
                              <Badge variant="secondary">{session.messages.length} mesaj</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {new Date(session.updatedAt).toLocaleDateString('tr-TR')}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* New Chat */}
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-purple-600" />
                        Yeni Sohbet Başlat
                      </h3>
                      <div className="flex gap-3">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="AI öğretmeninize sorunuzu yazın..."
                          className="flex-1 min-h-[100px]"
                          data-testid="textarea-new-message"
                        />
                        <Button
                          onClick={() => {
                            if (newMessage.trim()) {
                              // Start new chat session
                              toast({
                                title: "Yeni Sohbet Başlatıldı",
                                description: "AI öğretmeniniz size yardımcı olmaya hazır!"
                              });
                            }
                          }}
                          disabled={!newMessage.trim()}
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                          data-testid="button-start-chat"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Sohbeti Başlat
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Question Generation Tab */}
            <TabsContent value="questions">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-600" />
                    Akıllı Soru Üretimi
                  </CardTitle>
                  <CardDescription>
                    İhtiyacınıza özel sorular üretin ve pratik yapın
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Konu</label>
                        <Input
                          value={customTopic}
                          onChange={(e) => setCustomTopic(e.target.value)}
                          placeholder="Örn: Fonksiyonlar"
                          data-testid="input-custom-topic"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Soru Sayısı</label>
                        <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                          <SelectTrigger data-testid="select-question-count">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 Soru</SelectItem>
                            <SelectItem value="10">10 Soru</SelectItem>
                            <SelectItem value="20">20 Soru</SelectItem>
                            <SelectItem value="50">50 Soru</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Kategori</label>
                        <Select value={questionCategory} onValueChange={setQuestionCategory}>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tyt">TYT</SelectItem>
                            <SelectItem value="ayt">AYT</SelectItem>
                            <SelectItem value="kpss">KPSS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Soru Üretimi</h3>
                        <div className="flex items-center gap-2 text-sm text-purple-600">
                          <Coins className="w-4 h-4" />
                          Maliyet: {Math.ceil(questionCount / 10) * 5} kredi
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          if (customTopic.trim()) {
                            generateQuestionsMutation.mutate({
                              topic: customTopic,
                              count: questionCount,
                              category: questionCategory
                            });
                          }
                        }}
                        disabled={!customTopic.trim() || generateQuestionsMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        data-testid="button-generate-questions"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        {generateQuestionsMutation.isPending ? 'Sorular Üretiliyor...' : 'Soru Üret'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Study Planner Tab */}
            <TabsContent value="planner">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-green-600" />
                    AI Çalışma Planlayıcı
                  </CardTitle>
                  <CardDescription>
                    Hedeflerinize özel kişiselleştirilmiş çalışma programı
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <Trophy className="w-8 h-8 text-green-600 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Hedef Belirleme</h3>
                        <p className="text-gray-600 mb-4">Sınav tarihinizi ve hedef puanınızı belirleyin</p>
                        <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                          <Target className="w-4 h-4 mr-2" />
                          Hedef Belirle
                        </Button>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <Clock className="w-8 h-8 text-blue-600 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Günlük Program</h3>
                        <p className="text-gray-600 mb-4">Size özel günlük çalışma programı oluşturun</p>
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                          <Rocket className="w-4 h-4 mr-2" />
                          Program Oluştur
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
                <h2 className="text-3xl font-bold mb-4">AI ile Öğrenmeye Başlayın</h2>
                <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                  Yapay zeka destekli kişiselleştirilmiş eğitim deneyimi ile hedeflerinize daha hızlı ulaşın
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-3"
                  data-testid="button-get-started"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Hemen Başla
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}