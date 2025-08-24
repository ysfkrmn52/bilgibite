import { AI_CREDIT_CONFIG, type CreditCheckResult, type CreditPurchaseResponse, type CreditUsageInput } from '@shared/ai-credits-schema';
import { db } from './db';
import { userInventory, storeItems, userStorePurchases } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export class AICreditService {
  
  /**
   * Check if user has enough credits for a specific AI feature
   */
  static async checkCredits(userId: string, feature: keyof typeof AI_CREDIT_CONFIG.FEATURE_COSTS): Promise<CreditCheckResult> {
    try {
      const requiredCredits = AI_CREDIT_CONFIG.FEATURE_COSTS[feature];
      const currentBalance = await this.getUserCreditBalance(userId);
      
      return {
        hasCredits: currentBalance >= requiredCredits,
        currentBalance,
        requiredCredits,
        message: currentBalance >= requiredCredits 
          ? `Yeterli krediye sahipsiniz (${currentBalance} kredi)`
          : `Yetersiz kredi! ${requiredCredits} kredi gerekli, ${currentBalance} krediniz var`
      };
    } catch (error) {
      console.error('Error checking credits:', error);
      return {
        hasCredits: false,
        currentBalance: 0,
        requiredCredits: AI_CREDIT_CONFIG.FEATURE_COSTS[feature],
        message: 'Kredi kontrolü sırasında hata oluştu'
      };
    }
  }

  /**
   * Consume credits for AI feature usage
   */
  static async consumeCredits(userId: string, feature: keyof typeof AI_CREDIT_CONFIG.FEATURE_COSTS, metadata?: Record<string, any>): Promise<boolean> {
    try {
      const requiredCredits = AI_CREDIT_CONFIG.FEATURE_COSTS[feature];
      const creditCheck = await this.checkCredits(userId, feature);
      
      if (!creditCheck.hasCredits) {
        console.log(`User ${userId} doesn't have enough credits for ${feature}`);
        return false;
      }

      // Deduct credits from user inventory
      const aiCreditItem = await db.select()
        .from(storeItems)
        .where(and(
          eq(storeItems.type, 'ai_credits'),
          eq(storeItems.isActive, true)
        ))
        .limit(1);

      if (aiCreditItem.length === 0) {
        throw new Error('AI Credit item not found in store');
      }

      // Update user inventory (reduce credits)
      const [existingInventory] = await db.select()
        .from(userInventory)
        .where(and(
          eq(userInventory.userId, userId),
          eq(userInventory.itemId, aiCreditItem[0].id)
        ));

      if (existingInventory && existingInventory.quantity >= requiredCredits) {
        await db.update(userInventory)
          .set({ 
            quantity: existingInventory.quantity - requiredCredits,
            lastUpdated: new Date()
          })
          .where(and(
            eq(userInventory.userId, userId),
            eq(userInventory.itemId, aiCreditItem[0].id)
          ));

        console.log(`✅ ${requiredCredits} credits consumed for ${feature} by user ${userId}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error consuming credits:', error);
      return false;
    }
  }

  /**
   * Get user's current AI credit balance
   */
  static async getUserCreditBalance(userId: string): Promise<number> {
    try {
      const aiCreditItem = await db.select()
        .from(storeItems)
        .where(and(
          eq(storeItems.type, 'ai_credits'),
          eq(storeItems.isActive, true)
        ))
        .limit(1);

      if (aiCreditItem.length === 0) {
        return 0;
      }

      const [userCreditInventory] = await db.select()
        .from(userInventory)
        .where(and(
          eq(userInventory.userId, userId),
          eq(userInventory.itemId, aiCreditItem[0].id)
        ));

      return userCreditInventory?.quantity || 0;
    } catch (error) {
      console.error('Error getting credit balance:', error);
      return 0;
    }
  }

  /**
   * Add credits to user account (after purchase)
   */
  static async addCredits(userId: string, creditAmount: number): Promise<boolean> {
    try {
      const aiCreditItem = await db.select()
        .from(storeItems)
        .where(and(
          eq(storeItems.type, 'ai_credits'),
          eq(storeItems.isActive, true)
        ))
        .limit(1);

      if (aiCreditItem.length === 0) {
        throw new Error('AI Credit item not found in store');
      }

      // Check if user already has credit inventory
      const [existingInventory] = await db.select()
        .from(userInventory)
        .where(and(
          eq(userInventory.userId, userId),
          eq(userInventory.itemId, aiCreditItem[0].id)
        ));

      if (existingInventory) {
        // Update existing inventory
        await db.update(userInventory)
          .set({ 
            quantity: existingInventory.quantity + creditAmount,
            lastUpdated: new Date()
          })
          .where(and(
            eq(userInventory.userId, userId),
            eq(userInventory.itemId, aiCreditItem[0].id)
          ));
      } else {
        // Create new inventory record
        await db.insert(userInventory).values({
          userId,
          itemId: aiCreditItem[0].id,
          quantity: creditAmount
        });
      }

      console.log(`✅ ${creditAmount} credits added to user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error adding credits:', error);
      return false;
    }
  }

  /**
   * Get required credit message for frontend
   */
  static getFeatureCreditInfo(feature: keyof typeof AI_CREDIT_CONFIG.FEATURE_COSTS) {
    const cost = AI_CREDIT_CONFIG.FEATURE_COSTS[feature];
    const featureNames = {
      'AI_QUESTION_GENERATION': 'Soru Üretimi',
      'AI_TUTOR_RESPONSE': 'AI Öğretmen',
      'AI_STUDY_PLAN': 'Çalışma Planı',
      'AI_PERFORMANCE_ANALYSIS': 'Performans Analizi',
      'AI_ADAPTIVE_DIFFICULTY': 'Adaptif Zorluk'
    };

    return {
      feature: featureNames[feature],
      cost,
      message: `${featureNames[feature]} özelliği için ${cost} kredi gerekli`
    };
  }
}