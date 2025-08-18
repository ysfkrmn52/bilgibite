import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Mock data for development
const mockWeakAreas = [
  {
    topic: "Fonksiyonlar", 
    category: "Matematik",
    accuracy: 45,
    totalQuestions: 20,
    correctAnswers: 9
  },
  {
    topic: "Paragraf Soruları",
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

const mockChatSessions = [
  {
    id: "chat-1",
    title: "Fonksiyonlar Konusu",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Fonksiyonları açıkla",
        timestamp: new Date()
      },
      {
        id: "msg-2", 
        role: "assistant",
        content: "Fonksiyon, her giriş değeri için tek bir çıkış değeri üreten matematiksel bir kuraldır...",
        timestamp: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Get user's weak areas based on quiz performance
router.get('/weak-areas', async (req, res) => {
  try {
    // TODO: Implement real analysis from user's quiz results
    // const userId = req.user?.id;
    // const weakAreas = await analyzeUserPerformance(userId);
    
    res.json(mockWeakAreas);
  } catch (error) {
    console.error('Error fetching weak areas:', error);
    res.status(500).json({ error: 'Zayıf alanlar alınamadı' });
  }
});

// Get chat sessions for user
router.get('/chat-sessions', async (req, res) => {
  try {
    // TODO: Fetch from database
    // const userId = req.user?.id;
    // const sessions = await getChatSessionsForUser(userId);
    
    res.json(mockChatSessions);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({ error: 'Sohbet geçmişi alınamadı' });
  }
});

// Create topic explanation with AI
router.post('/explain-topic', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Konu belirtilmelidir' });
    }

    // Generate explanation using Claude AI
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Sen bir Türk eğitim uzmanısın. "${topic}" konusunu lise seviyesinde, anlaşılır ve detaylı bir şekilde açıkla. 
        
        Açıklaman şunları içermeli:
        1. Temel tanım ve kavramlar
        2. Örneklerle açıklama  
        3. Formüller (varsa)
        4. Pratik uygulamalar
        5. Sık yapılan hatalar
        
        Türkçe olarak cevapla ve öğrencinin kolayca anlayabileceği bir dil kullan.`
      }],
    });

    const explanation = response.content[0].type === 'text' ? response.content[0].text : 'Açıklama alınamadı';

    // TODO: Save chat session to database
    const chatSession = {
      id: `chat-${Date.now()}`,
      title: topic,
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          role: 'user',
          content: `${topic} konusunu açıkla`,
          timestamp: new Date()
        },
        {
          id: `msg-${Date.now()}-2`, 
          role: 'assistant',
          content: explanation,
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json({
      success: true,
      chatId: chatSession.id,
      explanation: explanation,
      message: 'Konu anlatımı hazırlandı'
    });

  } catch (error) {
    console.error('Error generating topic explanation:', error);
    res.status(500).json({ error: 'Konu anlatımı oluşturulamadı' });
  }
});

// Send message to AI in existing chat
router.post('/chat/:chatId/message', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Mesaj boş olamaz' });
    }

    // TODO: Fetch chat history from database
    // const chatSession = await getChatSession(chatId);
    
    // Generate AI response
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Sen bir Türk eğitim uzmanısın. Öğrencinin sorusu: "${message}"
        
        Soruyu anlayışlı ve detaylı bir şekilde cevapla. Gerektiğinde örnekler ver ve konuyu pekiştirici bilgiler ekle.
        Türkçe olarak cevapla.`
      }],
    });

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : 'Yanıt alınamadı';

    // TODO: Save messages to database
    
    res.json({
      success: true,
      response: aiResponse,
      message: 'Mesaj gönderildi'
    });

  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ error: 'Mesaj gönderilemedi' });
  }
});

// Generate AI questions 
router.post('/generate-questions', async (req, res) => {
  try {
    const { topic, count = 10, category = 'tyt' } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Konu belirtilmelidir' });
    }

    const prompt = `Sen bir Türk eğitim uzmanısın. "${topic}" konusunda ${category.toUpperCase()} seviyesinde ${count} adet çoktan seçmeli soru üret.

    Her soru şu formatda olmalı:
    - Açık ve anlaşılır soru metni
    - 5 şık (A, B, C, D, E)  
    - Doğru cevap
    - Kısa açıklama

    JSON formatında cevapla:
    {
      "questions": [
        {
          "question": "Soru metni",
          "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı", "E şıkkı"],
          "correctAnswer": 0,
          "explanation": "Açıklama"
        }
      ]
    }`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }],
    });

    const aiResponse = response.content[0].type === 'text' ? response.content[0].text : '{}';
    
    // Parse JSON response
    let questionsData;
    try {
      questionsData = JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parsing fails, try to extract questions manually
      console.error('Failed to parse AI response as JSON:', parseError);
      return res.status(500).json({ error: 'AI yanıtı işlenemedi' });
    }

    // TODO: Save questions to database
    // const savedQuestions = await saveQuestionsToDatabase(questionsData.questions, category, topic);

    res.json({
      success: true,
      questionsGenerated: questionsData.questions?.length || count,
      topic: topic,
      category: category,
      message: `${questionsData.questions?.length || count} soru başarıyla üretildi`
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Sorular üretilemedi' });
  }
});

export default router;