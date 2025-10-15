// MySQL Subscription Tables
import { mysqlTable, text, int, boolean, timestamp, decimal, json, varchar, index } from 'drizzle-orm/mysql-core';

// Subscription Plans
export const subscriptionPlans = mysqlTable('subscription_plans', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: text('name').notNull(),
  nameEn: text('name_en').notNull(),
  description: text('description').notNull(),
  descriptionEn: text('description_en').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('TRY').notNull(),
  billingPeriod: text('billing_period').notNull(),
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
  status: varchar('status', { length: 50 }).notNull(),
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

// Payments
export const payments = mysqlTable('payments', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 36 }).notNull(),
  subscriptionId: varchar('subscription_id', { length: 36 }),
  iyzicoPaymentId: text('iyzico_payment_id'),
  iyzicoConversationId: text('iyzico_conversation_id'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('TRY').notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  paymentMethod: text('payment_method'),
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
  status: varchar('status', { length: 50 }).notNull(), // pending, approved, rejected
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
  status: varchar('status', { length: 50 }).notNull(), // active, invited, removed
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
  referrerId: varchar('referrer_id', { length: 36 }).notNull(), // User who sent the invitation
  refereeId: varchar('referee_id', { length: 36 }).notNull(), // User who was invited
  referralCode: text('referral_code').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // pending, completed, expired
  reward: text('reward').notNull(), // +1_month, discount_percentage, etc.
  completedAt: timestamp('completed_at'),
  expiresAt: timestamp('expires_at'),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
}, (table) => ({
  referrerIdIdx: index('referrals_referrer_id_idx').on(table.referrerId),
  refereeIdIdx: index('referrals_referee_id_idx').on(table.refereeId),
  referralCodeIdx: index('referrals_code_idx').on(table.referralCode)
}));
