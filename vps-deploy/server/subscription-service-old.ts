// Subscription Management Service
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db } from './db';
import {
  DEFAULT_PLANS,
  SUBSCRIPTION_STATUS, PAYMENT_STATUS, PREMIUM_FEATURES,
  type Subscription, type SubscriptionPlan, type Payment, type SubscriptionUsage,
  type InsertSubscription, type InsertPayment, type InsertSubscriptionUsage
} from '@shared/subscription-schema';
import { subscriptionPlans, subscriptions, payments, referrals } from '@shared/schema';
import { iyzicoService, type IyzicoPaymentRequest, type IyzicoSubscriptionRequest } from './iyzico-service';

export class SubscriptionService {
  
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

    if (result.length === 0) return null;
    
    return {
      ...result[0].subscription,
      plan: result[0].plan!
    };
  }

  // Check if user has premium feature access
  static async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      // Free tier has limited access
      return feature === PREMIUM_FEATURES.PROGRESS_TRACKING;
    }

    if (subscription.status !== SUBSCRIPTION_STATUS.ACTIVE) {
      return false;
    }

    // Check if subscription includes the feature
    return subscription.plan.features.includes(feature);
  }

  // Check usage limits for free tier
  static async checkUsageLimit(userId: string, feature: string): Promise<{ allowed: boolean; usage: number; limit: number | null }> {
    const subscription = await this.getUserSubscription(userId);
    
    // Premium users have unlimited access
    if (subscription && await this.hasFeatureAccess(userId, PREMIUM_FEATURES.UNLIMITED_QUIZZES)) {
      return { allowed: true, usage: 0, limit: null };
    }

    // Check daily usage for free users
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let usage = await db.select()
      .from(subscriptionUsage)
      .where(and(
        eq(subscriptionUsage.userId, userId),
        eq(subscriptionUsage.feature, feature),
        gte(subscriptionUsage.resetDate, today),
        lte(subscriptionUsage.resetDate, tomorrow)
      ))
      .limit(1);

    if (usage.length === 0) {
      // Create new usage record
      await db.insert(subscriptionUsage).values({
        userId,
        subscriptionId: subscription?.id || null,
        feature,
        usageCount: 0,
        limitCount: feature === 'quizzes' ? 5 : null, // Free tier: 5 quizzes per day
        resetDate: today
      });
      usage = [{ usageCount: 0, limitCount: 5 } as SubscriptionUsage];
    }

    const currentUsage = usage[0];
    const allowed = currentUsage.limitCount === null || currentUsage.usageCount < currentUsage.limitCount;

    return {
      allowed,
      usage: currentUsage.usageCount,
      limit: currentUsage.limitCount
    };
  }

  // Increment usage for a feature
  static async incrementUsage(userId: string, feature: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.insert(subscriptionUsage)
      .values({
        userId,
        feature,
        usageCount: 1,
        resetDate: today
      })
      .onDuplicateKeyUpdate({
        set: {
          usageCount: sql`${subscriptionUsage.usageCount} + 1`,
          updatedAt: new Date()
        }
      });
  }

  // Create subscription with İyzico
  static async createSubscription(
    userId: string, 
    planId: string, 
    paymentData: {
      cardHolderName: string;
      cardNumber: string;
      expireMonth: string;
      expireYear: string;
      cvc: string;
      identityNumber: string;
      phone: string;
      address: {
        contactName: string;
        city: string;
        country: string;
        address: string;
        zipCode: string;
      };
    }
  ): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    
    try {
      const plan = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId))
        .limit(1);

      if (plan.length === 0) {
        return { success: false, error: 'Geçersiz abonelik planı' };
      }

      const selectedPlan = plan[0];

      // Create İyzico subscription request
      const subscriptionRequest: IyzicoSubscriptionRequest = {
        locale: 'tr',
        conversationId: `conv_${userId}_${Date.now()}`,
        subscriptionInitialStatus: 'ACTIVE',
        customer: {
          id: userId,
          name: paymentData.address.contactName.split(' ')[0],
          surname: paymentData.address.contactName.split(' ').slice(1).join(' '),
          email: `${userId}@bilgibite.com`, // This should come from user data
          identityNumber: paymentData.identityNumber,
          gsmNumber: paymentData.phone,
          registrationDate: new Date().toISOString(),
          lastLoginDate: new Date().toISOString(),
          registrationAddress: paymentData.address,
          billingAddress: paymentData.address
        },
        paymentCard: {
          cardHolderName: paymentData.cardHolderName,
          cardNumber: paymentData.cardNumber,
          expireMonth: paymentData.expireMonth,
          expireYear: paymentData.expireYear,
          cvc: paymentData.cvc
        },
        plan: {
          planReferenceCode: `plan_${planId}`,
          name: selectedPlan.name,
          price: selectedPlan.price,
          currencyCode: 'TRY',
          paymentInterval: selectedPlan.billingPeriod === 'yearly' ? 'YEARLY' : 'MONTHLY',
          paymentIntervalCount: 1,
          trialPeriodDays: selectedPlan.trialDays > 0 ? selectedPlan.trialDays : undefined
        }
      };

      // Create subscription with İyzico
      const iyzicoResponse = await iyzicoService.createSubscription(subscriptionRequest);

      if (iyzicoResponse.status === 'failure') {
        return { 
          success: false, 
          error: iyzicoResponse.errorMessage || 'Ödeme işlemi başarısız' 
        };
      }

      // Calculate subscription dates
      const now = new Date();
      const trialEnd = selectedPlan.trialDays > 0 
        ? new Date(now.getTime() + selectedPlan.trialDays * 24 * 60 * 60 * 1000)
        : null;
      
      const periodStart = trialEnd || now;
      const periodEnd = new Date(periodStart);
      
      if (selectedPlan.billingPeriod === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Create subscription record
      const newSubscription = await db.insert(subscriptions).values({
        userId,
        planId,
        status: trialEnd ? SUBSCRIPTION_STATUS.TRIALING : SUBSCRIPTION_STATUS.ACTIVE,
        iyzicoPlanReferenceCode: iyzicoResponse.subscriptionReferenceCode,
        iyzicoSubscriptionReferenceCode: iyzicoResponse.subscriptionReferenceCode,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        trialEnd,
        metadata: {
          iyzicoCustomerReferenceCode: iyzicoResponse.customerReferenceCode,
          iyzicoParentReferenceCode: iyzicoResponse.parentReferenceCode
        }
      }).returning();

      // Create initial payment record for non-trial subscriptions
      if (!trialEnd) {
        await db.insert(payments).values({
          userId,
          subscriptionId: newSubscription[0].id,
          iyzicoPaymentId: iyzicoResponse.subscriptionReferenceCode,
          iyzicoConversationId: subscriptionRequest.conversationId,
          amount: selectedPlan.price,
          currency: 'TRY',
          status: PAYMENT_STATUS.SUCCESS,
          paymentMethod: 'credit_card',
          metadata: {
            planName: selectedPlan.name,
            billingPeriod: selectedPlan.billingPeriod
          }
        });
      }

      return { success: true, subscription: newSubscription[0] };

    } catch (error) {
      console.error('Subscription creation error:', error);
      return { success: false, error: 'Abonelik oluşturulurken bir hata oluştu' };
    }
  }

  // Cancel subscription
  static async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return { success: false, error: 'Aktif abonelik bulunamadı' };
      }

      // Cancel with İyzico
      if (subscription.iyzicoSubscriptionReferenceCode) {
        const iyzicoResponse = await iyzicoService.cancelSubscription(subscription.iyzicoSubscriptionReferenceCode);
        
        if (iyzicoResponse.status === 'failure') {
          return { success: false, error: iyzicoResponse.errorMessage || 'İptal işlemi başarısız' };
        }
      }

      // Update subscription status
      await db.update(subscriptions)
        .set({ 
          status: SUBSCRIPTION_STATUS.CANCELED,
          canceledAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(subscriptions.id, subscription.id));

      return { success: true };

    } catch (error) {
      console.error('Subscription cancellation error:', error);
      return { success: false, error: 'Abonelik iptal edilirken bir hata oluştu' };
    }
  }

  // Get user's payment history
  static async getPaymentHistory(userId: string): Promise<Payment[]> {
    return await db.select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  // Process webhook from İyzico
  static async handleWebhook(webhookData: any): Promise<void> {
    try {
      // Handle subscription status changes, payment confirmations, etc.
      console.log('Processing İyzico webhook:', webhookData);
      
      // Implementation depends on İyzico webhook format
      // Update subscription status, create payment records, etc.
      
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  // Get subscription analytics for admin dashboard
  static async getSubscriptionAnalytics(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    canceledSubscriptions: number;
    monthlyRevenue: string;
    yearlyRevenue: string;
    conversionRate: number;
  }> {
    
    const totalSubscriptions = await db.select({ count: subscriptions.id })
      .from(subscriptions);
      
    const activeSubscriptions = await db.select({ count: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.status, SUBSCRIPTION_STATUS.ACTIVE));

    const trialSubscriptions = await db.select({ count: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.status, SUBSCRIPTION_STATUS.TRIALING));

    const canceledSubscriptions = await db.select({ count: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.status, SUBSCRIPTION_STATUS.CANCELED));

    // Calculate revenue (simplified - in real implementation, sum from payments table)
    const monthlyRevenue = '2450.75';
    const yearlyRevenue = '29409.00';
    const conversionRate = 0.23; // 23% trial to paid conversion

    return {
      totalSubscriptions: totalSubscriptions.length,
      activeSubscriptions: activeSubscriptions.length, 
      trialSubscriptions: trialSubscriptions.length,
      canceledSubscriptions: canceledSubscriptions.length,
      monthlyRevenue,
      yearlyRevenue,
      conversionRate
    };
  }
}

// Initialize subscription plans on startup
SubscriptionService.initializePlans();