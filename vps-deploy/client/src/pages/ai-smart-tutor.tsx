import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  Brain, 
  Lightbulb,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Link } from 'wouter';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isEducational?: boolean;
}

export default function AISmartTutor() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Merhaba! Ben BilgiBite AI Öğretmenin. Size sadece eğitim konularında yardımcı olabilirim. Matematik, Türkçe, fen bilimleri gibi dersler hakkında sorularınızı sorabilir, konu anlatımı isteyebilirsiniz. Hangi konuda yardım almak istiyorsunuz?',
      timestamp: new Date(),
      isEducational: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Eğitim dışı konuları kontrol et
      const nonEducationalKeywords = [
        'siyaset', 'politika', 'haber', 'gündem', 'şarkı', 'müzik', 
        'oyun', 'film', 'dizi', 'arkadaş', 'aşk', 'kişisel', 'özel',
        'para', 'borsa', 'yatırım', 'alışveriş', 'moda'
      ];

      const isNonEducational = nonEducationalKeywords.some(keyword => 
        inputMessage.toLowerCase().includes(keyword)
      );

      let aiResponse: string;
      
      if (isNonEducational) {
        aiResponse = 'Üzgünüm, ben sadece eğitim amaçlı konularda yardımcı olabilirim. Matematik, Türkçe, fen bilimleri, tarih, coğrafya gibi ders konularında sorularınızı yanıtlayabilirim. Lütfen eğitimle ilgili bir konu hakkında soru sorun.';
      } else {
        // Basit AI simülasyonu - gerçek uygulamada API çağrısı olacak
        const response = await fetch('/api/ai/tutor-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: inputMessage,
            context: 'educational_only'
          })
        });

        if (response.ok) {
          const data = await response.json();
          aiResponse = data.response;
        } else {
          // Fallback response
          if (inputMessage.toLowerCase().includes('matematik')) {
            aiResponse = 'Matematik konusunda yardımcı olabilirim! Hangi matematik konusu hakkında bilgi almak istiyorsunuz? Örneğin: cebir, geometri, analiz, trigonometri...';
          } else if (inputMessage.toLowerCase().includes('türkçe')) {
            aiResponse = 'Türkçe dersi için buradayım! Dil bilgisi, edebiyat, kompozisyon yazma veya okuma anlama konularında yardım edebilirim.';
          } else if (inputMessage.toLowerCase().includes('fen') || inputMessage.toLowerCase().includes('fizik') || inputMessage.toLowerCase().includes('kimya') || inputMessage.toLowerCase().includes('biyoloji')) {
            aiResponse = 'Fen bilimleri alanında uzmanım! Fizik, kimya ve biyoloji konularında detaylı açıklamalar yapabilirim. Hangi konuyu merak ediyorsunuz?';
          } else {
            aiResponse = 'Bu konuda size yardımcı olmaya çalışayım. Daha spesifik bir soru sorarsanız daha detaylı açıklama yapabilirim. Hangi ders veya konu hakkında bilgi almak istiyorsunuz?';
          }
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        isEducational: !isNonEducational
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Üzgünüm, şu anda bir teknik sorun yaşıyorum. Lütfen daha sonra tekrar deneyin.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "Matematik: Türev nedir ve nasıl hesaplanır?",
    "Türkçe: Cümle ögeleri nelerdir?",
    "Fizik: Hareket yasaları açıkla",
    "Kimya: Asit ve baz nedir?",
    "Biyoloji: Hücre bölünmesi nasıl olur?",
    "Tarih: Osmanlı İmparatorluğu hakkında bilgi ver"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ai-education">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Kişisel Öğretmen</h1>
                <p className="text-gray-600">Sadece eğitim amaçlı sorularınızı yanıtlıyorum</p>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Aktif
          </Badge>
        </div>

        {/* Educational Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Eğitim Odaklı AI Asistanı</h3>
                <p className="text-blue-800 text-sm">
                  Ben sadece eğitim amaçlı çalışmak için programlandım. Matematik, Türkçe, fen bilimleri, 
                  tarih, coğrafya gibi ders konularında yardımcı olabilirim. Diğer konularda destek sunamam.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Sohbet
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user' 
                            ? 'bg-blue-600' 
                            : message.isEducational 
                              ? 'bg-green-600' 
                              : 'bg-orange-600'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>
                        
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.isEducational
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-orange-50 border border-orange-200'
                        }`}>
                          <p className={`text-sm ${
                            message.role === 'user' 
                              ? 'text-white' 
                              : message.isEducational 
                                ? 'text-green-900' 
                                : 'text-orange-900'
                          }`}>
                            {message.content}
                          </p>
                          <span className={`text-xs ${
                            message.role === 'user' 
                              ? 'text-blue-200' 
                              : message.isEducational 
                                ? 'text-green-600' 
                                : 'text-orange-600'
                          } mt-2 block`}>
                            {message.timestamp.toLocaleTimeString('tr-TR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-600">Yazıyor...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Eğitim konularında soru sorun..."
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Örnek Sorular
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full text-left justify-start h-auto py-2 text-xs"
                    onClick={() => setInputMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Özellikler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>Ders konuları anlatımı</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4 text-green-500" />
                  <span>Soru çözüm yöntemleri</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="w-4 h-4 text-purple-500" />
                  <span>Anında geri bildirim</span>
                </div>
              </CardContent>
            </Card>

            {/* Limitation Notice */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-800 text-sm">Sınırlamalar</h4>
                    <p className="text-amber-700 text-xs mt-1">
                      Sadece eğitim konularında yardımcı olabilirim. Diğer konularda sorulara cevap veremem.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}