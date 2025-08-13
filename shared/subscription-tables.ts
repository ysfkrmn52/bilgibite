// Temporary file to include subscription tables in schema
import { pgTable, text, integer, boolean, timestamp, decimal, jsonb, uuid, index } from 'drizzle-orm/pg-core';

// Subscription Plans
export const subscriptionPlans = pgTable('subscription_plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameEn: text('name_en').notNull(),
  description: text('description').notNull(),
  descriptionEn: text('description_en').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('TRY').notNull(),
  billingPeriod: text('billing_period').notNull(),
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
  status: text('status').notNull(),
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

// Payments
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  iyzicoPaymentId: text('iyzico_payment_id'),
  iyzicoConversationId: text('iyzico_conversation_id'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('TRY').notNull(),
  status: text('status').notNull(),
  paymentMethod: text('payment_method'),
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