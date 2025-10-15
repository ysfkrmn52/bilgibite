// Comprehensive Gamification System - Duolingo Style
import { User } from "@shared/schema";

// XP and Level System
export interface XPSystem {
  currentXP: number;
  level: number;
  xpToNextLevel: number;
  totalXPForLevel: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'social' | 'challenge' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  gemReward: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'questions' | 'accuracy' | 'streak' | 'speed' | 'category';
  target: number;
  progress: number;
  xpReward: number;
  gemReward: number;
  expiresAt: Date;
  completed: boolean;
}

export interface UserStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestions: number;
  correctAnswers: number;
  averageAccuracy: number;
  totalTimeSpent: number; // in minutes
  level: number;
  gems: number;
  streakFreezes: number;
  perfectLessons: number;
  lastActiveDate: string;
  joinedDate: string;
}

// XP Calculation System
export class XPCalculator {
  static readonly BASE_XP_PER_LEVEL = 100;
  static readonly LEVEL_MULTIPLIER = 1.2;

  static calculateLevel(totalXP: number): number {
    let level = 1;
    let xpNeeded = this.BASE_XP_PER_LEVEL;
    let totalXPForCurrentLevel = 0;

    while (totalXP >= totalXPForCurrentLevel + xpNeeded) {
      totalXPForCurrentLevel += xpNeeded;
      level++;
      xpNeeded = Math.floor(this.BASE_XP_PER_LEVEL * Math.pow(this.LEVEL_MULTIPLIER, level - 1));
    }

    return level;
  }

  static getXPForLevel(level: number): XPSystem {
    let totalXPForLevel = 0;
    for (let i = 1; i < level; i++) {
      totalXPForLevel += Math.floor(this.BASE_XP_PER_LEVEL * Math.pow(this.LEVEL_MULTIPLIER, i - 1));
    }
    
    const xpForNextLevel = Math.floor(this.BASE_XP_PER_LEVEL * Math.pow(this.LEVEL_MULTIPLIER, level - 1));
    
    return {
      currentXP: 0, // Will be set by caller
      level,
      xpToNextLevel: xpForNextLevel,
      totalXPForLevel
    };
  }

  static calculateXPGain(
    baseXP: number,
    accuracy: number,
    timeBonus: boolean,
    streakMultiplier: number,
    difficultyMultiplier: number
  ): number {
    let xp = baseXP;
    
    // Accuracy bonus (80%+ accuracy gets bonus)
    if (accuracy >= 0.8) {
      xp *= (1 + (accuracy - 0.8) * 2); // Up to 40% bonus for perfect accuracy
    }
    
    // Time bonus (completed quickly)
    if (timeBonus) {
      xp *= 1.25;
    }
    
    // Streak multiplier
    xp *= streakMultiplier;
    
    // Difficulty multiplier
    xp *= difficultyMultiplier;
    
    return Math.floor(xp);
  }
}

// Achievement System - 50+ Achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Learning Achievements
  {
    id: 'first_quiz',
    title: 'İlk Adım',
    description: 'İlk quizini tamamladın!',
    icon: '🎯',
    category: 'learning',
    rarity: 'common',
    xpReward: 50,
    gemReward: 5,
    maxProgress: 1
  },
  {
    id: 'questions_10',
    title: 'Öğrenmeye Başla',
    description: '10 soru çözdün',
    icon: '📚',
    category: 'learning',
    rarity: 'common',
    xpReward: 100,
    gemReward: 10,
    maxProgress: 10
  },
  {
    id: 'questions_50',
    title: 'Bilgi Avcısı',
    description: '50 soru çözdün',
    icon: '🏹',
    category: 'learning',
    rarity: 'common',
    xpReward: 200,
    gemReward: 15,
    maxProgress: 50
  },
  {
    id: 'questions_100',
    title: 'Yüz Soru Ustası',
    description: '100 soru çözdün',
    icon: '💯',
    category: 'learning',
    rarity: 'rare',
    xpReward: 300,
    gemReward: 25,
    maxProgress: 100
  },
  {
    id: 'questions_500',
    title: 'Bilgi Makinası',
    description: '500 soru çözdün',
    icon: '⚙️',
    category: 'learning',
    rarity: 'epic',
    xpReward: 500,
    gemReward: 50,
    maxProgress: 500
  },
  {
    id: 'questions_1000',
    title: 'Bin Soru Efsanesi',
    description: '1000 soru çözdün',
    icon: '👑',
    category: 'learning',
    rarity: 'legendary',
    xpReward: 1000,
    gemReward: 100,
    maxProgress: 1000
  },

  // Streak Achievements
  {
    id: 'streak_3',
    title: 'İlk Seri',
    description: '3 gün üst üste çalıştın',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    xpReward: 75,
    gemReward: 10,
    maxProgress: 3
  },
  {
    id: 'streak_7',
    title: 'Bir Hafta',
    description: '7 gün üst üste çalıştın',
    icon: '📅',
    category: 'streak',
    rarity: 'common',
    xpReward: 150,
    gemReward: 20,
    maxProgress: 7
  },
  {
    id: 'streak_30',
    title: 'Bir Ay Kararlılık',
    description: '30 gün üst üste çalıştın',
    icon: '🏆',
    category: 'streak',
    rarity: 'rare',
    xpReward: 500,
    gemReward: 75,
    maxProgress: 30
  },
  {
    id: 'streak_100',
    title: 'Yüz Gün Efsanesi',
    description: '100 gün üst üste çalıştın',
    icon: '🌟',
    category: 'streak',
    rarity: 'epic',
    xpReward: 1500,
    gemReward: 200,
    maxProgress: 100
  },
  {
    id: 'streak_365',
    title: 'Bir Yıl Kararlılık',
    description: '365 gün üst üste çalıştın',
    icon: '💎',
    category: 'streak',
    rarity: 'legendary',
    xpReward: 3650,
    gemReward: 500,
    maxProgress: 365
  },

  // Accuracy Achievements
  {
    id: 'perfect_quiz',
    title: 'Mükemmel Quiz',
    description: 'Bir quizi %100 doğrulukla tamamladın',
    icon: '⭐',
    category: 'learning',
    rarity: 'common',
    xpReward: 100,
    gemReward: 15,
    maxProgress: 1
  },
  {
    id: 'perfect_5',
    title: 'Beş Mükemmel',
    description: '5 quizi %100 doğrulukla tamamladın',
    icon: '🌟',
    category: 'learning',
    rarity: 'rare',
    xpReward: 250,
    gemReward: 30,
    maxProgress: 5
  },
  {
    id: 'accuracy_90',
    title: 'Hassas Atış',
    description: 'Genel doğruluk oranın %90\'ın üzerinde',
    icon: '🎯',
    category: 'learning',
    rarity: 'rare',
    xpReward: 300,
    gemReward: 40,
    maxProgress: 90
  },

  // Speed Achievements
  {
    id: 'speed_demon',
    title: 'Hız Şeytanı',
    description: '10 soruyu 5 dakikada çözdün',
    icon: '⚡',
    category: 'challenge',
    rarity: 'rare',
    xpReward: 200,
    gemReward: 25,
    maxProgress: 1
  },
  {
    id: 'quick_thinker',
    title: 'Hızlı Düşünür',
    description: 'Her soruyu ortalama 10 saniyede çözdün',
    icon: '🧠',
    category: 'challenge',
    rarity: 'epic',
    xpReward: 400,
    gemReward: 50,
    maxProgress: 1
  },

  // Category Mastery
  {
    id: 'yks_master',
    title: 'YKS Ustası',
    description: 'YKS kategorisinde 50 soru çözdün',
    icon: '🎓',
    category: 'learning',
    rarity: 'rare',
    xpReward: 300,
    gemReward: 40,
    maxProgress: 50
  },
  {
    id: 'kpss_expert',
    title: 'KPSS Uzmanı',
    description: 'KPSS kategorisinde 50 soru çözdün',
    icon: '🏛️',
    category: 'learning',
    rarity: 'rare',
    xpReward: 300,
    gemReward: 40,
    maxProgress: 50
  },
  {
    id: 'driving_pro',
    title: 'Sürücü Kursu Pro',
    description: 'Ehliyet kategorisinde 50 soru çözdün',
    icon: '🚗',
    category: 'learning',
    rarity: 'rare',
    xpReward: 300,
    gemReward: 40,
    maxProgress: 50
  },

  // Social Achievements
  {
    id: 'early_bird',
    title: 'Erken Kalkan',
    description: 'Sabah 8\'den önce 10 quiz çözdün',
    icon: '🐦',
    category: 'social',
    rarity: 'common',
    xpReward: 150,
    gemReward: 20,
    maxProgress: 10
  },
  {
    id: 'night_owl',
    title: 'Gece Kuşu',
    description: 'Gece 10\'dan sonra 10 quiz çözdün',
    icon: '🦉',
    category: 'social',
    rarity: 'common',
    xpReward: 150,
    gemReward: 20,
    maxProgress: 10
  },

  // Milestone Achievements
  {
    id: 'level_5',
    title: 'Yükseliş',
    description: '5. seviyeye ulaştın',
    icon: '📈',
    category: 'milestone',
    rarity: 'common',
    xpReward: 200,
    gemReward: 25,
    maxProgress: 5
  },
  {
    id: 'level_10',
    title: 'Çift Haneli',
    description: '10. seviyeye ulaştın',
    icon: '🔟',
    category: 'milestone',
    rarity: 'rare',
    xpReward: 400,
    gemReward: 50,
    maxProgress: 10
  },
  {
    id: 'level_25',
    title: 'Çeyrek Yüzyıl',
    description: '25. seviyeye ulaştın',
    icon: '🏅',
    category: 'milestone',
    rarity: 'epic',
    xpReward: 800,
    gemReward: 100,
    maxProgress: 25
  },
  {
    id: 'level_50',
    title: 'Yarı Yol',
    description: '50. seviyeye ulaştın',
    icon: '🎖️',
    category: 'milestone',
    rarity: 'legendary',
    xpReward: 2000,
    gemReward: 250,
    maxProgress: 50
  }

  // Add more achievements to reach 50+ total...
];

// Daily Challenge System
export class DailyChallengeManager {
  static generateDailyChallenges(userStats: UserStats): DailyChallenge[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const challenges: DailyChallenge[] = [
      {
        id: `daily_questions_${today.toDateString()}`,
        title: 'Günlük Hedef',
        description: 'Bugün 20 soru çöz',
        type: 'questions',
        target: 20,
        progress: 0,
        xpReward: 100,
        gemReward: 15,
        expiresAt: tomorrow,
        completed: false
      },
      {
        id: `daily_accuracy_${today.toDateString()}`,
        title: 'Hassas Atış',
        description: 'Bugün %80 doğruluk oranına ulaş',
        type: 'accuracy',
        target: 80,
        progress: Math.round(userStats.averageAccuracy),
        xpReward: 150,
        gemReward: 20,
        expiresAt: tomorrow,
        completed: false
      },
      {
        id: `daily_streak_${today.toDateString()}`,
        title: 'Seriyi Devam Ettir',
        description: 'Bugün çalışarak serini devam ettir',
        type: 'streak',
        target: 1,
        progress: 0,
        xpReward: 75,
        gemReward: 10,
        expiresAt: tomorrow,
        completed: false
      }
    ];

    return challenges;
  }

  static updateChallengeProgress(
    challenges: DailyChallenge[],
    type: string,
    value: number
  ): DailyChallenge[] {
    return challenges.map(challenge => {
      if (challenge.type === type && !challenge.completed) {
        const newProgress = Math.min(challenge.progress + value, challenge.target);
        const completed = newProgress >= challenge.target;
        
        return {
          ...challenge,
          progress: newProgress,
          completed
        };
      }
      return challenge;
    });
  }
}

// Gem Economy System
export interface GemTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent';
  source: string;
  description: string;
  timestamp: Date;
}

export class GemEconomy {
  static readonly STREAK_FREEZE_COST = 10;
  static readonly EXTRA_LIVES_COST = 5;
  static readonly HINT_COST = 3;
  static readonly SKIP_COST = 8;

  static calculateGemReward(
    baseGems: number,
    streakMultiplier: number,
    achievementBonus: number
  ): number {
    return Math.floor(baseGems * streakMultiplier + achievementBonus);
  }

  static canAfford(userGems: number, cost: number): boolean {
    return userGems >= cost;
  }
}

// Leaderboard System
export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  totalXP: number;
  level: number;
  currentStreak: number;
  weeklyXP: number;
  monthlyXP: number;
  rank: number;
}

export class LeaderboardManager {
  static calculateWeeklyRanking(users: UserStats[]): LeaderboardEntry[] {
    // Implementation for weekly leaderboard
    return [];
  }

  static calculateMonthlyRanking(users: UserStats[]): LeaderboardEntry[] {
    // Implementation for monthly leaderboard
    return [];
  }

  static calculateAllTimeRanking(users: UserStats[]): LeaderboardEntry[] {
    // Implementation for all-time leaderboard
    return [];
  }
}

// Achievement Progress Tracker
export class AchievementTracker {
  static checkAchievements(
    userStats: UserStats,
    currentAchievements: Achievement[],
    recentAction: {
      type: 'quiz_completed' | 'streak_extended' | 'level_up';
      data: any;
    }
  ): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      const hasAchievement = currentAchievements.some(a => a.id === achievement.id);
      if (hasAchievement) return;

      const progress = this.calculateProgress(achievement, userStats, recentAction);
      
      if (progress >= (achievement.maxProgress || 1)) {
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: new Date(),
          progress: achievement.maxProgress
        });
      }
    });

    return newlyUnlocked;
  }

  private static calculateProgress(
    achievement: Achievement,
    userStats: UserStats,
    recentAction: any
  ): number {
    switch (achievement.id) {
      case 'first_quiz':
        return userStats.totalQuestions > 0 ? 1 : 0;
      case 'questions_10':
        return Math.min(userStats.totalQuestions, 10);
      case 'questions_50':
        return Math.min(userStats.totalQuestions, 50);
      case 'questions_100':
        return Math.min(userStats.totalQuestions, 100);
      case 'questions_500':
        return Math.min(userStats.totalQuestions, 500);
      case 'questions_1000':
        return Math.min(userStats.totalQuestions, 1000);
      case 'streak_3':
        return Math.min(userStats.currentStreak, 3);
      case 'streak_7':
        return Math.min(userStats.currentStreak, 7);
      case 'streak_30':
        return Math.min(userStats.currentStreak, 30);
      case 'streak_100':
        return Math.min(userStats.currentStreak, 100);
      case 'streak_365':
        return Math.min(userStats.currentStreak, 365);
      case 'perfect_quiz':
        return userStats.perfectLessons > 0 ? 1 : 0;
      case 'perfect_5':
        return Math.min(userStats.perfectLessons, 5);
      case 'accuracy_90':
        return userStats.averageAccuracy >= 90 ? 90 : 0;
      case 'level_5':
        return Math.min(userStats.level, 5);
      case 'level_10':
        return Math.min(userStats.level, 10);
      case 'level_25':
        return Math.min(userStats.level, 25);
      case 'level_50':
        return Math.min(userStats.level, 50);
      default:
        return 0;
    }
  }
}