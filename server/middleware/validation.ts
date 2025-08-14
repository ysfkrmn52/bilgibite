import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validationMiddleware = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }
  };
};

// Common validation schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['school', 'university', 'corporate', 'government']),
  adminUserId: z.string().min(1),
  plan: z.enum(['basic', 'professional', 'enterprise']),
  maxUsers: z.number().min(1).max(10000)
});

export const createAssignmentSchema = z.object({
  classId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['quiz', 'video', 'practice', 'exam']),
  content: z.object({}),
  dueDate: z.string().datetime(),
  maxAttempts: z.number().min(1).max(10),
  passingScore: z.number().min(0).max(100)
});

export const createVideoLessonSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  videoUrl: z.string().url(),
  categoryId: z.string().min(1),
  organizationId: z.string().optional(),
  transcript: z.string().optional(),
  interactiveElements: z.array(z.object({})).optional()
});