// Social Learning API Routes
import { Request, Response } from "express";
import { z } from "zod";

// Validation schemas
const friendRequestSchema = z.object({
  targetUserId: z.string()
});

const challengeSchema = z.object({
  challengedUserId: z.string(),
  challengeType: z.enum(['quiz_duel', 'streak_battle', 'category_race']),
  categoryId: z.string().optional(),
  targetScore: z.number().optional(),
  duration: z.number().optional()
});

const studyGroupSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  type: z.enum(['public', 'private', 'school']).default('public'),
  maxMembers: z.number().min(2).max(100).default(50)
});

const reactionSchema = z.object({
  reactionType: z.enum(['like', 'celebrate', 'support', 'wow'])
});

// FRIEND SYSTEM ROUTES

export const sendFriendRequest = async (req: Request, res: Response) => {
  // Always return success for development - no database operations
  const mockFriendship = {
    id: "friendship-" + Date.now(),
    requesterId: req.params.userId,
    addresseeId: req.body.targetUserId,
    status: 'pending',
    createdAt: new Date()
  };
  
  res.json({
    success: true,
    friendship: mockFriendship,
    message: 'Arkadaşlık talebi gönderildi'
  });
};

export const acceptFriendRequest = async (req: Request, res: Response) => {
  // Mock accept friend request for development
  const mockFriendship = {
    id: "friendship-accepted-" + Date.now(),
    requesterId: req.params.requesterId,
    addresseeId: req.params.userId,
    status: 'accepted',
    acceptedAt: new Date()
  };
  
  res.json({
    success: true,
    friendship: mockFriendship,
    message: 'Arkadaşlık talebi kabul edildi! 🎉'
  });
};

export const getUserFriends = async (req: Request, res: Response) => {
  // Mock friends for development
  const mockFriends = [
    {
      friend: {
        id: "friend-1",
        username: "Ahmet Kaya",
        level: 12,
        currentXP: 850,
        currentStreak: 7,
        profilePicture: null
      },
      friendship: {
        status: "accepted",
        createdAt: new Date()
      }
    },
    {
      friend: {
        id: "friend-2", 
        username: "Zeynep Özkan",
        level: 15,
        currentXP: 1200,
        currentStreak: 12,
        profilePicture: null
      },
      friendship: {
        status: "accepted",
        createdAt: new Date()
      }
    }
  ];
  
  res.json({
    success: true,
    friends: mockFriends,
    totalFriends: mockFriends.length
  });
};

export const discoverUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const users = await FriendService.discoverUsers(userId, limit);
    
    res.json({
      success: true,
      users,
      suggested: users.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Kullanıcı önerileri alınamadı'
    });
  }
};

// CHALLENGE SYSTEM ROUTES

export const createChallenge = async (req: Request, res: Response) => {
  // Always return success for development - no database operations  
  const mockChallenge = {
    id: "challenge-" + Date.now(),
    challengerId: req.params.userId,
    challengedUserId: req.body.challengedUserId,
    challengeType: req.body.challengeType || 'quiz_duel',
    status: 'pending',
    createdAt: new Date()
  };
  
  res.json({
    success: true,
    challenge: mockChallenge,
    message: 'Meydan okuma gönderildi! ⚔️'
  });
};

export const acceptChallenge = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const challengeId = req.params.challengeId;
    
    const challenge = await ChallengeService.acceptChallenge(challengeId, userId);
    
    res.json({
      success: true,
      challenge,
      message: 'Meydan okuma kabul edildi! 🔥'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Meydan okuma kabul edilemedi'
    });
  }
};

export const getUserChallenges = async (req: Request, res: Response) => {
  // Mock challenges for development - New user has no challenges
  const mockChallenges: any[] = [];
  
  res.json({
    success: true,
    challenges: mockChallenges,
    totalChallenges: mockChallenges.length
  });
};

// STUDY GROUP ROUTES

export const createStudyGroup = async (req: Request, res: Response) => {
  // Always return success for development - no database operations
  const mockGroup = {
    id: "group-" + Date.now(),
    name: req.body.name || "Yeni Çalışma Grubu",
    description: req.body.description || "Beraber çalışalım!",
    creatorId: req.params.userId,
    currentMembers: 1,
    maxMembers: req.body.maxMembers || 10,
    weeklyGoal: req.body.weeklyGoal || 500,
    createdAt: new Date()
  };
  
  res.json({
    success: true,
    group: mockGroup,
    message: 'Çalışma grubu oluşturuldu! 📚'
  });
};

export const joinStudyGroup = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    
    const result = await StudyGroupService.joinStudyGroup(groupId, userId);
    
    res.json({
      success: true,
      message: 'Çalışma grubuna katıldınız! 🎯'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Gruba katılınamadı'
    });
  }
};

export const getUserStudyGroups = async (req: Request, res: Response) => {
  // Mock study groups for development - New user has no groups
  const mockGroups: any[] = [];
  
  res.json({
    success: true,
    groups: mockGroups,
    totalGroups: mockGroups.length
  });
};

export const discoverStudyGroups = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const groups = await StudyGroupService.discoverStudyGroups(userId, limit);
    
    res.json({
      success: true,
      groups,
      available: groups.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Grup önerileri alınamadı'
    });
  }
};

// LEAGUE SYSTEM ROUTES

export const getCurrentLeague = async (req: Request, res: Response) => {
  // Mock current league for development - New user starts in Bronze with 0 XP
  const mockLeague = {
    league: {
      name: "Bronze",
      description: "Başlangıç seviyesi"
    },
    participation: {
      weeklyXP: 0,
      rank: 0
    },
    rank: 0
  };
  
  res.json({
    success: true,
    league: mockLeague.league,
    participation: mockLeague.participation,
    rank: mockLeague.rank
  });
};

export const getLeagueLeaderboard = async (req: Request, res: Response) => {
  try {
    const leagueId = req.params.leagueId;
    const weekPeriod = req.query.week as string || new Date().toISOString().slice(0, 4) + '-W' + Math.ceil((new Date().getMonth() + 1) * 4.33);
    
    const leaderboard = await LeagueService.getLeagueLeaderboard(leagueId, weekPeriod);
    
    res.json({
      success: true,
      leaderboard,
      weekPeriod
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Lig sıralaması alınamadı'
    });
  }
};

// SOCIAL FEED ROUTES

export const getSocialFeed = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    
    // New user has no social feed activities yet
    const mockFeed: any[] = [];
    
    res.json({
      success: true,
      activities: mockFeed,
      totalActivities: mockFeed.length
    });
  } catch (error: any) {
    // Fallback to empty data for new users
    const mockFeed: any[] = [];
    
    res.json({
      success: true,
      activities: mockFeed,
      totalActivities: mockFeed.length
    });
  }
};

export const reactToActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const activityId = req.params.activityId;
    const { reactionType } = reactionSchema.parse(req.body);
    
    await SocialActivityService.reactToActivity(activityId, userId, reactionType);
    
    res.json({
      success: true,
      message: 'Tepki eklendi'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'Tepki eklenemedi'
    });
  }
};