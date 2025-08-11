// Gamification API endpoints
import { Request, Response } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  dailyChallenges, 
  userDailyChallenges, 
  storeItems, 
  userStorePurchases, 
  userInventory,
  leaderboard,
  achievements,
  userAchievements
} from "@shared/schema";

// Get user's gamification stats
export const getUserGamificationStats = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's achievements
    const userAchievementsList = await db
      .select({
        achievement: achievements,
        earnedAt: userAchievements.earnedAt
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));

    // Get user's current daily challenges
    const today = new Date().toISOString().split('T')[0];
    const userChallenges = await db
      .select({
        challenge: dailyChallenges,
        progress: userDailyChallenges.progress,
        isCompleted: userDailyChallenges.isCompleted,
        completedAt: userDailyChallenges.completedAt
      })
      .from(dailyChallenges)
      .leftJoin(userDailyChallenges, sql`${userDailyChallenges.challengeId} = ${dailyChallenges.id} AND ${userDailyChallenges.userId} = ${userId}`)
      .where(eq(dailyChallenges.validDate, new Date(today)));

    // Get user's inventory
    const inventory = await db
      .select({
        item: storeItems,
        quantity: userInventory.quantity
      })
      .from(userInventory)
      .innerJoin(storeItems, eq(userInventory.itemId, storeItems.id))
      .where(eq(userInventory.userId, userId));

    const stats = {
      user: {
        level: user.level,
        xp: user.xp,
        gems: user.gems,
        lives: user.lives,
        maxLives: user.maxLives,
        streakDays: user.streakDays,
        livesLastRefilled: user.livesLastRefilled
      },
      achievements: userAchievementsList,
      dailyChallenges: userChallenges,
      inventory
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user gamification stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { type = 'weekly', limit = 50 } = req.query;
    
    const leaderboardData = await db
      .select({
        user: users,
        rank: leaderboard.rank,
        xp: leaderboard.xp
      })
      .from(leaderboard)
      .innerJoin(users, eq(leaderboard.userId, users.id))
      .where(eq(leaderboard.type, type as string))
      .orderBy(leaderboard.rank)
      .limit(Number(limit));

    res.json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get store items
export const getStoreItems = async (req: Request, res: Response) => {
  try {
    const items = await db
      .select()
      .from(storeItems)
      .where(eq(storeItems.isActive, true));

    res.json(items);
  } catch (error) {
    console.error('Error fetching store items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Purchase store item
export const purchaseStoreItem = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { itemId, quantity = 1 } = req.body;

    // Start a transaction
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [item] = await db.select().from(storeItems).where(eq(storeItems.id, itemId));

    if (!user || !item) {
      return res.status(404).json({ error: 'User or item not found' });
    }

    const totalCost = item.cost * quantity;
    
    if (user.gems < totalCost) {
      return res.status(400).json({ error: 'Insufficient gems' });
    }

    // Deduct gems
    await db.update(users)
      .set({ gems: user.gems - totalCost })
      .where(eq(users.id, userId));

    // Record purchase
    await db.insert(userStorePurchases).values({
      userId,
      itemId,
      quantity,
      totalCost
    });

    // Update inventory
    const [existingInventory] = await db
      .select()
      .from(userInventory)
      .where(sql`${userInventory.userId} = ${userId} AND ${userInventory.itemId} = ${itemId}`);

    if (existingInventory) {
      await db.update(userInventory)
        .set({ 
          quantity: existingInventory.quantity + quantity,
          lastUpdated: new Date()
        })
        .where(eq(userInventory.id, existingInventory.id));
    } else {
      await db.insert(userInventory).values({
        userId,
        itemId,
        quantity
      });
    }

    res.json({ success: true, remainingGems: user.gems - totalCost });
  } catch (error) {
    console.error('Error purchasing item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Complete daily challenge
export const completeDailyChallenge = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { challengeId } = req.body;

    const [challenge] = await db.select().from(dailyChallenges).where(eq(dailyChallenges.id, challengeId));
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if challenge is already completed
    const [existingProgress] = await db
      .select()
      .from(userDailyChallenges)
      .where(sql`${userDailyChallenges.userId} = ${userId} AND ${userDailyChallenges.challengeId} = ${challengeId}`);

    if (existingProgress?.isCompleted) {
      return res.status(400).json({ error: 'Challenge already completed' });
    }

    // Mark as completed and give rewards
    const rewards = challenge.rewards as any;
    
    if (existingProgress) {
      await db.update(userDailyChallenges)
        .set({
          isCompleted: true,
          completedAt: new Date(),
          claimedAt: new Date()
        })
        .where(eq(userDailyChallenges.id, existingProgress.id));
    } else {
      await db.insert(userDailyChallenges).values({
        userId,
        challengeId,
        progress: (challenge.requirement as any).target || 1,
        isCompleted: true,
        completedAt: new Date(),
        claimedAt: new Date()
      });
    }

    // Give rewards
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user) {
      await db.update(users)
        .set({
          xp: user.xp + (rewards.xp || 0),
          gems: user.gems + (rewards.gems || 0),
          lives: Math.min(user.maxLives, user.lives + (rewards.lives || 0))
        })
        .where(eq(users.id, userId));
    }

    res.json({ success: true, rewards });
  } catch (error) {
    console.error('Error completing daily challenge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user XP (called after quiz completion)
export const updateUserXP = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const { xpGained, streakBonus = false } = req.body;

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalXP = user.xp + xpGained;
    const newLevel = Math.floor(totalXP / 100) + 1; // 100 XP per level
    
    const updateData: any = {
      xp: totalXP,
      level: Math.max(newLevel, user.level)
    };

    // Update streak if bonus
    if (streakBonus) {
      updateData.streakDays = user.streakDays + 1;
      updateData.lastActiveDate = new Date();
    }

    await db.update(users).set(updateData).where(eq(users.id, userId));

    res.json({ 
      success: true, 
      newXP: totalXP,
      newLevel: updateData.level,
      levelUp: updateData.level > user.level
    });
  } catch (error) {
    console.error('Error updating user XP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};