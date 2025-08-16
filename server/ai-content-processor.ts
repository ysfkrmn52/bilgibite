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
    console.error('Response text was:', responseText?.substring(0, 500));
    throw new Error('İçerik işleme sırasında hata oluştu');
  }
}

export async function processContentFile(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya gerekli' });
    }

    const { contentType } = req.body;
    if (!['questions', 'courses', 'lessons'].includes(contentType)) {
      return res.status(400).json({ error: 'Geçersiz içerik tipi' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const processedContent = await processEducationContent(fileContent, contentType);

    res.json({
      success: true,
      data: processedContent,
      originalFileName: req.file.originalname,
      processedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Content processing error:', error);
    res.status(500).json({ 
      error: 'Dosya işleme hatası',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
}