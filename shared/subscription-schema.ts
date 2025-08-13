// Subscription and Payment Schema for Turkish Market
import { pgTable, text, integer, boolean, timestamp, decimal, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Subscription Plans
export const subscriptionPlans = pgTable('subscription_plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameEn: text('name_en').notNull(),
  description: text('description').notNull(),
  descriptionEn: text('description_en').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('TRY').notNull(),
  billingPeriod: text('billing_period').notNull(), // monthly, yearly, family
  maxUsers: integer('max_users').default(1).notNull(),
  features: jsonb('features').$type<string[]>().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0),
  trialDays: integer('trial_days').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// User Subscriptions
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  planId: text('plan_id').references(() => subscriptionPlans.id).notNull(),
  status: text('status').notNull(), // active, canceled, expired, trialing, past_due
  iyzicoPlanReferenceCode: text('iyzico_plan_reference_code'),
  iyzicoSubscriptionReferenceCode: text('iyzico_subscription_reference_code'),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  trialEnd: timestamp('trial_end'),
  canceledAt: timestamp('canceled_at'),
  endedAt: timestamp('ended_at'),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
  statusIdx: index('subscriptions_status_idx').on(table.status)
}));

// Payment History
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  iyzicoPaymentId: text('iyzico_payment_id'),
  iyzicoConversationId: text('iyzico_conversation_id'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('TRY').notNull(),
  status: text('status').notNull(), // success, failed, pending, refunded
  paymentMethod: text('payment_method'), // credit_card, debit_card, installment
  installmentCount: integer('installment_count').default(1),
  failureReason: text('failure_reason'),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('payments_user_id_idx').on(table.userId),
  statusIdx: index('payments_status_idx').on(table.status),
  iyzicoPaymentIdIdx: index('payments_iyzico_payment_id_idx').on(table.iyzicoPaymentId)
}));

// Subscription Usage Tracking
export const subscriptionUsage = pgTable('subscription_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  feature: text('feature').notNull(), // quizzes, ai_tutoring, analytics, etc.
  usageCount: integer('usage_count').default(0).notNull(),
  limitCount: integer('limit_count'), // null for unlimited
  resetDate: timestamp('reset_date').notNull(), // daily, monthly reset
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  userFeatureIdx: index('subscription_usage_user_feature_idx').on(table.userId, table.feature),
  resetDateIdx: index('subscription_usage_reset_date_idx').on(table.resetDate)
}));

// Student Verification
export const studentVerifications = pgTable('student_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  studentId: text('student_id').notNull(),
  schoolName: text('school_name').notNull(),
  documentUrl: text('document_url'), // uploaded verification document
  status: text('status').notNull(), // pending, approved, rejected
  verifiedAt: timestamp('verified_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('student_verifications_user_id_idx').on(table.userId),
  statusIdx: index('student_verifications_status_idx').on(table.status)
}));

// Family Plan Members
export const familyMembers = pgTable('family_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id).notNull(),
  userId: text('user_id').notNull(),
  role: text('role').notNull(), // owner, member
  inviteEmail: text('invite_email'),
  status: text('status').notNull(), // active, invited, removed
  invitedAt: timestamp('invited_at'),
  joinedAt: timestamp('joined_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  subscriptionIdIdx: index('family_members_subscription_id_idx').on(table.subscriptionId),
  userIdIdx: index('family_members_user_id_idx').on(table.userId)
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

// Schemas
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertSubscriptionUsageSchema = createInsertSchema(subscriptionUsage);
export const insertStudentVerificationSchema = createInsertSchema(studentVerifications);
export const insertFamilyMemberSchema = createInsertSchema(familyMembers);

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
    id: 'basic',
    name: 'Temel (Ücretsiz)',
    nameEn: 'Basic (Free)',
    description: 'Günde 5 quiz hakkı, temel özellikler, reklamlarla deneyim',
    descriptionEn: '5 daily quizzes, basic features, with ads',
    price: '0.00',
    currency: 'TRY',
    billingPeriod: 'monthly',
    maxUsers: 1,
    features: [PREMIUM_FEATURES.PROGRESS_TRACKING],
    isActive: true,
    sortOrder: 1,
    trialDays: 0
  },
  {
    id: 'premium_1_month',
    name: 'Premium 1 Ay',
    nameEn: 'Premium 1 Month',
    description: 'Sınırsız quiz, tüm premium özellikler, AI desteği dahil',
    descriptionEn: 'Unlimited quizzes, all premium features, AI support included',
    price: '80.00',
    currency: 'TRY',
    billingPeriod: 'monthly',
    maxUsers: 1,
    features: [
      PREMIUM_FEATURES.UNLIMITED_QUIZZES,
      PREMIUM_FEATURES.AI_PERSONAL_TUTOR,
      PREMIUM_FEATURES.ADVANCED_ANALYTICS,
      PREMIUM_FEATURES.AD_FREE,
      PREMIUM_FEATURES.DETAILED_EXPLANATIONS,
      PREMIUM_FEATURES.CUSTOM_STUDY_PLANS,
      PREMIUM_FEATURES.PROGRESS_TRACKING
    ],
    isActive: true,
    sortOrder: 2,
    trialDays: 7
  },
  {
    id: 'premium_3_months',
    name: 'Premium 3 Ay',
    nameEn: 'Premium 3 Months',
    description: '3 aylık premium paket, aylık 70 TL ile tasarruf edin',
    descriptionEn: '3-month premium package, save with 70 TL monthly rate',
    price: '70.00',
    currency: 'TRY',
    billingPeriod: 'quarterly',
    maxUsers: 1,
    features: [
      PREMIUM_FEATURES.UNLIMITED_QUIZZES,
      PREMIUM_FEATURES.AI_PERSONAL_TUTOR,
      PREMIUM_FEATURES.ADVANCED_ANALYTICS,
      PREMIUM_FEATURES.AD_FREE,
      PREMIUM_FEATURES.DETAILED_EXPLANATIONS,
      PREMIUM_FEATURES.CUSTOM_STUDY_PLANS,
      PREMIUM_FEATURES.PROGRESS_TRACKING
    ],
    isActive: true,
    sortOrder: 3,
    trialDays: 7
  },
  {
    id: 'premium_6_months',
    name: 'Premium 6 Ay',
    nameEn: 'Premium 6 Months',
    description: '6 aylık premium paket, aylık 60 TL ile daha fazla tasarruf',
    descriptionEn: '6-month premium package, more savings with 60 TL monthly rate',
    price: '60.00',
    currency: 'TRY',
    billingPeriod: 'semi-annually',
    maxUsers: 1,
    features: [
      PREMIUM_FEATURES.UNLIMITED_QUIZZES,
      PREMIUM_FEATURES.AI_PERSONAL_TUTOR,
      PREMIUM_FEATURES.ADVANCED_ANALYTICS,
      PREMIUM_FEATURES.AD_FREE,
      PREMIUM_FEATURES.DETAILED_EXPLANATIONS,
      PREMIUM_FEATURES.CUSTOM_STUDY_PLANS,
      PREMIUM_FEATURES.PROGRESS_TRACKING
    ],
    isActive: true,
    sortOrder: 4,
    trialDays: 7
  },
  {
    id: 'premium_12_months',
    name: 'Premium 12 Ay',
    nameEn: 'Premium 12 Months',
    description: '12 aylık premium paket, aylık 50 TL ile maksimum tasarruf',
    descriptionEn: '12-month premium package, maximum savings with 50 TL monthly rate',
    price: '50.00',
    currency: 'TRY',
    billingPeriod: 'yearly',
    maxUsers: 1,
    features: [
      PREMIUM_FEATURES.UNLIMITED_QUIZZES,
      PREMIUM_FEATURES.AI_PERSONAL_TUTOR,
      PREMIUM_FEATURES.ADVANCED_ANALYTICS,
      PREMIUM_FEATURES.OFFLINE_MODE,
      PREMIUM_FEATURES.AD_FREE,
      PREMIUM_FEATURES.DETAILED_EXPLANATIONS,
      PREMIUM_FEATURES.CUSTOM_STUDY_PLANS,
      PREMIUM_FEATURES.PROGRESS_TRACKING,
      PREMIUM_FEATURES.PRIORITY_SUPPORT
    ],
    isActive: true,
    sortOrder: 5,
    trialDays: 14
  },
  {
    id: 'family_yearly',
    name: 'Aile Planı (Yıllık)',
    nameEn: 'Family Plan (Yearly)',
    description: '6 kullanıcıya kadar, tüm premium özellikler, aile yönetimi - Sadece yıllık',
    descriptionEn: 'Up to 6 users, all premium features, family management - Yearly only',
    price: '1200.00',
    currency: 'TRY',
    billingPeriod: 'yearly',
    maxUsers: 6,
    features: [
      PREMIUM_FEATURES.UNLIMITED_QUIZZES,
      PREMIUM_FEATURES.AI_PERSONAL_TUTOR,
      PREMIUM_FEATURES.ADVANCED_ANALYTICS,
      PREMIUM_FEATURES.OFFLINE_MODE,
      PREMIUM_FEATURES.AD_FREE,
      PREMIUM_FEATURES.PREMIUM_SIMULATIONS,
      PREMIUM_FEATURES.EXPERT_CONTENT,
      PREMIUM_FEATURES.PRIORITY_SUPPORT,
      PREMIUM_FEATURES.DETAILED_EXPLANATIONS,
      PREMIUM_FEATURES.CUSTOM_STUDY_PLANS,
      PREMIUM_FEATURES.PROGRESS_TRACKING,
      PREMIUM_FEATURES.FAMILY_SHARING
    ],
    isActive: true,
    sortOrder: 6,
    trialDays: 14
  }
];