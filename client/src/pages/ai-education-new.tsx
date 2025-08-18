import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Brain, BookOpen, MessageCircle, Zap, Target, TrendingUp } from "lucide-react";

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

export default function AIEducationNew() {
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [customTopic, setCustomTopic] = useState<string>("");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questionCategory, setQuestionCategory] = useState<string>("tyt");

  // Fetch user's weak areas from quiz performance
  const { data: weakAreas, isLoading: weakAreasLoading } = useQuery({
    queryKey: ['/api/ai/weak-areas'],
    queryFn: () => fetch('/api/ai/weak-areas').then(res => res.json())
  });

  // Fetch chat sessions
  const { data: chatSessions, isLoading: chatLoading } = useQuery({
    queryKey: ['/api/ai/chat-sessions'],
    queryFn: () => fetch('/api/ai/chat-sessions').then(res => res.json())
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
      // Create new chat session with the explanation
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

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ chatId, message }: { chatId: string, message: string }) => {
      const response = await fetch(`/api/ai/chat/${chatId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error('Message sending failed');
      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      // Refresh chat sessions to get updated messages
      // queryClient.invalidateQueries({ queryKey: ['/api/ai/chat-sessions'] });
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

  const handleStartExam = () => {
    // Navigate to quiz with generated questions
    window.location.href = `/quiz?mode=ai-generated`;
  };

  const handleStartExamWithLastQuestions = () => {
    // Navigate to quiz with last generated questions
    window.location.href = `/quiz?mode=last-generated`;
  };

  const handleExplainTopic = (topic: string) => {
    explainTopicMutation.mutate({ topic });
  };

  const handleSendMessage = () => {
    if (!activeChat || !newMessage.trim()) return;
    sendMessageMutation.mutate({ chatId: activeChat, message: newMessage.trim() });
  };

  const mockWeakAreas: WeakArea[] = [
    {
      topic: "Fonksiyonlar",
      category: "Matematik",
      accuracy: 45,
      totalQuestions: 20,
      correctAnswers: 9
    },
    {
      topic: "Paragraf Sorulari",
      category: "Türkçe", 
      accuracy: 60,
      totalQuestions: 15,
      correctAnswers: 9
    },
    {
      topic: "Hareket",
      category: "Fizik",
      accuracy: 55,
      totalQuestions: 12,
      correctAnswers: 7
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Eğitim Merkezi
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Yapay zeka destekli kişiselleştirilmiş öğrenme deneyimi. Eksik konularınızı tespit edin ve AI öğretmeninizle çalışın.
          </p>
        </div>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analiz & Öneriler
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              AI Öğretmen
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Soru Üretimi
            </TabsTrigger>
          </TabsList>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-5 w-5 text-red-500" />
                  Gelişime Açık Konularınız
                </CardTitle>
                <CardDescription>
                  Sınav performansınıza göre odaklanmanız gereken konular
                </CardDescription>
              </CardHeader>
              <CardContent>
                {weakAreasLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Analiz ediliyor...</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {mockWeakAreas.map((area, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{area.topic}</h3>
                            <Badge variant="secondary" className="mt-1">
                              {area.category}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">
                              %{area.accuracy}
                            </div>
                            <p className="text-sm text-gray-600">
                              {area.correctAnswers}/{area.totalQuestions} doğru
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleExplainTopic(area.topic)}
                          disabled={explainTopicMutation.isPending}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          {explainTopicMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              AI Öğretmene Soruyorum...
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4 mr-2" />
                              Bu Konuyu AI ile Çalış
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Topic Request */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Özel Konu Talebi
                </CardTitle>
                <CardDescription>
                  İstediğiniz herhangi bir konuyu AI öğretmenimizle çalışın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Örnek: 'İkinci dereceden denklemleri detaylı olarak anlat' veya 'Osmanlı İmparatorluğu'nun kuruluş dönemini açıkla'"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  rows={3}
                  className="bg-white/80"
                />
                <Button
                  onClick={() => handleExplainTopic(customTopic)}
                  disabled={!customTopic.trim() || explainTopicMutation.isPending}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  {explainTopicMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Hazırlanıyor...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      AI Öğretmen ile Çalış
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chat Sessions Sidebar */}
              <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Önceki Sohbetler</CardTitle>
                </CardHeader>
                <CardContent>
                  {chatLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chatSessions?.map((session: ChatSession) => (
                        <Button
                          key={session.id}
                          variant={activeChat === session.id ? "default" : "ghost"}
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => setActiveChat(session.id)}
                        >
                          <div>
                            <p className="font-medium line-clamp-1">{session.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(session.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="lg:col-span-3 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                    AI Öğretmen Sohbeti
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!activeChat ? (
                    <div className="text-center py-12 text-gray-500">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Sohbet başlatmak için bir konu seçin veya yeni sohbet oluşturun</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Messages Area */}
                      <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
                        {/* Mock messages will be loaded here */}
                        <div className="text-center text-gray-500 py-8">
                          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>Sohbet mesajları burada görünecek</p>
                        </div>
                      </div>

                      {/* Message Input */}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Sorunuzu yazın..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={1}
                          className="flex-1 bg-white"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sendMessageMutation.isPending}
                          className="bg-gradient-to-r from-purple-600 to-blue-600"
                        >
                          {sendMessageMutation.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            'Gönder'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Question Generation Tab */}
          <TabsContent value="questions" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  AI Soru Üretimi
                </CardTitle>
                <CardDescription>
                  İstediğiniz konuda AI ile sorular üreterek çalışın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Generation Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Konu</label>
                    <Textarea
                      placeholder="Örnek: Fonksiyonlar, Türkçe Gramer, Fizik Hareket..."
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      rows={2}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Soru Sayısı</label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full p-2 border rounded-md bg-white"
                    >
                      <option value={5}>5 Soru</option>
                      <option value={10}>10 Soru</option>
                      <option value={15}>15 Soru</option>
                      <option value={20}>20 Soru</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kategori</label>
                    <select
                      value={questionCategory}
                      onChange={(e) => setQuestionCategory(e.target.value)}
                      className="w-full p-2 border rounded-md bg-white"
                    >
                      <option value="tyt">TYT</option>
                      <option value="ayt">AYT</option>
                      <option value="kpss">KPSS</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={() => generateQuestionsMutation.mutate({ 
                    topic: selectedTopic, 
                    count: questionCount, 
                    category: questionCategory 
                  })}
                  disabled={!selectedTopic.trim() || generateQuestionsMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-12 text-lg"
                >
                  {generateQuestionsMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      AI Sorular Üretiyor...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      {questionCount} Soru Üret ve Sınava Başla
                    </>
                  )}
                </Button>

                {/* Success State - Show after successful generation */}
                {generateQuestionsMutation.isSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                    <div className="text-center">
                      <div className="text-green-600 font-semibold text-lg mb-2">
                        🎉 Sorular Hazırlandı!
                      </div>
                      <p className="text-gray-600 mb-4">
                        AI tarafından {questionCount} adet {selectedTopic} konusunda soru üretildi.
                        Şimdi denemek ister misiniz?
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={handleStartExam}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        ✅ Evet, Sınava Başla!
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => generateQuestionsMutation.reset()}
                      >
                        ❌ Hayır, Başka Sorular Üret
                      </Button>
                    </div>
                  </div>
                )}

                {/* Backup option for accidentally clicking No */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900">Son Üretilen Sorular</h3>
                      <p className="text-sm text-blue-700">
                        Yanlışlıkla "Hayır" dediyseniz, son soralarla sınava başlayabilirsiniz
                      </p>
                    </div>
                    <Button
                      onClick={handleStartExamWithLastQuestions}
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Son Sorular ile Sınava Başla
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}