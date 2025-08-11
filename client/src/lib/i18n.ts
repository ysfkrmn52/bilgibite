import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  tr: {
    translation: {
      // Navigation
      home: 'Ana Sayfa',
      exams: 'Sınavlar',
      statistics: 'İstatistikler',
      profile: 'Profil',
      
      // Common
      start: 'Başla',
      continue: 'Devam Et',
      next: 'İleri',
      previous: 'Geri',
      skip: 'Atla',
      submit: 'Gönder',
      answer: 'Cevapla',
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı',
      
      // Quiz Interface
      question: 'Soru',
      timeRemaining: 'Kalan Süre',
      correctAnswers: 'Doğru Cevap',
      accuracy: 'Başarı Oranı',
      points: 'Puan',
      streak: 'Seri',
      lives: 'Can',
      
      // Dashboard
      welcome: 'Hoş geldin, {{name}}!',
      todayStudyQuestion: 'Bugün hangi sınava hazırlanmak istiyorsun?',
      level: 'Seviye',
      weeklyProgress: 'Haftalık İlerleme',
      examCategories: 'Sınav Kategorileri',
      recentAchievements: 'Son Başarılar',
      startStudying: 'Çalışmaya Başla',
      
      // Progress Stats
      questionsAnswered: 'Soru Çözüldü',
      correctAnswer: 'Doğru Cevap',
      studyHours: 'Saat Çalışma',
      successRate: 'Başarı Oranı',
      
      // Categories
      yks: 'YKS',
      kpss: 'KPSS',
      driving: 'Ehliyet',
      yksDescription: 'Yükseköğretim Kurumları Sınavı',
      kpssDescription: 'Kamu Personeli Seçme Sınavı',
      drivingDescription: 'Sürücü Kursu Sınavı',
      
      // Difficulty
      easy: 'Kolay',
      medium: 'Orta',
      hard: 'Zor',
      
      // Results
      congratulations: 'Tebrikler!',
      quizCompleted: 'Quiz tamamlandı',
      pointsEarned: 'Kazanılan Puan',
      timeSpent: 'Süre',
      startNewQuiz: 'Yeni Quiz Başlat',
      backToDashboard: 'Ana Sayfaya Dön',
      
      // Achievements
      streakDays: '{{count}} Gün Seri',
      questionsCount: '{{count}} Soru',
      accuracyPercent: '%{{percent}} Başarı',
      studyTime: '{{hours}} Saat',
      dailyStudy: 'Günlük çalışma',
      totalSolution: 'Toplam çözüm',
      lastQuestions: 'Son {{count}} soruda',
      todayStudy: 'Bugün çalışma',
    }
  },
  en: {
    translation: {
      // Navigation
      home: 'Home',
      exams: 'Exams',
      statistics: 'Statistics',
      profile: 'Profile',
      
      // Common
      start: 'Start',
      continue: 'Continue',
      next: 'Next',
      previous: 'Previous',
      skip: 'Skip',
      submit: 'Submit',
      answer: 'Answer',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      
      // Quiz Interface
      question: 'Question',
      timeRemaining: 'Time Remaining',
      correctAnswers: 'Correct Answers',
      accuracy: 'Accuracy',
      points: 'Points',
      streak: 'Streak',
      lives: 'Lives',
      
      // Dashboard
      welcome: 'Welcome, {{name}}!',
      todayStudyQuestion: 'Which exam would you like to prepare for today?',
      level: 'Level',
      weeklyProgress: 'Weekly Progress',
      examCategories: 'Exam Categories',
      recentAchievements: 'Recent Achievements',
      startStudying: 'Start Studying',
      
      // Progress Stats
      questionsAnswered: 'Questions Answered',
      correctAnswer: 'Correct Answers',
      studyHours: 'Study Hours',
      successRate: 'Success Rate',
      
      // Categories
      yks: 'YKS',
      kpss: 'KPSS',
      driving: 'Driving License',
      yksDescription: 'Higher Education Institutions Exam',
      kpssDescription: 'Public Personnel Selection Exam',
      drivingDescription: 'Driving Course Exam',
      
      // Difficulty
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      
      // Results
      congratulations: 'Congratulations!',
      quizCompleted: 'Quiz completed',
      pointsEarned: 'Points Earned',
      timeSpent: 'Time Spent',
      startNewQuiz: 'Start New Quiz',
      backToDashboard: 'Back to Dashboard',
      
      // Achievements
      streakDays: '{{count}} Day Streak',
      questionsCount: '{{count}} Questions',
      accuracyPercent: '{{percent}}% Accuracy',
      studyTime: '{{hours}} Hours',
      dailyStudy: 'Daily study',
      totalSolution: 'Total solutions',
      lastQuestions: 'Last {{count}} questions',
      todayStudy: 'Today\'s study',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr', // Default to Turkish
    fallbackLng: 'tr',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;