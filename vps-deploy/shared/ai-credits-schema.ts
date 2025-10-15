// AI Credits System Schema and Configuration
import { z } from 'zod';

// AI Credit Configuration
export const AI_CREDIT_CONFIG = {
  // Store Item for AI Credits
  AI_CREDIT_PACKAGE: {
    id: 'ai_credits_500',
    name: 'AI Kredi Paketi',
    description: '500 AI Kredi - AI Eğitim özellikleri için',
    type: 'ai_credits',
    cost: 5000, // 50 TL in kuruş (cents)
    icon: 'brain',
    isActive: true,
    metadata: {
      creditAmount: 500,
      priceInTL: 50,
      currency: 'TRY'
    }
  },
  
  // AI Feature Credit Costs
  FEATURE_COSTS: {
    AI_QUESTION_GENERATION: 5,      // 5 credits per question generation
    AI_TUTOR_RESPONSE: 10,          // 10 credits per AI tutor interaction
    AI_STUDY_PLAN: 25,              // 25 credits for study plan generation
    AI_PERFORMANCE_ANALYSIS: 15,    // 15 credits for performance analysis
    AI_ADAPTIVE_DIFFICULTY: 5       // 5 credits for difficulty adjustment
  }
} as const;

// AI Credit Usage Tracking
export interface CreditUsageRecord {
  userId: string;
  feature: keyof typeof AI_CREDIT_CONFIG.FEATURE_COSTS;
  creditsUsed: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Credit Balance Check Result
export interface CreditCheckResult {
  hasCredits: boolean;
  currentBalance: number;
  requiredCredits: number;
  message: string;
}

// Credit Purchase Response
export interface CreditPurchaseResponse {
  success: boolean;
  newBalance: number;
  transactionId?: string;
  message: string;
}

export const creditUsageSchema = z.object({
  userId: z.string(),
  feature: z.enum(['AI_QUESTION_GENERATION', 'AI_TUTOR_RESPONSE', 'AI_STUDY_PLAN', 'AI_PERFORMANCE_ANALYSIS', 'AI_ADAPTIVE_DIFFICULTY']),
  creditsUsed: z.number().positive(),
  metadata: z.record(z.any()).optional()
});

export type CreditUsageInput = z.infer<typeof creditUsageSchema>;