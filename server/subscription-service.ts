// Subscription Management Service
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db } from './db';
import {
  DEFAULT_PLANS,
  SUBSCRIPTION_STATUS, PAYMENT_STATUS, PREMIUM_FEATURES,
  type Subscription, type SubscriptionPlan, type Payment,
  type InsertSubscription, type InsertPayment
} from '@shared/subscription-schema';
import { subscriptionPlans, subscriptions, payments, referrals } from '@shared/schema';
import { iyzicoService, type IyzicoPaymentRequest, type IyzicoSubscriptionRequest } from './iyzico-service';

export class SubscriptionService {
  private db = db;
  
  // Initialize default subscription plans
  static async initializePlans() {
    try {
      for (const plan of DEFAULT_PLANS) {
        await db.insert(subscriptionPlans)
          .values([plan])
          .onConflictDoNothing();
      }
      console.log('Subscription plans initialized');
    } catch (error) {
      console.error('Error initializing subscription plans:', error);
    }
  }

  // Get all available subscription plans
  static async getPlans(): Promise<SubscriptionPlan[]> {
    return await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.sortOrder);
  }

  // Get user's current subscription
  async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    const result = await this.db.select()
      .from(subscriptions)
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, SUBSCRIPTION_STATUS.ACTIVE)
      ))
      .limit(1);

    return result[0] || null;
  }

  // Get user's subscription with plan details
  static async getUserSubscription(userId: string): Promise<(Subscription & { plan: SubscriptionPlan }) | null> {
    const result = await db.select({
      subscription: subscriptions,
      plan: subscriptionPlans
    })
    .from(subscriptions)
    .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, SUBSCRIPTION_STATUS.ACTIVE)
    ))
    .limit(1);

    if (result.length === 0 || !result[0].plan) {
      return null;
    }

    return {
      ...result[0].subscription,
      plan: result[0].plan
    };
  }

  // Check if user has specific feature access
  static async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const userSubscription = await SubscriptionService.getUserSubscription(userId);
    
    if (!userSubscription) {
      // Free tier features
      return [PREMIUM_FEATURES.PROGRESS_TRACKING].includes(feature as any);
    }

    return userSubscription.plan.features.includes(feature);
  }

  // Create subscription with Iyzico
  static async createSubscription(
    userId: string, 
    planId: string, 
    paymentRequest: IyzicoPaymentRequest
  ): Promise<{ subscription: Subscription; iyzicoResult: any }> {
    
    // Get the selected plan
    const selectedPlan = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (selectedPlan.length === 0) {
      throw new Error('Subscription plan not found');
    }

    const plan = selectedPlan[0];

    try {
      // Create subscription record first
      const now = new Date();
      const periodEnd = new Date(now);
      
      // Calculate period end based on billing period
      switch (plan.billingPeriod) {
        case 'monthly':
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          break;
        case 'quarterly':
          periodEnd.setMonth(periodEnd.getMonth() + 3);
          break;
        case 'semi-annually':
          periodEnd.setMonth(periodEnd.getMonth() + 6);
          break;
        case 'yearly':
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          break;
        default:
          periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Add trial period if applicable
      const trialEnd = plan.trialDays && plan.trialDays > 0 
        ? new Date(now.getTime() + (plan.trialDays * 24 * 60 * 60 * 1000))
        : null;

      const [subscription] = await db.insert(subscriptions).values({
        userId,
        planId,
        status: trialEnd ? SUBSCRIPTION_STATUS.TRIALING : SUBSCRIPTION_STATUS.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialEnd,
        metadata: {}
      }).returning();

      // Process payment with Iyzico (mock for now)
      const iyzicoResult = await iyzicoService.createPayment({
        ...paymentRequest,
        price: plan.price,
        currency: plan.currency
      });

      // Record payment
      await db.insert(payments).values({
        userId,
        subscriptionId: subscription.id,
        amount: plan.price,
        currency: plan.currency,
        status: iyzicoResult.success ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED,
        paymentMethod: paymentRequest.paymentCard?.cardType || 'credit_card',
        metadata: { iyzicoResult }
      });

      return { subscription, iyzicoResult };

    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Cancel subscription
  static async cancelSubscription(userId: string): Promise<void> {
    await db.update(subscriptions)
      .set({ 
        status: SUBSCRIPTION_STATUS.CANCELED,
        canceledAt: new Date()
      })
      .where(and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, SUBSCRIPTION_STATUS.ACTIVE)
      ));
  }

  // Get user's payment history
  static async getPaymentHistory(userId: string, limit: number = 10): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt))
      .limit(limit);
  }

  // Referral System Methods
  async createReferral(referrerId: string, refereeId: string, referralCode: string) {
    const [referral] = await this.db.insert(referrals).values({
      referrerId,
      refereeId,
      referralCode,
      status: 'pending',
      reward: '+1_month',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }).returning();

    return referral;
  }

  async completeReferral(referralCode: string) {
    // Mark referral as completed
    const [referral] = await this.db
      .update(referrals)
      .set({ 
        status: 'completed', 
        completedAt: new Date() 
      })
      .where(and(
        eq(referrals.referralCode, referralCode),
        eq(referrals.status, 'pending')
      ))
      .returning();

    if (!referral) {
      throw new Error('Referral not found or already completed');
    }

    // Extend referrer's subscription by 1 month
    const currentSubscription = await this.getCurrentSubscription(referral.referrerId);
    if (currentSubscription && currentSubscription.status === SUBSCRIPTION_STATUS.ACTIVE) {
      const newEndDate = new Date(currentSubscription.currentPeriodEnd);
      newEndDate.setMonth(newEndDate.getMonth() + 1);

      await this.db
        .update(subscriptions)
        .set({ 
          currentPeriodEnd: newEndDate,
          metadata: {
            ...currentSubscription.metadata,
            referralExtensions: (currentSubscription.metadata?.referralExtensions || 0) + 1
          }
        })
        .where(eq(subscriptions.id, currentSubscription.id));
    }

    return referral;
  }

  async getUserReferrals(userId: string) {
    return await this.db.select().from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }
}

export const subscriptionService = new SubscriptionService();