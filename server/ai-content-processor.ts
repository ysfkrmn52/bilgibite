import Anthropic from '@anthropic-ai/sdk';
import type { Request, Response } from 'express';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ProcessedContent {
  questions?: Array<{
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    topic: string;
    year?: number;
    questionNumber?: number;
  }>;
  courses?: Array<{
    title: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    topics: string[];
    estimatedDuration: number;
  }>;
  lessons?: Array<{
    title: string;
    content: string;
    category: string;
    topic: string;
    objectives: string[];
    estimatedTime: number;
  }>;
  error?: string;
  message?: string;
}

export async function processTYTPDFContent(
  fileContent: string
): Promise<ProcessedContent> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Bu TYT (Temel Yeterlilik Testi) PDF dosyasını analiz et ve içindeki tüm soruları konularına göre kategorize et. Her soru için:

1. Soru metni (tam metin)
2. 4 seçenek (A, B, C, D) 
3. Doğru cevap (0-3 arası index - metnde belirtilen doğru şıkka göre)
4. Detaylı açıklama (varsa)
5. Zorluk seviyesi (easy/medium/hard)
6. Ana kategori (türkçe, matematik, fizik, kimya, biyoloji, tarih, coğrafya, felsefe)
7. Alt konu/konu başlığı

ÖZEL KURALLAR:
- Her soru için kategoriyi PDF'teki bölüm başlığına göre belirle
- TYT kategorileri: türkçe, matematik, fizik, kimya, biyoloji, tarih, coğrafya, felsefe
- Alt konuları PDF'te belirtilen konu başlıklarından al
- Soru numaralarını ve yıllarını (2018-2024) takip et
- Sadece tam sorular işle, eksik olanları atla

JSON formatında döndür:
{
  "questions": [
    {
      "text": "Tam soru metni?",
      "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
      "correctAnswer": 2,
      "explanation": "Açıklama (varsa)",
      "difficulty": "medium",
      "category": "türkçe",
      "topic": "sözcükte anlam",
      "year": 2024,
      "questionNumber": 1
    }
  ]
}

İçerik:
${fileContent.substring(0, 50000)}`
      }]
    });

    const responseText = (response.content[0] as any).text;
    
    // Clean up the response text by removing markdown code blocks
    let cleanedText = responseText.trim();
    
    // Remove markdown code blocks more comprehensively
    cleanedText = cleanedText.replace(/^```(?:json)?\s*/gm, '').replace(/\s*```$/gm, '');
    
    // Try to extract JSON from the response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
    
    try {
      const parsedContent = JSON.parse(cleanedText);
      return parsedContent;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('AI Response:', responseText.substring(0, 500) + '...');
      
      // Return a structured error response instead of throwing
      return {
        error: 'PDF içeriği işlenemedi',
        message: 'AI tarafından geçerli soru formatı üretilemedi. PDF\'deki içeriği kontrol edin.',
        questions: []
      };
    }
  } catch (error) {
    console.error('TYT PDF processing error:', error);
    
    // Return a structured error response instead of throwing
    return {
      error: 'PDF işleme hatası',
      message: 'PDF dosyası işlenirken bir hata oluştu.',
      questions: []
    };
  }
}

export async function processEducationContent(
  fileContent: string,
  contentType: 'questions' | 'courses' | 'lessons'
): Promise<ProcessedContent> {
  const prompts = {
    questions: `Aşağıdaki eğitim materyalini analiz et ve her bölümden çoktan seçmeli sorular çıkar. Her soru için:

1. Soru metni
2. 4 seçenek (A, B, C, D)
3. Doğru cevap (0-3 arası index)
4. Detaylı açıklama
5. Zorluk seviyesi (easy/medium/hard)
6. Kategori (matematik, türkçe, fen, sosyal, vb.)
7. Alt konu

JSON formatında döndür:
{
  "questions": [
    {
      "text": "Soru metni?",
      "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
      "correctAnswer": 2,
      "explanation": "Detaylı açıklama",
      "difficulty": "medium",
      "category": "matematik",
      "topic": "geometri"
    }
  ]
}

Materyal:
${fileContent}`,

    courses: `Aşağıdaki eğitim içeriğini analiz et ve mantıklı kurs modüllerine böl. Her kurs için:

1. Kurs başlığı
2. Kurs açıklaması  
3. Ana kategori
4. Zorluk seviyesi
5. Kapsanan konular listesi
6. Tahmini süre (dakika)

JSON formatında döndür:
{
  "courses": [
    {
      "title": "Kurs Başlığı",
      "description": "Kurs açıklaması",
      "category": "matematik",
      "difficulty": "intermediate",
      "topics": ["konu1", "konu2"],
      "estimatedDuration": 120
    }
  ]
}

İçerik:
${fileContent}`,

    lessons: `Aşağıdaki içeriği konu başlıklarına göre ders materyallerine böl. Her ders için:

1. Ders başlığı
2. Ders içeriği
3. Ana kategori
4. Alt konu
5. Öğrenme hedefleri
6. Tahmini süre (dakika)

JSON formatında döndür:
{
  "lessons": [
    {
      "title": "Ders Başlığı",
      "content": "Ders içeriği...",
      "category": "fen",
      "topic": "fizik",
      "objectives": ["Hedef 1", "Hedef 2"],
      "estimatedTime": 45
    }
  ]
}

İçerik:
${fileContent}`
  };

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompts[contentType]
      }]
    });

    const responseText = (response.content[0] as any).text;
    
    // Clean up the response text by removing markdown code blocks
    let cleanedText = responseText.trim();
    
    // Remove markdown code blocks more comprehensively
    cleanedText = cleanedText.replace(/^```(?:json)?\s*/gm, '').replace(/\s*```$/gm, '');
    
    // Try to extract JSON from the response
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
    
    const parsedContent = JSON.parse(cleanedText);
    
    return parsedContent;
  } catch (error) {
    console.error('AI content processing error:', error);
    throw new Error('İçerik işleme sırasında hata oluştu');
  }
}

export async function processContentFile(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Dosya gerekli',
        message: 'Lütfen yüklemek istediğiniz dosyayı seçin.'
      });
    }

    // File size check (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        error: 'Dosya çok büyük',
        message: `Dosya boyutu 50MB'dan küçük olmalıdır. Mevcut dosya: ${(req.file.size / 1024 / 1024).toFixed(2)}MB`
      });
    }

    const { contentType } = req.body;
    if (!['questions', 'courses', 'lessons'].includes(contentType)) {
      return res.status(400).json({ 
        error: 'Geçersiz içerik tipi',
        message: 'Sadece sorular, kurslar veya dersler yüklenebilir.'
      });
    }

    console.log(`Processing ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)}MB) as ${contentType}`);

    const fileContent = req.file.buffer.toString('utf-8');
    const processedContent = await processEducationContent(fileContent, contentType);

    // Save questions to storage if content type is questions
    if (contentType === 'questions' && processedContent.questions) {
      const { storage } = await import('./storage');
      
      // Prepare questions for insertion
      const questionsToAdd = processedContent.questions.map((q: any) => ({
        examCategoryId: 'yks', // Default to YKS, could be dynamic
        subject: q.category || 'genel',
        difficulty: q.difficulty || 'medium',
        questionText: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || null,
        points: 10 // Default points per question
      }));

      const addedQuestions = await storage.addQuestions(questionsToAdd);
      const totalQuestions = await storage.getTotalQuestionCount();

      console.log(`Added ${addedQuestions.length} questions to database. Total: ${totalQuestions}`);

      res.json({
        success: true,
        message: `${addedQuestions.length} soru başarıyla yüklendi!`,
        data: {
          ...processedContent,
          questionsAdded: addedQuestions.length,
          totalQuestionsInSystem: totalQuestions
        },
        originalFileName: req.file.originalname,
        fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
        processedAt: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        message: 'İçerik başarıyla işlendi!',
        data: processedContent,
        originalFileName: req.file.originalname,
        fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
        processedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Content processing error:', error);
    
    let errorMessage = 'Dosya işleme sırasında hata oluştu';
    let details = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    // Specific error handling
    if (error instanceof Error) {
      if (error.message.includes('JSON')) {
        errorMessage = 'AI yanıtı işlenirken hata oluştu';
        details = 'AI tarafından üretilen içerik geçersiz. Lütfen tekrar deneyin.';
      } else if (error.message.includes('İçerik işleme')) {
        errorMessage = 'AI içerik üretimi başarısız';
        details = 'AI servisi şu anda kullanılamıyor. Lütfen daha sonra deneyin.';
      }
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: details,
      fileName: req.file?.originalname,
      timestamp: new Date().toISOString()
    });
  }
}