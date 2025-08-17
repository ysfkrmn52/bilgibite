import Anthropic from '@anthropic-ai/sdk';
import { storage } from './storage';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function processAYTPDFAndSave(fileContent: string) {
  console.log('AYT PDF processing started, content length:', fileContent.length);
  
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `Bu AYT Din Kültürü ve Ahlak Bilgisi PDF'inden 42 sorunun TAMAMINI çıkar. Her soru tam olmalı!

KURALLAR:
1. PDF'deki tüm 42 soruyu çıkar
2. Her soru için tam metin
3. 5 şık (A, B, C, D, E) 
4. Yıl bilgisini tespit et
5. Doğru cevabı tahmin et (mantıklı olanı seç)

PDF İçeriği:
${fileContent}

JSON format (42 soru):
{
  "questions": [
    {
      "text": "Soru metni tam...",
      "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı", "E şıkkı"],
      "correctAnswer": 0,
      "difficulty": "medium",
      "category": "ayt",
      "topic": "din kültürü ve ahlak bilgisi",
      "year": 2023,
      "questionNumber": 1
    }
  ]
}

ÖNEMLİ: 42 sorunun hepsini çıkar! Eksik bırakma!`
      }]
    });

    const responseText = (response.content[0] as any).text;
    console.log('AI response length:', responseText.length);
    
    // Clean and parse JSON
    let cleanedText = responseText.trim();
    cleanedText = cleanedText.replace(/^```(?:json)?\s*/gm, '').replace(/\s*```$/gm, '');
    
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON format not found in response');
    }

    const parsedContent = JSON.parse(jsonMatch[0]);
    const questions = parsedContent.questions || [];
    
    console.log(`${questions.length} soru AI tarafından çıkarıldı`);
    
    if (questions.length === 0) {
      throw new Error('No questions extracted');
    }

    // Save to database
    let savedCount = 0;
    const errors = [];
    
    for (const question of questions) {
      try {
        const insertQuestion = {
          examCategoryId: 'ayt',
          subject: 'din kültürü ve ahlak bilgisi',
          difficulty: question.difficulty || 'medium',
          questionText: question.text,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation || '',
          points: 10,
          topic: question.topic || 'din kültürü ve ahlak bilgisi',
          year: question.year || 2023
        };
        
        await storage.createQuestion(insertQuestion);
        savedCount++;
        console.log(`Soru ${savedCount} kaydedildi: ${question.text.substring(0, 50)}...`);
      } catch (dbError: any) {
        console.error(`Soru kaydetme hatası:`, dbError);
        errors.push(dbError?.message || 'Bilinmeyen hata');
      }
    }
    
    return {
      success: true,
      totalExtracted: questions.length,
      savedToDb: savedCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `${savedCount} AYT sorusu başarıyla veritabanına kaydedildi`
    };

  } catch (error: any) {
    console.error('AYT PDF processing error:', error);
    return {
      success: false,
      error: error?.message || 'Bilinmeyen hata',
      message: 'AYT PDF işlenirken hata oluştu'
    };
  }
}