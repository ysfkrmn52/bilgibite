// AI Tutor Chatbot Component
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Lightbulb, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  relatedTopics?: string[];
  difficulty?: string;
}

interface AITutorChatProps {
  userId: string;
  currentTopic?: string;
  recentErrors?: string[];
  userLevel?: number;
  className?: string;
}

export default function AITutorChat({
  userId,
  currentTopic,
  recentErrors = [],
  userLevel = 1,
  className = ""
}: AITutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Merhaba! Ben BilgiBite AI öğretmeninim. Sana nasıl yardımcı olabilirim? 🤖',
      timestamp: new Date(),
      suggestions: [
        'Bu konuyu açıkla',
        'Örnek soru iste',
        'Çalışma tüyoları',
        'Motivasyon desteği'
      ]
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/ai/users/${userId}/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentMessage,
          currentTopic,
          recentErrors,
          userLevel
        })
      });

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response.response,
        timestamp: new Date(),
        suggestions: data.response.suggestion ? [data.response.suggestion] : undefined,
        relatedTopics: data.response.relatedTopics,
        difficulty: data.response.difficulty
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Tutor Error:', error);
      toast({
        title: "Hata",
        description: "AI öğretmen şu anda yanıt veremiyor. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Bot className="w-5 h-5 text-blue-600" />
          <span>AI Öğretmen</span>
          {currentTopic && (
            <Badge variant="outline" className="ml-auto">
              {currentTopic}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 p-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 max-h-96">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'ai' && (
                      <Bot className="w-4 h-4 mt-1 text-blue-600" />
                    )}
                    {message.type === 'user' && (
                      <User className="w-4 h-4 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {/* AI Suggestions */}
                      {message.suggestions && (
                        <div className="mt-2 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center space-x-1 text-xs">
                              <Lightbulb className="w-3 h-3" />
                              <span className="italic">{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Related Topics */}
                      {message.relatedTopics && message.relatedTopics.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.relatedTopics.map((topic, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs cursor-pointer hover:bg-blue-100"
                              onClick={() => handleSuggestionClick(`${topic} konusunu açıkla`)}
                            >
                              <BookOpen className="w-3 h-3 mr-1" />
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-blue-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-2"
          >
            {[
              'Bu konuyu açıkla',
              'Örnek soru ver',
              'Çalışma tüyoları',
              'Motivasyon desteği'
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs h-8"
              >
                {suggestion}
              </Button>
            ))}
          </motion.div>
        )}

        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Sorunuzu yazın..."
            disabled={isLoading}
            className="flex-1"
            data-testid="input-ai-chat"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isLoading}
            size="sm"
            className="px-3"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Context Info */}
        {(currentTopic || recentErrors.length > 0) && (
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-4">
            {currentTopic && (
              <div className="flex items-center space-x-1">
                <BookOpen className="w-3 h-3" />
                <span>Konu: {currentTopic}</span>
              </div>
            )}
            {recentErrors.length > 0 && (
              <div className="flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{recentErrors.length} son hata</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}