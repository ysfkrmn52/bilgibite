// Input validation and sanitization middleware
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Generic validation middleware
export const validateSchema = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      res.status(400).json({ error: 'Invalid input' });
    }
  };
};

// Input sanitization
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] }); // Strip all HTML
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  
  next();
};

// CORS configuration for production
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://bilgibite.com', 'https://www.bilgibite.com']
    : true,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.anthropic.com", "https://firebase.googleapis.com"],
    },
  },
  crossOriginEmbedderPolicy: false // Disable for Firebase compatibility
});

// Request logging
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')?.substring(0, 100),
      timestamp: new Date().toISOString()
    };
    
    // Log different levels based on status code
    if (res.statusCode >= 400) {
      console.error('HTTP Error:', logData);
    } else if (duration > 1000) {
      console.warn('Slow Request:', logData);
    } else if (process.env.NODE_ENV === 'development') {
      console.log('Request:', logData);
    }
  });
  
  next();
};