// AI Credits initialization and seeding
import { db } from './db';
import { storeItems } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { AI_CREDIT_CONFIG } from '@shared/ai-credits-schema';

export async function seedAICredits(): Promise<void> {
  try {
    // Check if AI credit item already exists
    const existingAICredit = await db.select()
      .from(storeItems)
      .where(and(
        eq(storeItems.type, 'ai_credits'),
        eq(storeItems.isActive, true)
      ))
      .limit(1);

    if (existingAICredit.length > 0) {
      console.log('AI Credits already exist, skipping seed...');
      return;
    }

    console.log('Seeding AI Credits store item...');

    // Create AI Credit package in store
    await db.insert(storeItems).values({
      id: AI_CREDIT_CONFIG.AI_CREDIT_PACKAGE.id,
      name: AI_CREDIT_CONFIG.AI_CREDIT_PACKAGE.name,
      description: AI_CREDIT_CONFIG.AI_CREDIT_PACKAGE.description,
      type: AI_CREDIT_CONFIG.AI_CREDIT_PACKAGE.type,
      cost: AI_CREDIT_CONFIG.AI_CREDIT_PACKAGE.cost,
      icon: AI_CREDIT_CONFIG.AI_CREDIT_PACKAGE.icon,
      isActive: AI_CREDIT_CONFIG.AI_CREDIT_PACKAGE.isActive,
      metadata: AI_CREDIT_CONFIG.AI_CREDIT_PACKAGE.metadata
    });

    console.log('✅ AI Credits store item created successfully');
  } catch (error) {
    console.error('❌ Error seeding AI Credits:', error);
    throw error;
  }
}