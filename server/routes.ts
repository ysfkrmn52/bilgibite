import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertQuizSessionSchema,
  insertUserProgressSchema 
} from "@shared/schema";
import { z } from "zod";
import {
  getUserGamificationStats,
  getLeaderboard,
  getStoreItems,
  purchaseStoreItem,
  completeDailyChallenge,
  updateUserXP
} from "./gamification";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Exam categories
  app.get("/api/exam-categories", async (req, res) => {
    try {
      const categories = await storage.getExamCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/exam-categories/:id", async (req, res) => {
    try {
      const category = await storage.getExamCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Exam category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Questions
  app.get("/api/questions/:categoryId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const questions = await storage.getQuestionsByCategory(req.params.categoryId, limit);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User progress
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgressAll(req.params.userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/progress/:categoryId", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.params.userId, req.params.categoryId);
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users/:userId/progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId: req.params.userId
      });
      const progress = await storage.createOrUpdateUserProgress(progressData);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quiz sessions
  app.post("/api/quiz-sessions", async (req, res) => {
    try {
      const sessionData = insertQuizSessionSchema.parse(req.body);
      const session = await storage.createQuizSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/quiz-sessions/:id", async (req, res) => {
    try {
      const updates = req.body;
      const session = await storage.updateQuizSession(req.params.id, updates);
      if (!session) {
        return res.status(404).json({ message: "Quiz session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/quiz-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getQuizSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Quiz session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const userAchievements = await storage.getUserAchievements(req.params.userId);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users/:userId/achievements", async (req, res) => {
    try {
      const { achievementId } = req.body;
      const userAchievement = await storage.addUserAchievement(req.params.userId, achievementId);
      res.status(201).json(userAchievement);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Gamification routes
  app.get("/api/users/:userId/gamification", getUserGamificationStats);
  app.post("/api/users/:userId/xp", updateUserXP);
  app.post("/api/users/:userId/challenges/complete", completeDailyChallenge);
  app.post("/api/users/:userId/store/purchase", purchaseStoreItem);
  app.get("/api/leaderboard", getLeaderboard);
  app.get("/api/store", getStoreItems);

  const httpServer = createServer(app);
  return httpServer;
}
