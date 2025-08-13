// Turkish Exam Service
import { 
  ExamCategory, ExamQuestion, MockExamSession, ExamPerformance,
  ExamRegistration, SuccessPrediction, TurkishExamTypes, ExamSubjects 
} from '@shared/exam-schema';
import { TurkishExamQuestionBank, getQuestionsByCategory, generateAdditionalQuestions } from './turkish-exam-question-bank';

// Mock Turkish Exam Data Service
export class TurkishExamService {
  
  // Get all exam categories with Turkish-specific data
  static getExamCategories(): ExamCategory[] {
    return [
      {
        id: 'yks-tyt',
        name: 'YKS - TYT (Temel Yeterlilik Testi)',
        slug: 'yks-tyt',
        type: 'yks',
        description: 'Üniversite giriş sınavının temel yeterlilik bölümü. Tüm öğrencilerin girmesi zorunlu.',
        icon: '🎓',
        color: '#2563eb',
        examDuration: 165, // 2 saat 45 dakika
        totalQuestions: 120,
        passingScore: '150.00',
        officialExamDates: ['2025-06-14', '2025-06-15'],
        subjects: ExamSubjects.YKS.TYT,
        examFormat: {
          sections: [
            { name: 'Türkçe', questions: 40, duration: 50 },
            { name: 'Matematik', questions: 30, duration: 40 },
            { name: 'Fen Bilimleri', questions: 20, duration: 35 },
            { name: 'Sosyal Bilimler', questions: 30, duration: 40 }
          ],
          scoringSystem: 'net_calculation',
          negativeScoring: true,
          wrongAnswerPenalty: 0.25
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'yks-ayt',
        name: 'YKS - AYT (Alan Yeterlilik Testi)',
        slug: 'yks-ayt',
        type: 'yks',
        description: 'Alan odaklı üniversite giriş sınavı. SAY, EA, SÖZ, DİL alanları için.',
        icon: '📚',
        color: '#dc2626',
        examDuration: 180, // 3 saat
        totalQuestions: 80,
        passingScore: '180.00',
        officialExamDates: ['2025-06-21', '2025-06-22'],
        subjects: ExamSubjects.YKS.AYT,
        examFormat: {
          sections: [
            { name: 'Matematik', questions: 30, duration: 60 },
            { name: 'Fen Bilimleri', questions: 30, duration: 60 },
            { name: 'Türk Dili ve Edebiyatı', questions: 24, duration: 60 }
          ],
          scoringSystem: 'net_calculation',
          negativeScoring: true,
          wrongAnswerPenalty: 0.25
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'kpss-genel',
        name: 'KPSS - Genel Yetenek & Genel Kültür',
        slug: 'kpss-genel',
        type: 'kpss',
        description: 'Kamu personeli seçme sınavı. Tüm kamu kurumları için temel sınav.',
        icon: '🏛️',
        color: '#059669',
        examDuration: 180, // 3 saat
        totalQuestions: 120,
        passingScore: '70.00',
        officialExamDates: ['2025-07-13', '2025-11-09'],
        subjects: [...ExamSubjects.KPSS.GENEL_YETENEK, ...ExamSubjects.KPSS.GENEL_KULTUR],
        examFormat: {
          sections: [
            { name: 'Genel Yetenek', questions: 60, duration: 90 },
            { name: 'Genel Kültür', questions: 60, duration: 90 }
          ],
          scoringSystem: 'standard_scoring',
          negativeScoring: false,
          wrongAnswerPenalty: 0
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'kpss-egitim',
        name: 'KPSS - Eğitim Bilimleri',
        slug: 'kpss-egitim',
        type: 'kpss',
        description: 'Öğretmenlik pozisyonları için eğitim bilimleri sınavı.',
        icon: '👨‍🏫',
        color: '#7c3aed',
        examDuration: 90,
        totalQuestions: 80,
        passingScore: '70.00',
        officialExamDates: ['2025-07-13'],
        subjects: ExamSubjects.KPSS.EGITIM_BILIMLERI,
        examFormat: {
          sections: [
            { name: 'Eğitim Bilimleri', questions: 80, duration: 90 }
          ],
          scoringSystem: 'standard_scoring',
          negativeScoring: false,
          wrongAnswerPenalty: 0
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'ehliyet-teorik',
        name: 'Sürücü Kursu Teorik Sınavı',
        slug: 'ehliyet-teorik',
        type: 'ehliyet',
        description: 'B sınıfı ehliyet için teorik sınav. Trafik kuralları, ilk yardım ve teknik bilgiler.',
        icon: '🚗',
        color: '#ea580c',
        examDuration: 30,
        totalQuestions: 50,
        passingScore: '70.00',
        officialExamDates: null, // Her hafta yapılır
        subjects: ExamSubjects.EHLIYET.TEORIK,
        examFormat: {
          sections: [
            { name: 'Trafik ve Yol Bilgisi', questions: 23, duration: 15 },
            { name: 'İlk Yardım', questions: 12, duration: 8 },
            { name: 'Motor ve Araç Tekniği', questions: 15, duration: 7 }
          ],
          scoringSystem: 'percentage',
          negativeScoring: false,
          wrongAnswerPenalty: 0,
          specialFeatures: ['video_questions', 'scenario_based', 'traffic_signs']
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'src-belgesi',
        name: 'SRC Belgesi - Yolcu ve Yük Taşımacılığı',
        slug: 'src-belgesi',
        type: 'src',
        description: 'Yurt içi ve yurt dışı yolcu ve yük taşımacılığı için SRC belgesi sınavı.',
        icon: '🚛',
        color: '#0891b2',
        examDuration: 90,
        totalQuestions: 60,
        passingScore: '70.00',
        officialExamDates: ['2025-01-15', '2025-04-15', '2025-07-15', '2025-10-15'],
        subjects: ['Mevzuat', 'Güvenlik', 'Yük Güvenliği', 'Uluslararası Taşımacılık'],
        examFormat: {
          sections: [
            { name: 'Mevzuat ve Kurallar', questions: 20, duration: 30 },
            { name: 'Yük Güvenliği', questions: 15, duration: 25 },
            { name: 'Uluslararası Taşımacılık', questions: 15, duration: 25 },
            { name: 'Güvenlik ve İlk Yardım', questions: 10, duration: 10 }
          ],
          scoringSystem: 'percentage',
          negativeScoring: false,
          wrongAnswerPenalty: 0
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'ales',
        name: 'ALES - Akademik Personel ve Lisansüstü Eğitimi Giriş Sınavı',
        slug: 'ales',
        type: 'ales',
        description: 'Akademik personel ve lisansüstü eğitimi giriş sınavı.',
        icon: '🎓',
        color: '#8b5cf6',
        examDuration: 150,
        totalQuestions: 80,
        passingScore: '55.00',
        officialExamDates: ['2025-04-13', '2025-05-18', '2025-10-26', '2025-11-16'],
        subjects: ['Sözel Yetenek', 'Sayısal Yetenek'],
        examFormat: {
          sections: [
            { name: 'Sözel Yetenek', questions: 40, duration: 75 },
            { name: 'Sayısal Yetenek', questions: 40, duration: 75 }
          ],
          scoringSystem: 'standard_scoring',
          negativeScoring: true,
          wrongAnswerPenalty: 0.25
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'dgs',
        name: 'DGS - Dikey Geçiş Sınavı',
        slug: 'dgs',
        type: 'dgs',
        description: 'Önlisans mezunları için lisans programlarına geçiş sınavı.',
        icon: '📈',
        color: '#f59e0b',
        examDuration: 150,
        totalQuestions: 120,
        passingScore: '60.00',
        officialExamDates: ['2025-07-20'],
        subjects: ['Türkçe', 'Matematik'],
        examFormat: {
          sections: [
            { name: 'Türkçe', questions: 60, duration: 75 },
            { name: 'Matematik', questions: 60, duration: 75 }
          ],
          scoringSystem: 'net_calculation',
          negativeScoring: true,
          wrongAnswerPenalty: 0.25
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tyt-ayt-yabanci-dil',
        name: 'YKS - Yabancı Dil Testi (YDT)',
        slug: 'tyt-ayt-yabanci-dil',
        type: 'yks',
        description: 'Yabancı dil eğitimi veren programlar için yabancı dil testi.',
        icon: '🌍',
        color: '#10b981',
        examDuration: 180,
        totalQuestions: 80,
        passingScore: '60.00',
        officialExamDates: ['2025-06-22'],
        subjects: ['İngilizce', 'Almanca', 'Fransızca', 'Arapça', 'Rusça'],
        examFormat: {
          sections: [
            { name: 'Dil Bilgisi ve Kelime', questions: 40, duration: 90 },
            { name: 'Okuduğunu Anlama', questions: 40, duration: 90 }
          ],
          scoringSystem: 'net_calculation',
          negativeScoring: true,
          wrongAnswerPenalty: 0.25
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'msu',
        name: 'MSÜ - Milli Savunma Üniversitesi Sınavı',
        slug: 'msu',
        type: 'msu',
        description: 'Milli Savunma Üniversitesi giriş sınavı.',
        icon: '🎖️',
        color: '#dc2626',
        examDuration: 180,
        totalQuestions: 120,
        passingScore: '180.00',
        officialExamDates: ['2025-07-06'],
        subjects: ['Türkçe', 'Matematik', 'Fen Bilimleri', 'Sosyal Bilimler'],
        examFormat: {
          sections: [
            { name: 'Türkçe', questions: 30, duration: 45 },
            { name: 'Matematik', questions: 30, duration: 45 },
            { name: 'Fen Bilimleri', questions: 30, duration: 45 },
            { name: 'Sosyal Bilimler', questions: 30, duration: 45 }
          ],
          scoringSystem: 'net_calculation',
          negativeScoring: true,
          wrongAnswerPenalty: 0.25
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'polis-akademisi',
        name: 'Polis Akademisi Giriş Sınavı',
        slug: 'polis-akademisi',
        type: 'polis',
        description: 'Polis Akademisi giriş sınavı.',
        icon: '👮',
        color: '#1e40af',
        examDuration: 120,
        totalQuestions: 100,
        passingScore: '70.00',
        officialExamDates: ['2025-08-10'],
        subjects: ['Türkçe', 'Matematik', 'Genel Kültür', 'Anayasa ve Vatandaşlık Bilgisi'],
        examFormat: {
          sections: [
            { name: 'Türkçe', questions: 25, duration: 30 },
            { name: 'Matematik', questions: 25, duration: 30 },
            { name: 'Genel Kültür', questions: 25, duration: 30 },
            { name: 'Anayasa ve Vatandaşlık', questions: 25, duration: 30 }
          ],
          scoringSystem: 'percentage',
          negativeScoring: false,
          wrongAnswerPenalty: 0
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // Generate exam questions for Turkish exams using comprehensive question bank
  static generateExamQuestions(categoryId: string, count: number = 50): ExamQuestion[] {
    const category = this.getExamCategories().find(c => c.id === categoryId);
    if (!category) return [];

    // First, get questions from comprehensive question bank
    const bankQuestions = getQuestionsByCategory(categoryId, count);
    
    // If we have enough questions from bank, return them
    if (bankQuestions.length >= count) {
      return bankQuestions.slice(0, count);
    }
    
    // If not enough, generate additional questions to fill the gap
    const additionalCount = count - bankQuestions.length;
    const additionalQuestions = generateAdditionalQuestions(categoryId, category, bankQuestions.length + 1, count);
    
    return [...bankQuestions, ...additionalQuestions].slice(0, count);
  }
          subject: 'Türkçe',
          topic: 'Anlam Bilgisi',
          questionText: 'Aşağıdaki cümlelerin hangisinde "baş" sözcüğü mecaz anlamında kullanılmıştır?',
          questionType: 'multiple_choice',
          options: [
            'Kitabın başından sonuna kadar okudum.',
            'Başım çok ağrıyor bugün.',
            'Ailenin başı olarak sorumluluk almak zorundayım.',
            'Merdivenlerin başında duruyorum.',
            'Saçlarımı başımda topladım.'
          ],
          correctAnswer: 'Ailenin başı olarak sorumluluk almak zorundayım.',
          explanation: '"Baş" kelimesi burada "lider, önder" anlamında mecaz olarak kullanılmıştır.',
          difficulty: 'medium',
          examYear: 2024,
          questionNumber: 15,
          timeEstimate: 60,
          mediaUrl: null,
          tags: ['anlam_bilgisi', 'mecaz', 'sözcük_anlamı'],
          officialSource: 'OSYM',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'yks-tyt-mat-001',
          categoryId,
          subject: 'Matematik',
          topic: 'Fonksiyonlar',
          questionText: 'f(x) = 2x + 3 fonksiyonu için f(5) değeri kaçtır?',
          questionType: 'multiple_choice',
          options: ['11', '13', '15', '17', '19'],
          correctAnswer: '13',
          explanation: 'f(5) = 2(5) + 3 = 10 + 3 = 13',
          difficulty: 'easy',
          examYear: 2024,
          questionNumber: 45,
          timeEstimate: 45,
          mediaUrl: null,
          tags: ['fonksiyonlar', 'temel_matematik'],
          officialSource: 'OSYM',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    }

    // KPSS Questions
    if (categoryId === 'kpss-genel') {
      questions.push(
        {
          id: 'kpss-gy-001',
          categoryId,
          subject: 'Genel Yetenek',
          topic: 'Sözel Yetenek',
          questionText: 'Dostluk : İlişki = ? : Bilim',
          questionType: 'multiple_choice',
          options: ['Araştırma', 'Deney', 'Gözlem', 'Hipotez', 'Teori'],
          correctAnswer: 'Araştırma',
          explanation: 'Dostluk bir ilişki türü olduğu gibi, araştırma da bilim dalının temel yöntemidir.',
          difficulty: 'medium',
          examYear: 2024,
          questionNumber: 12,
          timeEstimate: 75,
          mediaUrl: null,
          tags: ['analoji', 'sözel_yetenek', 'mantık'],
          officialSource: 'OSYM',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'kpss-gk-001',
          categoryId,
          subject: 'Genel Kültür',
          topic: 'Türk Tarihi',
          questionText: 'Osmanlı İmparatorluğunun kuruluş tarihi hangi yüzyıldır?',
          questionType: 'multiple_choice',
          options: ['12. yüzyıl', '13. yüzyıl', '14. yüzyıl', '15. yüzyıl', '16. yüzyıl'],
          correctAnswer: '13. yüzyıl',
          explanation: 'Osmanlı İmparatorluğu 13. yüzyılın sonlarında (1299) kurulmuştur.',
          difficulty: 'easy',
          examYear: 2024,
          questionNumber: 85,
          timeEstimate: 45,
          mediaUrl: null,
          tags: ['türk_tarihi', 'osmanlı', 'kuruluş'],
          officialSource: 'OSYM',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    }

    // Ehliyet Questions
    if (categoryId === 'ehliyet-teorik') {
      questions.push(
        {
          id: 'ehliyet-001',
          categoryId,
          subject: 'Trafik Kuralları',
          topic: 'Trafik İşaretleri',
          questionText: 'Aşağıdaki trafik işaretinin anlamı nedir?',
          questionType: 'multiple_choice',
          options: [
            'Dur işareti',
            'Yol ver işareti', 
            'Hız sınırı işareti',
            'Park yasağı işareti',
            'Okul geçidi işareti'
          ],
          correctAnswer: 'Dur işareti',
          explanation: 'Sekizgen şeklindeki kırmızı işaret "Dur" işaretidir. Araç tamamen durmalıdır.',
          difficulty: 'easy',
          examYear: 2024,
          questionNumber: 8,
          timeEstimate: 30,
          mediaUrl: '/assets/traffic-signs/stop-sign.jpg',
          tags: ['trafik_işaretleri', 'dur_işareti', 'temel_kurallar'],
          officialSource: 'MEB',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'ehliyet-002',
          categoryId,
          subject: 'İlk Yardım',
          topic: 'Temel İlk Yardım',
          questionText: 'Bilinçsiz bir yaralıya ilk müdahalede yapılacak ilk işlem nedir?',
          questionType: 'multiple_choice',
          options: [
            'Nefes kontrol edilir',
            'Nabız kontrol edilir',
            'Hava yolu açılır',
            'Yaralı sarsılır',
            'Ağızdan su verilir'
          ],
          correctAnswer: 'Hava yolu açılır',
          explanation: 'Bilinçsiz yaralıda önce hava yolu açılmalı, sonra nefes ve nabız kontrol edilmelidir.',
          difficulty: 'medium',
          examYear: 2024,
          questionNumber: 32,
          timeEstimate: 45,
          mediaUrl: null,
          tags: ['ilk_yardım', 'bilinçsiz_yaralı', 'temel_müdahale'],
          officialSource: 'MEB',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    }

    // SRC Questions
    if (categoryId === 'src-teorik') {
      questions.push(
        {
          id: 'src-001',
          categoryId,
          subject: 'Telsiz İletişimi',
          topic: 'Temel İletişim',
          questionText: 'VHF telsizinde acil durum kanalı hangisidir?',
          questionType: 'multiple_choice',
          options: ['Kanal 6', 'Kanal 9', 'Kanal 16', 'Kanal 72', 'Kanal 77'],
          correctAnswer: 'Kanal 16',
          explanation: 'Kanal 16 (156.800 MHz) uluslararası acil durum ve çağrı kanalıdır.',
          difficulty: 'easy',
          examYear: 2024,
          questionNumber: 5,
          timeEstimate: 30,
          mediaUrl: null,
          tags: ['vhf', 'acil_durum', 'kanal_16'],
          officialSource: 'Ulaştırma Bakanlığı',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      );
    }

    // Fill remaining questions with subject-grouped generated content
    const remainingCount = count - questions.length;
    if (remainingCount > 0 && Array.isArray(category.subjects)) {
      const questionsPerSubject = Math.ceil(remainingCount / category.subjects.length);
      let questionIndex = questions.length + 1;
      
      // Group questions by subject to avoid mixing
      for (const subject of category.subjects) {
        for (let i = 0; i < questionsPerSubject && questionIndex <= count; i++) {
          questions.push(this.generateRandomQuestion(categoryId, category, questionIndex, subject));
          questionIndex++;
        }
      }
    }

    return questions.slice(0, count);
  }

  private static generateRandomQuestion(categoryId: string, category: ExamCategory, index: number, forceSubject?: string): ExamQuestion {
    const subjects = Array.isArray(category.subjects) ? category.subjects : [];
    const selectedSubject = forceSubject || subjects[Math.floor(Math.random() * subjects.length)] || 'Genel';
    
    const difficulties = ['easy', 'medium', 'hard'];
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)] as 'easy' | 'medium' | 'hard';

    return {
      id: `${categoryId}-gen-${String(index).padStart(3, '0')}`,
      categoryId,
      subject: selectedSubject,
      topic: `${selectedSubject} Konuları`,
      questionText: `${selectedSubject} alanından ${index}. soru metni buraya gelecek.`,
      questionType: 'multiple_choice',
      options: ['A şıkkı', 'B şıkkı', 'C şıkkı', 'D şıkkı', 'E şıkkı'],
      correctAnswer: 'A şıkkı',
      explanation: `Bu sorunun açıklaması burada yer alacak.`,
      difficulty: randomDifficulty,
      examYear: 2024,
      questionNumber: index,
      timeEstimate: randomDifficulty === 'easy' ? 30 : randomDifficulty === 'medium' ? 60 : 90,
      mediaUrl: null,
      tags: [selectedSubject.toLowerCase().replace(' ', '_')],
      officialSource: categoryId.includes('yks') ? 'OSYM' : categoryId.includes('kpss') ? 'OSYM' : categoryId.includes('ehliyet') ? 'MEB' : 'Ulaştırma Bakanlığı',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Calculate success probability for Turkish exams
  static calculateSuccessProbability(
    categoryId: string, 
    currentPerformance: number, 
    targetScore: number, 
    studyHoursPerWeek: number,
    daysUntilExam: number
  ): SuccessPrediction {
    const category = this.getExamCategories().find(c => c.id === categoryId);
    const passingScore = parseFloat(category?.passingScore || '70');
    
    // Turkish exam-specific calculation factors
    const examFactors = {
      'yks-tyt': { difficulty: 0.85, competitiveness: 0.9 },
      'yks-ayt': { difficulty: 0.75, competitiveness: 0.95 },
      'kpss-genel': { difficulty: 0.8, competitiveness: 0.85 },
      'kpss-egitim': { difficulty: 0.82, competitiveness: 0.88 },
      'ehliyet-teorik': { difficulty: 0.9, competitiveness: 0.7 },
      'src-teorik': { difficulty: 0.88, competitiveness: 0.75 }
    };
    
    const factor = examFactors[categoryId as keyof typeof examFactors] || { difficulty: 0.8, competitiveness: 0.8 };
    
    // Base probability calculation
    const currentLevel = currentPerformance / 100;
    const targetLevel = targetScore / 100;
    const requiredImprovement = Math.max(0, targetLevel - currentLevel);
    
    // Study time effectiveness
    const weeksUntilExam = daysUntilExam / 7;
    const totalStudyHours = studyHoursPerWeek * weeksUntilExam;
    const studyEffectiveness = Math.min(1, totalStudyHours / (requiredImprovement * 100));
    
    // Final probability calculation
    let probability = currentLevel * factor.difficulty + studyEffectiveness * factor.competitiveness;
    probability = Math.min(0.95, Math.max(0.05, probability));
    
    return {
      id: `prediction-${categoryId}-${Date.now()}`,
      userId: 'mock-user-123',
      categoryId,
      currentScore: currentPerformance.toString(),
      targetScore: targetScore.toString(),
      successProbability: (probability * 100).toFixed(2),
      requiredStudyHours: Math.ceil(requiredImprovement * 80),
      weakAreas: this.identifyWeakAreas(categoryId),
      recommendations: this.generateStudyRecommendations(categoryId, requiredImprovement, daysUntilExam),
      lastUpdated: new Date(),
      createdAt: new Date()
    };
  }

  private static identifyWeakAreas(categoryId: string): string[] {
    const weaknessMap: { [key: string]: string[] } = {
      'yks-tyt': ['Matematik - Geometri', 'Fen Bilimleri - Kimya', 'Sosyal Bilimler - Coğrafya'],
      'yks-ayt': ['Matematik - Analiz', 'Fizik - Elektrik', 'Kimya - Organik'],
      'kpss-genel': ['Sayısal Yetenek - Geometri', 'Genel Kültür - Güncel Bilgiler'],
      'kpss-egitim': ['Eğitim Psikolojisi - Gelişim', 'Ölçme Değerlendirme - İstatistik'],
      'ehliyet-teorik': ['Trafik İşaretleri - Yasaklama', 'İlk Yardım - Acil Müdahale'],
      'src-teorik': ['Navigasyon - Elektronik', 'Acil Durumlar - GMDSS']
    };
    
    return weaknessMap[categoryId] || ['Genel Konular'];
  }

  private static generateStudyRecommendations(categoryId: string, improvement: number, days: number): string[] {
    const baseRecommendations: { [key: string]: string[] } = {
      'yks-tyt': [
        'Günde 2 saat matematik çalışması yapın',
        'TYT deneme sınavları çözün',
        'Zayıf olduğunuz konularda video dersleri izleyin',
        'Son 3 yıl sorularını analiz edin'
      ],
      'yks-ayt': [
        'Alan odaklı çalışma planı yapın',
        'AYT deneme sınavları düzenli çözün',
        'Üniversite hedefiniize göre puan hesabı yapın',
        'Zor soruları çözmek için extra zaman ayırın'
      ],
      'kpss-genel': [
        'Güncel olayları takip edin',
        'Sayısal yetenek sorularına odaklanın',
        'KPSS deneme sınavları çözün',
        'Genel kültür konularını sistematik çalışın'
      ],
      'ehliyet-teorik': [
        'Trafik işaretlerini görsel olarak ezberleyin',
        'İlk yardım videolarını izleyin',
        'Sınav simülasyonları yapın',
        'Gerçek sınav ortamında practice yapın'
      ]
    };

    return baseRecommendations[categoryId] || [
      'Düzenli çalışma programı oluşturun',
      'Deneme sınavları çözün',
      'Zayıf alanlarınıza odaklanın'
    ];
  }

  // Get exam performance statistics
  static getExamStatistics(categoryId: string): any {
    const statsMap: { [key: string]: any } = {
      'yks-tyt': {
        averageScore: 285.5,
        passingRate: 0.65,
        totalParticipants: 2500000,
        topUniversityThreshold: 450,
        subjectAverages: {
          'Türkçe': 75.2,
          'Matematik': 45.8,
          'Fen Bilimleri': 55.4,
          'Sosyal Bilimler': 68.9
        }
      },
      'yks-ayt': {
        averageScore: 245.3,
        passingRate: 0.45,
        totalParticipants: 1800000,
        topUniversityThreshold: 380,
        subjectAverages: {
          'Matematik': 42.1,
          'Fizik': 38.7,
          'Kimya': 51.2,
          'Biyoloji': 58.6
        }
      },
      'kpss-genel': {
        averageScore: 72.4,
        passingRate: 0.58,
        totalParticipants: 1200000,
        topPositionThreshold: 85,
        subjectAverages: {
          'Genel Yetenek': 68.5,
          'Genel Kültür': 76.3
        }
      },
      'ehliyet-teorik': {
        averageScore: 82.1,
        passingRate: 0.78,
        totalParticipants: 3500000,
        perfectScoreRate: 0.12
      }
    };

    return statsMap[categoryId] || {
      averageScore: 75.0,
      passingRate: 0.70,
      totalParticipants: 100000
    };
  }
}