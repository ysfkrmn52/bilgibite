// Subscription and Payment Schema for Turkish Market - MySQL Version
import { mysqlTable, text, int, boolean, timestamp, decimal, json, varchar, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Subscription Plans
export const subscriptionPlans = mysqlTable('subscription_plans', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: text('name').notNull(),
  nameEn: text('name_en').notNull(),
  description: text('description').notNull(),
  descriptionEn: text('description_en').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('TRY').notNull(),
  billingPeriod: text('billing_period').notNull(), // monthly, yearly, family
  maxUsers: int('max_users').default(1).notNull(),
  features: json('features').$type<string[]>().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: int('sort_order').default(0),
  trialDays: int('trial_days').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

// User Subscriptions
export const subscriptions = mysqlTable('subscriptions', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 36 }).notNull(),
  planId: varchar('plan_id', { length: 50 }).notNull(),
  status: text('status').notNull(), // active, canceled, expired, trialing, past_due
  iyzicoPlanReferenceCode: text('iyzico_plan_reference_code'),
  iyzicoSubscriptionReferenceCode: text('iyzico_subscription_reference_code'),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  trialEnd: timestamp('trial_end'),
  canceledAt: timestamp('canceled_at'),
  endedAt: timestamp('ended_at'),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
}, (table) => ({
  userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
  statusIdx: index('subscriptions_status_idx').on(table.status)
}));

// Payment History
export const payments = mysqlTable('payments', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 36 }).notNull(),
  subscriptionId: varchar('subscription_id', { length: 36 }),
  iyzicoPaymentId: text('iyzico_payment_id'),
  iyzicoConversationId: text('iyzico_conversation_id'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('TRY').notNull(),
  status: text('status').notNull(), // success, failed, pending, refunded
  paymentMethod: text('payment_method'), // credit_card, debit_card, installment
  installmentCount: int('installment_count').default(1),
  failureReason: text('failure_reason'),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
}, (table) => ({
  userIdIdx: index('payments_user_id_idx').on(table.userId),
  statusIdx: index('payments_status_idx').on(table.status),
  iyzicoPaymentIdIdx: index('payments_iyzico_payment_id_idx').on(table.iyzicoPaymentId)
}));

// Subscription Usage Tracking
export const subscriptionUsage = mysqlTable('subscription_usage', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 36 }).notNull(),
  subscriptionId: varchar('subscription_id', { length: 36 }),
  feature: text('feature').notNull(), // quizzes, ai_tutoring, analytics, etc.
  usageCount: int('usage_count').default(0).notNull(),
  limitCount: int('limit_count'), // null for unlimited
  resetDate: timestamp('reset_date').notNull(), // daily, monthly reset
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
}, (table) => ({
  userFeatureIdx: index('subscription_usage_user_feature_idx').on(table.userId, table.feature),
  resetDateIdx: index('subscription_usage_reset_date_idx').on(table.resetDate)
}));

// Student Verification
export const studentVerifications = mysqlTable('student_verifications', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 36 }).notNull(),
  studentId: text('student_id').notNull(),
  schoolName: text('school_name').notNull(),
  documentUrl: text('document_url'), // uploaded verification document
  status: text('status').notNull(), // pending, approved, rejected
  verifiedAt: timestamp('verified_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
}, (table) => ({
  userIdIdx: index('student_verifications_user_id_idx').on(table.userId),
  statusIdx: index('student_verifications_status_idx').on(table.status)
}));

// Family Plan Members
export const familyMembers = mysqlTable('family_members', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  subscriptionId: varchar('subscription_id', { length: 36 }).notNull(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  role: text('role').notNull(), // owner, member
  inviteEmail: text('invite_email'),
  status: text('status').notNull(), // active, invited, removed
  invitedAt: timestamp('invited_at'),
  joinedAt: timestamp('joined_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
}, (table) => ({
  subscriptionIdIdx: index('family_members_subscription_id_idx').on(table.subscriptionId),
  userIdIdx: index('family_members_user_id_idx').on(table.userId)
}));

// Referral System
export const referrals = mysqlTable('referrals', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  referrerId: varchar('referrer_id', { length: 36 }).notNull(),
  refereeId: varchar('referee_id', { length: 36 }).notNull(),
  referralCode: text('referral_code').notNull(),
  status: text('status').notNull(), // pending, completed, expired
  reward: text('reward').notNull(), // +1_month, discount_20, etc
  expiresAt: timestamp('expires_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
}, (table) => ({
  referrerIdIdx: index('referrals_referrer_id_idx').on(table.referrerId),
  referralCodeIdx: index('referrals_referral_code_idx').on(table.referralCode),
  statusIdx: index('referrals_status_idx').on(table.status)
}));

// Relations
export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions)
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id]
  }),
  payments: many(payments),
  usage: many(subscriptionUsage),
  familyMembers: many(familyMembers)
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id]
  })
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(subscriptions, {
    fields: [referrals.referrerId],
    references: [subscriptions.userId]
  }),
  referee: one(subscriptions, {
    fields: [referrals.refereeId], 
    references: [subscriptions.userId]
  })
}));

// Schemas
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertSubscriptionUsageSchema = createInsertSchema(subscriptionUsage);
export const insertStudentVerificationSchema = createInsertSchema(studentVerifications);
export const insertFamilyMemberSchema = createInsertSchema(familyMembers);
export const insertReferralSchema = createInsertSchema(referrals);

// Types
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type SubscriptionUsage = typeof subscriptionUsage.$inferSelect;
export type InsertSubscriptionUsage = z.infer<typeof insertSubscriptionUsageSchema>;
export type StudentVerification = typeof studentVerifications.$inferSelect;
export type InsertStudentVerification = z.infer<typeof insertStudentVerificationSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

// Enums and Constants
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled', 
  EXPIRED: 'expired',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due'
} as const;

export const PAYMENT_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PENDING: 'pending',
  REFUNDED: 'refunded'
} as const;

export const STUDENT_VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const FAMILY_MEMBER_ROLE = {
  OWNER: 'owner',
  MEMBER: 'member'
} as const;

export const FAMILY_MEMBER_STATUS = {
  ACTIVE: 'active',
  INVITED: 'invited',
  REMOVED: 'removed'
} as const;

// Premium Features Configuration
export const PREMIUM_FEATURES = {
  UNLIMITED_QUIZZES: 'unlimited_quizzes',
  AI_PERSONAL_TUTOR: 'ai_personal_tutor',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  OFFLINE_MODE: 'offline_mode',
  AD_FREE: 'ad_free_experience',
  PREMIUM_SIMULATIONS: 'premium_exam_simulations',
  EXPERT_CONTENT: 'expert_created_content',
  PRIORITY_SUPPORT: 'priority_support',
  DETAILED_EXPLANATIONS: 'detailed_explanations',
  CUSTOM_STUDY_PLANS: 'custom_study_plans',
  PROGRESS_TRACKING: 'progress_tracking',
  FAMILY_SHARING: 'family_sharing'
} as const;

// Default Subscription Plans
export const DEFAULT_PLANS: InsertSubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    nameEn: 'Free',
    description: 'Sadece hızlı quiz, reklamlarla deneyim',
    descriptionEn: 'Quick quiz only, with ads',
    price: '0.00',
    currency: 'TRY',
    billingPeriod: 'monthly',
    maxUsers: 1,
    features: ['quick_quiz', 'with_ads'],
    isActive: true,
    sortOrder: 1,
    trialDays: 0
  },
  {
    id: 'plus',
    name: 'Plus',
    nameEn: 'Plus',
    description: 'Reklamsız tüm uygulama özellikleri - AI özellikler için ayrı kredi gerekli',
    descriptionEn: 'Ad-free full app features - Separate credits required for AI features',
    price: '99.00',
    currency: 'TRY',
    billingPeriod: 'monthly',
    maxUsers: 1,
    features: [
      PREMIUM_FEATURES.UNLIMITED_QUIZZES,
      PREMIUM_FEATURES.ADVANCED_ANALYTICS,
      PREMIUM_FEATURES.AD_FREE,
      PREMIUM_FEATURES.DETAILED_EXPLANATIONS,
      PREMIUM_FEATURES.CUSTOM_STUDY_PLANS,
      PREMIUM_FEATURES.PROGRESS_TRACKING,
      PREMIUM_FEATURES.OFFLINE_MODE
    ],
    isActive: true,
    sortOrder: 2,
    trialDays: 7
  },
  {
    id: 'premium',
    name: 'Premium (Aile Paketi)',
    nameEn: 'Premium (Family Package)',
    description: '4 kullanıcıya kadar - Tüm Plus özellikleri aile için',
    descriptionEn: 'Up to 4 users - All Plus features for family',
    price: '299.00',
    currency: 'TRY',
    billingPeriod: 'monthly',
    maxUsers: 4,
    features: [
      PREMIUM_FEATURES.UNLIMITED_QUIZZES,
      PREMIUM_FEATURES.ADVANCED_ANALYTICS,
      PREMIUM_FEATURES.AD_FREE,
      PREMIUM_FEATURES.DETAILED_EXPLANATIONS,
      PREMIUM_FEATURES.CUSTOM_STUDY_PLANS,
      PREMIUM_FEATURES.PROGRESS_TRACKING,
      PREMIUM_FEATURES.OFFLINE_MODE,
      PREMIUM_FEATURES.FAMILY_SHARING,
      PREMIUM_FEATURES.PRIORITY_SUPPORT
    ],
    isActive: true,
    sortOrder: 3,
    trialDays: 7
  }
];
