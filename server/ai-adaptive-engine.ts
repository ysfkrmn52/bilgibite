import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';
import { users, userProgress, quizSessions, adaptiveLearningMetrics } from '@shared/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface LearningPattern {
  strengths: string[];
  weaknesses: string[];
  learningVelocity: number;
  optimalDifficulty: number;
  preferredQuestionTypes: string[];
  retentionRate: number;
  motivationalFactors: string[];
}

interface AdaptiveRecommendation {
  nextTopics: string[];
  difficultyAdjustment: number;
  studyDuration: number;
  questionTypes: string[];
  reinforcementTopics: string[];
  motivationalStrategy: string;
}

export class AdaptiveLearningEngine {
  private static instance: AdaptiveLearningEngine;

  static getInstance(): AdaptiveLearningEngine {
    if (!this.instance) {
      this.instance = new AdaptiveLearningEngine();
    }
    return this.instance;
  }

  // Machine Learning-powered user pattern analysis
  async analyzeUserLearningPattern(userId: string): Promise<LearningPattern> {
    // Get user's historical data
    const [userData] = await db.select().from(users).where(eq(users.id, userId));
    const progressData = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    const recentSessions = await db
      .select()
      .from(quizSessions)
      .where(and(
        eq(quizSessions.userId, userId),
        gte(quizSessions.completedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
      ))
      .orderBy(desc(quizSessions.completedAt))
      .limit(50);

    // AI-powered pattern analysis
    const analysisPrompt = `
Analyze this student's learning pattern and provide insights:

User Level: ${userData?.level || 1}
User Points: ${userData?.totalPoints || 0}
Recent Quiz Sessions: ${JSON.stringify(recentSessions.slice(0, 10))}
Progress Data: ${JSON.stringify(progressData)}

Analyze and determine:
1. Learning strengths and weaknesses
2. Learning velocity (fast/medium/slow)
3. Optimal difficulty level (1-10)
4. Preferred question types
5. Knowledge retention rate
6. Motivational factors

Respond in JSON format with detailed analysis.
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: 'user', content: analysisPrompt }],
      });

      const analysis = JSON.parse(response.content[0].text);
      
      return {
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        learningVelocity: analysis.learningVelocity || 5,
        optimalDifficulty: analysis.optimalDifficulty || 5,
        preferredQuestionTypes: analysis.preferredQuestionTypes || ['multiple_choice'],
        retentionRate: analysis.retentionRate || 0.7,
        motivationalFactors: analysis.motivationalFactors || ['progress', 'competition']
      };
    } catch (error) {
      console.error('Error analyzing learning pattern:', error);
      // Fallback to basic analysis
      return this.basicPatternAnalysis(recentSessions, progressData);
    }
  }

  // Generate adaptive recommendations
  async generateAdaptiveRecommendations(userId: string): Promise<AdaptiveRecommendation> {
    const pattern = await this.analyzeUserLearningPattern(userId);
    
    const recommendationPrompt = `
Based on this learning pattern, generate adaptive recommendations:

Learning Pattern: ${JSON.stringify(pattern)}

Generate personalized recommendations for:
1. Next topics to study (prioritized)
2. Difficulty adjustment (-3 to +3)
3. Optimal study duration (minutes)
4. Best question types for this user
5. Topics that need reinforcement
6. Motivational strategy

Consider the user's strengths, weaknesses, and learning velocity.
Respond in JSON format.
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: 'user', content: recommendationPrompt }],
      });

      const recommendations = JSON.parse(response.content[0].text);
      
      return {
        nextTopics: recommendations.nextTopics || [],
        difficultyAdjustment: recommendations.difficultyAdjustment || 0,
        studyDuration: recommendations.studyDuration || 30,
        questionTypes: recommendations.questionTypes || ['multiple_choice'],
        reinforcementTopics: recommendations.reinforcementTopics || [],
        motivationalStrategy: recommendations.motivationalStrategy || 'progress'
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.basicRecommendations(pattern);
    }
  }

  // Real-time difficulty adjustment
  async adjustDifficultyRealTime(userId: string, currentPerformance: number): Promise<number> {
    const pattern = await this.analyzeUserLearningPattern(userId);
    
    // ML-based difficulty adjustment algorithm
    let adjustment = 0;
    
    if (currentPerformance > 0.8 && pattern.learningVelocity > 7) {
      adjustment = 2; // Increase difficulty significantly
    } else if (currentPerformance > 0.7) {
      adjustment = 1; // Increase difficulty moderately
    } else if (currentPerformance < 0.4) {
      adjustment = -2; // Decrease difficulty significantly
    } else if (currentPerformance < 0.6) {
      adjustment = -1; // Decrease difficulty moderately
    }
    
    // Factor in user's optimal difficulty preference
    const targetDifficulty = Math.max(1, Math.min(10, pattern.optimalDifficulty + adjustment));
    
    return targetDifficulty;
  }

  // Predictive analytics for exam success
  async predictExamSuccess(userId: string, examType: string): Promise<{
    successProbability: number;
    confidenceLevel: number;
    improvementAreas: string[];
    timeToReadiness: number; // days
  }> {
    const pattern = await this.analyzeUserLearningPattern(userId);
    const [userProgress] = await db.select().from(users).where(eq(users.id, userId));
    
    const predictionPrompt = `
Predict exam success probability for this student:

Exam Type: ${examType}
Learning Pattern: ${JSON.stringify(pattern)}
Current Level: ${userProgress?.level || 1}
Total Points: ${userProgress?.totalPoints || 0}

Analyze and predict:
1. Success probability (0-1)
2. Confidence level in prediction (0-1)
3. Key improvement areas
4. Estimated days to exam readiness

Consider the student's learning velocity, retention rate, and weaknesses.
Respond in JSON format.
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: 'user', content: predictionPrompt }],
      });

      const prediction = JSON.parse(response.content[0].text);
      
      return {
        successProbability: prediction.successProbability || 0.5,
        confidenceLevel: prediction.confidenceLevel || 0.7,
        improvementAreas: prediction.improvementAreas || [],
        timeToReadiness: prediction.timeToReadiness || 30
      };
    } catch (error) {
      console.error('Error predicting exam success:', error);
      return {
        successProbability: 0.5,
        confidenceLevel: 0.5,
        improvementAreas: pattern.weaknesses,
        timeToReadiness: 30
      };
    }
  }

  // Document/PDF to question generation
  async generateQuestionsFromDocument(documentText: string, topic: string, count: number = 10): Promise<any[]> {
    const generationPrompt = `
Generate ${count} high-quality quiz questions from this document content:

Topic: ${topic}
Document Content: ${documentText.substring(0, 4000)}...

Generate questions with:
1. Multiple choice questions (4 options)
2. True/false questions
3. Fill-in-the-blank questions
4. Matching questions

Each question should include:
- Question text
- Options (for multiple choice)
- Correct answer
- Explanation
- Difficulty level (1-10)
- Learning objective

Respond in JSON array format.
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [{ role: 'user', content: generationPrompt }],
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      console.error('Error generating questions from document:', error);
      return [];
    }
  }

  // Emotional AI for motivation
  async analyzeLearningMotivation(userId: string): Promise<{
    motivationLevel: number;
    emotionalState: string;
    recommendedActions: string[];
    encouragementMessage: string;
  }> {
    const pattern = await this.analyzeUserLearningPattern(userId);
    
    const motivationPrompt = `
Analyze this student's motivation and emotional state:

Learning Pattern: ${JSON.stringify(pattern)}

Determine:
1. Current motivation level (1-10)
2. Emotional state (excited, frustrated, confident, anxious, etc.)
3. Recommended motivational actions
4. Personalized encouragement message in Turkish

Consider learning velocity, recent performance, and engagement patterns.
Respond in JSON format.
`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: 'user', content: motivationPrompt }],
      });

      const motivation = JSON.parse(response.content[0].text);
      
      return {
        motivationLevel: motivation.motivationLevel || 5,
        emotionalState: motivation.emotionalState || 'neutral',
        recommendedActions: motivation.recommendedActions || [],
        encouragementMessage: motivation.encouragementMessage || 'Harika gidiyorsun! Devam et!'
      };
    } catch (error) {
      console.error('Error analyzing motivation:', error);
      return {
        motivationLevel: 5,
        emotionalState: 'neutral',
        recommendedActions: ['Take a break', 'Try easier questions'],
        encouragementMessage: 'Harika gidiyorsun! Devam et!'
      };
    }
  }

  private basicPatternAnalysis(sessions: any[], progress: any[]): LearningPattern {
    const recentPerformance = sessions.slice(0, 10).map(s => s.score / s.totalQuestions);
    const avgPerformance = recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length || 0.5;
    
    return {
      strengths: avgPerformance > 0.7 ? ['Quick learner'] : [],
      weaknesses: avgPerformance < 0.5 ? ['Needs more practice'] : [],
      learningVelocity: avgPerformance * 10,
      optimalDifficulty: Math.max(1, Math.min(10, Math.round(avgPerformance * 10))),
      preferredQuestionTypes: ['multiple_choice'],
      retentionRate: avgPerformance,
      motivationalFactors: ['progress', 'achievements']
    };
  }

  private basicRecommendations(pattern: LearningPattern): AdaptiveRecommendation {
    return {
      nextTopics: ['Review fundamentals'],
      difficultyAdjustment: pattern.optimalDifficulty > 5 ? 1 : -1,
      studyDuration: 30,
      questionTypes: pattern.preferredQuestionTypes,
      reinforcementTopics: pattern.weaknesses,
      motivationalStrategy: 'progress'
    };
  }
}

export const adaptiveLearningEngine = AdaptiveLearningEngine.getInstance();